// Classic script; loaded before app.js. Shared board state is initialized by app.js.
// The half-time score, as a calculation the view can ask for before kickoff.
// Deterministic on purpose: the premise is re-taking one specific match, so
// the situation you inherit must not reroll.
function firstHalfOutcome() {
  const oppStr = OPP_STRENGTH[state.opponent] || { att: 72, def: 72 };
  const attackEdge = state.stats.attack / oppStr.def
    + (state.dials.route === 'halfspace' ? 0.10 : state.dials.route === 'wing' ? 0.05 : 0)
    + (state.dials.nopassback ? 0.08 : 0)
    + (state.dials.mentality === 'attack' ? 0.06 : state.dials.mentality === 'lock' ? -0.06 : 0);
  const defenceEdge = state.stats.defense / oppStr.att
    + (state.dials.press === 'tenback' ? 0.18 : state.dials.press === 'high' ? 0.12 : 0)
    + (state.dials.mentality === 'lock' ? 0.05 : state.dials.mentality === 'attack' ? -0.05 : 0);
  return {
    attackEdge, defenceEdge,
    korGoals: attackEdge >= 1.10 ? 1 : 0,
    oppGoals: defenceEdge >= 1.05 ? 0 : 1
  };
}

// ==========================================================================
// Real match model: Poisson Monte Carlo on team-derived goal rates (local, no LLM).
// Second-half goals ~ Poisson(lambda); lambda derived from team stats, dials,
// post-drain stamina, executed subs, and opponent strength. Aggregated over N runs.
// ==========================================================================
// The three 2026 group-stage opponents, derived from their own FBref tables by
// scripts/parse_opponents.py: attack from goals and shots on target, defence
// from what opponents managed against them, both as log-ratios against Korea's
// own rates with Korea pinned at 70. Transferred by hand on purpose, so that
// script only ever reports and this table stays the single place the engine
// reads. Re-run it to check for drift. The values these replaced were hand-set
// balance numbers, and the derivation reproduced them closely enough to be a
// check on both: Czechia 68 attack against 68, South Africa 70 defence against
// 70, and the same ordering on each axis. Limits are in MODEL_SELECTION §4.
const OPP_STRENGTH = {
  MEX: { att: 77, def: 77 },
  CZE: { att: 68, def: 65 },
  RSA: { att: 67, def: 70 }
};

// What a player has left right now: whatever the first half drained him to,
// or his baseline if he has not been on the pitch yet. The same rule the
// stamina gauge on the card uses, so the bars and the model agree.
function staminaOf(name) {
  if (state.staminaState[name] !== undefined) return state.staminaState[name];
  const s = (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[name]) ? SQUAD_STATS_2026[name] : null;
  return s ? s.stamina : 82;
}

function poissonSample(lambda) {
  // Knuth's algorithm
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k += 1; p *= Math.random(); } while (p > L);
  return k - 1;
}

