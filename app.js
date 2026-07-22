/* ==========================================================================
   K-Tactics Lab 2026 - Advanced Interactive Engine (Vanilla JS)
   ========================================================================== */

// --- Global State ---
const state = {
  currentFormation: '4-3-3',
  vibeScore: 50,
  opponent: 'MEX', // 'MEX' | 'ESP' | 'RSA'
  matchPhase: 0, // 0: Pre-match (0'), 1: Half-time (45'), 2: Full-time (90')
  staminaState: {}, // { '손흥민': 85, '황인범': 89 ... }
  subActions: [], // [ { time: '60m', playerOut: '황인범', playerIn: '오현규' } ]
  dials: {
    tempo: 'standard', // 'build' | 'standard' | 'direct'
    route: 'halfspace', // 'halfspace' | 'wing' | 'longball' (attacking approach axis)
    press: 'region', // 'tenback' | 'region' | 'high'
    mentality: 'balance', // 'lock' | 'balance' | 'attack'
    nopassback: false, // 🚫 U자 백패스 금지 (signature reform toggle)
    kangin: false // 🎯 이강인 프리롤 / 해줘축구 (high-risk star-reliance toggle)
  },
  halfTimeScore: { kor: 0, opp: 1 },
  finalScore: { kor: 2, opp: 1 },
  stats: {
    attack: 75,
    defense: 60,
    midfield: 80,
    stamina: 70
  },
  tactics: {
    halfspace: true,
    nopassback: false,
    kangin: false
  },
  fullbackRole: 'inverted', // 'inverted' | 'defensive' | 'overlap'
  selectedJoker: {
    id: 'oh',
    name: '오현규 (피지컬/뚝배기)'
  },
  activePlayerForRole: null,
  selectedPlayerForSwap: null,
  draggedPlayer: null,
  draggedSource: null // 'pitch' | 'bench'
};

// --- Player Squad & Bench Data (Strictly 20 Official Played Members) ---
const squadData = {
  '4-3-3': [
    { id: 'p1', name: '손흥민', pos: 'LW', avatar: '⚡', role: '인사이드 포워드', type: 'att' },
    { id: 'p2', name: '오현규', pos: 'ST', avatar: '🎯', role: '컴플리트 포워드', type: 'att' },
    { id: 'p3', name: '이강인', pos: 'RW', avatar: '🎨', role: '전천후 플레이메이커', type: 'att' },
    { id: 'p4', name: '이재성', pos: 'LCM', avatar: '🏃', role: '박스 투 박스', type: 'mid' },
    { id: 'p5', name: '황인범', pos: 'RCM', avatar: '🧭', role: '딥라잉 플레이메이커', type: 'mid' },
    { id: 'p6', name: '백승호', pos: 'CDM', avatar: '🛡️', role: '홀딩 미드필더', type: 'mid' },
    { id: 'p7', name: '이태석', pos: 'LB', avatar: '🔄', role: '인버티드 풀백', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '파괴자 스토퍼', type: 'def' },
    { id: 'p9', name: '이한범', pos: 'CB', avatar: '⚓', role: '커버링 센터백', type: 'def' },
    { id: 'p10', name: '설영우', pos: 'RB', avatar: '🛡️', role: '밸런스형 풀백', type: 'def' },
    { id: 'p11', name: '김승규', pos: 'GK', avatar: '🧤', role: '안정형 수문장', type: 'gk' }
  ],
  '3-5-2': [
    { id: 'p1', name: '손흥민', pos: 'LS', avatar: '⚡', role: '라인 브레이커', type: 'att' },
    { id: 'p2', name: '오현규', pos: 'RS', avatar: '🎯', role: '피지컬 타겟맨', type: 'att' },
    { id: 'p7', name: '이태석', pos: 'LWB', avatar: '🏃', role: '왕성한 활동량', type: 'def' },
    { id: 'p3', name: '이강인', pos: 'CAM', avatar: '🎨', role: '프리롤 마법사', type: 'att' },
    { id: 'p5', name: '황인범', pos: 'CM', avatar: '🧭', role: '템포 조율사', type: 'mid' },
    { id: 'p6', name: '백승호', pos: 'CDM', avatar: '⚙️', role: '중원 진공청소기', type: 'mid' },
    { id: 'p10', name: '설영우', pos: 'RWB', avatar: '🛡️', role: '클래식 윙백', type: 'def' },
    { id: 'p12', name: '이기혁', pos: 'LCB', avatar: '🔒', role: '좌측 스토퍼', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '수비 사령관', type: 'def' },
    { id: 'p9', name: '이한범', pos: 'RCB', avatar: '⚓', role: '우측 스토퍼', type: 'def' },
    { id: 'p11', name: '김승규', pos: 'GK', avatar: '🧤', role: '안정형 수문장', type: 'gk' }
  ],
  '4-2-3-1': [
    { id: 'p1', name: '손흥민', pos: 'ST', avatar: '⚡', role: '원톱 해결사', type: 'att' },
    { id: 'p13', name: '황희찬', pos: 'LAM', avatar: '🌪️', role: '크랙 드리블러', type: 'att' },
    { id: 'p3', name: '이강인', pos: 'CAM', avatar: '🎨', role: '공격 전권 지휘', type: 'att' },
    { id: 'p14', name: '엄지성', pos: 'RAM', avatar: '🔥', role: '초광속 침투', type: 'att' },
    { id: 'p5', name: '황인범', pos: 'LDM', avatar: '🧭', role: '빌드업 시가', type: 'mid' },
    { id: 'p6', name: '백승호', pos: 'RDM', avatar: '⚙️', role: '수비 스크린', type: 'mid' },
    { id: 'p7', name: '이태석', pos: 'LB', avatar: '🔄', role: '오버래핑 가담', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '괴물 수비수', type: 'def' },
    { id: 'p9', name: '이한범', pos: 'CB', avatar: '⚓', role: '차세대 센터백', type: 'def' },
    { id: 'p10', name: '설영우', pos: 'RB', avatar: '🛡️', role: '스마트 풀백', type: 'def' },
    { id: 'p11', name: '김승규', pos: 'GK', avatar: '🧤', role: '안정형 수문장', type: 'gk' }
  ],
  '4-4-2': [
    { id: 'p1', name: '손흥민', pos: 'LS', avatar: '⚡', role: '침투 포워드', type: 'att' },
    { id: 'p15', name: '조규성', pos: 'RS', avatar: '🎯', role: '포스트 플레이', type: 'att' },
    { id: 'p13', name: '황희찬', pos: 'LM', avatar: '🌪️', role: '측면 플레이메이커', type: 'att' },
    { id: 'p4', name: '이재성', pos: 'LCM', avatar: '🏃', role: '언성 히어로', type: 'mid' },
    { id: 'p5', name: '황인범', pos: 'RCM', avatar: '🧭', role: '중원 컨트롤러', type: 'mid' },
    { id: 'p3', name: '이강인', pos: 'RM', avatar: '🎨', role: '인버티드 윙어', type: 'att' },
    { id: 'p7', name: '이태석', pos: 'LB', avatar: '🔄', role: '오버래핑 가담', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '통곡의 벽', type: 'def' },
    { id: 'p12', name: '이기혁', pos: 'CB', avatar: '⚓', role: '안정적인 빌드업', type: 'def' },
    { id: 'p10', name: '설영우', pos: 'RB', avatar: '🛡️', role: '밸런스 풀백', type: 'def' },
    { id: 'p11', name: '김승규', pos: 'GK', avatar: '🧤', role: '안정형 수문장', type: 'gk' }
  ]
};

const benchPlayers = [
  { id: 'b1', name: '황희찬', pos: 'SUB', avatar: '🐂', role: '황소 돌파', type: 'att' },
  { id: 'b2', name: '조규성', pos: 'SUB', avatar: '🎯', role: '타겟 헤더', type: 'att' },
  { id: 'b3', name: '양현준', pos: 'SUB', avatar: '⚡', role: '고속 스프린트', type: 'att' },
  { id: 'b4', name: '엄지성', pos: 'SUB', avatar: '🌪️', role: '저돌적 윙어', type: 'att' },
  { id: 'b5', name: '김진규', pos: 'SUB', avatar: '🧭', role: '중원 전진 패스', type: 'mid' },
  { id: 'b6', name: '옌스 카스트로프', pos: 'SUB', avatar: '🔥', role: '다이내믹 압박', type: 'mid' },
  { id: 'b7', name: '김문환', pos: 'SUB', avatar: '🏃', role: '우측 오버래핑', type: 'def' },
  { id: 'b8', name: '이기혁', pos: 'SUB', avatar: '🛡️', role: '멀티 수비수', type: 'def' },
  { id: 'b9', name: '박진섭', pos: 'SUB', avatar: '🧱', role: '수비 스크린', type: 'def' }
];

const roleOptions = {
  att: ['인사이드 포워드', '컴플리트 포워드', '라인 브레이커', '전천후 플레이메이커', '크랙 드리블러'],
  mid: ['박스 투 박스', '딥라잉 플레이메이커', '홀딩 미드필더', '중원 진공청소기', '템포 조율사'],
  def: ['인버티드 풀백', '파괴자 스토퍼', '커버링 센터백', '클래식 윙백', '오버래핑 가담'],
  gk: ['빛현우 슈퍼세이브', '스위퍼 키퍼', '안정형 수문장']
};

// --- AI Coach Witty Quotes ---
const coachQuotes = {
  default: "감독님! 선수를 <strong>마우스로 끌어(Drag & Drop)</strong> 원하는 위치나 벤치 선수와 교체해보세요. 클릭하면 세부 전술 역할(Role)도 바꿀 수 있습니다!",
  halfspace: "오! 중앙 하프스페이스를 뚫기 시작했습니다! 측면에서 의미 없이 돌던 공이 드디어 상대 위험 지역으로 투입됩니다. (공격력 ↑)",
  nopassback: "🔥 '무의미한 U자형 백패스 금지' 선언!! 팬들이 '이게 진짜 사이다 축구지!'라며 열광합니다! 지지율 20% 폭등!!",
  kangin: "🎯 이강인 선수에게 프리롤을 주셨군요! 상대 수비 2~3명이 끌려다니면서 손흥민 선수에게 광활한 공간이 열립니다!",
  inverted: "🔄 인버티드 풀백 지시! 좌우 풀백이 중앙으로 좁혀 들어와 중원 수적 우위를 만들고, 백패스 남발 문제를 해결합니다!",
  defensive: "🔒 풀백 쓰리백 스토퍼 전환! 월드컵에서 우리를 울렸던 측면 자동문 수비가 철옹성으로 변했습니다. 실점 걱정 끝!",
  overlap: "⚡ 좌우 풀백 오버래핑 올인!! 화끈한 닥공이 펼쳐지지만... 후반전 60분이 넘어가면 선수들 체력이 바닥나서 뻗어버릴 수 있습니다!",
  form352: "🛡️ 3-5-2 포메이션! 중원을 5명으로 꽉 채우고 김민재를 중심에 세워 수비 불안을 원천 봉쇄합니다. 아주 견고한 선택!",
  form4231: "⚡ 4-2-3-1 포메이션! 이강인을 중앙 공격 메인에 두고 손흥민 원톱 파괴력을 극대화하는 현대적인 꿀조합입니다!"
};

