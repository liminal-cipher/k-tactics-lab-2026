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
  card.className = 'player-card card-' + (p.type || 'mid');
  card.draggable = true;
  card.dataset.id = p.id;
  card.dataset.source = source;
  
  card.innerHTML = `
    <span class="player-pos-badge">${p.pos}</span>
    <div class="player-avatar">${p.avatar}</div>
    <div class="player-name">${p.name}</div>
    <div class="player-role-tag">${p.role}</div>
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
function checkBizarrePositioning(p1, p2) {
  const pitchList = squadData[state.currentFormation];
  const son = pitchList.find(x => x.name === '손흥민');
  const hyunwoo = pitchList.find(x => x.name === '조현우');
  
  if (son && ['CB', 'LB', 'RB', 'LCB', 'RCB', 'GK'].includes(son.pos)) {
    pushCoachMessage(`🚨 <strong>[AI 코치 비상 경보] 감독님 제정신이십니까?!</strong><br>월드클래스 공격수 <strong>손흥민 선수를 최후방 수비/골키퍼에 박아두다니...</strong> 축구 역사상 전례가 없는 역대급 기행입니다! 팬들이 복장 터져서 쓰러집니다!!`, true);
    state.vibeScore = Math.max(15, state.vibeScore - 25);
    triggerScreenShake();
    pushChatComment('손흥민을 왜 수비에 둬?! 감독 제정신이냐 당장 경질해라!!', 'hater');
  } else if (hyunwoo && ['ST', 'LW', 'RW', 'LS', 'RS', 'CAM'].includes(hyunwoo.pos)) {
    pushCoachMessage(`🚨 <strong>[AI 코치 파멸 경보] 빛현우 골키퍼가 최전방 스트라이커?!</strong><br>골문은 누가 지키나요?! 이건 예능 축구도 아니고 파멸 그 자체입니다!! 매 경기 10실점 확정입니다!!`, true);
    state.vibeScore = Math.max(10, state.vibeScore - 30);
    triggerScreenShake();
    pushChatComment('골키퍼를 공격수로 쓰네 ㅋㅋㅋ 골문 텅텅 비었다 패망각 ㅋㅋㅋ', 'hater');
  } else {
    pushCoachMessage(`🔄 <strong>선수 교체/배치 완료!</strong><br><strong>${p1.name}</strong> ↔ <strong>${p2.name}</strong> 위치가 변경되었습니다. 선수들의 조직력이 새롭게 가동됩니다!`, false);
    state.vibeScore = Math.min(100, state.vibeScore + 4);
    pushChatComment(`오 ${p1.name} 투입했네? 이번 교체 카드는 잘 통할 것 같음!`, 'vip');
  }
  
  updateVibeMeter();
  updateStats();
}

// --- Player Role Click Popup Modal ---
function openRoleModal(player, cardElement) {
  state.activePlayerForRole = player;
  
  const statObj = (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[player.name]) ? SQUAD_STATS_2026[player.name] : { rating: 80, statStr: '공인 스탯 분석 중...' };
  
  document.getElementById('role-modal-name').innerHTML = `⚙️ ${player.name} (${player.pos}) <span style="font-size:0.8rem; color:var(--accent-cyan); font-weight:800; margin-left:0.5rem;">종합 능력치: ${statObj.rating}점</span>`;
  document.getElementById('role-modal-desc').innerHTML = `
    <div style="background:rgba(0,0,0,0.4); padding:0.7rem; border-radius:6px; border:1px solid rgba(6, 182, 212, 0.4); margin-bottom:0.8rem;">
      <div style="color:var(--accent-emerald); font-weight:700; font-size:0.75rem; margin-bottom:0.25rem;">📊 FBref / SofaScore 공인 벤치마크 스탯</div>
      <div style="font-size:0.85rem; color:var(--text-primary); font-weight:700;">공인 분석 통계: <span style="color:var(--accent-amber);">${statObj.statStr}</span></div>
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

