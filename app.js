/* ==========================================================================
   K-Tactics Lab 2026 - Advanced Interactive Engine (Vanilla JS)
   ========================================================================== */

// --- Global State ---
const state = {
  // Open in the shape Korea actually fielded that day (FBref: RSA and CZE both
  // 3-4-3). One deliberate exception: 손흥민 starts, because his benching is the
  // controversy the user is here to re-litigate, not a condition to inherit.
  currentFormation: '3-4-3',
  vibeScore: 50,
  opponent: 'MEX', // 'MEX' | 'CZE' | 'RSA' — the three 2026 group-stage opponents
  matchPhase: 0, // 0: Pre-match (0'), 1: Half-time (45'), 2: Full-time (90')
  staminaState: {}, // { '손흥민': 85, '황인범': 89 ... }
  dials: {
    tempo: 'standard', // 'build' | 'standard' | 'direct'
    // The board opens on the route that actually lost the match: press coverage of
    // the day reduced our play to switching flanks. Starting on 'halfspace' would
    // hand the user the reform the scenario is asking them to discover.
    route: 'wing', // 'halfspace' | 'wing' | 'longball' (attacking approach axis)
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
  // Every settled match this session, in order: the re-coaching loop needs a
  // memory so the result card can say "3번째 도전" instead of pretending each
  // run is the first. Kept per opponent (see renderAttemptLine).
  attempts: [],
  fullbackRole: 'inverted', // 'inverted' | 'defensive' | 'overlap'
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
  // The shape Korea actually lined up in against South Africa and Czechia
  // (FBref match reports, 2026). Wing-backs sit in the midfield band, so the
  // three centre-backs are the last line and the flanks are a shared duty.
  '3-4-3': [
    { id: 'p1', name: '손흥민', pos: 'LW', avatar: '⚡', role: '인사이드 포워드', type: 'att' },
    { id: 'p2', name: '오현규', pos: 'ST', avatar: '🎯', role: '컴플리트 포워드', type: 'att' },
    { id: 'p3', name: '이강인', pos: 'RW', avatar: '🎨', role: '전천후 플레이메이커', type: 'att' },
    { id: 'p7', name: '이태석', pos: 'LWB', avatar: '🏃', role: '클래식 윙백', type: 'def' },
    { id: 'p5', name: '황인범', pos: 'LCM', avatar: '🧭', role: '딥라잉 플레이메이커', type: 'mid' },
    { id: 'p6', name: '백승호', pos: 'RCM', avatar: '⚙️', role: '홀딩 미드필더', type: 'mid' },
    { id: 'p10', name: '설영우', pos: 'RWB', avatar: '🛡️', role: '클래식 윙백', type: 'def' },
    { id: 'p12', name: '이기혁', pos: 'LCB', avatar: '🔒', role: '좌측 스토퍼', type: 'def' },
    { id: 'p8', name: '김민재', pos: 'CB', avatar: '🧱', role: '수비 사령관', type: 'def' },
    { id: 'p9', name: '이한범', pos: 'RCB', avatar: '⚓', role: '커버링 센터백', type: 'def' },
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
  { id: 'b9', name: '박진섭', pos: 'SUB', avatar: '🧱', role: '수비형 센터백', type: 'def' }
];

// Canonical bench role per player — ONE consistent archetype so the substitutes'
// bench never mixes role nouns ("홀딩 미드필더") with action phrases ("초광속 침투")
// or left/right tags that mean nothing for an unassigned reserve. Pitch cards keep
// their formation-specific roles; this labels the bench only (see resyncBench).
const BENCH_ROLE = {
  '손흥민': '인사이드 포워드',
  '오현규': '컴플리트 포워드',
  '조규성': '타겟 스트라이커',
  '이강인': '전천후 플레이메이커',
  '황희찬': '돌파형 윙어',
  '엄지성': '스피드 윙어',
  '양현준': '측면 윙어',
  '이재성': '박스 투 박스',
  '황인범': '딥라잉 플레이메이커',
  '백승호': '홀딩 미드필더',
  '김진규': '전진형 미드필더',
  '옌스 카스트로프': '다이내믹 미드필더',
  '이태석': '오버래핑 풀백',
  '설영우': '밸런스형 풀백',
  '김문환': '측면 풀백',
  '김민재': '중앙 수비수',
  '이한범': '커버링 센터백',
  '이기혁': '멀티 센터백',
  '박진섭': '수비형 센터백',
  '김승규': '안정형 수문장'
};

const roleOptions = {
  att: ['인사이드 포워드', '컴플리트 포워드', '라인 브레이커', '전천후 플레이메이커', '크랙 드리블러'],
  mid: ['박스 투 박스', '딥라잉 플레이메이커', '홀딩 미드필더', '중원 진공청소기', '템포 조율사'],
  def: ['인버티드 풀백', '파괴자 스토퍼', '커버링 센터백', '클래식 윙백', '오버래핑 가담'],
  gk: ['빛현우 슈퍼세이브', '스위퍼 키퍼', '안정형 수문장']
};

// Every detailed role is a trade-off, never a free buff: what a role gains in
// one column it pays for in another, so re-tasking the whole XI into attacking
// roles hollows out the back line instead of stacking a bonus. The 18 selectable
// roles and the 33 default descriptors are all defined here, otherwise a
// formation would be silently advantaged by which labels its starters happen to
// ship with. Applied in updateStats as a summed team adjustment.
const ROLE_EFFECTS = {
  // --- 공격 (선택 가능) ---
  '인사이드 포워드':    { att: 2, mid: 1, stam: -1 },
  '컴플리트 포워드':    { att: 1, mid: 2, stam: -2 },
  '라인 브레이커':      { att: 3, mid: -2 },
  '전천후 플레이메이커': { att: 1, mid: 3, def: -1 },
  '크랙 드리블러':      { att: 3, def: -2, stam: -1 },
  // --- 중원 (선택 가능) ---
  '박스 투 박스':       { att: 1, mid: 2, stam: -3 },
  '딥라잉 플레이메이커': { att: 1, mid: 3, def: -1 },
  '홀딩 미드필더':      { att: -2, def: 3 },
  '중원 진공청소기':    { def: 2, mid: 2, stam: -2 },
  '템포 조율사':        { att: -2, mid: 3, stam: 1 },
  // --- 수비 (선택 가능) ---
  '인버티드 풀백':      { mid: 3, def: -2 },
  '파괴자 스토퍼':      { def: 3, mid: -1, stam: -1 },
  '커버링 센터백':      { att: -1, def: 2, stam: 1 },
  '클래식 윙백':        { att: 2, mid: 1, def: -2, stam: -1 },
  '오버래핑 가담':      { att: 3, def: -3 },
  // --- 골키퍼 (선택 가능) ---
  '빛현우 슈퍼세이브':   { def: 3, mid: -1 },
  '스위퍼 키퍼':        { mid: 3, def: -2 },
  '안정형 수문장':      { def: 2, mid: -1 },
  // --- 기본 임무 서술 (모달 목록에는 없지만 초기 배치에 쓰임) ---
  '피지컬 타겟맨':      { att: 2, mid: -1, stam: 1 },
  '프리롤 마법사':      { att: 2, mid: 2, def: -2 },
  '원톱 해결사':        { att: 3, mid: -2 },
  '공격 전권 지휘':     { att: 2, mid: 1, def: -2 },
  '초광속 침투':        { att: 3, stam: -2 },
  '침투 포워드':        { att: 2, mid: -1 },
  '포스트 플레이':      { att: 1, mid: 1, stam: -1 },
  '측면 플레이메이커':   { att: 1, mid: 2, def: -1 },
  '인버티드 윙어':      { att: 2, mid: 1, def: -1 },
  '황소 돌파':          { att: 3, stam: -2 },
  '타겟 헤더':          { att: 2, mid: -1 },
  '고속 스프린트':      { att: 2, stam: -2 },
  '저돌적 윙어':        { att: 3, def: -2 },
  '왕성한 활동량':      { def: 1, mid: 2, stam: -2 },
  '빌드업 시가':        { att: -1, mid: 3, def: -1 },
  '수비 스크린':        { att: -2, def: 3 },
  '언성 히어로':        { def: 1, mid: 2, stam: -2 },
  '중원 컨트롤러':      { att: -1, mid: 3, def: -1 },
  '중원 전진 패스':     { att: 1, mid: 2, def: -1 },
  '다이내믹 압박':      { def: 2, mid: 1, stam: -3 },
  '밸런스형 풀백':      { att: 1, mid: 1, def: 1, stam: -2 },
  '밸런스 풀백':        { att: 1, mid: 1, def: 1, stam: -2 },
  '좌측 스토퍼':        { def: 2, mid: -1 },
  '우측 스토퍼':        { def: 2, mid: -1 },
  '수비 사령관':        { def: 3, mid: -1, stam: -1 },
  '괴물 수비수':        { def: 3, mid: -1, stam: -1 },
  '차세대 센터백':      { def: 2, mid: 1, stam: -2 },
  '스마트 풀백':        { att: -1, mid: 2, def: 1 },
  '통곡의 벽':          { att: -2, def: 3 },
  '안정적인 빌드업':    { att: -2, mid: 2, def: 1 },
  '우측 오버래핑':      { att: 2, def: -2 },
  '멀티 수비수':        { def: 2, mid: 1, stam: -2 },
  '수비형 센터백':      { att: -2, def: 3 },
  // --- 벤치 기본 임무 (교체 투입 시 그대로 따라 들어옴) ---
  '타겟 스트라이커':    { att: 2, mid: -1, stam: 1 },
  '돌파형 윙어':        { att: 3, def: -2 },
  '스피드 윙어':        { att: 2, stam: -2 },
  '측면 윙어':          { att: 2, mid: 1, def: -2 },
  '전진형 미드필더':    { att: 1, mid: 2, def: -2 },
  '다이내믹 미드필더':  { def: 1, mid: 2, stam: -3 },
  '오버래핑 풀백':      { att: 2, def: -2 },
  '측면 풀백':          { att: 1, mid: 1, def: 1, stam: -2 },
  '중앙 수비수':        { def: 3, mid: -1, stam: -1 },
  '멀티 센터백':        { def: 2, mid: 1, stam: -2 }
};

function roleSum(list) {
  const t = { att: 0, def: 0, mid: 0, stam: 0 };
  (list || []).forEach(p => {
    const r = ROLE_EFFECTS[p.role];
    if (!r) return;
    t.att += r.att || 0; t.def += r.def || 0;
    t.mid += r.mid || 0; t.stam += r.stam || 0;
  });
  return t;
}

// Captured at load, before any swap or role change can mutate squadData: each
// formation's shipped task set is the zero point, so the balance readout only
// moves when the user actually re-tasks someone.
const DEFAULT_ROLE_SUM = {};
Object.keys(squadData).forEach(f => { DEFAULT_ROLE_SUM[f] = roleSum(squadData[f]); });

// Pristine slot templates (position code + band), also captured at load.
// Formation switches carry the current XI into these slots; reading bands
// from the live squadData instead would drift, because a carried player
// overwrites the entry's type with his own.
const FORMATION_SLOTS = {};
Object.keys(squadData).forEach(f => {
  FORMATION_SLOTS[f] = squadData[f].map(p => ({ pos: p.pos, type: p.type, role: p.role }));
});

// ROLE_EFFECTS scores 61 task names; the modal offers 18, five per band. So a
// player's current task is often not one of the five on offer, and that is by
// design: the five are re-tasking choices, not the whole vocabulary. Used by
// openRoleModal to decide whether the current task needs listing on its own.
const roleFitsBand = (role, band) => (roleOptions[band] || []).includes(role);

// Each player's own band, also captured at load. A slot's band belongs to the
// slot, so a player who walks off the pitch has to get his own back rather than
// keep whatever line he was last filling in.
const NATURAL_TYPE = {};
Object.keys(squadData).forEach(f => {
  squadData[f].forEach(p => { if (!(p.id in NATURAL_TYPE)) NATURAL_TYPE[p.id] = p.type; });
});
benchPlayers.forEach(p => { if (!(p.id in NATURAL_TYPE)) NATURAL_TYPE[p.id] = p.type; });

// Half weight, rounded away from zero so a one-point deviation still shows up
// (plain Math.round turns -0.5 into 0 and would silently swallow it).
function roleDeviation(pitchList) {
  const now = roleSum(pitchList);
  const base = DEFAULT_ROLE_SUM[state.currentFormation] || { att: 0, def: 0, mid: 0, stam: 0 };
  const half = v => (v < 0 ? -Math.round(-v / 2) : Math.round(v / 2));
  return {
    att: half(now.att - base.att),
    def: half(now.def - base.def),
    mid: half(now.mid - base.mid),
    stam: half(now.stam - base.stam)
  };
}

// --- AI Coach formation quotes ---
// Only the three formations with a distinct read get a bespoke line; the
// generic branch in setFormation covers the rest. (Dial and toggle commentary
// is generated inline by setTacticalDial/toggleTactic, not here.)
const coachQuotes = {
  form352: "🛡️ 3-5-2 전환. 중원을 5명으로 채우고 김민재를 스리백 중심에 세워 수비 불안을 눌러 놓는 선택입니다.",
  form4231: "⚡ 4-2-3-1 전환. 이강인을 중앙 공격 지휘에 두고 손흥민 원톱의 파괴력을 극대화하는 현대적인 구성입니다.",
  form343: "🔥 3-4-3 전환. 2026 본선에서 실제로 들고 나갔던 대형입니다. 전방 3인은 두꺼워지고, 측면은 윙백 둘이 통째로 책임집니다."
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
  // Vibe is documented as a pure function of the board, so compute it for the
  // very first paint too instead of leaving the hardcoded 50% placeholder
  // (recalculateVibe ends by refreshing the meter).
  recalculateVibe();
  updateBrandFixture(); // the header names whichever match is loaded, including a shared link's
  renderHeroOdds();     // the intro quotes odds this engine just sampled
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
  // Arrival beats, staggered so they read one at a time and stay in their own
  // corners: the guide bar bottom-left, the opponent-manager chip top-right.
  startCoachGuide();
  setTimeout(peekOppCoachChip, 1800);
}

// The odds the manager inherits, computed rather than claimed: sets up the
// opening board (that day's 3-4-3 against South Africa, its first half played
// out), samples it, and puts the state back exactly as it was. The intro then
// states a number this engine produced a moment ago instead of a slogan.
function heroOpeningOdds() {
  const keys = ['dials', 'opponent', 'staminaState', 'halfTimeScore', 'matchPhase', 'stats', 'opponentPlan'];
  const snap = {};
  // opponentPlan does not exist until the first scout, and JSON.stringify of
  // undefined is undefined, which JSON.parse then chokes on.
  keys.forEach(k => { snap[k] = state[k] === undefined ? undefined : JSON.parse(JSON.stringify(state[k])); });
  try {
    state.opponent = 'RSA';
    state.opponentPlan = scriptedCounterPlan();
    updateStats();
    const o = firstHalfOutcome();
    state.halfTimeScore = { kor: o.korGoals, opp: o.oppGoals };
    state.matchPhase = 1;
    state.staminaState = {};
    (squadData[state.currentFormation] || []).forEach(p => {
      const base = (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name])
        ? SQUAD_STATS_2026[p.name].stamina : 82;
      state.staminaState[p.name] = Math.max(30, base - 22); // the drain, without its random spread
    });
    const sim = runMonteCarlo(20000); // a headline number should not flicker between page loads
    return { win: sim.winPct, half: `${o.korGoals}-${o.oppGoals}` };
  } catch (e) {
    return null;
  } finally {
    keys.forEach(k => { state[k] = snap[k]; });
    updateStats();
  }
}

function renderHeroOdds() {
  const el = document.getElementById('hero-odds');
  if (!el) return;
  const odds = heroOpeningOdds();
  if (!odds) { el.style.display = 'none'; return; }
  el.innerHTML = `그날의 전술을 그대로 두면 승률 <strong>${odds.win}%</strong>. 바꿀 수 있는 건 전부 당신 손에 있습니다.`;
}

function startHeroScenario() {
  dismissHeroIntro();
  if (typeof selectOpponent === 'function') selectOpponent('RSA');
  pushCoachMessage(
    `🔥 <strong>[남아공전 재도전]</strong><br>비기기만 하면 32강입니다. 그날의 3-4-3 보드에서 벤치 논란의 손흥민만 선발로 되돌려 뒀습니다. 이제 U자 백패스를 폐기하고, 당신만의 전술로 그날의 결과를 바꾸세요. ` +
    `단, 손흥민을 다시 벤치에 내리면 팬 지지율이 폭락합니다.`,
    true
  );
  showRouteGuide();
}

// One-shot nudge, hero scenario only: the route dial is where the designed
// discovery lives (that day's flank-swapping is the default; the reform is
// one press away). A pulse ring plus a one-line hint, dismissed by the first
// meaningful interaction anywhere on the board. A nudge, not a gate.
function showRouteGuide() {
  const routeBtn = document.getElementById('btn-route-halfspace');
  const box = routeBtn ? routeBtn.closest('.tactic-box') : null;
  if (!box || box.classList.contains('guide-pulse')) return;
  box.classList.add('guide-pulse');
  const onFirstMove = (e) => {
    if (!e.target || !e.target.closest) return;
    if (e.target.closest('.btn-tactic, .btn-formation, .btn-opponent, .player-card, .cta-sim')) {
      box.classList.remove('guide-pulse');
      document.removeEventListener('click', onFirstMove, true);
    }
  };
  document.addEventListener('click', onFirstMove, true);
}

// ==========================================================================
// First-run coach guide + arrival flourishes.
// Closing the hero intro used to drop the manager onto a full board with no
// word about which parts are theirs to move. These are nudges, not gates:
// each step clears itself the moment the manager does the thing.
// ==========================================================================

const GUIDE_STEPS = [
  {
    text: '선수 카드를 <b>클릭하거나 드래그</b>해 선발 라인업을 바꿔 보세요.',
    ring: () => document.querySelector('#pitch-players-grid .player-card'),
    done: '.player-card, .rail-tab'
  },
  {
    text: '아래 <b>전술 다이얼</b>에서 템포·공격 루트·압박 라인을 지정합니다.',
    // The route box may already be carrying the hero scenario's own pulse;
    // its rule outranks .guide-ring, so it simply keeps that tooltip.
    ring: () => {
      const btn = document.getElementById('btn-route-halfspace');
      return btn ? btn.closest('.tactic-box') : null;
    },
    done: '.btn-tactic, .btn-formation'
  },
  {
    text: '준비되면 <b>[▶ 경기 시뮬레이션]</b>으로 그날의 후반전을 다시 치릅니다.',
    ring: () => document.getElementById('btn-run-simulation'),
    done: '.cta-sim'
  }
];

let guideIdx = -1;
let guideRinged = null;
let guideStarted = false;

function startCoachGuide() {
  if (guideStarted) return;
  guideStarted = true;
  document.addEventListener('click', onGuideClick, true);
  setTimeout(() => showGuideStep(0), 600); // let the intro modal finish closing
}

function showGuideStep(i) {
  const bar = document.getElementById('guide-bar');
  const stepEl = document.getElementById('guide-step');
  const textEl = document.getElementById('guide-text');
  if (!bar || !textEl) return;

  clearGuideRing();
  if (i >= GUIDE_STEPS.length) { dismissCoachGuide(); return; }

  guideIdx = i;
  const step = GUIDE_STEPS[i];
  if (stepEl) stepEl.textContent = `${i + 1}/${GUIDE_STEPS.length}`;
  textEl.innerHTML = step.text;
  bar.hidden = false;

  const target = step.ring();
  if (target) {
    target.classList.add('guide-ring');
    guideRinged = target;
  }
}

function clearGuideRing() {
  if (guideRinged) guideRinged.classList.remove('guide-ring');
  guideRinged = null;
}

function onGuideClick(e) {
  if (guideIdx < 0 || !e.target || !e.target.closest) return;
  if (e.target.closest('.guide-bar')) return; // the bar's own skip button
  if (e.target.closest(GUIDE_STEPS[guideIdx].done)) showGuideStep(guideIdx + 1);
}

function dismissCoachGuide() {
  clearGuideRing();
  guideIdx = -1;
  document.removeEventListener('click', onGuideClick, true);
  const bar = document.getElementById('guide-bar');
  if (bar) bar.hidden = true;
}

// The AI opponent manager is the differentiator and it ships collapsed, so it
// introduces itself once on arrival and folds back on its own. Any click on
// the chip means the manager took over, and the auto-close stands down.
function peekOppCoachChip() {
  const chip = document.getElementById('opp-coach-chip');
  if (!chip || state.matchPhase !== 0) return;
  setOppChip(true);
  chip.classList.add('chip-peek');

  const timer = setTimeout(() => {
    chip.classList.remove('chip-peek');
    if (state.matchPhase === 0) setOppChip(false);
  }, 5200);
  const head = chip.querySelector('.collapse-head');
  if (head) {
    head.addEventListener('click', () => {
      clearTimeout(timer);
      chip.classList.remove('chip-peek');
    }, { once: true });
  }
}

// ==========================================================================
// Narrow-screen landing (≤767px). The board needs desktop width, but the
// vote link lands on a phone, so the phone gets the pitch and a way through.
// ==========================================================================

function copyDesktopLink() {
  const url = location.href.split('#')[0];
  const ok = () => showToast('🔗 링크를 복사했습니다. PC 브라우저에 붙여넣어 주세요!');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(ok).catch(() => prompt('아래 주소를 PC에서 열어 주세요:', url));
    return;
  }
  prompt('아래 주소를 PC에서 열어 주세요:', url);
}