// --- Fan Live Chat Stream Pool ---
const fanComments = [
  { user: '축잘알123', text: '오 드디어 백패스 안 하네? 이번엔 기대해 봐도 되나', type: 'normal' },
  { user: '낭만축구단', text: '크~ 하프스페이스 열리니까 공격 시원시원하다 ㅠㅠ', type: 'vip' },
  { user: '답답축구는이제그만', text: '풀백 자동문 해결 안 하면 또 조별리그 탈락입니다 ^^', type: 'hater' },
  { user: '붉은악마_서울', text: '이강인 프리롤 미쳤다!! 킬패스 팍팍 뿌려주자!!', type: 'vip' },
  { user: '대한축구협회_공식', text: '팬 여러분의 소중한 의견을 반영하여 전술을 개선 중입니다.', type: 'normal' },
  { user: '손흥민골넣자', text: '후반 60분에 조커 딱 투입하면 극장골 무조건 터짐 ㅋㅋㅋ', type: 'normal' },
  { user: '텐백은절대안돼', text: '제발 수비만 하다가 똥볼 차는 축구는 그만합시다 감독님!', type: 'hater' },
  { user: '빛현우팬클럽', text: '조현우만 믿는다 ㅠㅠ 수비수들 정신 좀 차려라', type: 'normal' }
];

// --- Synthesized match-day sound FX (Web Audio API; no assets, file:// safe) ---
const SFX = {
  ctx: null, muted: false,
  _ac() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  _tone(freq, start, dur, type, gain) {
    const ac = this.ctx; if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain || 0.2, start + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g).connect(ac.destination); o.start(start); o.stop(start + dur + 0.02);
  },
  _noise(start, dur, gain, freq) {
    const ac = this.ctx; if (!ac) return;
    const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1);
    const src = ac.createBufferSource(); src.buffer = buf;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq || 850; bp.Q.value = 0.6;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(gain || 0.14, start + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.connect(bp).connect(g).connect(ac.destination); src.start(start); src.stop(start + dur);
  },
  whistle() {
    if (this.muted) return; const ac = this._ac(); if (!ac) return; const t = ac.currentTime;
    [0, 0.19].forEach(off => { this._tone(2150, t + off, 0.15, 'square', 0.14); this._tone(2180, t + off, 0.15, 'sine', 0.10); });
  },
  cheer() {
    if (this.muted) return; const ac = this._ac(); if (!ac) return;
    this._noise(ac.currentTime, 0.85, 0.13, 800);
  },
  goal() {
    if (this.muted) return; const ac = this._ac(); if (!ac) return; const t = ac.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => this._tone(f, t + i * 0.09, 0.22, 'triangle', 0.17));
    this._noise(t + 0.1, 1.5, 0.2, 720);
  },
  ui() {
    if (this.muted) return; const ac = this._ac(); if (!ac) return;
    this._tone(720, ac.currentTime, 0.05, 'sine', 0.06);
  }
};
function toggleSfx() {
  SFX.muted = !SFX.muted;
  const btn = document.getElementById('sound-toggle');
  if (btn) { btn.textContent = SFX.muted ? '🔇' : '🔊'; btn.classList.toggle('on', !SFX.muted); btn.title = SFX.muted ? '사운드 켜기' : '사운드 끄기'; }
  if (!SFX.muted) SFX.ui();
}

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  const challenge = applyChallengeFromURL(); // decode a shared "beat my tactic" link, if any
  renderPitch(state.currentFormation);
  renderBench();
  updateStats();
  updateVibeMeter();
  startLiveChatStream();
  if (challenge) {
    dismissHeroIntro();       // a shared challenge link skips the hero onboarding
    announceChallenge(challenge);
  }
});

// --- Hero onboarding: re-coach the real 2026 RSA(남아공) match ---
function dismissHeroIntro() {
  const m = document.getElementById('hero-intro-modal');
  if (m) m.style.display = 'none';
}

function startHeroScenario() {
  dismissHeroIntro();
  if (typeof selectOpponent === 'function') selectOpponent('RSA');
  pushCoachMessage(
    `🔥 <strong>[남아공전 재도전]</strong><br>비기기만 하면 32강입니다. 손흥민을 선발로 되돌리고, U자 백패스를 폐기하고, 당신만의 전술로 그날의 결과를 바꾸세요. ` +
    `단, 손흥민을 벤치에 두면 팬 지지율이 폭락합니다.`,
    true
  );
}

// Row breakdown per formation, top to bottom (attack line first, GK last).
// Each array sums to 11 and matches that formation's squadData ordering, so
// the pitch renders the real shape (e.g. 4-2-3-1 = ST / 3 AM / 2 DM / 4 DF / GK).
const FORMATION_ROWS = {
  '4-3-3':   [3, 3, 4, 1],
  '3-5-2':   [2, 5, 3, 1],
  '4-2-3-1': [1, 3, 2, 4, 1],
  '4-4-2':   [2, 4, 4, 1]
};

// --- Render Pitch & Players (with Drag & Drop) ---
function renderPitch(formation) {
  const grid = document.getElementById('pitch-players-grid');
  grid.innerHTML = '';
  
  const players = squadData[formation] || squadData['4-3-3'];
  
  // Group players into formation lines using the per-formation row map
  // (falls back to a generic att/mid/def/GK split for any unknown formation).
  const rowSizes = FORMATION_ROWS[formation] || [3, 3, 4, 1];
  const rows = [];
  let cursor = 0;
  for (const size of rowSizes) {
    rows.push(players.slice(cursor, cursor + size));
    cursor += size;
  }
  
  rows.forEach((rowPlayers, rowIndex) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'formation-row';
    
    rowPlayers.forEach((p, colIndex) => {
      const card = createPlayerCardElement(p, 'pitch');
      rowDiv.appendChild(card);
    });
    
    grid.appendChild(rowDiv);
  });
}

// Keep the bench equal to the 20-man roster minus whoever is on the pitch,
// so a fielded player (e.g. 조규성 starting in 4-4-2) never also shows up as a
// substitute. Runs on every bench render (init, formation change, swaps).
function resyncBench() {
  const onPitch = new Set(currentLineupNames());
  const reserves = Object.values(buildMasterRoster())
    .filter(p => !onPitch.has(p.name))
    .map(p => ({ id: p.id, name: p.name, pos: 'SUB', avatar: p.avatar, role: p.role, type: p.type }));
  benchPlayers.splice(0, benchPlayers.length, ...reserves);
}

// --- Render Bench Players ---
function renderBench() {
  resyncBench();
  const benchGrid = document.getElementById('bench-grid');
  benchGrid.innerHTML = '';
  
  benchPlayers.forEach(p => {
    const card = createPlayerCardElement(p, 'bench');
    benchGrid.appendChild(card);
  });
}

// --- Create Player Card Element with HTML5 Drag & Drop ---
function createPlayerCardElement(p, source) {
  const card = document.createElement('div');
  card.className = 'player-card card-' + (p.type || 'mid');
  card.draggable = true;
  card.dataset.id = p.id;
  card.dataset.source = source;
  
  let staminaHtml = '';
  if (state.matchPhase >= 1 && source === 'pitch') {
    const stVal = state.staminaState[p.name] !== undefined ? state.staminaState[p.name] : (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name] ? SQUAD_STATS_2026[p.name].stamina : 82);
    const stColor = stVal < 60 ? '#f43f5e' : (stVal < 75 ? '#f59e0b' : '#10b981');
    staminaHtml = `
      <div class="stamina-gauge-wrap">
        <div class="stamina-gauge-fill" style="width: ${stVal}%; background: ${stColor};"></div>
      </div>
      <span class="stamina-gauge-text" style="color: ${stColor};">체력 ${stVal}%</span>
    `;
  }

  const rating = (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name]) ? SQUAD_STATS_2026[p.name].rating : '';
  card.innerHTML = `
    ${rating ? `<span class="player-rating">${rating}</span>` : ''}
    <span class="player-pos-badge">${p.pos}</span>
    <div class="player-avatar">${p.avatar}</div>
    <div class="player-name">${p.name}</div>
    <div class="player-role-tag">${p.role}</div>
    ${staminaHtml}
  `;
  
  // Click-to-Swap OR Role Popup (Hybrid Interaction)
  card.onclick = (e) => {
    if (card.classList.contains('dragging')) return;
    
    // If we already selected THIS exact player, click again -> Open Role Modal!
    if (state.selectedPlayerForSwap && state.selectedPlayerForSwap.player.id === p.id) {
      card.classList.remove('click-selected');
      state.selectedPlayerForSwap = null;
      openRoleModal(p, card);
      return;
    }
    
    // If another player was previously selected -> Swap them!
    if (state.selectedPlayerForSwap) {
      const sourceObj = state.selectedPlayerForSwap;
      state.selectedPlayerForSwap = null;
      
      document.querySelectorAll('.player-card').forEach(el => el.classList.remove('click-selected'));
      handlePlayerSwap(sourceObj.player, p, sourceObj.source, source);
      return;
    }
    
    // Otherwise, select THIS player for Click-to-Swap!
    document.querySelectorAll('.player-card').forEach(el => el.classList.remove('click-selected'));
    card.classList.add('click-selected');
    state.selectedPlayerForSwap = { player: p, source };
    
    pushCoachMessage(`👆 <strong>[클릭 맞교환 모드] ${p.name} (${p.pos})</strong> 선택됨!<br>교체할 다른 선수나 벤치 선수를 터치/클릭하세요. (세부 임무 변경을 원하시면 <strong>한 번 더 클릭</strong>하세요!)`, false);
  };
  
  // Drag Events
  card.addEventListener('dragstart', (e) => {
    state.draggedPlayer = p;
    state.draggedSource = source;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', p.id);
  });
  
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });
  
  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    card.classList.add('drag-over');
  });
  
  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over');
  });
  
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('drag-over');
    if (!state.draggedPlayer || state.draggedPlayer.id === p.id) return;
    
    handlePlayerSwap(state.draggedPlayer, p, state.draggedSource, source);
  });
  
  return card;
}

