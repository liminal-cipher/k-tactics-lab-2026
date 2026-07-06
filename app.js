/* ==========================================================================
   K-Tactics Lab 2026 - Advanced Interactive Engine (Vanilla JS)
   ========================================================================== */

// --- Global State ---
const state = {
  currentFormation: '4-3-3',
  vibeScore: 50,
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
  draggedPlayer: null,
  draggedSource: null // 'pitch' | 'bench'
};

// --- Player Squad & Bench Data ---
const squadData = {
  '4-3-3': [
    { id: 'p1', name: '손흥민', pos: 'LW', avatar: '⚡', role: '인사이드 포워드', type: 'att' },
    { id: 'p2', name: '주민규', pos: 'ST', avatar: '🎯', role: '컴플리트 포워드', type: 'att' },
    { id: 'p3', name: '이강인', pos: 'RW', avatar: '🎨', role: '전천후 플레이메이커', type: 'att' },
    { id: 'p4', name: '이재성', pos: 'LCM', avatar: '🏃', role: '박스 투 박스', type: 'mid' },
    { id: 'p5', name: '황인범', pos: 'RCM', avatar: '🧭', role: '딥라잉 플레이메이커', type: 'mid' },
    { id: 'p6', name: '박용우', pos: 'CDM', avatar: '🛡️', role: '홀딩 미드필더', type: 'mid' },
    { id: 'p7', name: '이태석', pos: 'LB', avatar: '🔄', role: '인버티드 풀백', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '파괴자 스토퍼', type: 'def' },
    { id: 'p9', name: '조유민', pos: 'CB', avatar: '⚓', role: '커버링 센터백', type: 'def' },
    { id: 'p10', name: '설영우', pos: 'RB', avatar: '🛡️', role: '밸런스형 풀백', type: 'def' },
    { id: 'p11', name: '조현우', pos: 'GK', avatar: '🧤', role: '빛현우 슈퍼세이브', type: 'gk' }
  ],
  '3-5-2': [
    { id: 'p1', name: '손흥민', pos: 'LS', avatar: '⚡', role: '라인 브레이커', type: 'att' },
    { id: 'p12', name: '오현규', pos: 'RS', avatar: '🦁', role: '피지컬 타겟맨', type: 'att' },
    { id: 'p7', name: '이태석', pos: 'LWB', avatar: '🏃', role: '왕성한 활동량', type: 'def' },
    { id: 'p3', name: '이강인', pos: 'CAM', avatar: '🎨', role: '프리롤 마법사', type: 'att' },
    { id: 'p5', name: '황인범', pos: 'CM', avatar: '🧭', role: '템포 조율사', type: 'mid' },
    { id: 'p13', name: '백승호', pos: 'CDM', avatar: '⚙️', role: '중원 진공청소기', type: 'mid' },
    { id: 'p10', name: '설영우', pos: 'RWB', avatar: '🛡️', role: '클래식 윙백', type: 'def' },
    { id: 'p14', name: '정승현', pos: 'LCB', avatar: '🔒', role: '좌측 스토퍼', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '수비 사령관', type: 'def' },
    { id: 'p9', name: '조유민', pos: 'RCB', avatar: '⚓', role: '우측 스토퍼', type: 'def' },
    { id: 'p11', name: '조현우', pos: 'GK', avatar: '🧤', role: '빛현우 슈퍼세이브', type: 'gk' }
  ],
  '4-2-3-1': [
    { id: 'p1', name: '손흥민', pos: 'ST', avatar: '⚡', role: '원톱 해결사', type: 'att' },
    { id: 'p15', name: '배준호', pos: 'LAM', avatar: '🌪️', role: '크랙 드리블러', type: 'att' },
    { id: 'p3', name: '이강인', pos: 'CAM', avatar: '🎨', role: '공격 전권 지휘', type: 'att' },
    { id: 'p16', name: '양민혁', pos: 'RAM', avatar: '🔥', role: '초광속 침투', type: 'att' },
    { id: 'p5', name: '황인범', pos: 'LDM', avatar: '🧭', role: '빌드업 시가', type: 'mid' },
    { id: 'p13', name: '백승호', pos: 'RDM', avatar: '⚙️', role: '수비 스크린', type: 'mid' },
    { id: 'p17', name: '김진수', pos: 'LB', avatar: '🔄', role: '베테랑 풀백', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '괴물 수비수', type: 'def' },
    { id: 'p18', name: '이한범', pos: 'CB', avatar: '⚓', role: '차세대 센터백', type: 'def' },
    { id: 'p10', name: '설영우', pos: 'RB', avatar: '🛡️', role: '스마트 풀백', type: 'def' },
    { id: 'p11', name: '조현우', pos: 'GK', avatar: '🧤', role: '빛현우 슈퍼세이브', type: 'gk' }
  ],
  '4-4-2': [
    { id: 'p1', name: '손흥민', pos: 'LS', avatar: '⚡', role: '침투 포워드', type: 'att' },
    { id: 'p2', name: '주민규', pos: 'RS', avatar: '🎯', role: '포스트 플레이', type: 'att' },
    { id: 'p15', name: '배준호', pos: 'LM', avatar: '🌪️', role: '측면 플레이메이커', type: 'mid' },
    { id: 'p4', name: '이재성', pos: 'LCM', avatar: '🏃', role: '언성 히어로', type: 'mid' },
    { id: 'p5', name: '황인범', pos: 'RCM', avatar: '🧭', role: '중원 컨트롤러', type: 'mid' },
    { id: 'p3', name: '이강인', pos: 'RM', avatar: '🎨', role: '인버티드 윙어', type: 'mid' },
    { id: 'p7', name: '이태석', pos: 'LB', avatar: '🔄', role: '오버래핑 가담', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '통곡의 벽', type: 'def' },
    { id: 'p9', name: '조유민', pos: 'CB', avatar: '⚓', role: '안정적인 빌드업', type: 'def' },
    { id: 'p10', name: '설영우', pos: 'RB', avatar: '🛡️', role: '밸런스 풀백', type: 'def' },
    { id: 'p11', name: '조현우', pos: 'GK', avatar: '🧤', role: '빛현우 슈퍼세이브', type: 'gk' }
  ]
};

