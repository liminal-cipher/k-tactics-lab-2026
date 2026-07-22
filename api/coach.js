/* ==========================================================================
   K-Tactics Lab 2026 - Coach V serverless proxy (Vercel, Node 18+)
   --------------------------------------------------------------------------
   Holds API keys server-side so judges use the AI with NO key.
   CommonJS + global fetch, zero dependencies, no package.json, no build.

   Provider layer: callLLM() tries providers in order and returns the first
   success. A provider without its env key is skipped, so deployment config
   alone decides the active backend:
     1. Groq gpt-oss-120b         (GROQ_API_KEY)
     2. Google Gemini Flash-Lite  (GEMINI_API_KEY)
   If every provider fails, the client falls back to scripted responses.

   POST /api/coach
   body: { mode: "chat"|"analysis"|"opponent", message?: string, state?: {...} }
   ok:   { reply: string, model: string, fallback: false, opponent?: {...} }
   soft-fail (client shows scripted fallback): { fallback: true, ... }
   ========================================================================== */

// --- Best-effort per-IP rate limit (in-memory; resets on cold start) ---
const RL = new Map(); // ip -> { count, resetAt }
const RL_MAX = 12;
const RL_WINDOW_MS = 60_000;

function rateLimited(ip) {
  const now = Date.now();
  const e = RL.get(ip);
  if (!e || now > e.resetAt) {
    RL.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  e.count += 1;
  return e.count > RL_MAX;
}

// Valid tactical vocabulary the AI opponent may choose from (mirrors app.js dials).
const FORMATIONS = ['4-3-3', '3-5-2', '4-2-3-1', '4-4-2'];
const DIAL_OPTIONS = {
  tempo: ['build', 'standard', 'direct'],
  route: ['halfspace', 'nopassback', 'kangin'],
  press: ['tenback', 'region', 'high'],
  mentality: ['lock', 'balance', 'attack'],
};

// Gemini responseSchema (OpenAPI subset) for the structured opponent decision.
const OPPONENT_SCHEMA = {
  type: 'object',
  properties: {
    counterFormation: { type: 'string', enum: FORMATIONS },
    counterDials: {
      type: 'object',
      properties: {
        tempo: { type: 'string', enum: DIAL_OPTIONS.tempo },
        route: { type: 'string', enum: DIAL_OPTIONS.route },
        press: { type: 'string', enum: DIAL_OPTIONS.press },
        mentality: { type: 'string', enum: DIAL_OPTIONS.mentality },
      },
      required: ['tempo', 'route', 'press', 'mentality'],
    },
    reasoning: { type: 'string' },
  },
  required: ['counterFormation', 'counterDials', 'reasoning'],
};

const PERSONA =
  '너는 대한민국 축구 대표팀의 AI 수석 코치 "Coach V"다. ' +
  '2026 북중미 월드컵을 배경으로, 한국어로 간결하고 전술적으로 조언한다. ' +
  '핵심 화두는 U자형 후방 빌드업 탈피와 측면 수비 밸런스다. ' +
  '실제 스탯과 보드 상태에 근거해 말하고, 근거 없는 과장은 피한다.';

// Korean output-style rules. gpt-oss-120b otherwise leaks English soccer
// jargon ("half-space", "lock mentality") and translationese. Examples are
// Hangul-only (no English tokens to echo) and spelled exactly like the app
// UI labels. Length stays with each mode's depth instruction, not here.
const STYLE =
  '표현 규칙(반드시 지킬 것): ' +
  '축구 용어는 하프스페이스, 텐백, 빌드업, 압박처럼 자연스러운 한글 표기만 쓴다. ' +
  '영어 단어와 괄호 원어 병기를 쓰지 않는다. U자형, PK처럼 굳어진 표기는 예외다. ' +
  '이모지나 특수 하이픈 없이 보통 문장부호만 쓴다. ' +
  '번역투를 피하고 자연스러운 구어체로 말한다.';

// Korean display names for dial codes, copied from the index.html buttons.
// The board summary uses these so the model quotes UI vocabulary instead of
// echoing raw codes like "direct" into Korean replies.
const DIAL_KO = {
  tempo: { build: '지공 빌드업', standard: '표준 템포', direct: '다이렉트 역습' },
  route: { halfspace: '하프스페이스', nopassback: 'U자 백패스 금지', kangin: '이강인 프리롤' },
  press: { tenback: '텐백 저지선', region: '중원 지역방어', high: '게겐프레싱' },
  mentality: { lock: '잠그기', balance: '균형', attack: '닥공' },
};

function dialKo(group, value) {
  return (DIAL_KO[group] && DIAL_KO[group][value]) || value || '?';
}

function summarizeState(state) {
  const s = state && typeof state === 'object' ? state : {};
  const stats = s.stats && typeof s.stats === 'object' ? s.stats : {};
  const dials = s.dials && typeof s.dials === 'object' ? s.dials : {};
  const lineup = Array.isArray(s.lineup) ? s.lineup.slice(0, 11) : [];
  return [
    `포메이션: ${s.formation || '미상'}`,
    `상대: ${s.opponentName || s.opponent || '미상'}${s.opponentStyle ? ` (${s.opponentStyle})` : ''}`,
    s.opponentBriefing ? `상대 브리핑: ${String(s.opponentBriefing).slice(0, 400)}` : '',
    `팀 지표: 공격 ${stats.attack ?? '?'} / 중원 ${stats.midfield ?? '?'} / 수비 ${stats.defense ?? '?'} / 체력 ${stats.stamina ?? '?'}`,
    `전술 다이얼: 템포 ${dialKo('tempo', dials.tempo)}, 루트 ${dialKo('route', dials.route)}, 압박 ${dialKo('press', dials.press)}, 성향 ${dialKo('mentality', dials.mentality)}`,
    lineup.length ? `선발 XI: ${lineup.join(', ')}` : '',
    typeof s.vibeScore === 'number' ? `팬 지지율: ${s.vibeScore}%` : '',
  ].filter(Boolean).join('\n');
}

function buildSystem(mode, state) {
  const board = summarizeState(state);
  if (mode === 'opponent') {
    return (
      '너는 대한민국의 상대팀 감독이다. 아래 한국 대표팀 셋업의 약점을 공략하는 카운터 전술을 결정하라.\n' +
      '주어진 JSON 스키마에 정확히 맞춰 응답하라. counterFormation과 각 counterDials 값은 반드시 허용된 옵션의 영어 코드 그대로 쓴다.\n' +
      // Do NOT inject the full STYLE here: its no-English rule would fight the
      // English enum values the schema requires. Scope it to reasoning only.
      'reasoning 필드만 자연스러운 한국어로 쓴다. 축구 용어는 하프스페이스, 텐백, 백패스 금지처럼 한글로 표기하고, JSON에 쓴 영어 코드를 문장에 그대로 옮기지 않는다. 이모지나 특수문자 없이 짧은 단문으로 쓴다.\n\n' +
      '=== 한국 대표팀 현재 셋업 ===\n' + board
    );
  }
  const depth =
    mode === 'analysis'
      ? '사전 스카우트 리포트처럼 구체적으로: 강점 1, 약점 1, 실전 지시 2가지를 제시하라. 5문장 이내.'
      : '2~3문장으로 짧고 임팩트 있게 답하라.';
  return `${PERSONA}\n${depth}\n${STYLE}\n\n=== 현재 전술 보드 ===\n${board}`;
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// --------------------------------------------------------------------------
// Provider layer. callLLM() walks the chain below; each provider is skipped
// when its env key is missing, so the active backend is pure deploy config.
// --------------------------------------------------------------------------
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GROQ_MODEL = 'openai/gpt-oss-120b';

async function callGemini({ system, user, maxTokens, temperature, schema }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, noKey: true };

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

  const generationConfig = {
    maxOutputTokens: maxTokens,
    temperature: temperature,
  };
  if (schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = schema;
  }

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig,
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return { ok: false, status: r.status, detail: detail.slice(0, 400) };
    }
    const data = await r.json();
    const text = (data.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text)
      .filter(Boolean)
      .join('\n')
      .trim();
    if (!text) return { ok: false, status: 'empty' };
    return { ok: true, text, model: GEMINI_MODEL };
  } catch (e) {
    return { ok: false, status: 'exception' };
  }
}

