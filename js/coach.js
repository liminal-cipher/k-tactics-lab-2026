// Classic script; loaded before app.js. Shared board state is initialized by app.js.
// ==========================================================================
// Coach V — real AI via serverless proxy (/api/coach) with scripted fallback.
// On file:// (offline judging) or any network error, we silently fall back to
// the hand-authored responses so the coach never appears broken.
// ==========================================================================
const COACH_API = (location.protocol === 'file:') ? null : '/api/coach';

// Assemble the live board into the payload the serverless function grounds on.
function buildCoachState() {
  const xi = (squadData[state.currentFormation] || []).map(p => p.name);
  const prof = (typeof OPPONENT_PROFILES !== 'undefined' && OPPONENT_PROFILES[state.opponent]) || {};
  return {
    formation: state.currentFormation,
    opponent: state.opponent,
    opponentName: prof.name || state.opponent,
    opponentStyle: prof.style || '',
    opponentBriefing: (prof.briefing || '').replace(/<[^>]*>/g, ' ').trim(),
    stats: { ...state.stats },
    dials: { ...state.dials },
    lineup: xi,
    vibeScore: state.vibeScore
  };
}

// Escape model text, then allow simple line breaks + **bold** for readability.
function coachTextToHtml(text) {
  const esc = String(text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

// Returns the parsed JSON on success, or null → caller uses scripted fallback.
async function callCoachAPI(mode, message, signal) {
  if (!COACH_API || signal?.aborted) return null;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 25_000);
  try {
    const res = await fetch(COACH_API, {
      signal: controller.signal,
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, message: message || '', state: buildCoachState() })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.fallback || !data.reply) return null;
    return data;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}

function pushUserMessage(text) {
  const container = document.getElementById('coach-messages');
  if (!container) return;
  const bubble = document.createElement('div');
  bubble.className = 'coach-msg-bubble';
  bubble.style.cssText = 'align-self: flex-end; background: rgba(6, 182, 212, 0.18); border: 1px solid var(--accent-cyan); max-width: 85%;';
  bubble.innerHTML = `<strong>🧑‍💼 감독님:</strong><br>${coachTextToHtml(text)}`;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function pushPendingMessage() {
  const container = document.getElementById('coach-messages');
  if (!container) return null;
  const bubble = document.createElement('div');
  bubble.className = 'coach-msg-bubble';
  bubble.innerHTML = `<strong>🤖 Coach V:</strong> <em style="opacity:0.7;">전술 분석 중…</em>`;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

// Free-text chat submit (form onsubmit).
async function submitCoachChat(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('coach-input');
  if (!input) return false;
  const text = input.value.trim();
  if (!text) return false;
  input.value = '';
  pushUserMessage(text);
  const pending = pushPendingMessage();
  const data = await callCoachAPI('chat', text);
  if (pending) pending.remove();
  if (data && data.reply) {
    pushCoachMessage(coachTextToHtml(data.reply));
  } else {
    pushCoachMessage(scriptedChatFallback());
  }
  return false;
}

function scriptedChatFallback() {
  return `📋 <strong>[Coach V 오프라인 진단]</strong><br>현재 공격 <strong>${state.stats.attack}</strong> · 중원 <strong>${state.stats.midfield}</strong> · 수비 <strong>${state.stats.defense}</strong> · 체력 <strong>${state.stats.stamina}</strong> 입니다. U자형 후방 빌드업을 줄이고 하프스페이스 침투로 상대 수비 라인을 흔드는 것을 권장합니다. (실시간 AI는 배포 환경에서 가동됩니다)`;
}

// Preset buttons → real analysis with scripted fallback (original hand-written text).
async function requestAiTacticalAdvice(type) {
  const pending = pushPendingMessage();
  const prompt = (type === 'mexico')
    ? '상대 국가팀을 공략할 맞춤 전술(포메이션·다이얼·핵심 선수 활용)을 추천해줘.'
    : '현재 스쿼드 밸런스를 진단하고 후반 체력 저하 대비 교체 조언을 해줘.';
  const data = await callCoachAPI('analysis', prompt);
  if (pending) pending.remove();
  if (data && data.reply) {
    pushCoachMessage(coachTextToHtml(data.reply), false);
    return;
  }
  // Scripted fallback (offline / no key)
  if (type === 'mexico') {
    pushCoachMessage(`⚡ <strong>[상대 국가팀 맞춤 전술 분석: 멕시코/남아공]</strong><br>상대는 측면 역습 속도가 빠르고 수비 라인이 높습니다. <strong>4-2-3-1 포메이션</strong>으로 전환하고, 이강인의 킬패스와 손흥민·엄지성의 초광속 침투를 극대화하는 것을 추천합니다! (스쿼드 밸런스 최적화)`, false);
  } else {
    pushCoachMessage(`🛡️ <strong>[현재 스쿼드 밸런스 진단]</strong><br>현재 공격 파괴력 <strong>${state.stats.attack}</strong>, 중원 장악 <strong>${state.stats.midfield}</strong>, 수비 안정 <strong>${state.stats.defense}</strong>입니다. 후반전 60분이 넘어가면 체력 저하를 대비해 벤치의 조규성이나 양현준을 교체 투입하세요!`, false);
  }
}

// ==========================================================================
// AI opponent manager (agentic, adversarial). The LLM scouts our XI and
// returns counter-tactics as structured JSON (opponent mode). A scripted
// heuristic is used synchronously as fallback so the sim always has a plan.
// ==========================================================================
function scriptedCounterPlan() {
  const s = state.stats;
  const cd = { tempo: 'standard', route: 'wing', press: 'region', mentality: 'balance' };
  let counterFormation = '4-4-2';
  if (s.attack >= 82) { cd.press = 'high'; cd.mentality = 'lock'; counterFormation = '4-2-3-1'; }
  if (s.defense <= 60) { cd.mentality = 'attack'; cd.tempo = 'direct'; }
  if (state.dials.mentality === 'attack') cd.press = 'high'; // punish over-commit
  return {
    counterFormation,
    counterDials: cd,
    reasoning: '한국의 강점을 지우고 약점을 노리는 기본 대응 전술입니다.',
    scripted: true
  };
}

// Vocabulary the LLM opponent must answer in (mirrors api/coach.js enums).
// Groq's JSON mode guarantees syntax only, so values are validated here:
// an off-enum plan must never replace the working scripted plan.
const OPPONENT_VOCAB = {
  formations: ['4-3-3', '3-4-3', '3-5-2', '4-2-3-1', '4-4-2'],
  tempo: ['build', 'standard', 'direct'],
  route: ['halfspace', 'wing', 'longball'],
  press: ['tenback', 'region', 'high'],
  mentality: ['lock', 'balance', 'attack']
};

function isValidOpponentPlan(plan) {
  if (!plan || !plan.counterDials) return false;
  const cd = plan.counterDials;
  return OPPONENT_VOCAB.formations.includes(plan.counterFormation) &&
    OPPONENT_VOCAB.tempo.includes(cd.tempo) &&
    OPPONENT_VOCAB.route.includes(cd.route) &&
    OPPONENT_VOCAB.press.includes(cd.press) &&
    OPPONENT_VOCAB.mentality.includes(cd.mentality);
}

// Korean labels for the opponent's counter-dial codes (mirrors the app's own
// button vocabulary). Without this the chip and coach messages leak raw enum
// codes like "성향 attack / 압박 high" into a Korean UI.
const COUNTER_KO = {
  tempo: { build: '지공 빌드업', standard: '표준 템포', direct: '다이렉트 역습' },
  press: { tenback: '텐백 저지선', region: '중원 지역방어', high: '게겐프레싱' },
  mentality: { lock: '잠그기', balance: '균형', attack: '닥공' }
};
function counterKo(group, code) {
  return (COUNTER_KO[group] && COUNTER_KO[group][code]) || code;
}

// The chip is this feature's home: idle it states the contract, after the
// scout it shows the actual picks AND what they do to the second-half
// expected goals — both for the LLM plan and for the scripted fallback,
// which used to apply silently.
function renderOpponentPlanChip(plan) {
  const box = document.getElementById('opp-plan-readout');
  if (!box) return;
  if (!plan || !plan.counterDials) {
    box.innerHTML = '🛰️ 킥오프하면 상대 감독이 <strong>내 라인업·다이얼을 읽고</strong> 카운터 전술을 짭니다. 그 선택은 후반 기대 득점에 배수로 반영됩니다.';
    return;
  }
  const cd = plan.counterDials;
  const m = planMultipliers(cd);
  const effects = [];
  if (m.korMul !== 1) effects.push(`${counterKo('press', cd.press)} → 우리 기대득점 ×${m.korMul.toFixed(2)}`);
  if (cd.mentality !== 'balance') effects.push(`${counterKo('mentality', cd.mentality)} → 상대 기대득점 ×${cd.mentality === 'attack' ? '1.15' : '0.85'}`);
  if (cd.tempo === 'direct') effects.push(`다이렉트 역습 → 상대 기대득점 ×1.08`);
  box.innerHTML =
    `🧠 <strong>카운터 확정${plan.scripted ? ' (기본 대응)' : ' (AI 판단)'}:</strong> ` +
    `${plan.counterFormation} · ${counterKo('press', cd.press)} · ${counterKo('mentality', cd.mentality)}<br>` +
    (effects.length
      ? `<span class="opp-plan-effect">${effects.join(' · ')}</span>`
      : `<span class="opp-plan-effect">중립 성향: 이번 카운터는 기대득점 배수에 손대지 않습니다</span>`);
}

// Fetch the AI opponent's plan (LLM), falling back to the scripted heuristic.
let opponentRequestId = 0;
let opponentRequestController = null;

function cancelOpponentRequest() {
  opponentRequestId += 1;
  opponentRequestController?.abort();
  opponentRequestController = null;
}

async function fetchOpponentPlan() {
  cancelOpponentRequest();
  const requestId = opponentRequestId;
  const opponent = state.opponent;
  const controller = new AbortController();
  opponentRequestController = controller;
  // Synchronous fallback first, so the sim always has a plan even if the call is slow.
  if (!state.opponentPlan) state.opponentPlan = scriptedCounterPlan();
  renderOpponentPlanChip(state.opponentPlan);
  setOppChip(true); // the scout is the moment this chip earns its screen space

  const data = await callCoachAPI('opponent', '', controller.signal);
  if (requestId !== opponentRequestId || opponent !== state.opponent || !state.opponentPlan) return;
  opponentRequestController = null;
  const plan = data && data.opponent ? data.opponent : null;
  if (isValidOpponentPlan(plan)) {
    plan.scripted = false;
    state.opponentPlan = plan;
    renderOpponentPlanChip(plan);
  }
  // Announce whichever plan stands (the scripted path used to stay silent).
  const p = state.opponentPlan;
  const oppName = (typeof OPPONENT_PROFILES !== 'undefined' && OPPONENT_PROFILES[state.opponent])
    ? OPPONENT_PROFILES[state.opponent].name : state.opponent;
  pushCoachMessage(
    `🧠 <strong>[상대 감독 스카우트: ${oppName}]</strong><br>` +
    `맞불 포메이션 <strong>${p.counterFormation}</strong> · 압박 ${counterKo('press', p.counterDials.press)} · 성향 ${counterKo('mentality', p.counterDials.mentality)}<br>` +
    // reasoning is free-form LLM text: escape it like the chat path does.
    `“${coachTextToHtml(p.reasoning || '한국의 약점을 겨냥합니다.')}”`,
    true
  );
}