// --- Handle Drag and Drop Player Swapping & Witty AI Coach Warning ---
function handlePlayerSwap(sourcePlayer, targetPlayer, sourceOrigin, targetOrigin) {
  state.selectedPlayerForSwap = null;
  // If swapping between bench and pitch
  if (sourceOrigin === 'bench' && targetOrigin === 'pitch') {
    const pitchList = squadData[state.currentFormation];
    const targetIdx = pitchList.findIndex(x => x.id === targetPlayer.id);
    const benchIdx = benchPlayers.findIndex(x => x.id === sourcePlayer.id);
    
    if (targetIdx !== -1 && benchIdx !== -1) {
      // Preserve target position badge
      const tempPos = pitchList[targetIdx].pos;
      
      pitchList[targetIdx] = { ...sourcePlayer, pos: tempPos };
      benchPlayers[benchIdx] = { ...targetPlayer, pos: 'SUB' };
    }
  } else if (sourceOrigin === 'pitch' && targetOrigin === 'bench') {
    const pitchList = squadData[state.currentFormation];
    const sourceIdx = pitchList.findIndex(x => x.id === sourcePlayer.id);
    const benchIdx = benchPlayers.findIndex(x => x.id === targetPlayer.id);
    
    if (sourceIdx !== -1 && benchIdx !== -1) {
      const tempPos = pitchList[sourceIdx].pos;
      
      pitchList[sourceIdx] = { ...targetPlayer, pos: tempPos };
      benchPlayers[benchIdx] = { ...sourcePlayer, pos: 'SUB' };
    }
  } else if (sourceOrigin === 'pitch' && targetOrigin === 'pitch') {
    // Swap positions within pitch
    const pitchList = squadData[state.currentFormation];
    const idx1 = pitchList.findIndex(x => x.id === sourcePlayer.id);
    const idx2 = pitchList.findIndex(x => x.id === targetPlayer.id);
    
    if (idx1 !== -1 && idx2 !== -1) {
      const tempPos1 = pitchList[idx1].pos;
      const tempPos2 = pitchList[idx2].pos;
      
      const temp = pitchList[idx1];
      pitchList[idx1] = { ...pitchList[idx2], pos: tempPos1 };
      pitchList[idx2] = { ...temp, pos: tempPos2 };
    }
  }
  
  renderPitch(state.currentFormation);
  renderBench();
  
  // --- Check for Bizarre Positioning (AI Coach Witty Warning) ---
  checkBizarrePositioning(sourcePlayer, targetPlayer);
}

// --- Witty AI Coach Warning Logic ---
// Position sets used to detect a bizarre placement regardless of who is moved.
const BACKLINE_POS = ['GK', 'CB', 'LB', 'RB', 'LCB', 'RCB', 'LWB', 'RWB'];
const ATTACK_POS = ['ST', 'LW', 'RW', 'LS', 'RS', 'CAM', 'LAM', 'RAM'];

function checkBizarrePositioning(p1, p2) {
  const pitchList = squadData[state.currentFormation] || [];
  // Compare intrinsic role (type) against the slot (pos), not hardcoded names,
  // so any striker parked on the back line / any keeper pushed up is caught.
  const strikerInBack = pitchList.find(x => x.type === 'att' && BACKLINE_POS.includes(x.pos));
  const keeperUpFront = pitchList.find(x => x.type === 'gk' && ATTACK_POS.includes(x.pos));

  if (strikerInBack) {
    const spot = strikerInBack.pos === 'GK' ? '골문' : '최후방 수비';
    pushCoachMessage(`🚨 <strong>[AI 코치 긴급 경보]</strong><br>월드클래스 공격수 <strong>${strikerInBack.name} 선수를 ${spot}(${strikerInBack.pos})에 두는 배치</strong>는 공격 자원을 통째로 사장시킵니다. 팬들도 크게 술렁이고 있어요. 재고를 권합니다!`, true);
    triggerScreenShake();
    pushChatComment(`${strikerInBack.name}을 왜 수비에 둬?! 감독 제정신이냐 당장 경질해라!!`, 'hater');
  } else if (keeperUpFront) {
    pushCoachMessage(`🚨 <strong>[AI 코치 긴급 경보]</strong><br>${keeperUpFront.name} 골키퍼를 최전방 스트라이커(${keeperUpFront.pos})로 올리면 골문이 비어 실점 위험이 급격히 커집니다. 원래 자리로 되돌리는 걸 권합니다!`, true);
    triggerScreenShake();
    pushChatComment('골키퍼를 공격수로 쓰네 ㅋㅋㅋ 골문 텅텅 비었다 패망각 ㅋㅋㅋ', 'hater');
  } else {
    pushCoachMessage(`🔄 <strong>선수 교체/배치 완료!</strong><br><strong>${p1.name}</strong> ↔ <strong>${p2.name}</strong> 위치가 변경되었습니다. 선수들의 조직력이 새롭게 가동됩니다!`, false);
    pushChatComment(`오 ${p1.name} 투입했네? 이번 교체 카드는 잘 통할 것 같음!`, 'vip');
  }
  
  recalculateVibe();
  updateStats();
}

// --- Player Role Click Popup Modal ---
function openRoleModal(player, cardElement) {
  state.activePlayerForRole = player;
  
  const statObj = (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[player.name]) ? SQUAD_STATS_2026[player.name] : { rating: 80, statStr: '스탯 분석 중...' };
  
  document.getElementById('role-modal-name').innerHTML = `⚙️ ${player.name} (${player.pos}) <span style="font-size:0.8rem; color:var(--accent-cyan); font-weight:800; margin-left:0.5rem;">종합 능력치: ${statObj.rating}점</span>`;
  document.getElementById('role-modal-desc').innerHTML = `
    <div style="background:var(--surface-sunken); padding:0.7rem; border-radius:6px; border:1px solid rgba(8, 145, 178, 0.4); margin-bottom:0.8rem;">
      <div style="color:var(--accent-emerald); font-weight:700; font-size:0.75rem; margin-bottom:0.25rem;">📊 FBref / SofaScore 기반 벤치마크 스탯</div>
      <div style="font-size:0.85rem; color:var(--text-primary); font-weight:700;">기반 분석 통계: <span style="color:var(--accent-amber);">${statObj.statStr}</span></div>
      <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.3rem;">현재 수행 임무: "<strong>${player.role}</strong>" (아래 목록에서 세부 지침 변경)</div>
    </div>
  `;
  
  const list = document.getElementById('role-option-list');
  list.innerHTML = '';
  
  const options = roleOptions[player.type] || roleOptions['mid'];
  options.forEach(roleName => {
    const item = document.createElement('div');
    item.className = `role-option-item ${player.role === roleName ? 'active' : ''}`;
    item.innerHTML = `
      <span style="font-weight: 700; font-size: 0.9rem;">${roleName}</span>
      <span style="font-size: 0.75rem; color: var(--accent-emerald);">${player.role === roleName ? '✓ 현재 지정됨' : '선택하기'}</span>
    `;
    item.onclick = () => selectPlayerRole(player, roleName);
    list.appendChild(item);
  });
  
  document.getElementById('role-modal').classList.add('active');
}

function closeRoleModal() {
  const modal = document.getElementById('role-modal');
  if (modal) modal.classList.remove('active');
}

function selectPlayerRole(player, newRole) {
  player.role = newRole;
  closeRoleModal();
  renderPitch(state.currentFormation);
  renderBench();
  
  pushCoachMessage(`⚙️ <strong>${player.name}</strong> 전술 임무 변경:<br>"<strong>${newRole}</strong>" 임무를 부여받았습니다! 선수가 경기장에서 더 적극적인 롤을 수행합니다!`, false);

  recalculateVibe();
  updateStats();
}

// --- Formation Switching ---
function setFormation(formation) {
  state.currentFormation = formation;
  
  document.querySelectorAll('.btn-formation').forEach(btn => btn.classList.remove('active'));
  if (formation === '4-3-3') document.getElementById('btn-form-433').classList.add('active');
  if (formation === '3-5-2') document.getElementById('btn-form-352').classList.add('active');
  if (formation === '4-2-3-1') document.getElementById('btn-form-4231').classList.add('active');
  if (formation === '4-4-2') document.getElementById('btn-form-442').classList.add('active');
  
  document.getElementById('header-formation-val').textContent = formation + (formation === '4-3-3' ? ' (밸런스)' : (formation === '3-5-2' ? ' (쓰리백)' : ' (코어 집중)'));
  
  if (formation === '3-5-2') pushCoachMessage(coachQuotes.form352);
  else if (formation === '4-2-3-1') pushCoachMessage(coachQuotes.form4231);
  else pushCoachMessage(`⚽ <strong>${formation}</strong> 포메이션 전환!<br>선수들의 간격이 재조정되었습니다. 한국 축구의 강점을 극대화할 세부 지침을 선택해 주세요!`);
  
  if (formation === '3-5-2') {
    state.stats.defense = 85; state.stats.midfield = 88; state.stats.attack = 72;
  } else if (formation === '4-2-3-1') {
    state.stats.attack = 88; state.stats.midfield = 84; state.stats.defense = 70;
  } else {
    state.stats.attack = 78; state.stats.defense = 75; state.stats.midfield = 80;
  }
  
  renderPitch(formation);
  renderBench();
  recalculateVibe();
  updateStats();
}

// --- Floating AI Coach Chatbot Logic ---
function toggleCoachChat() {
  const win = document.getElementById('coach-chat-window');
  if (win) win.classList.toggle('active');
  const badge = document.getElementById('coach-badge-cnt');
  if (win && win.classList.contains('active') && badge) {
    badge.style.display = 'none';
  }
}

function pushCoachMessage(html, isWarning = false) {
  const container = document.getElementById('coach-messages');
  if (!container) return;
  
  const bubble = document.createElement('div');
  bubble.className = `coach-msg-bubble ${isWarning ? 'warning' : ''}`;
  bubble.innerHTML = `<strong>🤖 Coach V:</strong><br>${html}`;
  
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  
  const win = document.getElementById('coach-chat-window');
  const badge = document.getElementById('coach-badge-cnt');
  if (isWarning && win && !win.classList.contains('active')) {
    win.classList.add('active');
  } else if (win && !win.classList.contains('active') && badge) {
    badge.style.display = 'inline-block';
    let cnt = parseInt(badge.textContent || '0', 10) + 1;
    badge.textContent = cnt;
  }
}

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
async function callCoachAPI(mode, message) {
  if (!COACH_API) return null; // file:// → no backend reachable
  try {
    const res = await fetch(COACH_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, message: message || '', state: buildCoachState() })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.fallback || !data.reply) return null;
    return data;
  } catch (e) {
    return null;
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
    pushCoachMessage(`⚡ <strong>[상대 국가팀 맞춤 전술 분석: 멕시코/남아공]</strong><br>상대는 측면 역습 속도가 빠르고 수비 라인이 높습니다. <strong>4-2-3-1 포메이션</strong>으로 전환하고, 이강인의 킬패스와 손흥민·양민혁의 초광속 침투를 극대화하는 것을 추천합니다! (스쿼드 밸런스 최적화)`, false);
  } else {
    pushCoachMessage(`🛡️ <strong>[현재 스쿼드 밸런스 진단]</strong><br>현재 공격 파괴력 <strong>${state.stats.attack}</strong>, 중원 장악 <strong>${state.stats.midfield}</strong>, 수비 안정 <strong>${state.stats.defense}</strong>입니다. 후반전 60분이 넘어가면 체력 저하를 대비해 벤치의 오현규나 배준호를 교체 투입하세요!`, false);
  }
}