const benchPlayers = [
  { id: 'b1', name: '이동경', pos: 'SUB', avatar: '🚀', role: '왼발 중거리 포에트', type: 'mid' },
  { id: 'b2', name: '김문환', pos: 'SUB', avatar: '🏃‍♂️', role: '지치지 않는 체력', type: 'def' },
  { id: 'b3', name: '송범근', pos: 'SUB', avatar: '🧤', role: '차기 수문장', type: 'gk' },
  { id: 'b4', name: '엄지성', pos: 'SUB', avatar: '🌪️', role: '저돌적 돌파', type: 'att' },
  { id: 'b5', name: '권경원', pos: 'SUB', avatar: '🔒', role: '베테랑 센터백', type: 'def' }
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
  nopassback: "🔥 '무의미한 U자형 백패스 금지' 선언!! 팬들이 '이게 진짜 사이다 축구지!'라며 열광합니다! 여론 지지도 20% 폭등!!",
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

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
  renderPitch(state.currentFormation);
  renderBench();
  updateStats();
  updateVibeMeter();
  startLiveChatStream();
});

// --- Render Pitch & Players (with Drag & Drop) ---
function renderPitch(formation) {
  const grid = document.getElementById('pitch-players-grid');
  grid.innerHTML = '';
  
  const players = squadData[formation] || squadData['4-3-3'];
  
  // Arrange in 4 rows: Forward, Midfield, Defense, Goalkeeper
  const fwd = players.slice(0, formation === '3-5-2' ? 2 : (formation === '4-2-3-1' ? 1 : 3));
  const mid = players.slice(fwd.length, fwd.length + (formation === '3-5-2' ? 5 : (formation === '4-2-3-1' ? 5 : 3)));
  const def = players.slice(fwd.length + mid.length, players.length - 1);
  const gk = [players[players.length - 1]];
  
  const rows = [fwd, mid, def, gk];
  
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

// --- Render Bench Players ---
function renderBench() {
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
  card.className = 'player-card';
  card.draggable = true;
  card.dataset.id = p.id;
  card.dataset.source = source;
  
  card.innerHTML = `
    <span class="player-pos-badge">${p.pos}</span>
    <div class="player-avatar">${p.avatar}</div>
    <div class="player-name">${p.name}</div>
    <div class="player-role-tag">${p.role}</div>
  `;
  
  // Click event for Role Popup
  card.onclick = (e) => {
    if (card.classList.contains('dragging')) return;
    openRoleModal(p, card);
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
function checkBizarrePositioning(p1, p2) {
  const bubble = document.getElementById('coach-bubble-text');
  
  // Example 1: Son Heung-min placed in defense or GK
  const pitchList = squadData[state.currentFormation];
  const son = pitchList.find(x => x.name === '손흥민');
  const hyunwoo = pitchList.find(x => x.name === '조현우');
  
  if (son && ['CB', 'LB', 'RB', 'LCB', 'RCB', 'GK'].includes(son.pos)) {
    bubble.innerHTML = `🚨 <strong>[AI 코치 비상 경보] 감독님 제정신이십니까?!</strong><br>월드클래스 공격수 <strong>손흥민 선수를 최후방 수비/골키퍼에 박아두다니...</strong> 축구 역사상 전례가 없는 역대급 기행입니다! 팬들이 복장 터져서 쓰러집니다!!`;
    state.vibeScore = Math.max(15, state.vibeScore - 25);
    triggerScreenShake();
    pushChatComment('손흥민을 왜 수비에 둬?! 감독 제정신이냐 당장 경질해라!!', 'hater');
  } else if (hyunwoo && ['ST', 'LW', 'RW', 'LS', 'RS', 'CAM'].includes(hyunwoo.pos)) {
    bubble.innerHTML = `🚨 <strong>[AI 코치 파멸 경보] 빛현우 골키퍼가 최전방 스트라이커?!</strong><br>골문은 누가 지키나요?! 이건 예능 축구도 아니고 파멸 그 자체입니다!! 매 경기 10실점 확정입니다!!`;
    state.vibeScore = Math.max(10, state.vibeScore - 30);
    triggerScreenShake();
    pushChatComment('골키퍼를 공격수로 쓰네 ㅋㅋㅋ 골문 텅텅 비었다 패망각 ㅋㅋㅋ', 'hater');
  } else {
    bubble.innerHTML = `🔄 <strong>선수 교체/배치 완료!</strong><br><strong>${p1.name}</strong> ↔ <strong>${p2.name}</strong> 위치가 변경되었습니다. 선수들의 조직력이 새롭게 가동됩니다!`;
    state.vibeScore = Math.min(100, state.vibeScore + 4);
    pushChatComment(`오 ${p1.name} 투입했네? 이번 교체 카드는 잘 통할 것 같음!`, 'vip');
  }
  
  updateVibeMeter();
  updateStats();
}

// --- Player Role Click Popup Modal ---
function openRoleModal(player, cardElement) {
  state.activePlayerForRole = player;
  
  document.getElementById('role-modal-name').textContent = `⚙️ ${player.name} (${player.pos}) 임무 설정`;
  document.getElementById('role-modal-desc').textContent = `현재 수행 중인 임무: "${player.role}". 아래에서 세부 전술 성향을 변경하세요.`;
  
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

function selectPlayerRole(player, newRole) {
  player.role = newRole;
  closeRoleModal();
  renderPitch(state.currentFormation);
  renderBench();
  
  const bubble = document.getElementById('coach-bubble-text');
  bubble.innerHTML = `⚙️ <strong>${player.name}</strong> 전술 임무 변경:<br>"<strong>${newRole}</strong>" 임무를 부여받았습니다! 선수가 경기장에서 더 적극적인 롤을 수행합니다.`;
  
  state.vibeScore = Math.min(100, state.vibeScore + 3);
  updateVibeMeter();
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
  
  const bubble = document.getElementById('coach-bubble-text');
  if (formation === '3-5-2') bubble.innerHTML = coachQuotes.form352;
  else if (formation === '4-2-3-1') bubble.innerHTML = coachQuotes.form4231;
  else bubble.innerHTML = `⚽ <strong>${formation}</strong> 포메이션 전환!<br>선수들의 간격이 재조정되었습니다. 한국 축구의 강점을 극대화할 세부 지침을 선택해 주세요!`;
  
  if (formation === '3-5-2') {
    state.stats.defense = 85; state.stats.midfield = 88; state.stats.attack = 72;
  } else if (formation === '4-2-3-1') {
    state.stats.attack = 88; state.stats.midfield = 84; state.stats.defense = 70;
  } else {
    state.stats.attack = 78; state.stats.defense = 75; state.stats.midfield = 80;
  }
  
  renderPitch(formation);
  recalculateVibe();
  updateStats();
}

// --- Tactic Toggles (Problem ①) ---
function toggleTactic(type) {
  state.tactics[type] = !state.tactics[type];
  const el = document.getElementById('toggle-tactic-' + type);
  if (state.tactics[type]) el.classList.add('active');
  else el.classList.remove('active');
  
  const bubble = document.getElementById('coach-bubble-text');
  if (state.tactics[type] && coachQuotes[type]) {
    bubble.innerHTML = coachQuotes[type];
    if (type === 'nopassback') pushChatComment('크~~ 드디어 백패스 금지 선언!! 이게 축구다!!', 'vip');
  } else {
    bubble.innerHTML = `⚠️ 전술 지침 해제:<br>다시 단조로운 공격 패턴으로 돌아갈 위험이 있습니다. 코칭스태프가 우려를 표합니다.`;
  }
  
  recalculateVibe();
  updateStats();
}

// --- Fullback Role Switching (Problem ②) ---
function toggleFullbackRole(role) {
  state.fullbackRole = role;
  document.querySelectorAll('#section-problem-2 .tactic-toggle-item').forEach(el => el.classList.remove('active'));
  document.getElementById('toggle-role-' + role).classList.add('active');
  
  const bubble = document.getElementById('coach-bubble-text');
  if (coachQuotes[role]) bubble.innerHTML = coachQuotes[role];
  
  if (role === 'defensive') {
    state.stats.defense = Math.min(100, state.stats.defense + 15);
    state.stats.attack = Math.max(40, state.stats.attack - 10);
    pushChatComment('풀백 스토퍼로 측면 자동문 잠갔네! 실리적인 선택 칭찬함', 'normal');
  } else if (role === 'overlap') {
    state.stats.attack = Math.min(100, state.stats.attack + 15);
    state.stats.defense = Math.max(40, state.stats.defense - 15);
    state.stats.stamina = Math.max(30, state.stats.stamina - 20);
    pushChatComment('풀백 오버래핑 올인?! 체력 다 갈아 넣고 닥공 가자!!', 'vip');
  } else {
    state.stats.midfield = Math.min(100, state.stats.midfield + 15);
    state.stats.defense = 75; state.stats.stamina = 75;
  }
  
  recalculateVibe();
  updateStats();
}

// --- Plan B Joker Selection (Problem ③) ---
function selectJoker(id, name) {
  state.selectedJoker = { id, name };
  document.querySelectorAll('.joker-item').forEach(el => el.classList.remove('selected'));
  document.getElementById('joker-' + id).classList.add('selected');
  
  const bubble = document.getElementById('coach-bubble-text');
  bubble.innerHTML = `🔄 <strong>플랜 B 조커 확정: ${name}</strong><br>후반 60분, 상대 수비 체력이 떨어졌을 때 투입하여 승부를 가르는 결정적 카드입니다!`;
  
  state.vibeScore = Math.min(100, state.vibeScore + 5);
  updateVibeMeter();
  pushChatComment(`후반 조커로 ${name} 대기 좋았다! 극장골 가자!!`, 'normal');
}

// --- Recalculate Vibe Score ---
function recalculateVibe() {
  let score = 50;
  if (state.tactics.halfspace) score += 12;
  if (state.tactics.nopassback) score += 18;
  if (state.tactics.kangin) score += 10;
  
  if (state.fullbackRole === 'inverted') score += 10;
  if (state.fullbackRole === 'defensive') score += 8;
  if (state.fullbackRole === 'overlap') score -= 5;
  
  if (state.currentFormation === '4-2-3-1' || state.currentFormation === '3-5-2') score += 5;
  
  state.vibeScore = Math.min(100, Math.max(10, score));
  updateVibeMeter();
}

// --- Update Vibe Meter UI & Screen Shake/Glow ---
function updateVibeMeter() {
  const scoreVal = document.getElementById('vibe-score-val');
  const bar = document.getElementById('vibe-progress-bar');
  const statusText = document.getElementById('vibe-status-text');
  const headerVal = document.getElementById('header-vibe-val');
  const body = document.getElementById('body-tag');
  
  scoreVal.textContent = `${state.vibeScore}%`;
  headerVal.textContent = `${state.vibeScore}%`;
  bar.style.width = `${state.vibeScore}%`;
  
  body.classList.remove('shake-danger', 'glow-success');
  
  if (state.vibeScore >= 80) {
    scoreVal.style.color = 'var(--accent-emerald)';
    headerVal.style.color = 'var(--accent-emerald)';
    statusText.textContent = `🎉 "역대급 사이다 명장 등장!" 한국 축구 팬들의 절대적인 지지를 받고 있습니다!`;
    body.classList.add('glow-success');
  } else if (state.vibeScore >= 60) {
    scoreVal.style.color = 'var(--accent-cyan)';
    headerVal.style.color = 'var(--accent-cyan)';
    statusText.textContent = `👍 "납득이 가는 전술 변화!" 팬들이 기대감을 가지고 지켜보고 있습니다.`;
  } else if (state.vibeScore >= 40) {
    scoreVal.style.color = 'var(--accent-amber)';
    headerVal.style.color = 'var(--accent-amber)';
    statusText.textContent = `😐 "아직은 지켜보자..." 월드컵의 트라우마가 남아있어 증명이 필요합니다.`;
  } else {
    scoreVal.style.color = 'var(--accent-rose)';
    headerVal.style.color = 'var(--accent-rose)';
    statusText.textContent = `🚨 "이럴 거면 왜 감독했나?!" U자형 백패스와 자동문 수비에 팬들이 분노하고 있습니다!`;
    body.classList.add('shake-danger');
  }
}

function triggerScreenShake() {
  const body = document.getElementById('body-tag');
  body.classList.remove('shake-danger');
  void body.offsetWidth; // trigger reflow
  body.classList.add('shake-danger');
}

// --- Update Stats UI ---
function updateStats() {
  ['attack', 'defense', 'midfield', 'stamina'].forEach(stat => {
    const val = state.stats[stat];
    document.getElementById(`stat-val-${stat}`).textContent = val;
    document.getElementById(`stat-bar-${stat}`).style.width = `${val}%`;
  });
}

// --- Live Chat Stream Auto Generator ---
function startLiveChatStream() {
  setInterval(() => {
    const randomIdx = Math.floor(Math.random() * fanComments.length);
    const comment = fanComments[randomIdx];
    pushChatComment(comment.text, comment.type);
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

// --- Run Simulation & Match Commentary Engine ---
function runSimulation() {
  const modal = document.getElementById('sim-modal');
  const liveCast = document.getElementById('sim-live-cast');
  const resultCard = document.getElementById('manager-result-card');
  const actions = document.getElementById('sim-modal-actions');
  const stepText = document.getElementById('sim-step-text');
  
  modal.classList.add('active');
  liveCast.style.display = 'flex';
  resultCard.style.display = 'none';
  actions.style.display = 'none';
  
  // Dramatic 3-stage Match Commentary
  const steps = [
    "⚽ [조별리그 1차전 vs 멕시코] 전반 18분, 이강인의 환상적인 하프스페이스 킬패스! -> 손흥민 침투 슈팅~~ 골골골!! 2:1 극적 승리! 🔥",
    "🛡️ [조별리그 2차전 vs 스페인] 후반 65분, 상대 무차별 측면 파상공세! -> 인버티드 풀백과 김민재의 통곡의 벽 육탄 방어!! 1:1 귀중한 무승부!",
    `🔄 [조별리그 3차전 vs 남아공] 후반 80분, 승부를 띄운 플랜 B 조커 ${state.selectedJoker.name} 투입!! -> 경기 종료 직전 극장 헤더 결승골~~~!! 조별리그 통과!! 🇰🇷✨`
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
  }, 1400);
}

function showFinalResult() {
  const liveCast = document.getElementById('sim-live-cast');
  const resultCard = document.getElementById('manager-result-card');
  const actions = document.getElementById('sim-modal-actions');
  
  liveCast.style.display = 'none';
  resultCard.style.display = 'block';
  actions.style.display = 'flex';
  
  let styleName = ""; let desc = ""; let stage = "";
  
  if (state.vibeScore >= 85) {
    styleName = "🔥 '답답한 백패스 축구 완벽 극복!' 중앙을 지배하는 명장 지략가";
    desc = `U자형 백패스를 과감히 폐기하고 이강인과 하프스페이스 침투를 극대화한 당신의 전술! 측면 수비까지 안정적으로 잠그며 한국 축구 역사상 최고의 경기력을 선보였습니다.`;
    stage = "월드컵 8강 진출! 🇰🇷✨";
  } else if (state.vibeScore >= 65) {
    styleName = "⚡ '실리주의 밸런스 마스터' 침착한 승부사";
    desc = `안정적인 빌드업과 스마트한 풀백 활용으로 수비 밸런스를 맞췄습니다. 후반 60분 투입된 조커 ${state.selectedJoker.name}의 극장골로 강호들을 잇달아 격파했습니다!`;
    stage = "월드컵 16강 진출! ⚽";
  } else if (state.vibeScore >= 45) {
    styleName = "🎲 '낭만파 상남자' 필사적인 닥공 지휘관";
    desc = `수비는 하늘에 맡기고 전원 공격을 외친 상남자 전술! 경기는 매번 4:3, 3:3으로 끝나는 역대급 꿀잼 명승부가 펼쳐져 전 세계 축구팬들을 열광시켰습니다!`;
    stage = "조별리그 3전 2승 1패 (16강 진출!) 🔥";
  } else {
    styleName = "🚌 '통곡의 텐백 버스' 수비 올인 감독";
    desc = `골문 앞에 2층 버스를 세우고 실점을 극도로 거부한 실리주의 극단! 공격은 답답하지만 절대 지지 않는 끈적한 축구로 짠내 나는 성과를 냈습니다.`;
    stage = "조별리그 3무 (토너먼트 진출) 🛡️";
  }
  
  document.getElementById('res-style-name').textContent = styleName;
  document.getElementById('res-desc').textContent = desc;
  document.getElementById('res-val-stage').textContent = stage;
  document.getElementById('res-val-vibe').textContent = `${state.vibeScore}%`;
  document.getElementById('res-val-joker').textContent = `${Math.min(95, state.vibeScore + 8)}%`;
}

function closeModal() {
  document.getElementById('sim-modal').classList.remove('active');
}

function shareResult() {
  alert('📤 [바이럴 공유 완료!]\n당신의 전술 카드 명함 텍스트가 복사되었습니다. SNS와 DAKER 대중 투표에 공유해 보세요! 🚀⚽');
}

// --- Download Viral Shareable Card as PNG (html2canvas) ---
function downloadCardPNG() {
  const card = document.getElementById('manager-result-card');
  
  html2canvas(card, {
    backgroundColor: '#0f172a',
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