// Groq (OpenAI-compatible). gpt-oss is a reasoning model: reasoning is kept
// out of the reply (include_reasoning: false) but still consumes completion
// tokens, hence the headroom on max_completion_tokens. JSON mode requires
// non-raw reasoning output, which include_reasoning: false satisfies.
async function callGroq({ system, user, maxTokens, temperature, schema }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return { ok: false, noKey: true };

  const sys = schema
    ? `${system}\n\n반드시 아래 JSON 스키마를 만족하는 JSON 객체 하나만 출력하라. JSON 외 다른 텍스트 금지.\n${JSON.stringify(schema)}`
    : system;

  const body = {
    model: GROQ_MODEL,
    max_completion_tokens: maxTokens + 1024,
    temperature,
    reasoning_effort: 'low',
    include_reasoning: false,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
  };
  if (schema) body.response_format = { type: 'json_object' };

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return { ok: false, status: r.status, detail: detail.slice(0, 400) };
    }
    const data = await r.json();
    const text = (data.choices?.[0]?.message?.content || '').trim();
    if (!text) return { ok: false, status: 'empty' };
    return { ok: true, text, model: GROQ_MODEL };
  } catch (e) {
    return { ok: false, status: 'exception' };
  }
}

async function callLLM(req) {
  let lastFail = { ok: false, noKey: true, status: 'no-key' };
  for (const provider of [callGroq, callGemini]) {
    const out = await provider(req);
    if (out.ok) return out;
    if (!out.noKey) lastFail = out; // keep the most informative failure
  }
  return lastFail;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only', fallback: true });
    return;
  }

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    // No provider key configured -> tell client to use scripted fallback (never a hard error).
    res.status(200).json({ reply: '', fallback: true, error: 'no-key' });
    return;
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'rate-limited', fallback: true });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body && typeof body === 'object' ? body : {};

  const mode = ['chat', 'analysis', 'opponent'].includes(body.mode) ? body.mode : 'chat';
  const message = String(body.message || '').slice(0, 500);
  const state = body.state && typeof body.state === 'object' ? body.state : {};

  const isOpponent = mode === 'opponent';
  const maxTokens = mode === 'chat' ? 400 : 800;
  const temperature = isOpponent ? 0.6 : 0.7;

  const userContent = isOpponent
    ? '위 셋업의 약점을 공략할 카운터 전술을 스키마에 맞춰 결정하라.'
    : (message || '지금 스쿼드 밸런스를 진단해줘.');

  const out = await callLLM({
    system: buildSystem(mode, state),
    user: userContent,
    maxTokens,
    temperature,
    schema: isOpponent ? OPPONENT_SCHEMA : undefined,
  });

  if (!out.ok) {
    // Client only needs to know it should use the scripted fallback; the raw
    // upstream detail was diagnostic-only and is intentionally not exposed.
    res.status(502).json({ error: out.status || 'upstream', fallback: true });
    return;
  }

  // Deterministic cleanup the prompt rules can only encourage: normalize
  // exotic hyphens/minus (U+2010..U+2015, U+2212) the model still emits.
  const hyphens = new RegExp('[\\u2010-\\u2015\\u2212]', 'g');
  const text = out.text.replace(hyphens, '-');

  if (isOpponent) {
    res.status(200).json({ reply: text, opponent: extractJson(text), model: out.model, fallback: false });
  } else {
    res.status(200).json({ reply: text, model: out.model, fallback: false });
  }
};