// --- Opponent Selection & Tactical Dial Control Functions ---
function selectOpponent(opp) {
  state.opponent = opp;
  state.opponentPlan = null; // new opponent re-scouts on next kickoff

  document.querySelectorAll('.btn-opponent').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-opp-${opp}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update the broadcast score bug's opponent side.
  const oppMeta = ({ MEX: ['MEX', '🇲🇽'], ESP: ['ESP', '🇪🇸'], RSA: ['RSA', '🇿🇦'] })[opp] || ['OPP', '🏳️'];
  const fxOpp = document.getElementById('fixture-opp'); if (fxOpp) fxOpp.textContent = oppMeta[0];
  const fxFlag = document.getElementById('fixture-opp-flag'); if (fxFlag) fxFlag.textContent = oppMeta[1];

  if (typeof OPPONENT_PROFILES !== 'undefined' && OPPONENT_PROFILES[opp]) {
    const prof = OPPONENT_PROFILES[opp];
    const briefingEl = document.getElementById('opponent-briefing-text');
    if (briefingEl) briefingEl.innerHTML = prof.briefing;
    
    pushCoachMessage(`⚔️ <strong>[상대 국가 분석 완료: ${prof.name}]</strong><br>${prof.style}<br>${prof.briefing}`, false);
  }
  
  recalculateVibe();
  updateStats();
}

// Signature reform toggles (KR-specific): U자 백패스 금지, 이강인 프리롤.
// Kept OUT of the shared Route dial so Route stays a coherent spatial axis
// (and the AI opponent never has to pick "이강인 프리롤").
function toggleTactic(name) {
  state.dials[name] = !state.dials[name];
  const on = state.dials[name];
  const btn = document.getElementById(`toggle-${name}`);
  if (btn) { btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); }
  SFX.ui(); if (name === 'nopassback' && on) SFX.cheer();
  if (name === 'nopassback') {
    pushCoachMessage(on
      ? `🚫 <strong>[U자 백패스 전면 금지]</strong><br>후방 횡·백패스를 막고 무조건 전방 전진 패스만! U자형 빌드업을 폐기 — 팬 지지율이 대폭 상승합니다!`
      : `↩️ U자 백패스 허용으로 되돌렸습니다. (후방 안정성↑, 대신 팬 지지율엔 아쉬움)`, false);
  } else if (name === 'kangin') {
    pushCoachMessage(on
      ? `🎯 <strong>[이강인 프리롤 — 해줘축구 승부수]</strong><br>이강인에게 공격 전권을 부여합니다. 화력은 크게 오르지만, 스타 의존 논란으로 팬 지지율엔 부담이 됩니다.`
      : `↩️ 이강인 프리롤을 해제하고 공격을 고르게 분담합니다.`, false);
  }
  recalculateVibe();
  updateStats();
}

function setTacticalDial(category, val) {
  state.dials[category] = val;
  SFX.ui();

  // Update button UI
  const parent = document.getElementById(`btn-${category}-${val}`)?.closest('.tactic-btns');
  if (parent) {
    parent.querySelectorAll('.btn-tactic').forEach(btn => btn.classList.remove('active'));
    const clickedBtn = document.getElementById(`btn-${category}-${val}`);
    if (clickedBtn) clickedBtn.classList.add('active');
  }
  
  // Dynamic AI Coach feedback & Vibe adjust based on ML weight profile
  if (category === 'tempo') {
    if (val === 'direct') pushCoachMessage(`⚡ <strong>[템포 변경: 다이렉트 고속 역습]</strong><br>전방으로 빠른 수직 패스를 투입합니다! 체력 소모가 다소 크지만 상대 수비 뒷공간을 단숨에 찢을 수 있습니다.`);
    else if (val === 'build') pushCoachMessage(`🐢 <strong>[템포 변경: 지공 세밀 빌드업]</strong><br>중원에서 점유율을 쥐고 차근차근 상대 수비를 흔듭니다. 패스 성공률과 중원 장악 지수가 상승합니다.`);
  } else if (category === 'route') {
    if (val === 'halfspace') pushCoachMessage(`🎯 <strong>[공격 루트: 중앙 하프스페이스 침투]</strong><br>상대 풀백과 센터백 사이 하프스페이스 틈새를 집중 타격합니다. 결정적 슈팅 기회가 극대화됩니다!`);
    else if (val === 'wing') pushCoachMessage(`↔️ <strong>[공격 루트: 측면 오버랩]</strong><br>풀백을 전진시켜 측면을 허물고 크로스로 공략합니다. 화력은 오르지만 측면 뒷공간이 열릴 수 있습니다.`);
    else if (val === 'longball') pushCoachMessage(`🚀 <strong>[공격 루트: 다이렉트 롱볼]</strong><br>중원을 생략하고 전방으로 길게 찔러 수비 뒷공간을 직선으로 노립니다. 높은 수비 라인 상대에 특히 효과적입니다.`);
  } else if (category === 'press') {
    if (val === 'high') pushCoachMessage(`🔥 <strong>[압박 강도: 초고강도 게겐프레싱]</strong><br>전방에서 공을 빼앗기자마자 5초 내에 다시 에워쌉니다! 강력한 수비 지수를 얻지만 후반전 체력 급감에 주의하세요!`, true);
    else if (val === 'tenback') pushCoachMessage(`🚌 <strong>[압박 강도: 텐백 2층 버스 저지선]</strong><br>페널티 박스 앞에 10명이 촘촘히 섭니다. 실점 확률을 극단적으로 낮추지만 공격 전개가 단조로워집니다.`);
  } else if (category === 'mentality') {
    if (val === 'attack') pushCoachMessage(`⚔️ <strong>[경기 성향: 전원 닥공 (추격 올인)]</strong><br>수비 라인을 하프라인 위로 끌어올리고 총공세에 나섭니다! 지고 있을 때 반드시 필요한 승부수입니다!`, true);
    else if (val === 'lock') pushCoachMessage(`🔒 <strong>[경기 성향: 굳히기 잠그기]</strong><br>시간을 효율적으로 쓰며 리드를 확실하게 굳힙니다. 남은 시간 동안 상대에게 틈을 주지 않습니다.`);
  }
  
  recalculateVibe();
  updateStats();
}

function switchBottomTab(tabName) {
  const benchBox = document.getElementById('bench-container');
  const tacticsBox = document.getElementById('tactical-controls-console');
  const btnBench = document.getElementById('tab-btn-bench');
  const btnTactics = document.getElementById('tab-btn-console');

  if (!benchBox || !tacticsBox) return;
  
  if (tabName === 'bench') {
    benchBox.style.display = 'block';
    tacticsBox.style.display = 'none';
    if (btnBench) btnBench.classList.add('active');
    if (btnTactics) btnTactics.classList.remove('active');
  } else if (tabName === 'tactics') {
    benchBox.style.display = 'none';
    tacticsBox.style.display = 'block';
    if (btnBench) btnBench.classList.remove('active');
    if (btnTactics) btnTactics.classList.add('active');
  }
}

// --- Recalculate Vibe Score (Realistic Trade-Offs & Counter-Matchup Engine) ---
function recalculateVibe() {
  // Base Starting Sentiment (Neutral-Realistic)
  let baseScore = 55;
  
  // 1. Formation Impact (Modest variation)
  if (state.currentFormation === '4-2-3-1') baseScore += 4;      // Modern balanced
  else if (state.currentFormation === '3-5-2') baseScore += 2;    // Tactical 3-back
  else if (state.currentFormation === '4-3-3') baseScore += 5;    // Attacking classic
  else if (state.currentFormation === '4-4-2') baseScore -= 2;    // Rigid/classic
  
  // 2. Tactical Dials Impact — each category spans a negative AND a positive so
  //    the public reacts in both directions (no more "everything nudges it up").
  if (state.dials.tempo === 'direct') baseScore += 5;            // thrilling pace (+5)
  else if (state.dials.tempo === 'build') baseScore -= 4;        // slow U-shape buildup (-4)

  if (state.dials.route === 'halfspace') baseScore += 3;         // smart central penetration (+3)
  else if (state.dials.route === 'wing') baseScore += 2;         // wide overlaps & crosses (+2)
  else if (state.dials.route === 'longball') baseScore += 1;     // direct long balls (+1)

  if (state.dials.nopassback) baseScore += 8;                    // signature "사이다" U-turn ban (+8)
  if (state.dials.kangin) baseScore -= 3;                        // "해줘축구" star-reliance the public distrusts (-3)

  if (state.dials.press === 'high') baseScore += 6;              // energetic gegenpress (+6)
  else if (state.dials.press === 'tenback') baseScore -= 12;     // boring 2-tier bus (-12)

  if (state.dials.mentality === 'attack') baseScore += 7;        // brave all-out (+7)
  else if (state.dials.mentality === 'lock') baseScore -= 10;    // time-wasting bus (-10)
  
  // 3. Counter-Matchup Synergy / Penalty (Against state.opponent)
  let matchupDelta = 0;
  if (state.opponent === 'MEX') {
    if (state.dials.press === 'high') matchupDelta -= 10;         // Mexico exploits high press space
    if (state.dials.tempo === 'direct' || state.dials.route === 'halfspace') matchupDelta += 5;
  } else if (state.opponent === 'ESP') {
    if (state.dials.tempo === 'build') matchupDelta -= 8;         // Spain dominates possession
    if (state.dials.press === 'tenback') matchupDelta -= 6;
    if (state.dials.nopassback) matchupDelta += 6;               // ban the U-turn Spain feeds on
    if (state.dials.route === 'longball') matchupDelta += 4;     // bypass their high press/line
  } else if (state.opponent === 'RSA') {
    if (state.dials.mentality === 'attack' && state.dials.press === 'high') matchupDelta -= 6;
    if (state.currentFormation === '3-5-2' || state.dials.press === 'region') matchupDelta += 5;
    if (state.dials.route === 'wing') matchupDelta -= 4;         // vacated flanks vs their physical counters
  }
  
  // 4. Lineup integrity — computed LIVE from the current board (not accumulated),
  //    so fixing a bizarre placement instantly clears its penalty. Vibe is now a
  //    pure function of state: the same setup always yields the same score.
  const pitch = squadData[state.currentFormation] || [];
  let placementPenalty = 0;
  if (pitch.some(p => p.type === 'gk' && ATTACK_POS.includes(p.pos))) placementPenalty -= 30;
  if (pitch.some(p => p.type === 'att' && BACKLINE_POS.includes(p.pos))) placementPenalty -= 25;

  // 5. Controversy: benching the captain re-enacts the real 2026 RSA-match flashpoint.
  const sonBenched = !pitch.some(p => p.name === '손흥민');
  const controversyDelta = sonBenched ? -18 : 0;

  // Final calculation
  const finalScore = baseScore + matchupDelta + placementPenalty + controversyDelta;

  // Clamp between 15 and 98
  state.vibeScore = Math.min(98, Math.max(15, Math.round(finalScore)));
  updateVibeMeter();
}

