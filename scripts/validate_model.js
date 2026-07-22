#!/usr/bin/env node
// ==========================================================================
// K-Tactics Lab 2026 — Match-Model Validation Harness
// Extracts the REAL poissonSample / secondHalfLambdas from app.js (no copy,
// no drift) and checks the Monte Carlo engine against analytic ground truth:
//   (1) calibration: MC win/draw/lose vs exact Poisson PMF summation
//   (2) sample-mean: E[2nd-half goals] vs lambda
//   (3) convergence: winPct standard error at N = 100 / 1,000 / 10,000
// Usage:  node scripts/validate_model.js
// Docs:   docs/MODEL_SELECTION.md §3
// ==========================================================================
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function extract(name, kind) {
  const startTok = kind === 'const' ? `const ${name} = ` : `function ${name}(`;
  const i = src.indexOf(startTok);
  if (i === -1) throw new Error(`not found in app.js: ${name}`);
  let j = src.indexOf('{', i);
  let depth = 0, inStr = null;
  for (; j < src.length; j++) {
    const c = src[j], p = src[j - 1];
    if (inStr) { if (c === inStr && p !== '\\') inStr = null; continue; }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
  }
  let code = src.slice(i, j + 1) + (kind === 'const' ? ';' : '');
  if (kind === 'const') code = code.replace(`const ${name} = `, `globalThis.${name} = `);
  return code;
}

// Fixed representative board state (default dials vs ESP, halftime 0:1,
// post-drain stamina). Changing it changes the numbers, not the conclusions.
global.OPPONENT_PROFILES = { ESP: { name: '스페인' } };
global.state = {
  stats: { attack: 75, defense: 60, midfield: 80, stamina: 70 },
  opponent: 'ESP',
  dials: { tempo: 'standard', route: 'halfspace', press: 'region', mentality: 'balance', nopassback: false, kangin: false },
  staminaState: { A: 62, B: 58, C: 65, D: 60, E: 55, F: 63, G: 59, H: 61, I: 64, J: 57, K: 85 },
  opponentPlan: { counterDials: { tempo: 'direct', route: 'wing', press: 'high', mentality: 'lock' } },
  halfTimeScore: { kor: 0, opp: 1 }
};
eval(extract('OPP_STRENGTH', 'const'));
eval(extract('opponentModifiers', 'fn'));
eval(extract('secondHalfLambdas', 'fn'));
eval(extract('poissonSample', 'fn'));

const { lamKor, lamOpp } = secondHalfLambdas();
const bK = state.halfTimeScore.kor, bO = state.halfTimeScore.opp;

// (1) analytic ground truth: exact win/draw/lose via truncated PMF summation
function pmf(lam, k) { let p = Math.exp(-lam); for (let i = 1; i <= k; i++) p *= lam / i; return p; }
let aw = 0, ad = 0, al = 0;
for (let k = 0; k <= 20; k++) for (let o = 0; o <= 20; o++) {
  const p = pmf(lamKor, k) * pmf(lamOpp, o);
  const fk = bK + k, fo = bO + o;
  if (fk > fo) aw += p; else if (fk === fo) ad += p; else al += p;
}

function mc(N) {
  let win = 0, draw = 0, lose = 0, sumK = 0, sumO = 0;
  for (let i = 0; i < N; i++) {
    const k = bK + poissonSample(lamKor);
    const o = bO + poissonSample(lamOpp);
    sumK += k; sumO += o;
    if (k > o) win++; else if (k === o) draw++; else lose++;
  }
  return { win: win / N * 100, draw: draw / N * 100, lose: lose / N * 100, avgK: sumK / N, avgO: sumO / N };
}

// (3) convergence: spread of winPct across 300 repetitions per N
function sd(arr) { const m = arr.reduce((a, b) => a + b) / arr.length; return Math.sqrt(arr.map(x => (x - m) ** 2).reduce((a, b) => a + b) / (arr.length - 1)); }
const conv = {};
for (const N of [100, 1000, 10000]) {
  const wins = [];
  for (let r = 0; r < 300; r++) wins.push(mc(N).win);
  conv[N] = { meanWin: +(wins.reduce((a, b) => a + b) / 300).toFixed(2), sdWin: +sd(wins).toFixed(2) };
}

const one = mc(1000);      // the app's N
const big = mc(200000);    // near-truth empirical reference

console.log(JSON.stringify({
  fixedState: { lambdas: { kor: +lamKor.toFixed(4), opp: +lamOpp.toFixed(4) }, halfTime: `${bK}:${bO}` },
  calibration: {
    analytic: { win: +(aw * 100).toFixed(2), draw: +(ad * 100).toFixed(2), lose: +(al * 100).toFixed(2) },
    mc200k: { win: +big.win.toFixed(2), draw: +big.draw.toFixed(2), lose: +big.lose.toFixed(2) },
    mc1000_oneRun: { win: one.win, draw: one.draw, lose: one.lose }
  },
  sampleMean: {
    lambda2ndHalf: { kor: +lamKor.toFixed(3), opp: +lamOpp.toFixed(3) },
    mc200kMeanTotal: { kor: +big.avgK.toFixed(3), opp: +big.avgO.toFixed(3) },
    note: 'meanTotal should equal halftime + lambda (kor ~ 0+lamKor, opp ~ 1+lamOpp)'
  },
  convergence: conv
}, null, 2));
