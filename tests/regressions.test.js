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





function abortedFetch(_, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('aborted')); return; }
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  });
}


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