// --- Update Vibe Meter UI & Screen Shake/Glow ---
function updateVibeMeter() {
  const scoreVal = document.getElementById('vibe-score-val');
  const bar = document.getElementById('vibe-progress-bar');
  const statusText = document.getElementById('vibe-status-text');
  const headerVal = document.getElementById('header-vibe-val');
  const body = document.getElementById('body-tag');
  
  if (scoreVal) scoreVal.textContent = `지지율 ${state.vibeScore}%`;
  if (headerVal) headerVal.textContent = `${state.vibeScore}%`;
  const headerBar = document.getElementById('header-vibe-bar');
  if (headerBar) headerBar.style.width = `${state.vibeScore}%`;
  if (bar) bar.style.width = `${state.vibeScore}%`;

  if (body) body.classList.remove('shake-danger', 'glow-success');
  
  if (state.vibeScore >= 80) {
    if (scoreVal) scoreVal.style.color = 'var(--accent-emerald)';
    if (headerVal) headerVal.style.color = 'var(--accent-emerald)';
    if (bar) bar.style.backgroundColor = 'var(--accent-emerald)';
    if (statusText) statusText.textContent = `🎉 "역대급 사이다 명장 등장!" 한국 축구 팬들의 절대적인 지지를 받고 있습니다!`;
    if (body) body.classList.add('glow-success');
  } else if (state.vibeScore >= 60) {
    if (scoreVal) scoreVal.style.color = 'var(--accent-cyan)';
    if (headerVal) headerVal.style.color = 'var(--accent-cyan)';
    if (bar) bar.style.backgroundColor = 'var(--accent-cyan)';
    if (statusText) statusText.textContent = `👍 "납득이 가는 전술 변화!" 팬들이 기대감을 가지고 지켜보고 있습니다.`;
  } else if (state.vibeScore >= 40) {
    if (scoreVal) scoreVal.style.color = 'var(--accent-amber)';
    if (headerVal) headerVal.style.color = 'var(--accent-amber)';
    if (bar) bar.style.backgroundColor = 'var(--accent-amber)';
    if (statusText) statusText.textContent = `😐 "아직은 지켜보자..." 월드컵의 트라우마가 남아있어 증명이 필요합니다.`;
  } else {
    if (scoreVal) scoreVal.style.color = 'var(--accent-rose)';
    if (headerVal) headerVal.style.color = 'var(--accent-rose)';
    if (bar) bar.style.backgroundColor = 'var(--accent-rose)';
    if (statusText) statusText.textContent = `🚨 "이럴 거면 왜 감독했나?!" U자형 백패스와 자동문 수비에 팬들이 분노하고 있습니다!`;
    if (body) body.classList.add('shake-danger');
  }
}

function triggerScreenShake() {
  const body = document.getElementById('body-tag');
  body.classList.remove('shake-danger');
  void body.offsetWidth; // trigger reflow
  body.classList.add('shake-danger');
}

// --- Update Stats UI based on Real Benchmark Data ---
function updateStats() {
  const pitchList = squadData[state.currentFormation] || [];
  if (typeof SQUAD_STATS_2026 !== 'undefined' && pitchList.length > 0) {
    let totalAtt = 0, totalDef = 0, totalMid = 0, totalStam = 0;
    pitchList.forEach(p => {
      const s = SQUAD_STATS_2026[p.name] || { attack: 75, defense: 75, midfield: 75, stamina: 80 };
      totalAtt += s.attack;
      totalDef += s.defense;
      totalMid += s.midfield;
      totalStam += s.stamina;
    });
    
    let avgAtt = Math.round(totalAtt / pitchList.length);
    let avgDef = Math.round(totalDef / pitchList.length);
    let avgMid = Math.round(totalMid / pitchList.length);
    let avgStam = Math.round(totalStam / pitchList.length);
    
    if (state.currentFormation === '3-5-2') { avgDef += 8; avgMid += 5; avgAtt -= 4; }
    else if (state.currentFormation === '4-2-3-1') { avgAtt += 8; avgMid += 4; avgDef -= 4; }
    else if (state.currentFormation === '4-3-3') { avgAtt += 5; avgMid += 3; avgDef += 2; }
    
    // Apply ML Dial adjustments
    if (state.dials.tempo === 'direct') { avgAtt += 6; avgStam -= 5; }
    else if (state.dials.tempo === 'build') { avgMid += 5; avgAtt -= 2; }
    
    if (state.dials.press === 'high') { avgDef += 7; avgStam -= 8; }
    else if (state.dials.press === 'tenback') { avgDef += 10; avgAtt -= 8; }
    
    if (state.dials.mentality === 'attack') { avgAtt += 8; avgDef -= 6; }
    else if (state.dials.mentality === 'lock') { avgDef += 9; avgAtt -= 7; }

    // Attacking route now moves the balance readout too (fixes the old "route changes nothing visible")
    if (state.dials.route === 'halfspace') { avgAtt += 4; avgMid += 2; }
    else if (state.dials.route === 'wing') { avgAtt += 4; avgDef -= 4; }
    else if (state.dials.route === 'longball') { avgAtt += 3; avgMid -= 4; }
    if (state.dials.nopassback) { avgAtt += 3; avgMid += 3; }
    if (state.dials.kangin) { avgAtt += 5; avgDef -= 4; }

    state.stats.attack = Math.min(100, Math.max(30, avgAtt));
    state.stats.defense = Math.min(100, Math.max(30, avgDef));
    state.stats.midfield = Math.min(100, Math.max(30, avgMid));
    state.stats.stamina = Math.min(100, Math.max(30, avgStam));
  }

  ['attack', 'defense', 'midfield', 'stamina'].forEach(stat => {
    const val = state.stats[stat];
    const el = document.getElementById(`stat-val-${stat}`);
    const bar = document.getElementById(`stat-bar-${stat}`);
    if (el) el.textContent = val;
    if (bar) bar.style.width = `${val}%`;
  });
}

// --- Live Chat Stream Auto Generator ---
// Derive the active fan-sentiment tags from the live board state.
function activeFanTags() {
  const tags = ['general'];
  const d = state.dials || {};
  if (d.nopassback) tags.push('nopassback');
  if (d.kangin) tags.push('kangin');
  if (d.route === 'halfspace') tags.push('halfspace');
  if (d.tempo === 'direct') tags.push('directTempo');
  if (d.tempo === 'build') tags.push('buildTempo');
  if (d.press === 'high') tags.push('highPress');
  if (d.press === 'tenback') tags.push('tenback');
  if (d.mentality === 'attack') tags.push('attackMentality');
  if (d.mentality === 'lock') tags.push('lockMentality');

  const xi = (squadData[state.currentFormation] || []).map(p => p.name);
  if (!xi.includes('손흥민')) tags.push('sonBenched');

  if (state.matchPhase === 1) tags.push('half');
  else if (state.matchPhase === 2) tags.push('full');
  else tags.push('pre');

  const st = Object.values(state.staminaState || {});
  if (st.length) {
    const avg = st.reduce((a, b) => a + b, 0) / st.length;
    if (avg < 60) tags.push('fatigue');
  }
  if ((state.stats.attack || 0) >= 82) tags.push('strongAttack');
  if ((state.stats.defense || 100) <= 60) tags.push('weakDefense');
  return tags;
}

// Remember the last few lines shown so the stream never repeats back-to-back.
const recentFanTexts = [];
const RECENT_FAN_WINDOW = 3;

// Pick a comment conditioned on the current state (offline bank, $0 runtime).
// Falls back to the legacy static pool if the bank asset is missing.
function pickFanComment() {
  const bank = (typeof FAN_COMMENTS_2026 !== 'undefined') ? FAN_COMMENTS_2026 : null;
  if (!bank || !bank.length) {
    const c = fanComments[Math.floor(Math.random() * fanComments.length)];
    return { text: c.text, type: c.type };
  }
  const active = new Set(activeFanTags());
  const situational = bank.filter(c => c.tags.some(t => t !== 'general' && active.has(t)));
  // 60% of the time prefer a situational (context-matched) line; else a broadly-eligible one.
  let pool;
  if (situational.length && Math.random() < 0.6) {
    pool = situational;
  } else {
    pool = bank.filter(c => c.tags.includes('general') || c.tags.some(t => active.has(t)));
  }
  if (!pool.length) pool = bank;
  // Never show a line that's in the last few picks, so consecutive comments differ.
  let fresh = pool.filter(c => !recentFanTexts.includes(c.text));
  if (!fresh.length) fresh = pool; // pool smaller than the window: allow reuse
  const chosen = fresh[Math.floor(Math.random() * fresh.length)] || bank[0];
  recentFanTexts.push(chosen.text);
  if (recentFanTexts.length > RECENT_FAN_WINDOW) recentFanTexts.shift();
  return { text: chosen.text, type: chosen.type };
}

function startLiveChatStream() {
  setInterval(() => {
    const c = pickFanComment();
    pushChatComment(c.text, c.type);
  }, 4500);
}

function pushChatComment(text, type = 'normal', customUser = null) {
  const box = document.getElementById('chat-messages');
  const item = document.createElement('div');
  item.className = 'chat-item';
  
  const userNames = ['축잘알_서울', 'K리그덕후', '사이다전술단', '텐백은절대안돼', '손흥민골넣자', '빛현우팬', '국대응원단'];
  const user = customUser || userNames[Math.floor(Math.random() * userNames.length)];
  
  item.innerHTML = `<span class="chat-user ${type}">${user}:</span> ${text}`;
  box.appendChild(item);
  box.scrollTop = box.scrollHeight;
}

