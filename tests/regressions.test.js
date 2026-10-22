const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function timers() {
  let id = 0;
  const pending = new Map();
  return {
    pending,
    setTimeout(fn, ms) { pending.set(++id, { fn, ms }); return id; },
    clearTimeout(key) { pending.delete(key); },
    fire() {
      const [key, timer] = pending.entries().next().value;
      pending.delete(key);
      timer.fn();
      return timer.ms;
    }
  };
}

function client(protocol = 'https:') {
  const clock = timers();
  const c = vm.createContext({
    console, AbortController, ...clock,
    location: { protocol, origin: 'https://example.test', pathname: '/', hash: '' },
    atob, btoa, document: { addEventListener() {}, getElementById: () => null },
  });
  // Load the actual HTML order, including data and every extracted script.
  const files = [...read('index.html').matchAll(/<script src="([^"]+)"/g)]
    .map(m => m[1]).filter(file => !file.startsWith('https:'));
  for (const file of files) vm.runInContext(read(file), c, { filename: file });
  c.board = vm.runInContext('state', c);
  c.clock = clock;
  return c;
}

function encode(c, payload) {
  c.location.hash = '#t=' + Buffer.from(JSON.stringify(payload)).toString('base64');
}

test('normal shared links round-trip through actual scripts', () => {
  const c = client();
  const original = JSON.stringify(c.buildChallengePayload());
  c.location.hash = c.buildChallengeURL().split('#')[1];
  c.location.hash = '#' + c.location.hash;
  assert.ok(c.applyChallengeFromURL());
  assert.equal(JSON.stringify(c.buildChallengePayload()), original);
  assert.ok(Number.isFinite(c.secondHalfLambdas().lamKor));
});



test('cancelled or superseded scouts cannot overwrite or announce stale plans', async () => {
  const c = client();
  const requests = [];
  c.callCoachAPI = (_, __, signal) => new Promise(resolve => requests.push({ resolve, signal }));
  c.setOppChip = () => {};
  const messages = [];
  c.pushCoachMessage = html => messages.push(html);
  const first = c.fetchOpponentPlan();
  const second = c.fetchOpponentPlan();
  assert.ok(requests[0].signal.aborted);
  const oldPlan = c.scriptedCounterPlan();
  requests[0].resolve({ opponent: oldPlan });
  await first;
  assert.equal(messages.length, 0);
  requests[1].resolve({ opponent: c.scriptedCounterPlan() });
  await second;
  assert.equal(messages.length, 1);
  for (const reply of [null, { opponent: oldPlan }]) {
    const pending = c.fetchOpponentPlan();
    c.cancelOpponentRequest();
    c.board.opponentPlan = null;
    requests.at(-1).resolve(reply);
    await pending;
    assert.equal(c.board.opponentPlan, null);
    assert.equal(messages.length, 1);
  }
});

test('opponent changes and second-half calculation cancel pending scouts', async () => {
  const c = client();
  let resolve, signal;
  c.callCoachAPI = (_, __, s) => { signal = s; return new Promise(r => resolve = r); };
  c.setOppChip = () => {};
  c.pushCoachMessage = () => {};
  c.updateBrandFixture = c.recalculateVibe = c.updateStats = () => {};
  c.document.querySelectorAll = () => [];
  const pending = c.fetchOpponentPlan();
  c.selectOpponent('RSA');
  assert.ok(signal.aborted);
  resolve(null);
  await pending;
  const next = c.fetchOpponentPlan();
  const saved = c.board.opponentPlan;
  c.updateScorebug = c.renderPitch = () => {};
  c.buildMatchFilm = () => ({});
  c.buildCommentaryCues = () => [];
  c.openMatchView = () => true;
  c.runSecondHalf();
  assert.ok(signal.aborted);
  resolve({ opponent: c.scriptedCounterPlan() });
  await next;
  assert.equal(c.board.opponentPlan, saved);
});

function abortedFetch(_, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('aborted')); return; }
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
}

test('client timeout and external cancellation release timers and return fallback', async () => {
  const c = client();
  c.fetch = abortedFetch;
  const pending = c.callCoachAPI('chat', 'test');
  assert.equal(c.clock.fire(), 25000);
  assert.equal(await pending, null);
  const controller = new AbortController();
  const cancelled = c.callCoachAPI('opponent', '', controller.signal);
  controller.abort();
  assert.equal(await cancelled, null);
  assert.equal(c.clock.pending.size, 0);
  const offline = client('file:');
  offline.fetch = () => assert.fail('offline must not fetch');
  assert.equal(await offline.callCoachAPI('chat'), null);
});

function server(fetch) {
  const clock = timers();
  const c = vm.createContext({
    AbortController, ...clock, fetch, module: { exports: {} },
    // Synthetic credentials used only by the in-memory transport double.
    process: { env: { GROQ_API_KEY: 'test-only', GEMINI_API_KEY: 'test-only' } },
  });
  vm.runInContext(read('api/coach.js'), c);
  c.clock = clock;
  return c;
}

test('server times out stalled Groq and falls back to Gemini', async () => {
  const calls = [];
  const c = server((url, options) => {
    calls.push(url);
    if (url.includes('groq.com')) return abortedFetch(url, options);
    return Promise.resolve({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '응답입니다.' }] } }] }) });
  });
  const pending = c.callLLM({ system: 'test', user: 'test', maxTokens: 10 });
  assert.equal(c.clock.fire(), 5000);
  const result = await pending;
  assert.equal(result.ok, true);
  assert.equal(calls.length, 2);
  assert.equal(c.clock.pending.size, 0);
});

test('server timeout covers stalled response bodies and total request budget', async () => {
  const c = server((url, options) => Promise.resolve({
    ok: true, json: () => abortedFetch(url, options),
  }));
  const pending = c.callGroq({ system: 'test', user: 'test', maxTokens: 10 });
  await new Promise(resolve => setImmediate(resolve));
  c.clock.fire();
  assert.equal((await pending).status, 'timeout');
  assert.equal(c.clock.pending.size, 0);
  vm.runInContext(`
    let now = 0;
    Date.now = () => now;
    callGroq = async () => { now = 21000; return { ok: false, status: 'timeout' }; };
    callGemini = async () => { throw new Error('must not exceed deadline'); };
  `, c);
  assert.equal((await c.callLLM({})).status, 'timeout');
});




function exportClient() {
  const c = client();
  const label = { textContent: 'Save' };
  const button = { disabled: false, querySelector: () => label };
  c.document.querySelector = () => button;
  c.document.getElementById = id => id === 'manager-result-card' ? {} : null;
  const alerts = [], clicks = [], copied = [];
  c.alert = text => alerts.push(text);
  c.showToast = () => {};
  c.document.createElement = () => ({ click() { clicks.push(this.href); } });
  c.navigator = { clipboard: { writeText: async text => copied.push(text) } };
  c.File = class {};
  return { c, button, label, alerts, clicks, copied };
}
