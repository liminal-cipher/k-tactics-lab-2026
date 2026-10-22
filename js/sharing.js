// Classic script; loaded before app.js. Shared board state is initialized by app.js.
// ==========================================================================
// Real viral share + "challenge a friend" URL-encoded tactic state.
// ==========================================================================
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%); z-index: 9999; background: rgba(15, 23, 42, 0.96); color: #fff; border: 1px solid var(--accent-cyan); padding: 0.85rem 1.2rem; border-radius: 10px; font-size: 0.9rem; font-weight: 700; box-shadow: 0 8px 30px rgba(0,0,0,0.5); max-width: 90vw; text-align: center;';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3400);
}

// Canonical name → player object, gathered across all formations + bench.
function buildMasterRoster() {
  const map = {};
  Object.values(squadData).forEach(list => list.forEach(p => { if (!map[p.name]) map[p.name] = { ...p }; }));
  benchPlayers.forEach(p => { if (!map[p.name]) map[p.name] = { ...p }; });
  return map;
}

function currentLineupNames() {
  return (squadData[state.currentFormation] || []).map(p => p.name);
}

function buildChallengePayload() {
  return {
    v: 1,
    f: state.currentFormation,
    o: state.opponent,
    d: { ...state.dials },
    xi: currentLineupNames(),
    s: { k: state.finalScore.kor, o: state.finalScore.opp },
    vb: state.vibeScore
  };
}

function buildChallengeURL() {
  const base = (location.origin && location.origin !== 'null')
    ? location.origin + location.pathname
    : location.href.split('#')[0];
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(buildChallengePayload()))));
  return `${base}#t=${encoded}`;
}