// --- Run Simulation & Match Commentary Engine (2-Phase Turn System) ---
function runSimulation() {
  if (state.matchPhase === 0) {
    runFirstHalf();
  } else if (state.matchPhase === 1) {
    runSecondHalf();
  } else {
    // If already finished, reset or show final
    state.matchPhase = 0;
    state.subActions = [];
    state.opponentPlan = null; // re-scout next match
    document.getElementById('btn-run-simulation').innerHTML = `<span>▶ 경기 시뮬레이션</span>`;
    document.getElementById('btn-run-simulation').style.background = '';
    document.getElementById('match-phase-status').innerHTML = `<span>⚽ <strong style="color: var(--accent-cyan);">0' 경기 전 셋업</strong> (포메이션, 교체 및 전술 지침 설정 완료 후 전반 가동)</span>`;
    document.getElementById('match-phase-actions').innerHTML = '';
    renderPitch(state.currentFormation);
  }
}

function runFirstHalf() {
  const btn = document.getElementById('btn-run-simulation');
  const statusEl = document.getElementById('match-phase-status');
  const actionsEl = document.getElementById('match-phase-actions');
  
  btn.disabled = true;
  btn.innerHTML = `<span>⏳ 전반전 (0~45분) AI 가동 중...</span>`;
  SFX.whistle();

  // AI opponent manager scouts our XI and picks counter-tactics (async, non-blocking).
  // Sets a scripted fallback synchronously so the sim always has a plan by 2nd half.
  fetchOpponentPlan();

  // Quick 1.5s transition relay
  const steps = [
    `⚽ 0' 킥오프! [vs ${state.opponent}] 전반전 탐색전 가동...`,
    `⚔️ 24' ${state.opponent} 측면 파상공세 vs 한국 ${state.dials.press === 'high' ? '초고강도 게겐프레싱' : '지역 방어'} 맞불!`,
    `⏱️ 45' 전반전 종료! 하프타임 라커룸 도달 (체력 방전 및 스코어 연산 중...)`
  ];
  
  let stepIdx = 0;
  statusEl.innerHTML = `<span>${steps[0]}</span>`;
  
  const interval = setInterval(() => {
    stepIdx++;
    if (stepIdx < steps.length) {
      statusEl.innerHTML = `<span>${steps[stepIdx]}</span>`;
    } else {
      clearInterval(interval);
      
      // Calculate half-time score & stamina drain based on dials
      let korGoals = 0; let oppGoals = 1;
      if (state.dials.route === 'halfspace' || state.dials.nopassback) korGoals += 1;
      if (state.dials.press === 'high' || state.dials.press === 'tenback') oppGoals = 0;
      state.halfTimeScore = { kor: korGoals, opp: oppGoals };
      
      // Drain stamina of pitch players
      const pitchList = squadData[state.currentFormation] || [];
      pitchList.forEach(p => {
        let baseStam = typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name] ? SQUAD_STATS_2026[p.name].stamina : 82;
        let drain = 22;
        if (state.dials.press === 'high') drain += 15;
        else if (state.dials.press === 'tenback') drain -= 8;
        if (state.dials.tempo === 'direct') drain += 10;
        
        // Random individual fatigue variance
        drain += Math.floor(Math.random() * 8) - 4;
        state.staminaState[p.name] = Math.max(30, baseStam - drain);
      });
      
      state.matchPhase = 1; // Half-time reached
      btn.disabled = false;
      btn.innerHTML = `<span>🔥 후반전 승부수 가동 (45~90분)</span>`;
      btn.style.background = 'var(--accent-rose)';
      btn.style.color = '#fff';
      
      statusEl.innerHTML = `<span>⏸️ <strong style="color: var(--accent-amber);">HALF-TIME (45')</strong> 전반 스코어 <strong>${korGoals} : ${oppGoals}</strong> | 방전된 선수 교체 및 후반 조커 투입 지시 중</span>`;
      
      // Add sub action booking controls
      actionsEl.innerHTML = `
        <button class="btn-opponent" onclick="bookSubAction('60m')" style="border-color: var(--accent-emerald); color: var(--accent-emerald);">⏱️ 60분 ${state.selectedJoker.name.split(' ')[0]} 투입 예약</button>
        <button class="btn-opponent" onclick="bookSubAction('75m')" style="border-color: var(--accent-cyan); color: var(--accent-cyan);">⏱️ 75분 닥공 전환 예약</button>
      `;
      
      renderPitch(state.currentFormation);
      pushCoachMessage(`⏸️ <strong>[하프타임 정비 보고 - 전반 ${korGoals}:${oppGoals}]</strong><br>구장 위 선수들의 체력 게이지 바를 확인해 주십시오! 방전된 선수(60% 미만)는 후반 60분 이후 경기력이 급감합니다. <strong>[⏱️ 교체 예약]</strong> 버튼을 누르거나 전술 다이얼을 수정한 뒤 <strong>[🔥 후반전 가동]</strong>을 눌러주십시오!`, true);
      triggerScreenShake();
    }
  }, 600);
}

function bookSubAction(timing) {
  if (timing === '60m') {
    state.subActions.push({ time: '60분', text: `${state.selectedJoker.name.split(' ')[0]} 투입` });
    pushCoachMessage(`✅ <strong>[교체 예약 등록: 60분]</strong><br>후반전 60분에 ${state.selectedJoker.name} 조커 카드가 자동 가동됩니다!`);
  } else {
    state.subActions.push({ time: '75분', text: `전원 닥공 전환` });
    setTacticalDial('mentality', 'attack');
    pushCoachMessage(`✅ <strong>[전술 예약 등록: 75분]</strong><br>후반 75분 승부처에서 전면 닥공 모드로 총공세가 펼쳐집니다!`);
  }
  
  const actionsEl = document.getElementById('match-phase-actions');
  const badgeHtml = state.subActions.map(a => `<span class="sub-action-badge">📌 ${a.time} ${a.text}</span>`).join('');
  if (actionsEl) actionsEl.innerHTML = badgeHtml;
}

// ==========================================================================
// Real match model: Poisson Monte Carlo on team-derived goal rates (local, no LLM).
// Second-half goals ~ Poisson(lambda); lambda derived from team stats, dials,
// post-drain stamina, executed subs, and opponent strength. Aggregated over N runs.
// ==========================================================================
const OPP_STRENGTH = {
  MEX: { att: 74, def: 72 },
  ESP: { att: 86, def: 82 },
  RSA: { att: 66, def: 70 }
};

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

  if (state.dials.mentality === 'attack') { lamKor *= 1.18; lamOpp *= 1.12; }
  else if (state.dials.mentality === 'lock') { lamKor *= 0.82; lamOpp *= 0.80; }
  if (state.dials.press === 'high') lamOpp *= 0.88;
  else if (state.dials.press === 'tenback') { lamOpp *= 0.75; lamKor *= 0.88; }
  if (state.dials.route === 'halfspace') lamKor *= 1.10;
  else if (state.dials.route === 'wing') lamKor *= 1.07;
  else if (state.dials.route === 'longball') { lamKor *= 1.06; lamOpp *= 1.03; }
  if (state.dials.nopassback) lamKor *= 1.08;
  if (state.dials.kangin) { lamKor *= 1.08; lamOpp *= 1.04; } // star magic, but over-reliance opens gaps

  // Stamina after first-half drain: tired legs score less, concede more.
  const st = Object.values(state.staminaState);
  const avg = st.length ? st.reduce((a, b) => a + b, 0) / st.length : 70;
  const sf = 0.75 + (avg / 100) * 0.45; // ~0.9 .. 1.2
  lamKor *= sf;
  lamOpp *= (1.9 - sf);

  // AI opponent manager's counter-tactics shift the expected goals.
  const om = opponentModifiers();
  lamKor *= om.korMul;
  lamOpp *= om.oppMul;

  return { lamKor: Math.max(0.05, lamKor), lamOpp: Math.max(0.05, lamOpp) };
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

function opponentModifiers() {
  const plan = state.opponentPlan;
  if (!plan || !plan.counterDials) return { korMul: 1, oppMul: 1 };
  const cd = plan.counterDials;
  let korMul = 1, oppMul = 1;
  if (cd.press === 'high') korMul *= 0.90;      // their press suppresses our goals
  else if (cd.press === 'tenback') korMul *= 0.82;
  if (cd.mentality === 'attack') oppMul *= 1.15; // they commit forward, score more
  else if (cd.mentality === 'lock') oppMul *= 0.85;
  if (cd.tempo === 'direct') oppMul *= 1.08;
  return { korMul, oppMul };
}

// Vocabulary the LLM opponent must answer in (mirrors api/coach.js enums).
// Groq's JSON mode guarantees syntax only, so values are validated here:
// an off-enum plan must never replace the working scripted plan.
const OPPONENT_VOCAB = {
  formations: ['4-3-3', '3-5-2', '4-2-3-1', '4-4-2'],
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

// Fetch the AI opponent's plan (LLM), falling back to the scripted heuristic.
async function fetchOpponentPlan() {
  // Synchronous fallback first, so the sim always has a plan even if the call is slow.
  if (!state.opponentPlan) state.opponentPlan = scriptedCounterPlan();

  const data = await callCoachAPI('opponent');
  const plan = data && data.opponent ? data.opponent : null;
  if (isValidOpponentPlan(plan)) {
    plan.scripted = false;
    state.opponentPlan = plan;
    const oppName = (typeof OPPONENT_PROFILES !== 'undefined' && OPPONENT_PROFILES[state.opponent])
      ? OPPONENT_PROFILES[state.opponent].name : state.opponent;
    pushCoachMessage(
      `🧠 <strong>[상대 감독 AI 스카우트: ${oppName}]</strong><br>` +
      `맞불 포메이션 <strong>${plan.counterFormation}</strong> · 성향 ${plan.counterDials.mentality} / 압박 ${plan.counterDials.press}<br>` +
      // reasoning is free-form LLM text: escape it like the chat path does.
      `“${coachTextToHtml(plan.reasoning || '한국의 약점을 겨냥합니다.')}”`,
      true
    );
  }
}

function runMonteCarlo(iterations = 1000) {
  const { lamKor, lamOpp } = secondHalfLambdas();
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
    lamKor, lamOpp
  };
}

// Execute booked substitutions: real swap on the pitch + fresh-legs stamina.
function executeSubstitutions() {
  const executed = [];
  if (state.subActions.some(a => a.time === '60분')) {
    const pitch = squadData[state.currentFormation] || [];
    const onPitch = new Set(pitch.map(p => p.name));
    let target = null, worst = 999;
    pitch.forEach(p => {
      if (p.type === 'gk') return;
      const stm = state.staminaState[p.name] ?? 70;
      if (stm < worst) { worst = stm; target = p; }
    });
    const incoming = benchPlayers.find(b => b.type === (target ? target.type : 'att') && !onPitch.has(b.name))
      || benchPlayers.find(b => !onPitch.has(b.name));
    if (target && incoming) {
      const idx = pitch.indexOf(target);
      pitch[idx] = { ...incoming, pos: target.pos, role: incoming.role || target.role };
      state.staminaState[incoming.name] = 88;
      delete state.staminaState[target.name];
      executed.push({ out: target.name, in: incoming.name });
    }
  }
  return executed;
}