function dismissMobileLanding() {
  document.body.classList.add('landing-dismissed');
  showToast('ℹ️ 좁은 화면에서는 보드 일부가 잘릴 수 있습니다.');
}

// Row breakdown per formation, top to bottom (attack line first, GK last).
// Each array sums to 11 and matches that formation's squadData ordering, so
// the pitch renders the real shape (e.g. 4-2-3-1 = ST / 3 AM / 2 DM / 4 DF / GK).
const FORMATION_ROWS = {
  '4-3-3':   [3, 3, 4, 1],
  '3-4-3':   [3, 4, 3, 1],
  '3-5-2':   [2, 5, 3, 1],
  '4-2-3-1': [1, 3, 2, 4, 1],
  '4-4-2':   [2, 4, 4, 1]
};

// One entry per formation, shared by the switcher and by the challenge-link
// restore path so a new shape can never light up the wrong button.
const FORMATION_BTN_IDS = {
  '4-3-3':   'btn-form-433',
  '3-4-3':   'btn-form-343',
  '3-5-2':   'btn-form-352',
  '4-2-3-1': 'btn-form-4231',
  '4-4-2':   'btn-form-442'
};

const FORMATION_TAGLINE = {
  '4-3-3':   ' (밸런스)',
  '3-4-3':   ' (쓰리백 공격형)',
  '3-5-2':   ' (쓰리백)',
  '4-2-3-1': ' (코어 집중)',
  '4-4-2':   ' (클래식)'
};