function secondHalfLambdas() {
  const s = state.stats;
  const o = OPP_STRENGTH[state.opponent] || { att: 72, def: 72 };
  const mid = 1 + (s.midfield - 65) / 220; // midfield control tilts possession
  let lamKor = 0.72 * (s.attack / o.def) * mid;
  let lamOpp = 0.72 * (o.att / s.defense) / mid;
  const base = { kor: lamKor, opp: lamOpp };

  // XAI instrumentation: every multiplier is recorded as a named factor.
  // apply() keeps the math identical to the original chained *= lines.
  const factors = [];
  const apply = (id, label, korMul, oppMul) => {
    lamKor *= korMul;
    lamOpp *= oppMul;
    factors.push({ id, label, korMul, oppMul });
  };

  if (state.dials.mentality === 'attack') apply('mentality-attack', '전원 닥공 전환', 1.18, 1.12);
  else if (state.dials.mentality === 'lock') apply('mentality-lock', '수비 잠그기 운영', 0.82, 0.80);
  if (state.dials.press === 'high') apply('press-high', '게겐프레싱 고압박', 1, 0.88);
  else if (state.dials.press === 'tenback') apply('press-tenback', '텐백 저지선', 0.88, 0.75);
  if (state.dials.route === 'halfspace') apply('route-halfspace', '하프스페이스 중앙 침투', 1.10, 1);
  else if (state.dials.route === 'wing') apply('route-wing', '측면 오버랩', 1.07, 1);
  else if (state.dials.route === 'longball') apply('route-longball', '다이렉트 롱볼', 1.06, 1.03);
  if (state.dials.nopassback) apply('nopassback', 'U자 백패스 금지', 1.08, 1);
  if (kanginActive()) apply('kangin', '이강인 프리롤', 1.08, 1.04); // star magic, but over-reliance opens gaps

  // Stamina after first-half drain: tired legs score less, concede more.
  // Averaged over the ELEVEN ON THE PITCH, not over everyone who has played.
  // The old version read the drain map, so a substitute brought on at
  // half-time was invisible to the model while the man he replaced kept
  // dragging the average down: making a change could not help, which is the
  // opposite of what a fresh pair of legs does. With no substitution the two
  // are the same eleven, so nothing about the documented board moves.
  const xi = (squadData[state.currentFormation] || []).map(p => p.name);
  const avg = xi.length ? xi.reduce((a, n) => a + staminaOf(n), 0) / xi.length : 70;
  const sf = 0.75 + (avg / 100) * 0.45; // ~0.9 .. 1.2
  apply('stamina', `후반 체력 (평균 ${Math.round(avg)}%)`, sf, 1.9 - sf);

  // AI opponent manager's counter-tactics shift the expected goals.
  const om = opponentModifiers();
  const oppName = (typeof OPPONENT_PROFILES !== 'undefined' && OPPONENT_PROFILES[state.opponent])
    ? OPPONENT_PROFILES[state.opponent].name.split(' ')[0] : state.opponent;
  apply('opponent', `${oppName} AI 감독 카운터`, om.korMul, om.oppMul);

  return { lamKor: Math.max(0.05, lamKor), lamOpp: Math.max(0.05, lamOpp), base, factors };
}

// The counter plan's mechanical teeth, shared by the sim (opponentModifiers)
// and by the chip readout that explains the plan to the user.
function planMultipliers(cd) {
  let korMul = 1, oppMul = 1;
  if (cd.press === 'high') korMul *= 0.90;      // their press suppresses our goals
  else if (cd.press === 'tenback') korMul *= 0.82;
  if (cd.mentality === 'attack') oppMul *= 1.15; // they commit forward, score more
  else if (cd.mentality === 'lock') oppMul *= 0.85;
  if (cd.tempo === 'direct') oppMul *= 1.08;
  return { korMul, oppMul };
}

function opponentModifiers() {
  const plan = state.opponentPlan;
  if (!plan || !plan.counterDials) return { korMul: 1, oppMul: 1 };
  return planMultipliers(plan.counterDials);
}

function runMonteCarlo(iterations = 1000) {
  const { lamKor, lamOpp, base, factors } = secondHalfLambdas();
  const baseKor = state.halfTimeScore.kor;
  const baseOpp = state.halfTimeScore.opp;
  let win = 0, draw = 0, lose = 0, sumKor = 0, sumOpp = 0;
  const scoreCount = {};
  for (let i = 0; i < iterations; i++) {
    const k = baseKor + poissonSample(lamKor);
    const o = baseOpp + poissonSample(lamOpp);
    sumKor += k; sumOpp += o;
    if (k > o) win++; else if (k === o) draw++; else lose++;
    const key = `${k}:${o}`;
    scoreCount[key] = (scoreCount[key] || 0) + 1;
  }
  let modal = `${baseKor}:${baseOpp}`, best = -1;
  for (const key in scoreCount) {
    if (scoreCount[key] > best) { best = scoreCount[key]; modal = key; }
  }
  const [mk, mo] = modal.split(':').map(Number);
  return {
    iterations,
    winPct: Math.round((win / iterations) * 100),
    drawPct: Math.round((draw / iterations) * 100),
    losePct: Math.round((lose / iterations) * 100),
    modalScore: { kor: mk, opp: mo },
    avgKor: sumKor / iterations,
    avgOpp: sumOpp / iterations,
    lamKor, lamOpp, lamBase: base, factors
  };
}