function runSecondHalf() {
  const modal = document.getElementById('sim-modal');
  const liveCast = document.getElementById('sim-live-cast');
  const resultCard = document.getElementById('manager-result-card');
  const actions = document.getElementById('sim-modal-actions');
  const stepText = document.getElementById('sim-step-text');
  const canvasBox = document.getElementById('sim-canvas-container');
  const pkBox = document.getElementById('pk-shootout-container');
  
  modal.classList.add('active');
  liveCast.style.display = 'flex';
  resultCard.style.display = 'none';
  actions.style.display = 'none';
  if (canvasBox) canvasBox.style.display = 'none';
  if (pkBox) pkBox.style.display = 'none';
  
  // Execute booked substitutions (real swap + fresh legs) before sampling.
  const executedSubs = executeSubstitutions();
  renderPitch(state.currentFormation);

  // Real Monte Carlo: 1,000 Poisson draws of each side's 2nd-half goals,
  // added to the half-time score, aggregated into a win/draw/loss distribution.
  const sim = runMonteCarlo(1000);
  state.simResult = sim;
  state.finalScore = { kor: sim.modalScore.kor, opp: sim.modalScore.opp };
  const finalKor = state.finalScore.kor;
  const finalOpp = state.finalScore.opp;

  const subStep = executedSubs.length > 0
    ? `🔄 60' 교체 실행: ${executedSubs[0].out} → ${executedSubs[0].in} (프레시 레그 공격 가담!)`
    : `⚡ 65' 이강인 탈압박 후 전진 패스! 공격 주도권 장악!`;
  const steps = [
    `🔥 45' 후반전 가동! [vs ${state.opponent}] 후반전 전술 지침 및 예약 가동...`,
    subStep,
    `⚽ 88' 1,000회 몬테카를로 연산 완료! 승 ${sim.winPct}% · 무 ${sim.drawPct}% · 패 ${sim.losePct}% → 최빈 스코어 ${finalKor} : ${finalOpp}!!`
  ];
  
  let i = 0;
  stepText.textContent = steps[0];
  
  const interval = setInterval(() => {
    i++;
    if (i < steps.length) {
      stepText.textContent = steps[i];
    } else {
      clearInterval(interval);
      showFinalResult();
    }
  }, 1200);
}

function showFinalResult() {
  const liveCast = document.getElementById('sim-live-cast');
  const resultCard = document.getElementById('manager-result-card');
  const actions = document.getElementById('sim-modal-actions');
  const canvasBox = document.getElementById('sim-canvas-container');
  const pkBox = document.getElementById('pk-shootout-container');
  
  liveCast.style.display = 'none';
  
  // Check if Draw -> Trigger PK Shootout!
  if (state.finalScore.kor === state.finalScore.opp) {
    if (pkBox) {
      pkBox.style.display = 'block';
      if (typeof initPenaltyShootoutUI === 'function') initPenaltyShootoutUI();
      return;
    }
  }
  
  // Otherwise show 2D canvas animation + Result Card!
  if (canvasBox && typeof start2DMiniMatchCanvas === 'function') {
    canvasBox.style.display = 'block';
    start2DMiniMatchCanvas(state.finalScore.kor > state.finalScore.opp);
  }
  
  resultCard.style.display = 'block';
  actions.style.display = 'flex';
  
  let styleName = ""; let desc = ""; let stage = "";
  const kor = state.finalScore.kor; const opp = state.finalScore.opp;
  const sim = state.simResult || { winPct: 0, drawPct: 0, losePct: 0 };

  if (kor > opp) {
    SFX.goal();
    styleName = `🔥 '몬테카를로 승률 ${sim.winPct}% 적중!' ${state.opponent} 완파 명장`;
    desc = `${state.dials.nopassback ? 'U자형 백패스를 과감히 폐기하고 ' : ''}${state.dials.route === 'halfspace' ? '하프스페이스 중앙 침투' : state.dials.route === 'wing' ? '측면 오버랩' : '다이렉트 롱볼'}와 후반 승부수를 적중시켰습니다! 최종 스코어 ${kor}:${opp} 극적 승리! 팬 지지율 ${state.vibeScore}% 달성!`;
    stage = "월드컵 8강/4강 진출! 🇰🇷✨";
  } else if (kor === opp) {
    styleName = `⚡ '끈적한 실리주의 밸런스 마스터' 귀중한 승점 확보`;
    desc = `${state.opponent} 강호의 거센 공격을 수비 밸런스와 체력 안배로 막아냈습니다. 최종 스코어 ${kor}:${opp} 무승부! 조별리그 자력 진출 발판 마련!`;
    stage = "월드컵 16강 진출! ⚽";
  } else {
    styleName = `🎲 '아쉬운 석패' 고군분투 열정 지휘관`;
    desc = `후반 체력 저하와 상대의 파상공세를 극복하지 못하고 ${kor}:${opp}로 아쉽게 패배했습니다. 하지만 팬 지지율과 XAI 진단에서는 전술적 당위성을 인정받았습니다.`;
    stage = "조별리그 1승 1무 1패 (토너먼트 도전) 🔥";
  }

  const distLine = `📊 1,000회 몬테카를로: 승 ${sim.winPct}% · 무 ${sim.drawPct}% · 패 ${sim.losePct}% (기대 득점 ${sim.avgKor != null ? sim.avgKor.toFixed(2) : '-'} : ${sim.avgOpp != null ? sim.avgOpp.toFixed(2) : '-'})`;

  document.getElementById('res-style-name').textContent = styleName;
  document.getElementById('res-desc').textContent = `${desc}\n\n${distLine}`;
  document.getElementById('res-val-stage').textContent = stage;
  document.getElementById('res-val-vibe').textContent = `${state.vibeScore}%`;
  document.getElementById('res-val-joker').textContent = `${Math.min(95, state.vibeScore + 8)}%`;
}

function closeModal() {
  document.getElementById('sim-modal').classList.remove('active');
}

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
  // Reflect decoded opponent + dials in the control UI.
  if (typeof selectOpponent === 'function' && state.opponent) selectOpponent(state.opponent);
  if (typeof syncDialButtons === 'function') syncDialButtons();
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
}