// --- Render Pitch & Players (with Drag & Drop) ---
function renderPitch(formation) {
  const grid = document.getElementById('pitch-players-grid');
  grid.innerHTML = '';
  
  const players = squadData[formation] || squadData['4-3-3'];
  
  // Group players into formation lines using the per-formation row map
  // (falls back to a generic att/mid/def/GK split for any unknown formation).
  const rowSizes = FORMATION_ROWS[formation] || [3, 3, 4, 1];
  // Four-line shapes have a spare line's worth of height, so their cards run
  // larger (index.css keys off this class).
  grid.classList.toggle('rows-4', rowSizes.length <= 4);
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
    .map(p => ({ id: p.id, name: p.name, pos: 'SUB', avatar: p.avatar, role: BENCH_ROLE[p.name] || p.role, type: p.type }));
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
  // Pitch cards keep their face clean: the role shows as a styled hover chip
  // (CSS ::after reads data-role) and in the click modal. Bench cards keep a
  // short inline role line, since that text is how you choose who to bring on.
  card.dataset.role = p.role;
  card.innerHTML = `
    ${rating ? `<span class="player-rating">${rating}</span>` : ''}
    <span class="player-pos-badge">${p.pos}</span>
    <div class="player-avatar">${p.avatar}</div>
    <div class="player-name">${p.name}</div>
    ${source === 'bench' ? `<div class="player-role-tag">${p.role}</div>` : ''}
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
// A pitch slot owns its position code AND its band; only the man in it changes.
// Carrying just the position over meant the badge said one line and the card
// colour said another, because the colour reads `type` and `type` was riding
// along with the player (swap 백승호 into 설영우's back-line slot and you got an
// RWB badge on a midfield-green card). Both now come from the slot template.
const intoSlot = (player, formation, idx) => {
  const slot = FORMATION_SLOTS[formation][idx];
  return { ...player, pos: slot.pos, type: slot.type };
};

// Off the pitch, a player is himself again rather than the line he was filling.
const ontoBench = (player) => ({
  ...player,
  pos: 'SUB',
  type: NATURAL_TYPE[player.id] || player.type
});

function handlePlayerSwap(sourcePlayer, targetPlayer, sourceOrigin, targetOrigin) {
  state.selectedPlayerForSwap = null;
  const f = state.currentFormation;
  // If swapping between bench and pitch
  if (sourceOrigin === 'bench' && targetOrigin === 'pitch') {
    const pitchList = squadData[f];
    const targetIdx = pitchList.findIndex(x => x.id === targetPlayer.id);
    const benchIdx = benchPlayers.findIndex(x => x.id === sourcePlayer.id);

    if (targetIdx !== -1 && benchIdx !== -1) {
      pitchList[targetIdx] = intoSlot(sourcePlayer, f, targetIdx);
      benchPlayers[benchIdx] = ontoBench(targetPlayer);
    }
  } else if (sourceOrigin === 'pitch' && targetOrigin === 'bench') {
    const pitchList = squadData[f];
    const sourceIdx = pitchList.findIndex(x => x.id === sourcePlayer.id);
    const benchIdx = benchPlayers.findIndex(x => x.id === targetPlayer.id);

    if (sourceIdx !== -1 && benchIdx !== -1) {
      pitchList[sourceIdx] = intoSlot(targetPlayer, f, sourceIdx);
      benchPlayers[benchIdx] = ontoBench(sourcePlayer);
    }
  } else if (sourceOrigin === 'pitch' && targetOrigin === 'pitch') {
    // Swap positions within pitch
    const pitchList = squadData[f];
    const idx1 = pitchList.findIndex(x => x.id === sourcePlayer.id);
    const idx2 = pitchList.findIndex(x => x.id === targetPlayer.id);

    if (idx1 !== -1 && idx2 !== -1) {
      const temp = pitchList[idx1];
      pitchList[idx1] = intoSlot(pitchList[idx2], f, idx1);
      pitchList[idx2] = intoSlot(temp, f, idx2);
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
  
  // The five on offer are re-tasking choices, not the whole vocabulary, so the
  // task a player is actually carrying is often not among them: 김민재 starts on
  // 수비 사령관 and a substitute arrives on a BENCH_ROLE name like 돌파형 윙어.
  // Matching on the exact string then left every row unmarked, which reads as
  // "nothing is selected" rather than "his task is not one of these five".
  // Listing it first, already active, keeps exactly one row current at all times.
  const band = roleOptions[player.type] ? player.type : 'mid';
  const options = roleFitsBand(player.role, band)
    ? roleOptions[band]
    : [player.role, ...roleOptions[band]];
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

const STAT_LABEL = { attack: '공격', defense: '수비', midfield: '중원', stamina: '체력' };

function selectPlayerRole(player, newRole) {
  const before = { ...state.stats };
  player.role = newRole;
  closeRoleModal();
  renderPitch(state.currentFormation);
  renderBench();

  recalculateVibe();
  updateStats();

  // Report the actual movement. A role that only renamed a tag would be an
  // empty promise, so the coach quotes the delta the HUD just took.
  const moved = Object.keys(STAT_LABEL)
    .map(k => ({ label: STAT_LABEL[k], d: state.stats[k] - before[k] }))
    .filter(x => x.d !== 0)
    .map(x => `${x.label} ${x.d > 0 ? '+' : ''}${x.d}`)
    .join(' · ');

  pushCoachMessage(`⚙️ <strong>${player.name}</strong> 전술 임무 변경: "<strong>${newRole}</strong>"<br>` +
    (moved ? `팀 밸런스 <strong>${moved}</strong> 반영되었습니다.` : `팀 밸런스 총합은 그대로입니다 (이전 임무와 상충 구조가 같습니다).`), false);
}

// Keep the manager's squad across formation changes. The new shape only
// contributes its slot template (positions); the eleven that walk into it are
// whoever is on the pitch right now. Each slot takes a same-band player first
// (gk/att/mid/def) and any overflow folds into the nearest remaining band, so
// e.g. a fourth forward entering a three-forward shape lands in midfield
// before it ever lands in the back line. Custom roles travel with the player.
function carrySquadInto(currentXI, template) {
  const pool = currentXI.slice();
  const rank = { att: 0, mid: 1, def: 2, gk: 3 };
  // Match on the player's OWN band, not the one the slot he currently occupies
  // lent him. The returned card takes the slot's type (so the badge and colour
  // stay honest), which means matching on `p.type` was reading back the last
  // formation's decision: 3-4-3 has three forwards but 4-2-3-1 wants four, so a
  // midfielder got pulled up and permanently became `att`. Coming back there was
  // then one midfielder short and somebody else got dragged across, and the XI
  // walked one seat further out of place on every round trip. NATURAL_TYPE never
  // moves, so a round trip now lands every player back where he started.
  // `type` is display only (updateStats averages SQUAD_STATS_2026 by name and
  // roleSum adds the same eleven roles whatever order they sit in), so this
  // changes who stands where and nothing the model reads.
  const bandOf = (p) => NATURAL_TYPE[p.id] || p.type;
  const take = (type) => {
    let idx = pool.findIndex(p => bandOf(p) === type);
    if (idx < 0) {
      let best = 0, bestD = 99;
      pool.forEach((p, i) => {
        const d = Math.abs((rank[bandOf(p)] ?? 1) - (rank[type] ?? 1));
        if (d < bestD) { bestD = d; best = i; }
      });
      idx = best;
    }
    return pool.splice(idx, 1)[0];
  };
  // The slot hands out both halves of its identity, position code and band.
  // Spreading the player last would let his own band ride along, and then the
  // card would wear a back-line badge in midfield green.
  return template.map(slot => ({ ...take(slot.type), pos: slot.pos, type: slot.type }));
}

// --- Formation Switching ---
function setFormation(formation) {
  const prev = state.currentFormation;
  if (prev !== formation && squadData[prev] && FORMATION_SLOTS[formation]) {
    squadData[formation] = carrySquadInto(squadData[prev], FORMATION_SLOTS[formation]);
  }
  state.currentFormation = formation;
  
  document.querySelectorAll('.btn-formation').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(FORMATION_BTN_IDS[formation] || '');
  if (activeBtn) activeBtn.classList.add('active');

  document.getElementById('header-formation-val').textContent = formation + (FORMATION_TAGLINE[formation] || '');

  if (formation === '3-5-2') pushCoachMessage(coachQuotes.form352);
  else if (formation === '4-2-3-1') pushCoachMessage(coachQuotes.form4231);
  else if (formation === '3-4-3') pushCoachMessage(coachQuotes.form343);
  else pushCoachMessage(`⚽ <strong>${formation}</strong> 포메이션 전환!<br>선수들의 간격이 재조정되었습니다. 한국 축구의 강점을 극대화할 세부 지침을 선택해 주세요!`);

  if (formation === '3-5-2') {
    state.stats.defense = 85; state.stats.midfield = 88; state.stats.attack = 72;
  } else if (formation === '4-2-3-1') {
    state.stats.attack = 88; state.stats.midfield = 84; state.stats.defense = 70;
  } else if (formation === '3-4-3') {
    state.stats.attack = 84; state.stats.midfield = 78; state.stats.defense = 74;
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
    pushCoachMessage(`⚡ <strong>[상대 국가팀 맞춤 전술 분석: 멕시코/남아공]</strong><br>상대는 측면 역습 속도가 빠르고 수비 라인이 높습니다. <strong>4-2-3-1 포메이션</strong>으로 전환하고, 이강인의 킬패스와 손흥민·엄지성의 초광속 침투를 극대화하는 것을 추천합니다! (스쿼드 밸런스 최적화)`, false);
  } else {
    pushCoachMessage(`🛡️ <strong>[현재 스쿼드 밸런스 진단]</strong><br>현재 공격 파괴력 <strong>${state.stats.attack}</strong>, 중원 장악 <strong>${state.stats.midfield}</strong>, 수비 안정 <strong>${state.stats.defense}</strong>입니다. 후반전 60분이 넘어가면 체력 저하를 대비해 벤치의 조규성이나 양현준을 교체 투입하세요!`, false);
  }
}

// --- Opponent Selection & Tactical Dial Control Functions ---
// The header names the match being coached. The three fixtures are the real
// 2026 group stage in order (체코 6/11 -> 멕시코 -> 남아공 최종전), so the
// round label is a fact about the schedule, not decoration.
const FIXTURE_LINE = {
  CZE: ['조별리그 1차전', '체코'],
  MEX: ['조별리그 2차전', '멕시코'],
  RSA: ['조별리그 최종전', '남아공']
};

function updateBrandFixture() {
  const el = document.getElementById('brand-fixture');
  if (!el) return;
  const f = FIXTURE_LINE[state.opponent] || ['조별리그', state.opponent];
  el.innerHTML = `${f[0]} · <b>대한민국 vs ${f[1]}</b>`;
}

function selectOpponent(opp) {
  state.opponent = opp;
  updateBrandFixture();
  state.opponentPlan = null; // new opponent re-scouts on next kickoff
  if (typeof renderOpponentPlanChip === 'function') renderOpponentPlanChip(null);

  document.querySelectorAll('.btn-opponent').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-opp-${opp}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update the broadcast score bug's opponent side.
  const oppMeta = ({ MEX: ['MEX', '🇲🇽'], CZE: ['CZE', '🇨🇿'], RSA: ['RSA', '🇿🇦'] })[opp] || ['OPP', '🏳️'];
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

// 이강인 프리롤은 그가 실제로 뛸 때만 성립한다. 이 확인이 없으면 그를 벤치에
// 내려도 공격 +5 와 λ ×1.08 이 그대로 붙는다. 손흥민 벤치 페널티가 보는 것과
// 같은 목록(squadData[포메이션] = 현재 피치)을 기준으로 판정한다.
// 토글 값 자체는 지우지 않는다. 다시 선발로 올리면 설정이 그대로 되살아난다.
function kanginActive() {
  return !!state.dials.kangin &&
    (squadData[state.currentFormation] || []).some(p => p.name === '이강인');
}

// The button stays lit (the setting is intact) but is marked inert while he is
// off the pitch, so an on-looking toggle with no effect is never a silent lie.
let kanginWasInert = false;
function syncKanginButton() {
  const on = !!state.dials.kangin;
  const inert = on && !kanginActive();
  const btn = document.getElementById('toggle-kangin');
  if (btn) {
    // Re-assert `on` from state so the button is right no matter which path
    // set the dial (click, challenge-link restore, or a reset).
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('inert', inert);
    btn.title = inert ? '이강인이 선발에 없어 효과가 적용되지 않습니다' : '';
  }
  if (inert && !kanginWasInert) {
    pushCoachMessage('⚠️ <strong>[이강인 프리롤 대기]</strong><br>이강인이 선발에서 빠져 프리롤 효과가 멈췄습니다. 다시 투입하면 그대로 되살아납니다.', false);
  }
  kanginWasInert = inert;
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

// Generic collapse toggle for rail sections + the bench drawer.
// The clicked head button's parent carries `.collapsible`; toggling `.collapsed`
// hides its `.collapse-body` (see CSS). Keeps every panel restorable in place.
function toggleCollapse(headBtn) {
  const section = headBtn && headBtn.parentElement;
  if (!section) return;
  const collapsed = section.classList.toggle('collapsed');
  headBtn.setAttribute('aria-expanded', String(!collapsed));
}

// Right-rail tabs (bench / Coach V / fan chat). One pane at a time — this is why
// the fan chat and the tactical console can no longer overlap.
// A hidden pane has no layout, so scrollHeight reads 0 and the pin-to-bottom
// that runs on every appended message quietly does nothing. The fan feed runs
// all match, so by the time the manager opens that tab it is sitting on the
// oldest message with the newest ones below the fold. Re-pin on reveal, once
// the pane is displayed and has a real height.
function pinChatsToBottom() {
  ['chat-messages', 'coach-messages'].forEach(id => {
    const box = document.getElementById(id);
    if (box) box.scrollTop = box.scrollHeight;
  });
}

function switchRailTab(name) {
  document.querySelectorAll('.rail-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.rail-pane').forEach(p =>
    p.classList.toggle('active', p.id === `rail-pane-${name}`));
  pinChatsToBottom();
  if (typeof SFX !== 'undefined' && SFX.ui) SFX.ui();
}

// Force the opponent-coach chip open/closed (used around the live match so the
// half-time controls inside it are never hidden behind the collapsed state).
function setOppChip(open) {
  const chip = document.getElementById('opp-coach-chip');
  if (!chip) return;
  chip.classList.toggle('collapsed', !open);
  const head = chip.querySelector('.collapse-head');
  if (head) head.setAttribute('aria-expanded', String(open));
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
  else if (state.currentFormation === '3-4-3') baseScore += 0;    // The shape that lost: the press spent 2026 on its wing-back gaps
  else if (state.currentFormation === '4-4-2') baseScore -= 2;    // Rigid/classic
  
  // 2. Tactical Dials Impact — each category spans a negative AND a positive so
  //    the public reacts in both directions (no more "everything nudges it up").
  if (state.dials.tempo === 'direct') baseScore += 5;            // thrilling pace (+5)
  else if (state.dials.tempo === 'build') baseScore -= 4;        // slow U-shape buildup (-4)

  if (state.dials.route === 'halfspace') baseScore += 3;         // smart central penetration (+3)
  else if (state.dials.route === 'wing') baseScore += 2;         // wide overlaps & crosses (+2)
  else if (state.dials.route === 'longball') baseScore += 1;     // direct long balls (+1)

  if (state.dials.nopassback) baseScore += 8;                    // signature "사이다" U-turn ban (+8)
  if (kanginActive()) baseScore -= 3;                            // "해줘축구" star-reliance the public distrusts (-3)

  if (state.dials.press === 'high') baseScore += 6;              // energetic gegenpress (+6)
  else if (state.dials.press === 'tenback') baseScore -= 12;     // boring 2-tier bus (-12)

  if (state.dials.mentality === 'attack') baseScore += 7;        // brave all-out (+7)
  else if (state.dials.mentality === 'lock') baseScore -= 10;    // time-wasting bus (-10)
  
  // 3. Counter-Matchup Synergy / Penalty (Against state.opponent)
  let matchupDelta = 0;
  if (state.opponent === 'MEX') {
    if (state.dials.press === 'high') matchupDelta -= 10;         // Mexico exploits high press space
    if (state.dials.tempo === 'direct' || state.dials.route === 'halfspace') matchupDelta += 5;
  } else if (state.opponent === 'CZE') {
    // Czechia lined up in the same 3-4-3 we did (FBref, 2026-06-11), so the
    // flanks cancel each other out and the space is between their three
    // centre-backs. This is also the one group match we won.
    if (state.dials.route === 'wing') matchupDelta -= 6;
    if (state.dials.route === 'halfspace') matchupDelta += 6;
    if (state.dials.press === 'high') matchupDelta += 4;
  } else if (state.opponent === 'RSA') {
    if (state.dials.mentality === 'attack' && state.dials.press === 'high') matchupDelta -= 6;
    // A back three (either flavour) or a zonal block is the reading the public
    // accepts against their counters. The flank exposure is priced separately
    // on the route dial just below, so 3-4-3 with wing overlaps nets out low.
    const backThree = state.currentFormation === '3-5-2' || state.currentFormation === '3-4-3';
    if (backThree || state.dials.press === 'region') matchupDelta += 5;
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

  // Shake only on the way INTO the danger band, not on every stat refresh.
  const wasDanger = body ? body.classList.contains('mood-danger') : false;
  if (body) body.classList.remove('mood-danger', 'glow-success');

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
    if (body) {
      body.classList.add('mood-danger');
      if (!wasDanger) triggerScreenShake();
    }
  }

  // The header mini-meter follows the same band colour as the main bar
  // (one hue that means one thing, instead of a decorative rainbow).
  if (headerBar && bar) headerBar.style.background = bar.style.backgroundColor;
}

// One-shot impact shake. It has to clear its own class: leaving it on freezes
// the board at the animation's last frame, so a single bad call used to leave
// the whole page tilted for the rest of the session, win or lose.
function triggerScreenShake() {
  const body = document.getElementById('body-tag');
  if (!body) return;
  const clear = e => {
    // animationend bubbles, so ignore anything a child element fired.
    if (e.target !== body || e.animationName !== 'shake') return;
    body.classList.remove('shake-fx');
    body.removeEventListener('animationend', clear);
  };
  body.classList.remove('shake-fx');
  void body.offsetWidth; // reflow, so a repeat trigger restarts the animation
  body.addEventListener('animationend', clear);
  body.classList.add('shake-fx');
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
      // Live legs, not the roster baseline: before kickoff staminaOf gives the
      // player's baseline anyway, and once the first half has been played it
      // gives what is actually left, so the HUD bar tells the same story as the
      // gauges on the cards and as the model. A substitution moves it.
      totalStam += staminaOf(p.name);
    });
    
    let avgAtt = Math.round(totalAtt / pitchList.length);
    let avgDef = Math.round(totalDef / pitchList.length);
    let avgMid = Math.round(totalMid / pitchList.length);
    let avgStam = Math.round(totalStam / pitchList.length);
    
    if (state.currentFormation === '3-5-2') { avgDef += 8; avgMid += 5; avgAtt -= 4; }
    else if (state.currentFormation === '4-2-3-1') { avgAtt += 8; avgMid += 4; avgDef -= 4; }
    else if (state.currentFormation === '4-3-3') { avgAtt += 5; avgMid += 3; avgDef += 2; }
    // Three up, three at the back, and only two central midfielders: the front
    // line is heavy and the middle is the thinnest of the five shapes.
    else if (state.currentFormation === '3-4-3') { avgAtt += 7; avgMid -= 2; avgDef += 0; }
    
    // Apply ML Dial adjustments
    if (state.dials.tempo === 'direct') { avgAtt += 6; }
    else if (state.dials.tempo === 'build') { avgMid += 5; avgAtt -= 2; }

    if (state.dials.press === 'high') { avgDef += 7; }
    else if (state.dials.press === 'tenback') { avgDef += 10; avgAtt -= 8; }

    // Before kickoff these two dials PREDICT what the shape will cost the legs.
    // After the first half that cost has already been taken out of the real
    // stamina above (runFirstHalf drains harder for a direct tempo and a high
    // press), so charging it again would bill the manager twice.
    if (state.matchPhase === 0) {
      if (state.dials.tempo === 'direct') avgStam -= 5;
      if (state.dials.press === 'high') avgStam -= 8;
    }
    
    if (state.dials.mentality === 'attack') { avgAtt += 8; avgDef -= 6; }
    else if (state.dials.mentality === 'lock') { avgDef += 9; avgAtt -= 7; }

    // Attacking route now moves the balance readout too (fixes the old "route changes nothing visible")
    if (state.dials.route === 'halfspace') { avgAtt += 4; avgMid += 2; }
    else if (state.dials.route === 'wing') { avgAtt += 4; avgDef -= 4; }
    else if (state.dials.route === 'longball') { avgAtt += 3; avgMid -= 4; }
    if (state.dials.nopassback) { avgAtt += 3; avgMid += 3; }
    if (kanginActive()) { avgAtt += 5; avgDef -= 4; }

    // Detailed roles, measured as a DEVIATION from the formation's own default
    // task set. Absolute sums would double-count formation identity, which the
    // deltas above already express, and would shift every opening board. The
    // deviation is halved so 11 assignments cannot swamp the dials.
    const roleDev = roleDeviation(pitchList);
    avgAtt += roleDev.att;
    avgDef += roleDev.def;
    avgMid += roleDev.mid;
    avgStam += roleDev.stam;

    state.stats.attack = Math.min(100, Math.max(30, Math.round(avgAtt)));
    state.stats.defense = Math.min(100, Math.max(30, Math.round(avgDef)));
    state.stats.midfield = Math.min(100, Math.max(30, Math.round(avgMid)));
    state.stats.stamina = Math.min(100, Math.max(30, Math.round(avgStam)));
  }

  ['attack', 'defense', 'midfield', 'stamina'].forEach(stat => {
    const val = state.stats[stat];
    const el = document.getElementById(`stat-val-${stat}`);
    const bar = document.getElementById(`stat-bar-${stat}`);
    if (el) el.textContent = val;
    if (bar) bar.style.width = `${val}%`;
  });

  // Every swap and placement change lands here, so this is where the freeroll
  // toggle learns that 이강인 left the XI.
  syncKanginButton();
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

// Remember recent lines so a comment cannot reappear while its previous
// appearance is still on screen. Measured at 1600x950 the expanded chat pane
// holds ~13 bubbles on average and ~17 if every line is short, so 20 keeps a
// repeat at least one full screen away (earliest recurrence: 20 x 4.5s = 90s).
// The general pool alone is 22 lines, and pickFanComment falls back to
// allowing reuse when a small situational pool is exhausted.
const recentFanTexts = [];
const RECENT_FAN_WINDOW = 20;

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

// Fan-chat handles. Flavors: supporters, tactics nerds, matchday culture,
// regional fans. House rules: cheer or nerd out, never demean a player or
// coach, and no fan-slang terms the docs only quote with attribution.
const FAN_NICKNAMES = [
  // 응원단 결
  '국대응원단', '낭만축구단', '월드컵은못참지', '4년을기다렸다', '오늘은이긴다',
  '믿고있었다구', '거리응원세대', '붉은유니폼꺼냈다', '응원가외우는중', '극장골기다림',
  // 선수 팬 결 (응원만, 조롱 없음)
  '손흥민골넣자', '캡틴손', '빛현우팬', '김민재벽믿음', '이강인패스감상가',
  '황인범볼터치팬', '설영우오버랩좋아', '조규성헤더조아',
  // 전술덕후 결
  'K리그덕후', '사이다전술단', '텐백은절대안돼', '하프스페이스신봉자', '빌드업연구가',
  '전술보드수집가', '포메이션박사', '윙백활용론자', '압박축구좋아', '세트피스분석가',
  '중원장악파', '역습한방러',
  // 직관·본방 문화 결
  '축잘알_서울', '새벽직관러', '본방사수클럽', '치킨먼저시킴', '하이라이트10번봄',
  'VAR확인중', '후반은다르다', '전반보다후반', '수원_원정러', '부산갈매기축덕'
];
let lastFanUser = null;

function pushChatComment(text, type = 'normal', customUser = null) {
  const box = document.getElementById('chat-messages');
  const item = document.createElement('div');
  item.className = 'chat-item';

  // Never show the same handle twice in a row; with 40 names the stream
  // reads like a crowd instead of seven people talking fast.
  let user = customUser;
  if (!user) {
    do {
      user = FAN_NICKNAMES[Math.floor(Math.random() * FAN_NICKNAMES.length)];
    } while (user === lastFanUser);
  }
  lastFanUser = user;

  item.innerHTML = `<span class="chat-user ${type}">${user}:</span> ${text}`;
  box.appendChild(item);
  // The stream runs all match; keep the DOM bounded to roughly two screens
  // of history so a long session does not accumulate hundreds of nodes.
  while (box.children.length > 40) box.removeChild(box.firstChild);
  box.scrollTop = box.scrollHeight;
}

// Broadcast score bug in the header. It is the most visible surface on the
// board, so it tracks the live score and phase instead of sitting on the
// pre-match placeholder for the whole match.
function updateScorebug(kor, opp, phase) {
  const k = document.getElementById('sb-score-kor');
  const o = document.getElementById('sb-score-opp');
  const p = document.getElementById('sb-phase');
  if (k && kor !== null) k.textContent = kor;
  if (o && opp !== null) o.textContent = opp;
  if (p && phase) p.innerHTML = `<span class="sb-dot"></span>${phase}`;
}

// --- Run Simulation & Match Commentary Engine (2-Phase Turn System) ---
function runSimulation() {
  if (state.matchPhase === 0) {
    runFirstHalf();
  } else if (state.matchPhase === 1) {
    runSecondHalf();
  } else {
    // Full-time -> fresh pre-match reset (keeps the user's current XI, dials, opponent)
    state.matchPhase = 0;
    state.opponentPlan = null; // re-scout next match
    renderOpponentPlanChip(null);
    state.staminaState = {}; // fresh legs: stamina bars back to base
    state.halfTimeScore = { kor: 0, opp: 1 };
    state.simResult = null;
    const btn = document.getElementById('btn-run-simulation');
    btn.innerHTML = `<span>▶ 경기 시뮬레이션</span>`;
    btn.style.background = '';
    btn.style.color = '';
    document.getElementById('match-phase-status').innerHTML = `<span>⚽ <strong style="color: var(--accent-cyan);">0' 경기 전 셋업</strong> (포메이션, 교체 및 전술 지침 설정 완료 후 전반 가동)</span>`;
    document.getElementById('match-phase-actions').innerHTML = '';
    setOppChip(false); // collapse the chip back once the match is over
    updateScorebug(0, 0, 'SET-UP');
    renderPitch(state.currentFormation);
    pushCoachMessage(`🔄 <strong>[새 경기 준비 완료]</strong><br>선수단 체력이 회복되었고 상대 스카우팅이 초기화되었습니다. 포메이션과 전술 지침을 다듬은 뒤 <strong>[▶ 경기 시뮬레이션]</strong>으로 재도전하십시오!`);
  }
}

