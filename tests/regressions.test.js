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

test('untrusted challenge fields are rejected atomically', () => {
  const c = client();
  const original = JSON.stringify(c.buildChallengePayload());
  const mutations = [
    p => p.vb = '<img src=x onerror="void(0)">',
    p => p.vb = 101,
    p => p.vb = -1,
    p => p.o = '<img src=x>',
    p => p.f = '__proto__',
    p => p.v = 2,
    p => p.s.k = -1,
    p => p.s.o = 1.5,
    p => p.xi[1] = p.xi[0],
    p => p.xi[0] = '__proto__',
    p => p.d.press = 'invalid',
    p => p.d.kangin = 'false',
    p => p.d = [],
  ];
  for (const mutate of mutations) {
    const payload = JSON.parse(original);
    mutate(payload);
    encode(c, payload);
    assert.equal(c.applyChallengeFromURL(), null);
    assert.equal(JSON.stringify(c.buildChallengePayload()), original);
  }
  c.location.hash = '#t=' + 'a'.repeat(8193);
  assert.equal(c.applyChallengeFromURL(), null);
});

test('extra dial keys are not imported and display escapes HTML defensively', () => {
  const c = client();
  const payload = JSON.parse(JSON.stringify(c.buildChallengePayload()));
  payload.d.injected = true;
  encode(c, payload);
  assert.ok(c.applyChallengeFromURL());
  assert.equal(c.board.dials.injected, undefined);
  c.selectOpponent = () => {};
  c.syncDialButtons = () => {};
  let html;
  c.pushCoachMessage = text => html = text;
  c.announceChallenge({ score: { k: 1, o: 0 }, vibe: '<img src=x>' });
  assert.ok(!html.includes('<img'));
  assert.ok(html.includes('&lt;img'));
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

test('custom roles survive sharing to a fresh board; legacy links still work', () => {
  const sender = client();
  vm.runInContext('squadData[state.currentFormation][0].role = roleOptions.att[2]', sender);
  const payload = JSON.parse(JSON.stringify(sender.buildChallengePayload()));
  const receiver = client();
  encode(receiver, payload);
  assert.ok(receiver.applyChallengeFromURL());
  assert.equal(JSON.stringify(receiver.buildChallengePayload()), JSON.stringify(payload));
  delete payload.roles;
  encode(receiver, payload);
  assert.ok(receiver.applyChallengeFromURL());
});

test('invalid roles and malformed encodings leave the board untouched', () => {
  const c = client();
  const original = JSON.stringify(c.buildChallengePayload());
  for (const roles of [null, [], {}, ['fake'], Array(11).fill('__proto__'), Array(11).fill('<img src=x>')]) {
    encode(c, { ...JSON.parse(original), roles });
    assert.equal(c.applyChallengeFromURL(), null);
    assert.equal(JSON.stringify(c.buildChallengePayload()), original);
  }
  for (const hash of ['#t=!!', '#t=ey', '#t=/w==']) {
    c.location.hash = hash;
    assert.equal(c.applyChallengeFromURL(), null);
    assert.equal(JSON.stringify(c.buildChallengePayload()), original);
  }
});

test('percentages total 100 across sample sizes; invalid iterations are rejected', () => {
  const c = client();
  vm.runInContext('Math.random=(()=>{let n=12345;return()=>((n=(n*1664525+1013904223)>>>0)/4294967296);})();', c);
  for (const size of [1, 2, 3, 7, 100, 1000]) {
    for (let i = 0; i < 20; i++) {
      const result = c.runMonteCarlo(size);
      const values = [result.winPct, result.drawPct, result.losePct];
      assert.equal(values.reduce((a, b) => a + b), 100);
      assert.ok(values.every(n => Number.isInteger(n) && n >= 0 && n <= 100));
    }
  }
  for (const value of [0, -1, 1.5, NaN, Infinity, '1000']) {
    assert.throws(() => c.runMonteCarlo(value), { name: 'RangeError' });
  }
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

test('image saving restores controls for missing library/card and rendering/encoding failures', async () => {
  for (const kind of ['missing-library', 'missing-card', 'throw', 'reject', 'encode', 'empty']) {
    const { c, button, label, alerts, clicks } = exportClient();
    if (kind !== 'missing-library') {
      c.html2canvas = () => {
        if (kind === 'throw') throw new Error('render');
        if (kind === 'reject') return Promise.reject(new Error('render'));
        return Promise.resolve({ toDataURL() {
          if (kind === 'encode') throw new Error('tainted canvas');
          return 'data:,';
        } });
      };
    }
    if (kind === 'missing-card') c.document.getElementById = () => null;
    await c.downloadCardPNG();
    assert.equal(button.disabled, false, kind);
    assert.equal(label.textContent, 'Save', kind);
    assert.equal(alerts.length, 1, kind);
    assert.equal(clicks.length, 0, kind);
    assert.equal(c.clock.pending.size, 0, kind);
  }
});

test('hung image export times out, ignores duplicate clicks, then allows retry', async () => {
  const { c, button, alerts, clicks } = exportClient();
  let calls = 0;
  c.html2canvas = () => { calls++; return new Promise(() => {}); };
  const pending = c.downloadCardPNG();
  await new Promise(resolve => setImmediate(resolve));
  await c.downloadCardPNG();
  assert.equal(calls, 1);
  assert.equal(button.disabled, true);
  assert.equal(c.clock.fire(), 15000);
  await pending;
  assert.equal(button.disabled, false);
  assert.equal(alerts.length, 1);
  c.html2canvas = async () => ({ toDataURL: () => 'data:image/png;base64,test' });
  await c.downloadCardPNG();
  assert.equal(clicks.length, 1);
  assert.equal(c.clock.pending.size, 0);
});

test('native share errors fall back to clipboard; user cancellation does not', async () => {
  for (const name of ['NotAllowedError', 'TypeError', 'AbortError']) {
    const { c, copied } = exportClient();
    c.html2canvas = async () => ({ toBlob: callback => callback({}) });
    c.navigator.canShare = () => true;
    c.navigator.share = async () => { throw Object.assign(new Error('share'), { name }); };
    await c.shareResult();
    assert.equal(copied.length, name === 'AbortError' ? 0 : 1, name);
  }
});

test('missing share APIs, null blobs and denied clipboard reach safe fallbacks', async () => {
  const { c, alerts, copied } = exportClient();
  await c.shareResult();
  assert.equal(copied.length, 1);
  c.html2canvas = async () => ({ toBlob: callback => callback(null) });
  c.navigator.canShare = () => true;
  c.navigator.share = () => assert.fail('null blob must not be shared');
  c.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
  await c.shareResult();
  assert.equal(alerts.length, 1);
  assert.ok(alerts[0].includes('#t='));
  assert.equal(c.clock.pending.size, 0);
});

test('hung blob conversion and repeated share clicks recover to text sharing', async () => {
  const { c, copied } = exportClient();
  c.html2canvas = async () => ({ toBlob() {} });
  c.navigator.canShare = () => true;
  c.navigator.share = () => assert.fail('hung blob must not be shared');
  const pending = c.shareResult();
  await new Promise(resolve => setImmediate(resolve));
  await c.shareResult();
  assert.equal(c.clock.pending.size, 1);
  assert.equal(c.clock.fire(), 15000);
  await pending;
  assert.equal(copied.length, 1);
  assert.equal(c.clock.pending.size, 0);
});