async function shareResult() {
  const styleName = (document.getElementById('res-style-name')?.textContent || 'K-Tactics 감독 명함').trim();
  const url = buildChallengeURL();
  const caption = `[K-Tactics Lab 2026] ${styleName}\n최종 ${state.finalScore.kor}:${state.finalScore.opp} · 팬 지지율 ${state.vibeScore}%\n내 전술에 도전 👉 ${url}`;

  // 1) Native share sheet with the result-card image (mobile).
  let sheetShown = false;
  try {
    const card = document.getElementById('manager-result-card');
    if (card && typeof html2canvas === 'function' && navigator.canShare) {
      const canvas = await html2canvas(card, { backgroundColor: '#ffffff', scale: 2 });
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
  const card = document.getElementById('manager-result-card');
  
  html2canvas(card, {
    backgroundColor: '#ffffff',
    scale: 2
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `K-Tactics_2026_내감독명함_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    alert('이미지 생성 중 오류가 발생했습니다. 다시 시도해 주세요!');
  });
}

// ==========================================================================
// Locker Room Tab & Scouting Report Modal Logic
// ==========================================================================
function switchTab(tabName) {
  const tacticsView = document.getElementById('view-tactics');
  const lockerView = document.getElementById('view-locker-room');
  const btnTactics = document.getElementById('tab-btn-tactics');
  const btnLocker = document.getElementById('tab-btn-locker');
  
  if (tabName === 'locker') {
    if (tacticsView) tacticsView.style.display = 'none';
    if (lockerView) lockerView.style.display = 'block';
    if (btnTactics) { btnTactics.classList.remove('active'); btnTactics.style.background = 'var(--surface-sunken)'; btnTactics.style.color = 'var(--text-primary)'; btnTactics.style.boxShadow = 'none'; }
    if (btnLocker) { btnLocker.classList.add('active'); btnLocker.style.background = 'var(--accent-cyan)'; btnLocker.style.color = '#000'; btnLocker.style.boxShadow = '0 0 15px var(--accent-cyan-glow)'; }
    renderLockerRoom('ALL');
  } else {
    if (tacticsView) tacticsView.style.display = 'grid';
    if (lockerView) lockerView.style.display = 'none';
    if (btnTactics) { btnTactics.classList.add('active'); btnTactics.style.background = 'var(--accent-emerald)'; btnTactics.style.color = '#000'; btnTactics.style.boxShadow = '0 0 15px var(--accent-emerald-glow)'; }
    if (btnLocker) { btnLocker.classList.remove('active'); btnLocker.style.background = 'var(--surface-sunken)'; btnLocker.style.color = 'var(--text-primary)'; btnLocker.style.boxShadow = 'none'; }
  }
}

// FBref stores age as "years-days" (e.g. "34-005" = 34 years, 5 days into the
// current year of age). Fans read plain years more easily, so we surface
// "만 34세" while keeping the exact raw value untouched in the dataset.
function formatAge(raw) {
  if (!raw) return '-';
  const years = String(raw).split('-')[0];
  return `만 ${years}세`;
}

function renderLockerRoom(filterPos = 'ALL') {
  const grid = document.getElementById('locker-grid');
  if (!grid || typeof SQUAD_STATS_2026 === 'undefined') return;
  grid.innerHTML = '';
  
  Object.keys(SQUAD_STATS_2026).forEach(name => {
    const data = SQUAD_STATS_2026[name];
    if (filterPos !== 'ALL' && !data.pos.includes(filterPos)) return;
    
    const card = document.createElement('div');
    card.className = 'locker-card glass-panel';
    card.style.padding = '1.25rem';
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '0.8rem';
    
    let posColor = 'var(--accent-emerald)';
    if (data.pos.includes('FW')) posColor = 'var(--accent-rose)';
    else if (data.pos.includes('DF')) posColor = 'var(--accent-cyan)';
    else if (data.pos.includes('GK')) posColor = 'var(--accent-amber)';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="background: var(--surface-sunken); color: ${posColor}; border: 1px solid ${posColor}; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 800; font-size: 0.75rem;">${data.pos}</span>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">나이: ${formatAge(data.age)}</span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.8rem; margin: 0.4rem 0;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #eef2f7, #dbe3ec); border: 2px solid ${posColor}; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; box-shadow: 0 4px 12px rgba(15,23,42,0.12);">
          ${data.pos.includes('GK') ? '🧤' : (data.pos.includes('FW') ? '⚡' : (data.pos.includes('DF') ? '🛡️' : '🧭'))}
        </div>
        <div>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">${name}</div>
          <div style="font-size: 0.72rem; color: var(--accent-cyan);">2026 월드컵 공식 출전 멤버</div>
        </div>
      </div>
      
      <div style="background: var(--surface-sunken); padding: 0.7rem; border-radius: 6px; font-size: 0.8rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.3rem;">
        <div style="display: flex; justify-content: space-between;"><span>공식 출전:</span> <strong>${data.mp}경기 (${data.min}분)</strong></div>
        <div style="display: flex; justify-content: space-between;"><span>선발 횟수:</span> <strong>${data.starts}회</strong></div>
        <div style="display: flex; justify-content: space-between;"><span>공격포인트:</span> <strong style="color: var(--accent-rose);">${data.gls}골 ${data.ast}도움</strong></div>
      </div>
      
      <button style="margin-top: auto; width: 100%; padding: 0.6rem; background: var(--surface-sunken); border: 1px solid var(--glass-border); border-radius: 6px; color: var(--text-primary); font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: background 0.2s;">
        📊 심층 스카우팅 리포트 열기
      </button>
    `;
    
    card.onclick = () => openScoutingModal(name, data, posColor);
    grid.appendChild(card);
  });
}

function filterLocker(pos, btnEl) {
  document.querySelectorAll('.locker-filter-btn').forEach(b => {
    b.style.background = 'var(--surface-sunken)';
    b.style.color = 'var(--text-secondary)';
    b.style.borderColor = 'var(--glass-border)';
  });
  if (btnEl) {
    btnEl.style.background = 'var(--accent-cyan)';
    btnEl.style.color = '#000';
    btnEl.style.borderColor = 'var(--accent-cyan)';
  }
  renderLockerRoom(pos);
}

function openScoutingModal(name, data, posColor) {
  const modal = document.getElementById('scout-modal');
  if (!modal) return;
  
  document.getElementById('scout-name').textContent = name;
  document.getElementById('scout-pos-badge').textContent = data.pos;
  document.getElementById('scout-pos-badge').style.borderColor = posColor;
  document.getElementById('scout-pos-badge').style.color = posColor;
  document.getElementById('scout-age').textContent = `나이: ${formatAge(data.age)}`;
  
  document.getElementById('scout-val-mp').textContent = `${data.mp}경기`;
  document.getElementById('scout-val-min').textContent = `${data.min}분`;
  document.getElementById('scout-val-starts').textContent = `${data.starts}회`;
  document.getElementById('scout-val-ga').textContent = `${data.gls}골 ${data.ast}도움`;

  // Section 2: real derived rating dimensions (from per-90 FBref stats).
  const setAdv = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '-'; };
  setAdv('scout-adv-attack', data.attack);
  setAdv('scout-adv-defense', data.defense);
  setAdv('scout-adv-midfield', data.midfield);
  setAdv('scout-adv-stamina', data.stamina);
  setAdv('scout-adv-shooting', data.shooting);
  setAdv('scout-adv-composure', data.composure);
  const noteEl = document.getElementById('scout-adv-note');
  if (noteEl && data.statStr) noteEl.textContent = data.statStr;

  modal.classList.add('active');
}

function closeScoutingModal() {
  const modal = document.getElementById('scout-modal');
  if (modal) modal.classList.remove('active');
}

// ==========================================================================
// 4. PK Shootout Sub-Game & 2D Mini Match Highlight Canvas Sandbox
// ==========================================================================

let selectedPkKickers = [];

function initPenaltyShootoutUI() {
  const selectorsEl = document.getElementById('pk-kicker-selectors');
  const logEl = document.getElementById('pk-results-log');
  if (!selectorsEl || !logEl) return;
  
  logEl.innerHTML = '';
  selectedPkKickers = [];

  const ht = document.getElementById('pk-header-title');
  if (ht) ht.textContent = `⚽ 90분 정규시간 ${state.finalScore.kor}:${state.finalScore.opp} 동점 종료! 승부차기(PK) 돌입!`;

  const pitchList = squadData[state.currentFormation] || [];
  const topKickers = pitchList.slice(0, 7);
  
  selectorsEl.innerHTML = topKickers.map((p, idx) => `
    <div class="pk-kicker-card ${idx < 5 ? 'selected' : ''}" id="pk-card-${p.id}" onclick="togglePkKicker('${p.id}', '${p.name}')">
      <div style="font-size: 1.1rem;">${p.avatar}</div>
      <div style="font-weight: 800; font-size: 0.78rem; color: var(--text-primary); margin-top: 2px;">${p.name}</div>
      <div style="font-size: 0.68rem; color: var(--accent-amber); margin-top: 2px;">침착성 ${typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name] ? SQUAD_STATS_2026[p.name].composure : 78}</div>
      <span class="pk-order-badge" id="pk-order-${p.id}" style="font-size: 0.65rem; color: var(--accent-cyan); display: ${idx < 5 ? 'block' : 'none'}; font-weight: 800;">#${idx + 1} 키커</span>
    </div>
  `).join('');
  
  selectedPkKickers = topKickers.slice(0, 5).map(p => ({ id: p.id, name: p.name }));
}

function togglePkKicker(id, name) {
  const card = document.getElementById(`pk-card-${id}`);
  const badge = document.getElementById(`pk-order-${id}`);
  const existingIdx = selectedPkKickers.findIndex(k => k.id === id);
  
  if (existingIdx !== -1) {
    if (selectedPkKickers.length <= 5) return; // keep at least 5
    selectedPkKickers.splice(existingIdx, 1);
    if (card) card.classList.remove('selected');
    if (badge) badge.style.display = 'none';
  } else {
    if (selectedPkKickers.length >= 5) return; // max 5
    selectedPkKickers.push({ id, name });
    if (card) card.classList.add('selected');
    if (badge) {
      badge.style.display = 'block';
      badge.textContent = `#${selectedPkKickers.length} 키커`;
    }
  }
}

function startPenaltyShootout() {
  const logEl = document.getElementById('pk-results-log');
  const btn = document.getElementById('btn-start-pk');
  if (!logEl || !btn) return;
  
  btn.disabled = true;
  logEl.innerHTML = `<div style="color: var(--accent-cyan); font-weight: 800;">🔥 승부차기 1번 키커 준비 중...</div>`;
  
  let korPk = 0; let oppPk = 0;
  let round = 0;
  
  const interval = setInterval(() => {
    if (round < 5) {
      const kicker = selectedPkKickers[round] || { name: `한국 ${round + 1}번 키커` };
      const baseComp = typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[kicker.name] ? SQUAD_STATS_2026[kicker.name].composure : 78;
      
      const korGoal = Math.random() * 100 < (baseComp + 5);
      const oppGoal = Math.random() * 100 < 75;
      
      if (korGoal) korPk++;
      if (oppGoal) oppPk++;
      
      logEl.innerHTML += `
        <div style="padding: 0.35rem; background: var(--surface-sunken); border-radius: 4px; border-left: 3px solid ${korGoal ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          <strong>#${round + 1} ${kicker.name}:</strong> ${korGoal ? '⚽ 골 성공!!' : '❌ 골키퍼 선방 / 실축!'} vs <strong>${state.opponent}:</strong> ${oppGoal ? '⚽ 성공' : '❌ 실축!'} (현재 ${korPk}:${oppPk})
        </div>
      `;
      logEl.scrollTop = logEl.scrollHeight;
      round++;
    } else {
      clearInterval(interval);
      btn.disabled = false;
      btn.style.display = 'none';
      
      const korWin = korPk >= oppPk;
      logEl.innerHTML += `
        <div style="margin-top: 0.6rem; padding: 0.6rem; background: ${korWin ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}; border: 1px solid ${korWin ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; border-radius: 6px; text-align: center; font-weight: 900; color: ${korWin ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          🏆 최종 PK 스코어 ${korPk} : ${oppPk} — ${korWin ? '대한민국 승부차기 극적 승리!! 8강 진출!' : '아쉬운 PK 석패... 훌륭한 명승부였습니다.'}
        </div>
      `;
      
      setTimeout(() => {
        const pkBox = document.getElementById('pk-shootout-container');
        const resultCard = document.getElementById('manager-result-card');
        const actions = document.getElementById('sim-modal-actions');
        if (pkBox) pkBox.style.display = 'none';
        if (resultCard) resultCard.style.display = 'block';
        if (actions) actions.style.display = 'flex';
        
        document.getElementById('res-style-name').textContent = korWin ? "🔥 'PK 혈투 끝에 승리한 강철 심장' 승부차기 명장" : "🎲 '아쉬운 PK 석패' 불굴의 투혼 지휘관";
        document.getElementById('res-desc').textContent = `90분 정규시간 ${state.finalScore.kor}:${state.finalScore.opp} 동점 이후 승부차기에서 ${selectedPkKickers.map(k=>k.name).join(', ')} 키커들의 활약으로 ${korPk}:${oppPk} 최종 승부를 가렸습니다.`;
        document.getElementById('res-val-stage').textContent = korWin ? "월드컵 8강/16강 통과! 🇰🇷✨" : "월드컵 16강 명승부 ⚽";
      }, 3500);
    }
  }, 1000);
}

function start2DMiniMatchCanvas(isKorWin) {
  const canvas = document.getElementById('live-match-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const timerEl = document.getElementById('sim-canvas-timer');
  
  let frame = 0;
  let ballX = 270; let ballY = 130;
  let ballVX = isKorWin ? 3.5 : -2; let ballVY = 1.2;
  
  const animate = () => {
    if (frame > 180) {
      if (timerEl) timerEl.textContent = '90\' 종료';
      return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pitch grass stripes
    ctx.fillStyle = 'rgba(6, 78, 59, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Ball movement
    ballX += ballVX; ballY += ballVY;
    if (ballY < 20 || ballY > canvas.height - 20) ballVY = -ballVY;
    if (ballX > canvas.width - 40 && isKorWin) {
      ballVX = 0; ballVY = 0;
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('⚽ GOAL!! 2:1 극적 골!', canvas.width / 2 - 90, canvas.height / 2);
    }
    
    // Draw players (Red for Kor, White for Opp)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.arc(Math.max(40, ballX - 25), ballY + 15, 8, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(Math.min(canvas.width - 40, ballX + 25), ballY - 10, 8, 0, Math.PI * 2); ctx.fill();
    
    // Draw ball
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(ballX, ballY, 5, 0, Math.PI * 2); ctx.fill();
    
    frame++;
    if (timerEl) timerEl.textContent = `${Math.floor(frame / 2)}'`;
    requestAnimationFrame(animate);
  };
  
  animate();
}