function selectPlayerRole(player, newRole) {
  player.role = newRole;
  closeRoleModal();
  renderPitch(state.currentFormation);
  renderBench();
  
  pushCoachMessage(`⚙️ <strong>${player.name}</strong> 전술 임무 변경:<br>"<strong>${newRole}</strong>" 임무를 부여받았습니다! 선수가 경기장에서 더 적극적인 롤을 수행합니다!`, false);
  
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
  bubble.innerHTML = `<strong>🤖 차비브 수석 코치:</strong><br>${html}`;
  
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

function requestAiTacticalAdvice(type) {
  if (type === 'mexico') {
    pushCoachMessage(`⚡ <strong>[상대 국가팀 맞춤 전술 분석: 멕시코/남아공]</strong><br>상대는 측면 역습 속도가 빠르고 수비 라인이 높습니다. <strong>4-2-3-1 포메이션</strong>으로 전환하고, 이강인의 킬패스와 손흥민·양민혁의 초광속 침투를 극대화하는 것을 추천합니다! (스쿼드 밸런스 최적화)`, false);
    state.vibeScore = Math.min(100, state.vibeScore + 5);
  } else {
    pushCoachMessage(`🛡️ <strong>[현재 스쿼드 밸런스 진단]</strong><br>현재 공격 파괴력 <strong>${state.stats.attack}</strong>, 중원 장악 <strong>${state.stats.midfield}</strong>, 수비 안정 <strong>${state.stats.defense}</strong>입니다. 후반전 60분이 넘어가면 체력 저하를 대비해 벤치의 오현규나 배준호를 교체 투입하세요!`, false);
  }
  updateVibeMeter();
}

// --- Recalculate Vibe Score ---
function recalculateVibe() {
  let score = 50;
  if (state.currentFormation === '4-2-3-1' || state.currentFormation === '3-5-2') score += 8;
  if (state.currentFormation === '4-3-3') score += 5;
  
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
    if (btnTactics) { btnTactics.classList.remove('active'); btnTactics.style.background = 'rgba(30, 41, 59, 0.8)'; btnTactics.style.color = '#fff'; btnTactics.style.boxShadow = 'none'; }
    if (btnLocker) { btnLocker.classList.add('active'); btnLocker.style.background = 'var(--accent-cyan)'; btnLocker.style.color = '#000'; btnLocker.style.boxShadow = '0 0 15px var(--accent-cyan-glow)'; }
    renderLockerRoom('ALL');
  } else {
    if (tacticsView) tacticsView.style.display = 'grid';
    if (lockerView) lockerView.style.display = 'none';
    if (btnTactics) { btnTactics.classList.add('active'); btnTactics.style.background = 'var(--accent-emerald)'; btnTactics.style.color = '#000'; btnTactics.style.boxShadow = '0 0 15px var(--accent-emerald-glow)'; }
    if (btnLocker) { btnLocker.classList.remove('active'); btnLocker.style.background = 'rgba(30, 41, 59, 0.8)'; btnLocker.style.color = '#fff'; btnLocker.style.boxShadow = 'none'; }
  }
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
        <span style="background: rgba(255,255,255,0.08); color: ${posColor}; border: 1px solid ${posColor}; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 800; font-size: 0.75rem;">${data.pos}</span>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">나이: ${data.age}</span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 0.8rem; margin: 0.4rem 0;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #1e293b, #334155); border: 2px solid ${posColor}; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          ${data.pos.includes('GK') ? '🧤' : (data.pos.includes('FW') ? '⚡' : (data.pos.includes('DF') ? '🛡️' : '🧭'))}
        </div>
        <div>
          <div style="font-size: 1.15rem; font-weight: 800; color: #fff;">${name}</div>
          <div style="font-size: 0.72rem; color: var(--accent-cyan);">2026 월드컵 공식 출전 멤버</div>
        </div>
      </div>
      
      <div style="background: rgba(0,0,0,0.4); padding: 0.7rem; border-radius: 6px; font-size: 0.8rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 0.3rem;">
        <div style="display: flex; justify-content: space-between;"><span>공식 출전:</span> <strong>${data.mp}경기 (${data.min}분)</strong></div>
        <div style="display: flex; justify-content: space-between;"><span>선발 횟수:</span> <strong>${data.starts}회</strong></div>
        <div style="display: flex; justify-content: space-between;"><span>공격포인트:</span> <strong style="color: var(--accent-rose);">${data.gls}골 ${data.ast}도움</strong></div>
      </div>
      
      <button style="margin-top: auto; width: 100%; padding: 0.6rem; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 6px; color: #fff; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: background 0.2s;">
        📊 심층 스카우팅 리포트 열기
      </button>
    `;
    
    card.onclick = () => openScoutingModal(name, data, posColor);
    grid.appendChild(card);
  });
}

function filterLocker(pos, btnEl) {
  document.querySelectorAll('.locker-filter-btn').forEach(b => {
    b.style.background = 'rgba(255,255,255,0.05)';
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
  document.getElementById('scout-age').textContent = `나이: ${data.age}`;
  
  document.getElementById('scout-val-mp').textContent = `${data.mp}경기`;
  document.getElementById('scout-val-min').textContent = `${data.min}분`;
  document.getElementById('scout-val-starts').textContent = `${data.starts}회`;
  document.getElementById('scout-val-ga').textContent = `${data.gls}골 ${data.ast}도움`;
  
  modal.classList.add('active');
}

function closeScoutingModal() {
  const modal = document.getElementById('scout-modal');
  if (modal) modal.classList.remove('active');
}