// Decode a shared link into the live board. Defensive: any failure → no-op.
function applyChallengeFromURL() {
  try {
    const m = (location.hash || '').match(/[#&]t=([^&]+)/);
    if (!m) return null;
    const payload = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    if (!payload || !payload.f || !squadData[payload.f]) return null;

    const roster = buildMasterRoster();
    const template = squadData[payload.f];
    if (Array.isArray(payload.xi) && payload.xi.length === template.length) {
      squadData[payload.f] = template.map((slot, i) => {
        const base = roster[payload.xi[i]];
        if (!base) return { ...slot };
        return { ...base, pos: slot.pos, role: base.role || slot.role };
      });
    }
    state.currentFormation = payload.f;
    if (payload.o) state.opponent = payload.o;
    if (payload.d && typeof payload.d === 'object') state.dials = { ...state.dials, ...payload.d };
    return { score: payload.s, vibe: payload.vb, opponent: payload.o };
  } catch (e) {
    return null;
  }
}

function announceChallenge(challenge) {
  // Reflect decoded opponent + dials + formation in the control UI.
  if (typeof selectOpponent === 'function' && state.opponent) selectOpponent(state.opponent);
  if (typeof syncDialButtons === 'function') syncDialButtons();
  // The restore path bypasses setFormation (it would push a coach quote and
  // overwrite stat presets), so move the formation button highlight by hand.
  const formBtn = document.getElementById(FORMATION_BTN_IDS[state.currentFormation] || '');
  if (formBtn) {
    document.querySelectorAll('.btn-formation').forEach(b => b.classList.remove('active'));
    formBtn.classList.add('active');
  }
  const s = challenge.score || {};
  const target = (typeof s.k === 'number' && typeof s.o === 'number')
    ? `상대 감독의 기록은 <strong>${s.k}:${s.o}</strong> (지지율 ${challenge.vibe ?? '?'}%)입니다. ` : '';
  pushCoachMessage(`🎯 <strong>[도전장 접수!]</strong><br>누군가 자신의 전술을 공유하며 감독님께 도전했습니다. ${target}이 셋업을 그대로 이어받았습니다 — 더 나은 결과를 만들어 상대를 이겨보세요!`, true);
}

function syncDialButtons() {
  ['tempo', 'route', 'press', 'mentality'].forEach(cat => {
    const btn = document.getElementById(`btn-${cat}-${state.dials[cat]}`);
    if (!btn) return;
    const parent = btn.closest('.tactic-btns');
    if (parent) parent.querySelectorAll('.btn-tactic').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
  ['nopassback', 'kangin'].forEach(name => {
    const btn = document.getElementById(`toggle-${name}`);
    if (btn) { btn.classList.toggle('on', !!state.dials[name]); btn.setAttribute('aria-pressed', String(!!state.dials[name])); }
  });
  syncKanginButton();
}

// html2canvas measures a whitespace-delimited run as one box, which is wrong for
// Korean (no spaces inside a run) and stacks the glyphs on top of each other.
// Any explicit letter-spacing switches it to per-glyph positioning, so the clone
// gets a hairline value that is invisible at 2x but lays the text out correctly.
function captureResultCard() {
  const card = document.getElementById('manager-result-card');
  return html2canvas(card, {
    // Transparent, not the page colour. The canvas is a rectangle and the card
    // is rounded, so an opaque fill survives in the four corners outside the
    // radius: in the saved PNG that reads as dark wedges poking out behind the
    // card. html2canvas clips the card's own background to its border-radius,
    // so leaving the canvas unpainted gives clean rounded corners.
    backgroundColor: null,
    scale: 2,
    onclone: doc => {
      const st = doc.createElement('style');
      // Hide the hover-only info icon in the exported card: a tooltip cue makes
      // no sense on a static PNG.
      st.textContent = '#manager-result-card, #manager-result-card * { letter-spacing: 0.01px; } #manager-result-card .xai-info { display: none; }';
      doc.head.appendChild(st);
    }
  });
}

async function shareResult() {
  const styleName = (document.getElementById('res-style-name')?.textContent || 'K-Tactics 감독 명함').trim();
  const url = buildChallengeURL();
  // Lead with the same transformation the card leads with: the score alone
  // means nothing to someone who was not told what happened that day.
  const real = REAL_RESULT[state.opponent] || { kor: 0, opp: 1 };
  const oppKo = (FIXTURE_LINE[state.opponent] || [null, state.opponent])[1];
  const mine = (document.getElementById('res-tf-mine-note')?.textContent || '').startsWith('PK')
    ? `${state.finalScore.kor}:${state.finalScore.opp} (${document.getElementById('res-tf-mine-note').textContent})`
    : `${state.finalScore.kor}:${state.finalScore.opp}`;
  const caption = `[K-Tactics Lab 2026] ${styleName}\n${oppKo}전 그날 ${real.kor}:${real.opp} → 내 지휘 ${mine} · 팬 지지율 ${state.vibeScore}%\n내 전술 이겨봐 👉 ${url}`;

  // 1) Native share sheet with the result-card image (mobile).
  let sheetShown = false;
  try {
    const card = document.getElementById('manager-result-card');
    if (card && typeof html2canvas === 'function' && navigator.canShare) {
      const canvas = await captureResultCard();
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      if (blob) {
        const file = new File([blob], 'k-tactics-card.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          sheetShown = true;
          await navigator.share({ files: [file], title: 'K-Tactics Lab 2026', text: caption, url });
          return;
        }
      }
    }
  } catch (e) {
    if (sheetShown) return; // user opened then dismissed the share sheet
  }

  // 2) Clipboard fallback (desktop).
  try {
    await navigator.clipboard.writeText(caption);
    showToast('📋 공유 문구 + 도전 링크 복사 완료! SNS·DAKER 투표에 붙여넣기 하세요 🚀');
    return;
  } catch (e) { /* fall through */ }

  // 3) Last-resort.
  alert('📤 공유 문구 (복사해 사용하세요):\n\n' + caption);
}

// --- Download Viral Shareable Card as PNG (html2canvas) ---
function downloadCardPNG() {
  // Rendering the card takes a few seconds, so the button reports progress
  // instead of looking dead.
  const btn = document.querySelector('.btn-download');
  const label = btn ? btn.querySelector('span') : null;
  const original = label ? label.textContent : '';
  if (btn) { btn.disabled = true; }
  if (label) { label.textContent = '🖼️ 명함 카드 생성 중...'; }
  const restore = () => {
    if (btn) btn.disabled = false;
    if (label) label.textContent = original;
  };

  captureResultCard().then(canvas => {
    const link = document.createElement('a');
    link.download = `K-Tactics_2026_내감독명함_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    restore();
  }).catch(err => {
    restore();
    alert('이미지 생성 중 오류가 발생했습니다. 다시 시도해 주세요!');
  });
}
