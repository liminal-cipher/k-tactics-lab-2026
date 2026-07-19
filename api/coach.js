/* ==========================================================================
   K-Tactics Lab 2026 - Coach V serverless proxy (Vercel, Node 18+)
   --------------------------------------------------------------------------
   Holds GEMINI_API_KEY server-side so judges use the AI with NO key.
   CommonJS + global fetch, zero dependencies, no package.json, no build.

   Provider is isolated behind callLLM() so the model can be swapped later
   (Gemini Flash-Lite <-> Anthropic Haiku <-> hybrid) by editing one function.

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
    `전술 다이얼: 템포 ${dials.tempo || '?'}, 루트 ${dials.route || '?'}, 압박 ${dials.press || '?'}, 성향 ${dials.mentality || '?'}`,
    lineup.length ? `선발 XI: ${lineup.join(', ')}` : '',
    typeof s.vibeScore === 'number' ? `팬 여론(지지율): ${s.vibeScore}%` : '',
  ].filter(Boolean).join('\n');
}

function buildSystem(mode, state) {
  const board = summarizeState(state);
  if (mode === 'opponent') {
    return (
      '너는 대한민국의 상대팀 감독이다. 아래 한국 대표팀 셋업의 약점을 공략하는 카운터 전술을 결정하라.\n' +
      '주어진 JSON 스키마에 정확히 맞춰 응답하라. counterFormation과 각 counterDials 값은 반드시 허용된 옵션 중에서 고른다.\n\n' +
      '=== 한국 대표팀 현재 셋업 ===\n' + board
    );
  }
  const depth =
    mode === 'analysis'
      ? '사전 스카우트 리포트처럼 구체적으로: 강점 1, 약점 1, 실전 지시 2가지를 제시하라. 5문장 이내.'
      : '2~3문장으로 짧고 임팩트 있게 답하라.';
  return `${PERSONA}\n${depth}\n\n=== 현재 전술 보드 ===\n${board}`;
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
// Provider layer. Swap this one function to change LLM backend.
// Currently: Google Gemini Flash-Lite (free tier) via generateContent.
// --------------------------------------------------------------------------
const LLM_MODEL = 'gemini-2.5-flash-lite';

async function callLLM({ system, user, maxTokens, temperature, schema }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, noKey: true };

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${LLM_MODEL}:generateContent?key=${key}`;

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
    return { ok: true, text, model: LLM_MODEL };
  } catch (e) {
    return { ok: false, status: 'exception' };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only', fallback: true });
    return;
  }

  if (!process.env.GEMINI_API_KEY) {
    // No key configured -> tell client to use scripted fallback (never a hard error).
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
  const temperature = isOpponent ? 0.6 : 0.9;

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
    res.status(502).json({ error: out.status || 'upstream', detail: out.detail, fallback: true });
    return;
  }

  if (isOpponent) {
    res.status(200).json({ reply: out.text, opponent: extractJson(out.text), model: out.model, fallback: false });
  } else {
    res.status(200).json({ reply: out.text, model: out.model, fallback: false });
  }
};