// The 24' relay line quotes the user's own press setting back at them, so it has
// to cover all three options. It used to be a two-way check that reported
// "지역 방어" to anyone who had actually picked 텐백. Labels match the buttons.
const PRESS_BROADCAST_LABEL = {
  tenback: '텐백 저지선',
  region: '중원 지역방어',
  high: '초고강도 게겐프레싱'
};

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

function runFirstHalf() {
  const btn = document.getElementById('btn-run-simulation');
  const statusEl = document.getElementById('match-phase-status');
  const actionsEl = document.getElementById('match-phase-actions');

  btn.disabled = true;
  btn.innerHTML = `<span>⏳ 전반전 (0~45분) 진행 중...</span>`;
  SFX.whistle();
  setOppChip(true); // reveal the live status + half-time controls
  updateScorebug(0, 0, "1H · LIVE");

  // AI opponent manager scouts our XI and picks counter-tactics (async, non-blocking).
  // Sets a scripted fallback synchronously so the sim always has a plan by 2nd half.
  fetchOpponentPlan();

  // The half is settled here, before a frame is drawn, exactly as it always
  // was: the view below replays this result rather than producing it.
  const outcome = firstHalfOutcome();
  const korGoals = outcome.korGoals, oppGoals = outcome.oppGoals;
  const attackEdge = outcome.attackEdge, defenceEdge = outcome.defenceEdge;

  const reachHalfTime = () => {
      state.halfTimeScore = { kor: korGoals, opp: oppGoals };
      updateScorebug(korGoals, oppGoals, "HALF-TIME 45'");

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
      
      statusEl.innerHTML = `<span>⏸️ <strong style="color: var(--accent-amber);">HALF-TIME (45')</strong> 전반 스코어 <strong>${korGoals} : ${oppGoals}</strong> | 교체와 전술 지침을 직접 정한 뒤 후반을 가동하십시오</span>`;
      actionsEl.innerHTML = '';

      renderPitch(state.currentFormation);
      // Say WHY the half ended this way. The score is computed from two edges,
      // and a manager who cannot see which one failed cannot fix it.
      const atkNote = korGoals
        ? `공격 우위 <strong>${attackEdge.toFixed(2)}</strong>로 기준선 1.10을 넘겨 <strong>한 골 만회</strong>했습니다.`
        : `공격 우위 <strong>${attackEdge.toFixed(2)}</strong>로 기준선 1.10에 미치지 못해 만회에 실패했습니다. 침투 루트를 바꾸거나 공격 자원을 보강해야 합니다.`;
      const defNote = oppGoals
        ? `수비 우위 <strong>${defenceEdge.toFixed(2)}</strong>로 기준선 1.05에 미치지 못해 실점했습니다. 압박 라인을 내리거나 수비를 보강해 보십시오.`
        : `수비 우위 <strong>${defenceEdge.toFixed(2)}</strong>로 기준선 1.05를 넘겨 <strong>실점을 막았습니다</strong>.`;
      pushCoachMessage(`⏸️ <strong>[하프타임 정비 보고 - 전반 ${korGoals}:${oppGoals}]</strong><br>${atkNote} ${defNote}<br>구장 위 선수들의 체력 게이지 바를 확인해 주십시오! 방전된 선수(60% 미만)는 후반 경기력이 급감하므로, 벤치에서 <strong>직접 교체</strong>하면 그 자리는 프레시 레그로 채워집니다. 교체와 전술 다이얼을 정리한 뒤 <strong>[🔥 후반전 가동]</strong>을 눌러주십시오!`, true);
      triggerScreenShake();
  };

  // Play the settled half in the match view, then hand the board back so the
  // manager can work in the locker room. The modal is the match; the board is
  // where the tactics get changed, so it closes itself at the whistle.
  const film = buildMatchFilm({
    from: 0, to: 45, phaseLabel: '1H · LIVE',
    fromScore: { kor: 0, opp: 0 }, toScore: { kor: korGoals, opp: oppGoals },
    lamKor: outcome.attackEdge, lamOpp: outcome.defenceEdge
  });
  const cues = buildFirstHalfCues(film);
  statusEl.innerHTML = `<span>${cues[0].text}</span>`;

  const closeAndSettle = () => {
    setTimeout(() => {
      const modal = document.getElementById('sim-modal');
      if (modal) modal.classList.remove('active');
      reachHalfTime();
    }, 1100); // hold the final frame on 45' before handing the board back
  };

  if (!openMatchView({ film, cues, title: `⚽ 전반전 라이브 · vs ${state.opponent}`, onEnd: closeAndSettle })) {
    // No canvas: fall back to the ticker alone, at the old pace.
    let i = 1;
    const interval = setInterval(() => {
      if (i < cues.length) {
        statusEl.innerHTML = `<span>${cues[i++].text}</span>`;
      } else {
        clearInterval(interval);
        reachHalfTime();
      }
    }, 700);
  }
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
async function fetchOpponentPlan() {
  // Synchronous fallback first, so the sim always has a plan even if the call is slow.
  if (!state.opponentPlan) state.opponentPlan = scriptedCounterPlan();
  renderOpponentPlanChip(state.opponentPlan);
  setOppChip(true); // the scout is the moment this chip earns its screen space

  const data = await callCoachAPI('opponent');
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

function runSecondHalf() {
  const stepText = document.getElementById('sim-step-text');
  updateScorebug(null, null, "2H · LIVE");

  // Anyone on the pitch without a first-half drain entry came on at half-time,
  // which is how the broadcast knows to credit the manager's substitution.
  const freshLegs = (squadData[state.currentFormation] || [])
    .map(p => p.name).filter(n => state.staminaState[n] === undefined);
  renderPitch(state.currentFormation);

  // Real Monte Carlo: 1,000 Poisson draws of each side's 2nd-half goals,
  // added to the half-time score, aggregated into a win/draw/loss distribution.
  const sim = runMonteCarlo(1000);
  state.simResult = sim;
  state.finalScore = { kor: sim.modalScore.kor, opp: sim.modalScore.opp };

  // Replay the settled half as a 2D top-down match, with the ticker on the
  // same clock as the animation. The score is already fixed, so the view is a
  // presentation layer: if the canvas is unavailable the ticker alone still
  // carries the half to full time.
  const film = buildMatchFilm();
  const cues = buildCommentaryCues(film, freshLegs, sim);

  const started = openMatchView({
    film, cues,
    title: '🏆 2026 월드컵 대한민국 최종 리포트',
    onEnd: showFinalResult
  });

  if (!started) {
    document.getElementById('sim-modal').classList.add('active');
    const liveCast = document.getElementById('sim-live-cast');
    if (liveCast) liveCast.style.display = 'flex';
    stepText.textContent = cues[0].text;
    let i = 1;
    const interval = setInterval(() => {
      if (i < cues.length) {
        stepText.textContent = cues[i++].text;
      } else {
        clearInterval(interval);
        showFinalResult();
      }
    }, 1000);
  }
}

// ==========================================================================
// XAI: post-match factor attribution. Each lambda multiplier's contribution
// is the exact expected-goal delta vs. removing that factor (multiplicative
// model, so removal = divide it back out). Narrated as pundit one-liners.
// ==========================================================================
const XAI_NARRATIVE = {
  'mentality-attack': { up: '전원 닥공 전환이 화력을 폭발시켰다', down: '전원 닥공 전환이 뒷공간을 열어줬다' },
  'mentality-lock': { up: '수비 잠그기 운영이 실점 문을 걸어 잠갔다', down: '수비 잠그기 운영이 공격 화력까지 묶었다' },
  'press-high': { up: '게겐프레싱이 상대 빌드업을 질식시켰다', down: '게겐프레싱이 역효과를 냈다' },
  'press-tenback': { up: '텐백 저지선이 골문 앞을 걸어 잠갔다', down: '텐백 저지선이 공격 전개까지 막아버렸다' },
  'route-halfspace': { up: '하프스페이스 중앙 침투가 공격에 날을 세웠다', down: '하프스페이스 침투가 중앙에서 막혔다' },
  'route-wing': { up: '측면 오버랩이 공격 루트를 넓혔다', down: '측면 오버랩이 통하지 않았다' },
  'route-longball': { up: '다이렉트 롱볼이 단숨에 골문을 위협했다', down: '다이렉트 롱볼이 소유권만 헌납했다' },
  'nopassback': { up: 'U자 백패스 금지가 전진 본능을 깨웠다', down: 'U자 백패스 금지가 빌드업 불안을 낳았다' },
  'kangin': { up: '이강인 프리롤이 마법을 부렸다', down: '이강인 의존이 뒷공간 리스크로 돌아왔다' },
  'stamina': { up: '체력 안배가 후반 뒷심을 만들었다', down: '후반 체력 방전이 발목을 잡았다' },
  'opponent': { up: '상대 AI 감독의 소극적 운영이 오히려 공간을 내줬다', down: '상대 AI 감독의 카운터 전술이 우리를 옥죄었다' }
};

function renderXaiBreakdown() {
  const box = document.getElementById('res-xai');
  const top3El = document.getElementById('res-xai-top3');
  const detailEl = document.getElementById('res-xai-detail');
  const sim = state.simResult;
  if (!box || !top3El || !detailEl) return;
  if (!sim || !sim.factors || !sim.factors.length) { box.style.display = 'none'; return; }

  // Net expected-goal impact of each factor on OUR margin (kor gain - opp gain).
  const ranked = sim.factors.map(f => {
    const dKor = sim.lamKor * (1 - 1 / f.korMul); // goals this factor added for Korea
    const dOpp = sim.lamOpp * (1 - 1 / f.oppMul); // goals it added for the opponent
    return { ...f, net: dKor - dOpp };
  }).filter(f => Math.abs(f.net) >= 0.005)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  top3El.innerHTML = ranked.slice(0, 3).map(f => {
    const up = f.net > 0;
    const n = XAI_NARRATIVE[f.id] || {};
    const line = (up ? n.up : n.down) || `${f.label}${up ? '이(가) 플러스로 작용했다' : '이(가) 마이너스로 작용했다'}`;
    return `<div class="res-xai-line ${up ? 'xai-up' : 'xai-down'}">${up ? '▲' : '▼'} ${line} <b>(${up ? '+' : ''}${f.net.toFixed(2)}골)</b></div>`;
  }).join('') || `<div class="res-xai-line">특이 요인 없음 (기본 전력 그대로 맞대결)</div>`;

  const mulTd = (m) => m === 1 ? '<td class="xai-dim">—</td>' : `<td class="${m > 1 ? 'xai-up' : 'xai-down'}">×${m.toFixed(2)}</td>`;
  detailEl.innerHTML = `
    <table class="res-xai-table">
      <tr><th>요인</th><th>한국 λ</th><th>상대 λ</th></tr>
      <tr><td>기본 전력 (FBref 공${state.stats.attack}·수${state.stats.defense}·중원${state.stats.midfield})</td>
        <td>${sim.lamBase.kor.toFixed(2)}</td><td>${sim.lamBase.opp.toFixed(2)}</td></tr>
      ${sim.factors.map(f => `<tr><td>${f.label}</td>${mulTd(f.korMul)}${mulTd(f.oppMul)}</tr>`).join('')}
      <tr class="xai-total"><td>최종 λ → 1,000회 Poisson 시뮬</td>
        <td>${sim.lamKor.toFixed(2)}</td><td>${sim.lamOpp.toFixed(2)}</td></tr>
    </table>
    <p class="res-xai-note">λ = 후반전 기대 득점. 각 배수는 해당 전술 선택이 기대 득점에 곱해진 실제 가중치이며, TOP 3의 골 수치는 그 요인을 제거했을 때와의 기대 득점 차이입니다.</p>`;
  box.style.display = 'block';
}

function toggleXaiDetail() {
  const detailEl = document.getElementById('res-xai-detail');
  const btn = document.getElementById('res-xai-toggle');
  if (!detailEl || !btn) return;
  const open = detailEl.style.display !== 'none';
  detailEl.style.display = open ? 'none' : 'block';
  btn.textContent = open ? '📐 상세 분석 펼치기 ▾' : '📐 상세 분석 접기 ▴';
  SFX.ui();
}

// Full-time: flip the main CTA into reset mode so the next click starts a fresh match
// (covers both the regular result path and the draw -> PK path).
function markMatchFinished() {
  state.matchPhase = 2;
  updateScorebug(state.finalScore.kor, state.finalScore.opp, "FULL-TIME 90'");
  const btn = document.getElementById('btn-run-simulation');
  btn.innerHTML = `<span>🔄 다시 처음부터</span>`;
  btn.style.background = 'var(--accent-cyan)';
  btn.style.color = '#000';
  const statusEl = document.getElementById('match-phase-status');
  if (statusEl) statusEl.innerHTML = `<span>🏁 <strong style="color: var(--accent-emerald);">FULL-TIME (90')</strong> 정규시간 스코어 <strong>${state.finalScore.kor} : ${state.finalScore.opp}</strong> | [🔄 다시 처음부터]를 누르면 새 경기를 준비합니다</span>`;
}

// The result modal runs three stages back to back (match -> shootout ->
// report). Each swap replaces most of the modal's contents, so the scroll
// position left over from the previous stage lands the viewer in the middle of
// the new one. Retitle and rewind together, every time.
function setSimModalStage(title) {
  const titleEl = document.getElementById('sim-modal-title');
  if (titleEl && title) titleEl.textContent = title;
  const pane = document.querySelector('#sim-modal .modal-content');
  // Once now, once after the new stage has been laid out: the immediate write
  // is what actually lands, the frame later is insurance against a stage that
  // grows taller than the one it replaced.
  if (pane) {
    pane.scrollTop = 0;
    requestAnimationFrame(() => { pane.scrollTop = 0; });
  }
}

function showFinalResult() {
  const liveCast = document.getElementById('sim-live-cast');
  const resultCard = document.getElementById('manager-result-card');
  const actions = document.getElementById('sim-modal-actions');
  const pkBox = document.getElementById('pk-shootout-container');

  liveCast.style.display = 'none';
  markMatchFinished();
  renderXaiBreakdown(); // before the PK early-return so the draw path gets it too

  // Check if Draw -> Trigger PK Shootout!
  if (state.finalScore.kor === state.finalScore.opp) {
    if (pkBox) {
      // The shootout is its own stage, not a footnote to the match. The 90
      // minutes are over, so the 2D pitch comes down: leaving it up pushed the
      // kicker cards, the first-person view and the log a full screen below the
      // fold, and scrolling the box into view only ever showed one of the three.
      const canvasBox = document.getElementById('sim-canvas-container');
      if (canvasBox) canvasBox.style.display = 'none';
      pkBox.style.display = 'block';
      if (typeof initPenaltyShootoutUI === 'function') initPenaltyShootoutUI();
      setSimModalStage('⚽ 승부차기 · 키커 5명을 지정하세요');
      return;
    }
  }

  // Same handover for a decided match: the film is over, the report is the stage.
  const canvasBox = document.getElementById('sim-canvas-container');
  if (canvasBox) canvasBox.style.display = 'none';
  resultCard.style.display = 'block';
  actions.style.display = 'flex';
  setSimModalStage('🏆 2026 월드컵 대한민국 최종 리포트');

  let styleName = ""; let desc = ""; let stage = "";
  const kor = state.finalScore.kor; const opp = state.finalScore.opp;
  const sim = state.simResult || { winPct: 0, drawPct: 0, losePct: 0 };

  // The opponent is named, not coded: "RSA" is a lookup key, and this card
  // gets screenshotted by people who never opened the app.
  const oppKo = (FIXTURE_LINE[state.opponent] || [null, state.opponent])[1];
  const real = REAL_RESULT[state.opponent] || { kor: 0, opp: 1 };
  const beatReality = (kor - opp) > (real.kor - real.opp);

  if (kor > opp) {
    SFX.goal();
    styleName = `🔥 '${oppKo}전 완파' 그날을 뒤집은 명장`;
    desc = beatReality
      ? `그날 ${real.kor}:${real.opp}로 끝난 경기를 ${kor}:${opp} 승리로 되돌려 놓았습니다.`
      : `${kor}:${opp}로 이기며 그날의 승리를 그대로 지켜냈습니다.`;
    stage = "승점 6 · 32강 진출 🏆";
  } else if (kor === opp) {
    styleName = `⚡ '끈적한 실리주의' 승점을 지킨 감독`;
    desc = beatReality
      ? `그날 ${real.kor}:${real.opp}로 진 경기를 ${kor}:${opp} 무승부로 끌어올려 승점 1을 벌었습니다.`
      : `${kor}:${opp} 무승부로 균형을 지켰습니다.`;
    stage = "승점 4 · 32강 진출 ⚽";
  } else {
    styleName = `🎲 '아쉬운 석패' 고군분투 지휘관`;
    desc = `${kor}:${opp} 패배. ${state.vibeScore >= 60 ? `그래도 팬 지지율은 ${state.vibeScore}%로 남아 방향성은 인정받았습니다.` : `팬 지지율도 ${state.vibeScore}%까지 내려앉았습니다.`} 아래 승부 요인에서 패인을 확인해 보세요.`;
    // A loss repeats the real record: 1승 2패, 3rd in the group. The old text
    // said 1승 1무 1패, which is what a DRAW would have produced (and would have
    // qualified: the intro modal's whole premise is "비기기만 하면 32강").
    stage = "조별리그 1승 2패 · 조 3위 (32강행 불투명) 🔥";
  }

  styleName = publicVerdictTitle(kor > opp ? 'win' : kor === opp ? 'draw' : 'loss') || styleName;

  renderResultTransform(kor, opp);
  recordAttempt(kor, opp);
  document.getElementById('res-style-name').textContent = styleName;
  document.getElementById('res-desc').textContent = desc;
  document.getElementById('res-val-stage').textContent = stage;
  renderResultCardStats();
}

// The board the result came from, and the sampling behind it. Both endings need
// these: a draw hands off to the shootout before this point, so the shootout's
// card used to inherit whatever the previous match had left on it (a stale
// tactic line and stale percentages, on the surface people screenshot).
function renderResultCardStats() {
  const sim = state.simResult || { winPct: 0, drawPct: 0, losePct: 0 };
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('res-build', buildSummaryLine());
  set('res-val-vibe', `${state.vibeScore}%`);
  set('res-val-winpct', `${sim.winPct}%`);
  set('res-dist',
    `1,000회 시뮬 · 승 ${sim.winPct}% · 무 ${sim.drawPct}% · 패 ${sim.losePct}%`
    + (sim.avgKor != null ? ` · 기대 득점 ${sim.avgKor.toFixed(2)} : ${sim.avgOpp.toFixed(2)}` : ''));
}

// What actually happened in each of the three group-stage matches, from the
// repo's own FBref fixture table: Czechia 2-1 won, Mexico and South Africa
// both 0-1 lost. The card puts that beside the manager's result, which is the
// only comparison the premise is about.
const REAL_RESULT = {
  CZE: { kor: 2, opp: 1 },
  MEX: { kor: 0, opp: 1 },
  RSA: { kor: 0, opp: 1 }
};

function outcomeWord(kor, opp) {
  return kor > opp ? '승리' : kor === opp ? '무승부' : '패배';
}

// mineNote overrides the outcome word (a shootout is not a 90-minute result).
function renderResultTransform(mineKor, mineOpp, mineNote) {
  const oppKo = (FIXTURE_LINE[state.opponent] || [null, state.opponent])[1];
  const round = (FIXTURE_LINE[state.opponent] || ['조별리그'])[0];
  const real = REAL_RESULT[state.opponent] || { kor: 0, opp: 1 };
  const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  set('res-tf-real', `${real.kor} : ${real.opp}`);
  set('res-tf-real-note', outcomeWord(real.kor, real.opp));
  set('res-tf-mine', `${mineKor} : ${mineOpp}`);
  set('res-tf-mine-note', mineNote || outcomeWord(mineKor, mineOpp));
  set('res-tf-fixture', `2026 월드컵 ${round} · 대한민국 vs ${oppKo}`);
}

// ==========================================================================
// Re-coaching loop: remember every settled run, and offer the next one from
// the result card itself (where intent is highest) rather than making the
// manager close the modal and rediscover the header CTA.
// ==========================================================================

// Called once per settled match, from both the regular and the shootout path.
function recordAttempt(kor, opp, note) {
  state.attempts.push({
    opponent: state.opponent,
    kor, opp,
    note: note || outcomeWord(kor, opp),
    build: buildSummaryLine()
  });
  renderAttemptLine();
}

// A shootout win is a 90-minute draw, so it cannot be ranked by goal
// difference alone. The margin decides first, a PK win breaks the tie.
function attemptRank(a) {
  return (a.kor - a.opp) * 10 + (/^PK/.test(a.note) && /승/.test(a.note) ? 1 : 0);
}

function attemptLabel(a) {
  return /^PK/.test(a.note) ? `${a.kor}:${a.opp} (${a.note})` : `${a.kor}:${a.opp}`;
}

function renderAttemptLine() {
  const el = document.getElementById('res-attempts');
  if (!el) return;
  // Only runs against the match currently on the board: "3번째 도전" has to
  // mean this fixture, not three different opponents in a row.
  const runs = state.attempts.filter(a => a.opponent === state.opponent);
  if (runs.length <= 1) { el.style.display = 'none'; return; }

  let bestIdx = 0;
  runs.forEach((a, i) => { if (attemptRank(a) >= attemptRank(runs[bestIdx])) bestIdx = i; });
  const isBest = bestIdx === runs.length - 1;

  el.style.display = 'inline-flex';
  el.innerHTML = isBest
    ? `🔁 ${runs.length}번째 도전 <em>· 지금까지 최고 기록</em>`
    : `🔁 ${runs.length}번째 도전 <em>· 최고 기록 ${attemptLabel(runs[bestIdx])} (${bestIdx + 1}번째)</em>`;
}

// Result card -> straight back to the board, reset and ready for a new plan.
// runSimulation() already owns the full-time reset branch, so this reuses it
// rather than duplicating the teardown.
function retryFromResult() {
  closeModal();
  if (state.matchPhase === 2) runSimulation();
  if (typeof SFX !== 'undefined' && SFX.ui) SFX.ui();

  // Point at the dials, since "다른 전술로" is the whole premise of the click.
  const deck = document.getElementById('rail-dials');
  if (deck) {
    deck.classList.add('guide-ring');
    deck.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => deck.classList.remove('guide-ring'), 4000);
  }
  const runs = state.attempts.filter(a => a.opponent === state.opponent).length;
  showToast(`🔁 ${runs + 1}번째 도전 준비 완료! 전술을 바꾸고 다시 시뮬레이션하세요.`);
}

// The board in one line, using the same words the buttons use. Only the dials
// the manager actually moved: listing a default back at them says nothing
// about the decision they made.
function buildSummaryLine() {
  const parts = [state.currentFormation];
  const push = (map, val, dflt) => { if (val !== dflt && map[val]) parts.push(map[val]); };
  push({ build: '지공 빌드업', direct: '다이렉트 역습' }, state.dials.tempo, 'standard');
  push({ halfspace: '중앙 침투', longball: '다이렉트 롱볼' }, state.dials.route, 'wing');
  push({ tenback: '텐백 저지선', high: '게겐프레싱' }, state.dials.press, 'region');
  push({ lock: '잠그기', attack: '닥공' }, state.dials.mentality, 'balance');
  if (state.dials.nopassback) parts.push('U자 백패스 금지');
  if (kanginActive()) parts.push('이강인 프리롤');
  if (parts.length === 1) parts.push('기본 지침 그대로');
  return parts.join(' · ');
}

// The scoreline is one verdict, public opinion is the other. When the two
// disagree the divergence takes over the manager-card title.
function publicVerdictTitle(outcome) {
  const v = state.vibeScore;
  if (outcome === 'win' && v < 40) return `🥶 '이기고도 경질설' 여론을 잃은 승장`;
  if (outcome === 'draw' && v < 40) return `🥶 '승점 1점의 대가' 성난 여론에 갇힌 감독`;
  if (outcome === 'loss' && v >= 70) return `🌱 '졌지만 방향은 옳았다' 지지받는 패장`;
  return null;
}

function closeModal() {
  // Closing mid-replay must still settle the match: the score was decided
  // before the animation started, so jump it to full time rather than
  // leaving the board stuck at half-time.
  if (liveMatchView) skipLiveMatchView();
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
        <div style="width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #16223a, #0e1626); border: 2px solid ${posColor}; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
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
let pkCandidates = [];   // the seven cards on offer, in pitch order
let pkHintTimer = null;

// Real World Cup shootouts convert near 75%, so that is the baseline for BOTH
// sides. Composure is a curated stat, not a per-90 derivation, so it only
// nudges a kicker around that baseline (elite ~82%, weak ~71%) instead of being
// read as a raw percentage, which used to hand 손흥민 a 99% kick. The opponent
// moves with their attacking strength for the same reason the rest of the model
// does, so a shootout is never a free win: the opponent converts 72~76%
// depending on who you drew, and a weak kicker sits in the low 70s himself.
const PK_BASELINE = 75;
const PK_COMPOSURE_MID = 84;

function pkKickerRate(name) {
  const s = typeof SQUAD_STATS_2026 !== 'undefined' ? SQUAD_STATS_2026[name] : null;
  const composure = s ? s.composure : PK_COMPOSURE_MID;
  return PK_BASELINE + (composure - PK_COMPOSURE_MID) * 0.7;
}

function pkOpponentRate() {
  const opp = OPP_STRENGTH[state.opponent] || { att: 75 };
  return PK_BASELINE + (opp.att - 75) * 0.4;
}

function initPenaltyShootoutUI() {
  const selectorsEl = document.getElementById('pk-kicker-selectors');
  const logEl = document.getElementById('pk-results-log');
  if (!selectorsEl || !logEl) return;
  
  logEl.innerHTML = '';
  selectedPkKickers = [];

  // Clear anything the previous shootout left running
  stopPkView();
  clearTimeout(pkRoundTimer);
  const viewBox = document.getElementById('pk-view-container');
  if (viewBox) viewBox.style.display = 'none';

  // Back to stage 1: the cards return, the kicks and the verdict go away.
  const selectStage = document.getElementById('pk-select-stage');
  if (selectStage) selectStage.style.display = '';
  const finalLine = document.getElementById('pk-final-line');
  if (finalLine) { finalLine.style.display = 'none'; finalLine.innerHTML = ''; }

  // Restore the start button (a previous shootout hides it at the end)
  const startBtn = document.getElementById('btn-start-pk');
  if (startBtn) { startBtn.style.display = ''; startBtn.disabled = false; }

  const ht = document.getElementById('pk-header-title');
  if (ht) ht.textContent = `⚽ 90분 정규시간 ${state.finalScore.kor}:${state.finalScore.opp} 동점 종료! 승부차기(PK) 돌입!`;

  const pitchList = squadData[state.currentFormation] || [];
  const topKickers = pitchList.slice(0, 7);
  
  selectorsEl.innerHTML = topKickers.map((p, idx) => `
    <div class="pk-kicker-card ${idx < 5 ? 'selected' : ''}" id="pk-card-${p.id}" onclick="togglePkKicker('${p.id}', '${p.name}')">
      <div style="font-size: 1.1rem;">${p.avatar}</div>
      <div style="font-weight: 800; font-size: 0.78rem; color: var(--text-primary); margin-top: 2px;">${p.name}</div>
      <div style="font-size: 0.68rem; color: var(--accent-amber); margin-top: 2px;">성공률 ${pkKickerRate(p.name).toFixed(0)}%</div>
      <span class="pk-order-badge" id="pk-order-${p.id}" style="font-size: 0.65rem; color: var(--accent-cyan); display: ${idx < 5 ? 'block' : 'none'}; font-weight: 800;">#${idx + 1} 키커</span>
    </div>
  `).join('');
  
  pkCandidates = topKickers.map(p => ({ id: p.id, name: p.name }));
  selectedPkKickers = topKickers.slice(0, 5).map(p => ({ id: p.id, name: p.name }));
  syncPkKickerCards();
}

// Clicking a chosen kicker drops him; clicking a spare adds him to the end of
// the order. The old version guarded "at least five" and "at most five" against
// a list that starts at exactly five, so both branches returned early and the
// selection could never change: every card was frozen on the default order.
function togglePkKicker(id, name) {
  const idx = selectedPkKickers.findIndex(k => k.id === id);
  if (idx !== -1) {
    selectedPkKickers.splice(idx, 1);
  } else if (selectedPkKickers.length < 5) {
    selectedPkKickers.push({ id, name });
  } else {
    // Five already booked: say so rather than swallowing the click.
    const hint = document.getElementById('pk-hint');
    if (hint) {
      hint.textContent = '이미 5명입니다. 빼고 싶은 키커를 먼저 클릭해 주세요.';
      hint.classList.add('pk-hint-warn');
      clearTimeout(pkHintTimer);
      pkHintTimer = setTimeout(syncPkKickerCards, 1800);
    }
    try { SFX.ui(); } catch (e) { /* audio is optional */ }
    return;
  }
  try { SFX.ui(); } catch (e) { /* audio is optional */ }
  syncPkKickerCards();
}

// One place decides how the seven cards look, so an order change renumbers the
// badges instead of leaving stale ones behind.
function syncPkKickerCards() {
  pkCandidates.forEach(p => {
    const card = document.getElementById(`pk-card-${p.id}`);
    const badge = document.getElementById(`pk-order-${p.id}`);
    const order = selectedPkKickers.findIndex(k => k.id === p.id);
    if (card) card.classList.toggle('selected', order !== -1);
    if (badge) {
      badge.style.display = order === -1 ? 'none' : 'block';
      if (order !== -1) badge.textContent = `#${order + 1} 키커`;
    }
  });
  const hint = document.getElementById('pk-hint');
  const startBtn = document.getElementById('btn-start-pk');
  const n = selectedPkKickers.length;
  if (hint) {
    hint.classList.remove('pk-hint-warn');
    hint.textContent = n === 5
      ? `키커 순서 확정: ${selectedPkKickers.map((k, i) => `${i + 1}. ${k.name}`).join(' · ')}`
      : `카드를 클릭한 순서대로 키커가 정해집니다. 5명을 지정해 주세요 (현재 ${n}명).`;
  }
  if (startBtn) {
    startBtn.disabled = n !== 5;
    startBtn.style.opacity = n === 5 ? '' : '0.5';
    startBtn.style.cursor = n === 5 ? '' : 'not-allowed';
  }
}

// Each round is paced by its own animation instead of a fixed interval: the
// kick is sampled first, the first-person view plays that decided kick, and
// the log line lands when the ball does.
let pkRoundTimer = null;

function startPenaltyShootout() {
  const logEl = document.getElementById('pk-results-log');
  const btn = document.getElementById('btn-start-pk');
  const viewBox = document.getElementById('pk-view-container');
  if (!logEl || !btn) return;

  btn.disabled = true;
  clearTimeout(pkRoundTimer);
  logEl.innerHTML = `<div style="color: var(--accent-cyan); font-weight: 800;">🔥 승부차기 1번 키커 준비 중...</div>`;

  // Stage 2. The cards have done their job; taking them down is what makes the
  // kick view and the round log fit the modal together, so the viewer never has
  // to choose between watching the kick and reading whether it went in.
  const selectStage = document.getElementById('pk-select-stage');
  if (selectStage) selectStage.style.display = 'none';
  const header = document.getElementById('pk-header-title');
  if (header) header.textContent = '⚽ 승부차기 진행 중';
  const hint = document.getElementById('pk-hint');
  clearTimeout(pkHintTimer); // a pending "이미 5명입니다" reset would overwrite the order line
  if (hint) {
    hint.classList.remove('pk-hint-warn');
    hint.textContent = `키커 순서 ${selectedPkKickers.map((k, i) => `${i + 1}. ${k.name}`).join(' · ')}`;
  }
  if (viewBox) viewBox.style.display = 'block';
  setSimModalStage(`⚽ 승부차기 · 대한민국 vs ${state.opponent}`);

  let korPk = 0; let oppPk = 0;
  let round = 0;

  const concludeShootout = () => {
    btn.disabled = false;
    btn.style.display = 'none';

    const korWin = korPk > oppPk;
    updateScorebug(null, null, `PK ${korPk}-${oppPk} 종료`);
    logEl.scrollTop = logEl.scrollHeight;
    // Not appended to the log: the log is a capped scroller, and the one line
    // everybody is waiting for must not be the one line you have to scroll for.
    const finalLine = document.getElementById('pk-final-line');
    if (finalLine) {
      finalLine.style.display = 'block';
      finalLine.innerHTML = `
        <div style="padding: 0.6rem; background: ${korWin ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}; border: 1px solid ${korWin ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; border-radius: 6px; text-align: center; font-weight: 900; color: ${korWin ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          🏆 최종 PK 스코어 ${korPk} : ${oppPk} — ${korWin ? '대한민국 승부차기 승리!! 정규시간 무승부로 조별리그는 이미 통과했습니다.' : '아쉬운 PK 석패... 그래도 정규시간 무승부로 조별리그는 통과했습니다.'}
        </div>
      `;
    }

    pkRoundTimer = setTimeout(() => {
      const pkBox = document.getElementById('pk-shootout-container');
      const resultCard = document.getElementById('manager-result-card');
      const actions = document.getElementById('sim-modal-actions');
      if (pkBox) pkBox.style.display = 'none';
      if (resultCard) resultCard.style.display = 'block';
      if (actions) actions.style.display = 'flex';
      // Stage 3. Give the report its own title back and start it from the top.
      setSimModalStage('🏆 2026 월드컵 대한민국 최종 리포트');

      const pkTitle = korWin ? "🔥 'PK 혈투 끝의 강철 심장' 승부차기 명장" : "🎲 '아쉬운 PK 석패' 불굴의 지휘관";
      document.getElementById('res-style-name').textContent = publicVerdictTitle(korWin ? 'win' : 'loss') || pkTitle;
      document.getElementById('res-desc').textContent = `90분 ${state.finalScore.kor}:${state.finalScore.opp} 동점 이후 ${selectedPkKickers.map(k => k.name).join(', ')} 키커로 승부차기 ${korPk}:${oppPk}. 팬 지지율은 ${state.vibeScore}%입니다.`;
      // The shootout is a sub-game: the group table only saw a draw, so the
      // point and the qualification are the same either way.
      document.getElementById('res-val-stage').textContent =
        `승점 4 · 32강 진출 (승부차기 ${korWin ? '승' : '패'})`;
      // The 90-minute score is a draw either way, so the shootout carries the verdict.
      renderResultTransform(state.finalScore.kor, state.finalScore.opp, `PK ${korPk}:${oppPk} ${korWin ? '승' : '패'}`);
      renderResultCardStats();
      recordAttempt(state.finalScore.kor, state.finalScore.opp, `PK ${korPk}:${oppPk} ${korWin ? '승' : '패'}`);
    }, 3500);
  };

  const nextRound = () => {
    // After the 5 regulation kicks a level score goes to sudden death, so the
    // shootout can never be declared a "win" while the score is still tied.
    const suddenDeath = round >= 5;
    if (suddenDeath && korPk !== oppPk) { concludeShootout(); return; }

    const kicker = selectedPkKickers[round % Math.max(1, selectedPkKickers.length)]
      || { name: `한국 ${round + 1}번 키커` };

    const korGoal = Math.random() * 100 < pkKickerRate(kicker.name);
    const oppGoal = Math.random() * 100 < pkOpponentRate();
    // A missed kick is either saved or dragged off target; the view and the
    // log line have to tell the same story, so it is decided once here.
    const outcome = korGoal ? 'goal' : (Math.random() < 0.5 ? 'save' : 'miss');
    if (korGoal) korPk++;
    const label = suddenDeath ? `서든데스 ${round + 1}번` : `${round + 1}번 키커`;

    let settled = false;
    const settleRound = () => {
      if (settled) return; // the view's callback and the error path must not both fire
      settled = true;
      if (oppGoal) oppPk++;
      logEl.innerHTML += `
        <div style="padding: 0.35rem; background: var(--surface-sunken); border-radius: 4px; border-left: 3px solid ${korGoal ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          <strong>${suddenDeath ? `서든데스 #${round + 1}` : `#${round + 1}`} ${kicker.name}:</strong> ${korGoal ? '⚽ 골 성공!!' : (outcome === 'save' ? '❌ 골키퍼 선방!' : '❌ 크로스바 위로 실축!')} vs <strong>${state.opponent}:</strong> ${oppGoal ? '⚽ 성공' : '❌ 실축!'} (현재 ${korPk}:${oppPk})
        </div>
      `;
      logEl.scrollTop = logEl.scrollHeight;
      round++;
      pkRoundTimer = setTimeout(nextRound, 700);
    };

    try { SFX.ui(); if (korGoal) SFX.goal(); } catch (e) { /* audio is optional */ }
    try {
      animatePkKick({ kicker: kicker.name, round, outcome, korPk, oppPk, label }, settleRound);
    } catch (e) {
      settleRound(); // the shootout must finish even if the view cannot draw
    }
  };

  nextRound();
}

// ==========================================================================
// 2D live match view (top-down replay of the second half).
//
// The half is already decided before a single frame is drawn: runMonteCarlo
// samples 1,000 halves and picks the modal score, and this view replays THAT
// result. Goal minutes, scorers and the run of play come from a seeded PRNG
// fed by the same lambdas, so the same board always produces the same film
// and nothing drawn here can move a probability. The old canvas ignored the
// score entirely and shouted a hardcoded "GOAL!! 2:1" at every win.
// ==========================================================================

const LIVE_MATCH_MS_PER_MIN = 270; // 45 game minutes in ~12s
const LIVE_GOAL_FLASH_MIN = 2.4;   // how long a goal celebration holds, in game minutes
let liveMatchView = null;          // handle for the running view (raf id + finish hook)

// Deterministic 32-bit PRNG (mulberry32). Same seed -> same film.
function seededRng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Who gets the goal: sampled from the attacking players actually on the pitch,
// weighted by the same FBref attack rating the board shows.
function pickScorer(rng) {
  const pitch = squadData[state.currentFormation] || [];
  const pool = pitch.filter(p => p.type === 'att' || p.type === 'mid');
  if (!pool.length) return null;
  const weights = pool.map(p => {
    const s = (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name]) || null;
    const base = s ? s.attack : 60;
    return Math.max(4, p.type === 'att' ? base : base * 0.4);
  });
  let r = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

// Turn the settled score into a minute-by-minute script: when the goals land,
// who scored them, and which side is camped in which half in between. Both
// halves use this; the first one is a fixed calculation and the second a
// settled Monte Carlo draw, but either way the score exists before the film.
function buildMatchFilm(opts) {
  const cfg = opts || {};
  const from = cfg.from != null ? cfg.from : 45;
  const to = cfg.to != null ? cfg.to : 90;
  const sim = state.simResult || {};
  const half = cfg.fromScore || state.halfTimeScore || { kor: 0, opp: 0 };
  const fin = cfg.toScore || state.finalScore || { kor: 0, opp: 0 };
  const korGoals = Math.max(0, fin.kor - half.kor);
  const oppGoals = Math.max(0, fin.opp - half.opp);
  const lamKor = cfg.lamKor || sim.lamKor || 1, lamOpp = cfg.lamOpp || sim.lamOpp || 1;
  const seed = (Math.round(lamKor * 1e5) ^ Math.round(lamOpp * 7919)
    ^ ((korGoals * 31 + oppGoals) * 104729) ^ (from * 2654435761)) >>> 0;
  const rng = seededRng(seed);

  const lo = from + 3, hi = to - 2;   // no goal in the opening or closing minute
  const used = new Set();
  const drawMinute = () => {
    for (let i = 0; i < 60; i++) {
      const m = lo + Math.floor(rng() * (hi - lo));
      if (!used.has(m)) { used.add(m); return m; }
    }
    let m = lo; while (used.has(m)) m++;
    used.add(m); return m;
  };

  const events = [];
  for (let i = 0; i < korGoals; i++) events.push({ minute: drawMinute(), team: 'kor' });
  for (let i = 0; i < oppGoals; i++) events.push({ minute: drawMinute(), team: 'opp' });
  events.sort((a, b) => a.minute - b.minute);
  let k = half.kor, o = half.opp;
  events.forEach(e => {
    if (e.team === 'kor') { k++; const s = pickScorer(rng); e.scorer = s ? s.name : '대한민국'; }
    else o++;
    e.kor = k; e.opp = o;
  });

  // Possession segments: who is camped where between the goals. Share of the
  // ball tracks the lambda split, so a dominant board looks dominant.
  const korShare = Math.min(0.78, Math.max(0.22, lamKor / (lamKor + lamOpp)));
  const segments = [];
  let cursor = from;
  while (cursor < to) {
    const dur = 0.9 + rng() * 2.4;
    const team = rng() < korShare ? 'kor' : 'opp';
    const depth = team === 'kor' ? 0.60 + rng() * 0.28 : 0.40 - rng() * 0.28;
    segments.push({ start: cursor, end: cursor + dur, team, depth });
    cursor += dur;
  }
  return {
    events, segments, korShare, half, final: fin, from, to,
    phaseLabel: cfg.phaseLabel || '2H · LIVE'
  };
}

// Commentary cues shown in the ticker above the canvas, on the same clock as
// the animation: the ticker shouts a goal on the frame the ball goes in.
function goalCue(e) {
  return e.team === 'kor'
    ? { minute: e.minute, text: `⚽ ${e.minute}' 골!! ${e.scorer} 득점! ${e.kor} : ${e.opp}` }
    : { minute: e.minute, text: `😱 ${e.minute}' ${state.opponent}에 실점... ${e.kor} : ${e.opp}` };
}

function buildCommentaryCues(film, freshLegs, sim) {
  const cues = [{ minute: 45, text: `🔥 45' 후반전 킥오프! [vs ${state.opponent}] 후반 전술 지침 가동` }];
  cues.push(freshLegs && freshLegs.length
    ? { minute: 58, text: `🔄 58' 하프타임에 투입된 ${freshLegs[0]}, 프레시 레그가 전방을 흔든다` }
    : { minute: 62, text: `⚡ 62' 중원에서 탈압박 성공, 공격 주도권을 끌어온다` });
  film.events.forEach(e => cues.push(goalCue(e)));
  cues.push({
    minute: 89,
    text: `📊 1,000회 몬테카를로: 승 ${sim.winPct}% · 무 ${sim.drawPct}% · 패 ${sim.losePct}% → 최빈 스코어 ${film.final.kor} : ${film.final.opp}`
  });
  return cues.sort((a, b) => a.minute - b.minute);
}

// The first half runs on the same ticker, quoting the manager's own press
// setting back at them the way the old status-bar relay did.
function buildFirstHalfCues(film) {
  const cues = [
    { minute: 0, text: `⚽ 0' 킥오프! [vs ${state.opponent}] 전반전 탐색전 가동` },
    { minute: 24, text: `⚔️ 24' ${state.opponent} 측면 파상공세 vs 한국 ${PRESS_BROADCAST_LABEL[state.dials.press] || '중원 지역방어'} 맞불!` }
  ];
  film.events.forEach(e => cues.push(goalCue(e)));
  cues.push({ minute: 44, text: `⏱️ 45' 전반전 종료 — 라커룸에서 후반을 준비합니다 (${film.final.kor} : ${film.final.opp})` });
  return cues.sort((a, b) => a.minute - b.minute);
}

// Formation rows -> normalized pitch spots. FORMATION_ROWS runs attack line
// first and keeper last (the order the board renders), so the film shows the
// same shape the manager actually built.
function teamShape(formation, attackingRight) {
  const rows = FORMATION_ROWS[formation] || [3, 3, 4, 1];
  const outfieldRows = Math.max(1, rows.length - 1);
  const spots = [];
  rows.forEach((count, ri) => {
    const isGk = (ri === rows.length - 1 && count === 1);
    const x = isGk ? 0.045
      : 0.70 - (outfieldRows > 1 ? ri / (outfieldRows - 1) : 0) * 0.50;
    for (let i = 0; i < count; i++) {
      const y = count === 1 ? 0.5 : 0.15 + (i / (count - 1)) * 0.70;
      spots.push({ x: attackingRight ? x : 1 - x, y, gk: isGk });
    }
  });
  return spots;
}

// Shared chrome for both canvas views (the live match and the shootout), so
// the two animations read as one thing. Plates are measured, not guessed: the
// opponent code and the minute both change width mid-match.
function drawCanvasHud(ctx, W, H, leftText, rightText) {
  ctx.font = `800 ${Math.round(H * 0.075)}px 'Outfit', 'Noto Sans KR', sans-serif`;
  ctx.textBaseline = 'top';
  const pad = W * 0.013, y = H * 0.05, h = H * 0.11, m = W * 0.022;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.fillRect(m, y, ctx.measureText(leftText).width + pad * 2, h);
  const rw = ctx.measureText(rightText).width + pad * 2;
  ctx.fillRect(W - m - rw, y, rw, h);
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = 'left'; ctx.fillText(leftText, m + pad, y + H * 0.018);
  ctx.textAlign = 'right'; ctx.fillText(rightText, W - m - pad, y + H * 0.018);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

function drawCanvasFlash(ctx, W, H, tone, text, sub) {
  ctx.fillStyle = tone === 'good' ? 'rgba(16, 185, 129, 0.30)' : 'rgba(244, 63, 94, 0.26)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(2, 20, 12, 0.85)';
  ctx.shadowBlur = H * 0.05;
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${Math.round(H * 0.16)}px 'Outfit', 'Noto Sans KR', sans-serif`;
  ctx.fillText(text, W / 2, H * 0.44);
  ctx.font = `700 ${Math.round(H * 0.078)}px 'Outfit', 'Noto Sans KR', sans-serif`;
  ctx.fillStyle = tone === 'good' ? '#a7f3d0' : '#fecdd3';
  ctx.fillText(sub, W / 2, H * 0.63);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

function drawPitchSurface(ctx, W, H) {
  ctx.fillStyle = '#0a3d2c';
  ctx.fillRect(0, 0, W, H);
  const stripes = 9;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  for (let i = 0; i < stripes; i += 2) ctx.fillRect((W / stripes) * i, 0, W / stripes, H);

  const px = W * 0.022, py = H * 0.05;
  const fw = W - px * 2, fh = H - py * 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.lineWidth = Math.max(2, W / 420);
  ctx.strokeRect(px, py, fw, fh);
  ctx.beginPath(); ctx.moveTo(W / 2, py); ctx.lineTo(W / 2, py + fh); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, fh * 0.155, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, H / 2, ctx.lineWidth * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.32)'; ctx.fill();

  [0, 1].forEach(side => {
    const boxW = fw * 0.155, boxH = fh * 0.58;
    const bx = side === 0 ? px : px + fw - boxW;
    ctx.strokeRect(bx, py + (fh - boxH) / 2, boxW, boxH);
    const sixW = fw * 0.06, sixH = fh * 0.28;
    const sx = side === 0 ? px : px + fw - sixW;
    ctx.strokeRect(sx, py + (fh - sixH) / 2, sixW, sixH);
    const gW = fw * 0.014, gH = fh * 0.17;
    const gx = side === 0 ? px - gW : px + fw;
    ctx.strokeRect(gx, py + (fh - gH) / 2, gW, gH);
  });
}

// Pitch coords are normalized (0..1 along the length, Korea attacking right)
// so every drawing call is resolution-independent.
function pitchPoint(W, H, nx, ny) {
  const px = W * 0.022, py = H * 0.05;
  return { x: px + nx * (W - px * 2), y: py + ny * (H - py * 2) };
}

function drawDot(ctx, W, H, nx, ny, r, fill, ring) {
  const p = pitchPoint(W, H, nx, ny);
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = Math.max(1.5, r * 0.28); ctx.stroke(); }
  return p;
}

function stopLiveMatchView() {
  if (liveMatchView) {
    if (liveMatchView.raf) cancelAnimationFrame(liveMatchView.raf);
    if (liveMatchView.watchdog) clearTimeout(liveMatchView.watchdog);
  }
  liveMatchView = null;
}

// Jump straight to full time (skip button, or the modal being closed mid-match).
// The result is already settled, so this only skips pixels.
function skipLiveMatchView() {
  const v = liveMatchView;
  if (!v) return;
  stopLiveMatchView();
  v.finish();
}

// ==========================================================================
// Penalty view, from behind the ball. Like the live match above, the kick is
// decided before a frame is drawn (pkKickerRate vs. the keeper), so this
// animates a settled outcome: where the ball goes and which way the keeper
// dives are cosmetic choices seeded per kicker and round.
// ==========================================================================

const PK_GOAL = { left: 0.13, right: 0.87, top: 0.15, bottom: 0.64 };
const PK_HORIZON = 0.61;
let pkView = null;

function stopPkView() {
  if (pkView) {
    if (pkView.raf) cancelAnimationFrame(pkView.raf);
    if (pkView.watchdog) clearTimeout(pkView.watchdog);
  }
  pkView = null;
}

// A stable seed per (kicker, round) so a kick never re-rolls its corner
// mid-animation, and the same shootout replays identically.
function pkSeed(name, round) {
  let h = 2166136261;
  const s = String(name) + '#' + round;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function drawPenaltyScene(ctx, W, H, sc) {
  // Stands
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, W, H * PK_HORIZON);
  sc.crowd.forEach(c => {
    ctx.fillStyle = c.c;
    ctx.fillRect(c.x * W, c.y * H, W * 0.006, W * 0.006);
  });

  // Turf, with the box lines converging toward the goal for depth
  const horizon = H * PK_HORIZON;
  const g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, '#0d5238'); g.addColorStop(1, '#0a3d2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = Math.max(2, W / 420);
  ctx.beginPath();
  ctx.moveTo(-W * 0.20, H); ctx.lineTo(PK_GOAL.left * W - W * 0.02, horizon + H * 0.015);
  ctx.moveTo(W * 1.20, H); ctx.lineTo(PK_GOAL.right * W + W * 0.02, horizon + H * 0.015);
  ctx.moveTo(0, horizon + H * 0.02); ctx.lineTo(W, horizon + H * 0.02);
  ctx.stroke();
  // Penalty spot: the ground we are standing on
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath(); ctx.ellipse(W / 2, H * 0.88, W * 0.012, H * 0.008, 0, 0, Math.PI * 2); ctx.fill();

  // Goal: mouth, depth box, net
  const gl = PK_GOAL.left * W, gr = PK_GOAL.right * W;
  const gt = PK_GOAL.top * H, gb = PK_GOAL.bottom * H;
  const dx = W * 0.035, dy = H * 0.045; // net depth offset
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
  ctx.lineWidth = Math.max(1, W / 900);
  for (let i = 1; i < 16; i++) {
    const x = gl + ((gr - gl) / 16) * i;
    ctx.beginPath(); ctx.moveTo(x, gt); ctx.lineTo(x + (x < (gl + gr) / 2 ? dx : -dx), gt + dy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, gb); ctx.lineTo(x + (x < (gl + gr) / 2 ? dx : -dx), gb - dy * 0.4); ctx.stroke();
  }
  for (let i = 1; i < 9; i++) {
    const y = gt + ((gb - gt) / 9) * i;
    ctx.beginPath(); ctx.moveTo(gl, y); ctx.lineTo(gr, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.30)';
  ctx.strokeRect(gl + dx, gt + dy, (gr - gl) - dx * 2, (gb - gt) - dy);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = Math.max(3, W / 145);
  ctx.beginPath();
  ctx.moveTo(gl, gb); ctx.lineTo(gl, gt); ctx.lineTo(gr, gt); ctx.lineTo(gr, gb);
  ctx.stroke();
}

// A jointed keeper rather than a rotating blob: torso, head, two arms and two
// legs, drawn as thick round strokes. `dive` is -1..1 across the goal and
// `reach` is 0..1 from a low dive to a full stretch upward, so the figure goes
// where the ball actually went. `phase` 0..1 drives the sequence: a crouch and
// a push off the line first, then the extension.
function drawKeeper(ctx, W, H, cx, cy, dive, reach, phase) {
  const s = W * 0.047;
  const p = Math.min(1, Math.max(0, phase == null ? Math.abs(dive) : phase));
  const dir = dive < 0 ? -1 : 1;
  const commit = Math.abs(dive);                 // how far into the dive
  const crouch = Math.sin(Math.min(1, p * 3) * Math.PI) * 0.18 * (1 - commit); // dip before the push
  const lean = dir * commit * 1.15;              // radians: horizontal at full stretch
  const up = (reach == null ? 0.5 : reach);      // 1 = top corner, 0 = along the ground

  ctx.save();
  ctx.translate(cx, cy + s * crouch);
  ctx.rotate(lean * (0.55 + up * 0.35));

  const kit = '#22d3ee', skin = '#e2e8f0', glove = '#fbbf24';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // legs trail the dive, splitting as he extends
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = s * 0.34;
  const legSpread = 0.35 + commit * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.55);
  ctx.lineTo(-s * legSpread, s * (1.5 + commit * 0.35));
  ctx.moveTo(0, s * 0.55);
  ctx.lineTo(s * legSpread * 0.7, s * (1.6 - commit * 0.2));
  ctx.stroke();

  // torso
  ctx.strokeStyle = kit;
  ctx.lineWidth = s * 0.62;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.6);
  ctx.lineTo(0, -s * 0.55);
  ctx.stroke();

  // arms: the lead arm reaches for the corner, the trailing one balances
  ctx.lineWidth = s * 0.26;
  const reachLen = 1.05 + commit * 0.95;
  const leadX = dir * s * reachLen * 1.15;
  const leadY = -s * (0.75 + up * 0.9);
  const trailX = -dir * s * (0.85 + commit * 0.35);
  const trailY = s * (0.1 - up * 0.35);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.42); ctx.lineTo(leadX, leadY);
  ctx.moveTo(0, -s * 0.42); ctx.lineTo(trailX, trailY);
  ctx.stroke();

  ctx.fillStyle = glove;
  ctx.beginPath(); ctx.arc(leadX, leadY, s * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(trailX, trailY, s * 0.26, 0, Math.PI * 2); ctx.fill();

  // head, tucked slightly toward the dive
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(dir * s * 0.12 * commit, -s * 0.95, s * 0.4, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
}

function drawPkBall(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24'; ctx.fill();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)'; ctx.lineWidth = Math.max(1.5, r * 0.18); ctx.stroke();
  ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.32, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)'; ctx.fill();
}

// cfg: { kicker, round, outcome: 'goal'|'save'|'miss', korPk, oppPk, label }
function animatePkKick(cfg, onDone) {
  const canvas = document.getElementById('pk-view-canvas');
  const done = () => { if (typeof onDone === 'function') onDone(); };
  if (!canvas || typeof canvas.getContext !== 'function') { done(); return false; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { done(); return false; }
  stopPkView();

  const W = canvas.width, H = canvas.height;
  const rng = seededRng(pkSeed(cfg.kicker, cfg.round));
  const side = rng() < 0.5 ? -1 : 1;
  const target = {
    x: 0.5 + side * (0.19 + rng() * 0.13),
    y: cfg.outcome === 'miss' ? PK_GOAL.top - 0.10 : (rng() < 0.5 ? 0.22 + rng() * 0.07 : 0.46 + rng() * 0.09)
  };
  const keeperSide = cfg.outcome === 'goal'
    ? (rng() < 0.7 ? -side : side)   // beaten keeper usually guesses the other way
    : side;                          // a save means he went the right way
  const scene = {
    crowd: Array.from({ length: 170 }, (_, i) => ({
      x: rng(), y: 0.02 + rng() * 0.55,
      c: i % 4 === 0 ? 'rgba(244, 63, 94, 0.45)' : 'rgba(148, 163, 184, 0.30)'
    }))
  };

  const DUR = 1750, T_SET = 0.20, T_HIT = 0.62;
  const startX = 0.5, startY = 0.90, startR = W * 0.034, endR = W * 0.012;
  let t0 = 0, ended = false;

  const finish = () => {
    if (ended) return;
    ended = true;
    stopPkView();
    done();
  };

  const frame = (p) => {
    drawPenaltyScene(ctx, W, H, scene);
    const flight = Math.min(1, Math.max(0, (p - T_SET) / (T_HIT - T_SET)));
    // A save stops the ball at the keeper's gloves instead of the net.
    const travel = cfg.outcome === 'save' ? Math.min(flight, 0.82) : flight;
    const ease = travel * travel * (3 - 2 * travel);
    const bx = (startX + (target.x - startX) * ease) * W;
    const by = (startY + (target.y - startY) * ease) * H - Math.sin(ease * Math.PI) * H * 0.05;
    const br = startR + (endR - startR) * ease;

    // The dive: a beat of anticipation, then an arc across the line rather than
    // a slide. He rises off the ground and comes back down, and how high he
    // reaches follows the corner the ball is heading for.
    const diveP = Math.min(1, Math.max(0, (p - T_SET - 0.06) / 0.34));
    const diveEase = diveP * diveP * (3 - 2 * diveP);
    const dive = keeperSide * diveEase;
    const reach = Math.min(1, Math.max(0, (PK_GOAL.bottom - target.y) / (PK_GOAL.bottom - PK_GOAL.top)));
    const hop = Math.sin(diveEase * Math.PI) * (0.055 + reach * 0.05); // off the turf and back down
    drawKeeper(ctx, W, H,
      (0.5 + dive * 0.27) * W,
      H * (0.46 + diveEase * 0.05 - hop),
      dive, reach, diveP);
    drawPkBall(ctx, bx, by, br);

    drawCanvasHud(ctx, W, H, `PK ${cfg.korPk} : ${cfg.oppPk}`, cfg.label);
    if (p < T_SET) {
      ctx.textAlign = 'center';
      ctx.font = `800 ${Math.round(H * 0.062)}px 'Outfit', 'Noto Sans KR', sans-serif`;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`${cfg.kicker} 키커 준비`, W / 2, H * 0.80);
      ctx.textAlign = 'left';
    }
    if (p >= T_HIT) {
      if (cfg.outcome === 'goal') drawCanvasFlash(ctx, W, H, 'good', 'GOAL!', `${cfg.kicker} · ${cfg.korPk} : ${cfg.oppPk}`);
      else if (cfg.outcome === 'save') drawCanvasFlash(ctx, W, H, 'bad', 'SAVED!', `${cfg.kicker} · 골키퍼 선방`);
      else drawCanvasFlash(ctx, W, H, 'bad', 'MISS!', `${cfg.kicker} · 크로스바 위로`);
    }
  };

  const step = (ts) => {
    if (ended) return;
    if (!t0) t0 = ts;
    const p = Math.min(1, (ts - t0) / DUR);
    frame(p);
    if (p >= 1) { finish(); return; }
    pkView.raf = requestAnimationFrame(step);
  };

  pkView = { raf: 0, watchdog: 0, finish, frame };
  pkView.watchdog = setTimeout(finish, DUR + 4000); // a backgrounded tab must not stall the shootout
  frame(0);
  pkView.raf = requestAnimationFrame(step);
  return true;
}

// Opens the simulation modal as a live match view (either half) and starts the
// replay. Returns false if the canvas cannot draw, so the caller can fall back
// to the ticker alone and still finish the half.
function openMatchView(opts) {
  const modal = document.getElementById('sim-modal');
  const liveCast = document.getElementById('sim-live-cast');
  const stepText = document.getElementById('sim-step-text');
  const canvasBox = document.getElementById('sim-canvas-container');
  const resultCard = document.getElementById('manager-result-card');
  const actions = document.getElementById('sim-modal-actions');
  const pkBox = document.getElementById('pk-shootout-container');
  const titleEl = document.getElementById('sim-modal-title');
  const capEl = document.getElementById('sim-canvas-caption');
  if (!modal || !canvasBox || !stepText) return false;

  modal.classList.add('active');
  if (liveCast) liveCast.style.display = 'flex';
  if (resultCard) resultCard.style.display = 'none';
  if (actions) actions.style.display = 'none';
  if (pkBox) pkBox.style.display = 'none';
  if (titleEl && opts.title) titleEl.textContent = opts.title;
  if (capEl) capEl.textContent = `⚽ 2D 라이브 중계 · ${opts.film.from}~${opts.film.to}분`;
  canvasBox.style.display = 'block';
  stepText.textContent = opts.cues[0].text;

  let started = false;
  try {
    started = startLiveMatchView({
      film: opts.film,
      cues: opts.cues,
      onCue: (text) => { stepText.textContent = text; if (opts.onCue) opts.onCue(text); },
      onEnd: opts.onEnd
    });
  } catch (e) {
    started = false;
  }
  if (!started) {
    canvasBox.style.display = 'none';
    modal.classList.remove('active');
  }
  return started;
}

function startLiveMatchView(opts) {
  const canvas = document.getElementById('live-match-canvas');
  if (!canvas || typeof canvas.getContext !== 'function') return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  stopLiveMatchView();

  const W = canvas.width, H = canvas.height;
  const timerEl = document.getElementById('sim-canvas-timer');
  const skipBtn = document.getElementById('btn-skip-live');
  const film = opts.film;
  const cues = opts.cues || [];
  const onCue = opts.onCue || function () {};
  const onEnd = opts.onEnd || function () {};

  const korShape = teamShape(state.currentFormation, true);
  const oppFormation = (state.opponentPlan && state.opponentPlan.counterFormation) || '4-4-2';
  const oppShape = teamShape(oppFormation, false);
  // teamShape walks FORMATION_ROWS in the same order squadData stores the XI,
  // so spot i is player i: the dots carry the actual names the manager picked.
  // The opponent's players are not in the dataset, and inventing eleven names
  // would be inventing data, so their side stays unlabelled.
  // Real shirt numbers, from the roster in data/raw/kor/fbref_roster.csv.
  const korPlayers = (squadData[state.currentFormation] || []).map(p => ({
    name: p.name,
    jersey: (typeof SQUAD_STATS_2026 !== 'undefined' && SQUAD_STATS_2026[p.name])
      ? SQUAD_STATS_2026[p.name].jersey : null
  }));

  let clock = film.from;     // game minute
  let territory = 0.5;       // 0 = our goal, 1 = their goal
  let cueIdx = 0, eventIdx = 0;
  let flash = null;          // { until, team, text, sub }
  let score = { kor: film.half.kor, opp: film.half.opp };
  let last = 0, ended = false;

  const finish = () => {
    if (ended) return;
    ended = true;
    stopLiveMatchView(); // drop the raf/watchdog handle: this half is done
    if (skipBtn) skipBtn.style.display = 'none';
    if (timerEl) timerEl.textContent = `${film.to}' 종료`;
    score = { kor: film.final.kor, opp: film.final.opp };
    try { drawFrame(film.to, 0.5, null); } catch (e) { /* final still frame is cosmetic */ }
    onCue(cues.length ? cues[cues.length - 1].text : '');
    onEnd();
  };

  function currentSegment(t) {
    for (let i = 0; i < film.segments.length; i++) {
      if (t >= film.segments[i].start && t < film.segments[i].end) return film.segments[i];
    }
    return film.segments[film.segments.length - 1] || { team: 'kor', depth: 0.5 };
  }

  function drawFrame(t, terr, fl) {
    drawPitchSurface(ctx, W, H);

    const seg = currentSegment(t);
    const attacking = fl ? fl.team : seg.team;
    const push = (terr - 0.5);
    const r = Math.max(4, W / 125);

    // Both blocks slide with the play, the way a compact team actually moves.
    const nameFont = `700 ${Math.round(H * 0.042)}px 'Noto Sans KR', 'Outfit', sans-serif`;
    const drawTeam = (shape, isKor, color, ring) => {
      shape.forEach((s, i) => {
        const amp = s.gk ? 0.06 : (isKor ? 0.30 : 0.26);
        const nx = Math.min(0.985, Math.max(0.015, s.x + push * amp
          + (s.gk ? 0 : Math.sin(t * 2.1 + i * 1.7) * 0.008)));
        const ny = Math.min(0.97, Math.max(0.03, s.y + (s.gk ? 0 : Math.cos(t * 1.7 + i * 2.3) * 0.02)));
        const me = isKor ? korPlayers[i] : null;
        const rr = isKor ? r * 1.7 : r * 1.15;   // our discs carry a number, so they run larger
        const p = drawDot(ctx, W, H, nx, ny, s.gk ? rr * 0.95 : rr, color, ring);
        if (me) {
          ctx.textAlign = 'center';
          if (me.jersey != null) {
            ctx.font = `800 ${Math.round(rr * 1.15)}px 'Outfit', sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(10, 8, 14, 0.92)';
            ctx.fillText(String(me.jersey), p.x, p.y + rr * 0.04);
          }
          ctx.font = nameFont;
          ctx.textBaseline = 'top';
          ctx.lineWidth = Math.max(2, H * 0.008);
          ctx.strokeStyle = 'rgba(4, 12, 8, 0.85)'; // outline keeps it legible over grass
          ctx.strokeText(me.name, p.x, p.y + rr * 1.15);
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(me.name, p.x, p.y + rr * 1.15);
          ctx.textAlign = 'left';
          ctx.textBaseline = 'alphabetic';
        }
      });
    };
    drawTeam(oppShape, false, '#e2e8f0', 'rgba(15, 23, 42, 0.75)');
    drawTeam(korShape, true, '#f43f5e', 'rgba(255, 255, 255, 0.85)');

    // Ball: the focus of play, out at the goal mouth during a celebration.
    let bx, by;
    if (fl) {
      bx = fl.team === 'kor' ? 0.975 : 0.025;
      by = 0.5 + Math.sin(fl.seedY) * 0.07;
    } else {
      bx = 0.08 + terr * 0.84;
      by = 0.5 + Math.sin(t * 1.9 + 0.7) * 0.24;
    }
    const bp = drawDot(ctx, W, H, bx, by, r * 0.55, '#fbbf24', 'rgba(15, 23, 42, 0.9)');
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, r * 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = attacking === 'kor' ? 'rgba(244, 63, 94, 0.45)' : 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = Math.max(1.5, r * 0.22);
    ctx.stroke();

    drawCanvasHud(ctx, W, H, `KOR ${score.kor} : ${score.opp} ${state.opponent}`, `${Math.min(film.to, Math.floor(t))}'`);
    if (fl) drawCanvasFlash(ctx, W, H, fl.team === 'kor' ? 'good' : 'bad', fl.text, fl.sub);
  }

  const step = (ts) => {
    if (ended) return;
    if (!last) last = ts;
    const dt = Math.min(120, ts - last); // a backgrounded tab must not skip the match
    last = ts;
    clock += dt / LIVE_MATCH_MS_PER_MIN;

    // Goals fire on the frame the clock passes their minute.
    while (eventIdx < film.events.length && clock >= film.events[eventIdx].minute) {
      const e = film.events[eventIdx++];
      score = { kor: e.kor, opp: e.opp };
      flash = {
        until: clock + LIVE_GOAL_FLASH_MIN, team: e.team, seedY: e.minute,
        text: e.team === 'kor' ? 'GOAL!' : `${state.opponent} GOAL`,
        sub: e.team === 'kor' ? `${e.minute}' ${e.scorer} · ${e.kor} : ${e.opp}` : `${e.minute}' 실점 · ${e.kor} : ${e.opp}`
      };
      updateScorebug(e.kor, e.opp, film.phaseLabel);
      try { if (e.team === 'kor') SFX.goal(); else SFX.whistle(); } catch (err) { /* audio is optional */ }
    }
    if (flash && clock >= flash.until) flash = null;

    while (cueIdx < cues.length && clock >= cues[cueIdx].minute) onCue(cues[cueIdx++].text);

    // Territory eases toward whoever is on the ball; a goal drags it to the line.
    const seg = currentSegment(clock);
    let target = seg.depth;
    const next = film.events[eventIdx];
    if (next && next.minute - clock < 1.2) target = next.team === 'kor' ? 0.93 : 0.07;
    if (flash) target = flash.team === 'kor' ? 0.96 : 0.04;
    territory += (target - territory) * Math.min(1, dt / 320);

    drawFrame(clock, territory, flash);
    if (timerEl) timerEl.textContent = `${Math.min(film.to, Math.floor(clock))}'`;

    if (clock >= film.to) { finish(); return; }
    liveMatchView.raf = requestAnimationFrame(step);
  };

  liveMatchView = { raf: 0, watchdog: 0, finish };
  // requestAnimationFrame stops in a backgrounded tab, so a timer guarantees
  // the half reaches full time even if no frame is ever painted. The score is
  // already settled either way; only the pixels are skipped.
  liveMatchView.watchdog = setTimeout(finish, (film.to - film.from) * LIVE_MATCH_MS_PER_MIN + 8000);
  if (skipBtn) skipBtn.style.display = '';
  if (timerEl) timerEl.textContent = `${film.from}'`; // never show the previous half's clock
  drawFrame(film.from, 0.5, null);
  liveMatchView.raf = requestAnimationFrame(step);
  return true;
}
