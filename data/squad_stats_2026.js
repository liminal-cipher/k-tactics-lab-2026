// ==========================================================================
// K-Tactics Lab 2026 - World Cup Benchmark Dataset (FBref-based, curated)
// Source: FBref Korea Republic — World Cup 2026 (Standard/Shooting/Misc)
// Formula: 4-dimensional rating derived from per-90 stats (scripts/parse_stats.py)
// Last Updated: 2026-07-14 (KST)
// Note: Contains ONLY the 20 players who officially participated (> 0 MP).
// ==========================================================================

const SQUAD_STATS_2026 = {
  // --- Attackers (FW) ---
  '손흥민': {
    pos: 'FW', age: '34-005', mp: 3, starts: 2, min: 169, gls: 0, ast: 0,
    rating: 92, statStr: 'FBref 기반: 3경기(169분) 출전 / Sh/90 3.73',
    attack: 83, defense: 38, midfield: 62, stamina: 82,
    shooting: 95, composure: 94
  },
  '이강인': {
    pos: 'FW/MF', age: '25-144', mp: 3, starts: 3, min: 270, gls: 0, ast: 1,
    rating: 90, statStr: 'FBref 기반: 3경기(270분 풀타임) 1도움 / Crs 19',
    attack: 75, defense: 43, midfield: 86, stamina: 87,
    shooting: 88, composure: 92
  },
  '오현규': {
    pos: 'FW', age: '25-092', mp: 3, starts: 1, min: 129, gls: 1, ast: 0,
    rating: 84, statStr: 'FBref 기반: 3경기(129분) 1골 / Sh/90 2.79',
    attack: 86, defense: 36, midfield: 58, stamina: 86,
    shooting: 87, composure: 83
  },
  '황희찬': {
    pos: 'FW', age: '30-168', mp: 3, starts: 1, min: 108, gls: 0, ast: 0,
    rating: 85, statStr: 'FBref 기반: 3경기(108분) 출전 / Sh/90 0.83',
    attack: 73, defense: 39, midfield: 55, stamina: 84,
    shooting: 85, composure: 84
  },
  '조규성': {
    pos: 'FW', age: '28-169', mp: 2, starts: 0, min: 31, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 기반: 2경기(31분) 출전 (소표본)',
    attack: 74, defense: 36, midfield: 53, stamina: 85,
    shooting: 86, composure: 85
  },
  '양현준': {
    pos: 'FW/MF', age: '24-049', mp: 1, starts: 0, min: 20, gls: 0, ast: 0,
    rating: 80, statStr: 'FBref 기반: 1경기(20분) 출전 (소표본)',
    attack: 69, defense: 45, midfield: 65, stamina: 87,
    shooting: 79, composure: 78
  },
  '엄지성': {
    pos: 'MF/FW', age: '24-065', mp: 2, starts: 0, min: 42, gls: 0, ast: 0,
    rating: 80, statStr: 'FBref 기반: 2경기(42분) 출전 / TklW 2',
    attack: 67, defense: 46, midfield: 69, stamina: 87,
    shooting: 80, composure: 79
  },
  '이재성': {
    pos: 'FW/MF', age: '33-337', mp: 2, starts: 2, min: 117, gls: 0, ast: 0,
    rating: 86, statStr: 'FBref 기반: 2경기(117분) 선발 / TklW 3, Fld 4',
    attack: 72, defense: 57, midfield: 69, stamina: 83,
    shooting: 81, composure: 88
  },
  // --- Midfielders (MF) ---
  '황인범': {
    pos: 'MF', age: '29-296', mp: 3, starts: 3, min: 263, gls: 1, ast: 1,
    rating: 89, statStr: 'FBref 기반: 3경기(263분) 1골 1도움 / Int/90 1.38',
    attack: 71, defense: 63, midfield: 82, stamina: 88,
    shooting: 84, composure: 90
  },
  '백승호': {
    pos: 'MF', age: '29-118', mp: 3, starts: 3, min: 204, gls: 0, ast: 0,
    rating: 84, statStr: 'FBref 기반: 3경기(204분) 선발 / 슈팅 0회',
    attack: 57, defense: 55, midfield: 76, stamina: 88,
    shooting: 80, composure: 85
  },
  '김진규': {
    pos: 'MF', age: '29-139', mp: 2, starts: 0, min: 52, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 기반: 2경기(52분) 출전 / Sh/90 1.73',
    attack: 58, defense: 56, midfield: 76, stamina: 88,
    shooting: 77, composure: 82
  },
  '옌스 카스트로프': {
    pos: 'MF', age: '22-349', mp: 1, starts: 0, min: 45, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 기반: 1경기(45분) 출전 / Crs 3',
    attack: 57, defense: 52, midfield: 76, stamina: 90,
    shooting: 75, composure: 81
  },
  '설영우': {
    pos: 'MF/DF', age: '27-220', mp: 3, starts: 3, min: 250, gls: 0, ast: 0,
    rating: 85, statStr: 'FBref 기반: 3경기(250분) 선발 / Crs 9',
    attack: 60, defense: 67, midfield: 77, stamina: 88,
    shooting: 72, composure: 84
  },
  '이태석': {
    pos: 'MF/DF', age: '23-350', mp: 2, starts: 2, min: 113, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 기반: 2경기(113분) 선발 / TklW 3, Crs 8',
    attack: 58, defense: 72, midfield: 74, stamina: 89,
    shooting: 70, composure: 80
  },
  '김문환': {
    pos: 'MF/DF', age: '30-346', mp: 1, starts: 1, min: 70, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 기반: 1경기(70분) 출전 / Int 1, TklW 1',
    attack: 58, defense: 71, midfield: 65, stamina: 86,
    shooting: 71, composure: 82
  },
  // --- Defenders (DF) ---
  '김민재': {
    pos: 'DF', age: '29-240', mp: 3, starts: 3, min: 245, gls: 0, ast: 0,
    rating: 91, statStr: 'FBref 기반: 3경기(245분) 선발 / Int 2, TklW 2 [수동 보정]',
    attack: 42, defense: 90, midfield: 51, stamina: 87,
    shooting: 65, composure: 89
  },
  '이한범': {
    pos: 'DF', age: '24-026', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 기반: 3경기(270분 풀타임) / Int 3, TklW 2',
    attack: 42, defense: 81, midfield: 54, stamina: 88,
    shooting: 58, composure: 82
  },
  '이기혁': {
    pos: 'DF', age: '26-006', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 기반: 3경기(270분 풀타임) / Int 5, TklW 4 (팀내 최고)',
    attack: 40, defense: 88, midfield: 53, stamina: 88,
    shooting: 55, composure: 81
  },
  '박진섭': {
    pos: 'DF/MF', age: '30-263', mp: 2, starts: 0, min: 32, gls: 0, ast: 0,
    rating: 82, statStr: 'FBref 기반: 2경기(32분) 출전 / SoT 1 (소표본)',
    attack: 53, defense: 66, midfield: 63, stamina: 86,
    shooting: 62, composure: 83
  },
  // --- Goalkeepers (GK) ---
  '김승규': {
    pos: 'GK', age: '35-286', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 89, statStr: 'FBref 기반: 3경기(270분 풀타임) / GA 3, Save% 75.0%',
    attack: 30, defense: 84, midfield: 40, stamina: 80,
    shooting: 30, composure: 91
  },
};

const OPPONENT_PROFILES = {
  'MEX': {
    name: '🇲🇽 멕시코 (북중미 강호)',
    style: '측면 공격이 거세고 수비 뒷공간이 넓은 다이내믹 돌격형 팀',
    briefing: '💡 카운터 전략: 상대 양측면이 올라올 때 발생하는 넓은 뒷공간을 하프스페이스 침투와 다이렉트 롱볼 템포로 타격하세요!',
    weights: { tempo: 'direct', attackRoute: 'halfspace', press: 'region', mentality: 'attack' }
  },
  'ESP': {
    name: '🇪🇸 스페인 (유럽 무적함대)',
    style: '90분 내내 점유율을 지배하며 하프스페이스 티키타카로 압박하는 강호',
    briefing: '💡 카운터 전략: 중원을 함부로 열지 말고 지역 방어와 인버티드 풀백으로 공간을 좁힌 뒤, 고속 다이렉트 역습을 노리세요!',
    weights: { tempo: 'direct', attackRoute: 'nopassback', press: 'region', mentality: 'balance' }
  },
  'RSA': {
    name: '🇿🇦 남아공 (아프리카 복병)',
    style: '뛰어난 피지컬과 탄력적인 롱볼 다이렉트 카운터 역습을 주무기로 하는 난적',
    briefing: '💡 카운터 전략: 상대 피지컬 경합을 이겨내기 위해 중원 점유율(표준/지공 템포)을 쥐고 세밀한 빌드업으로 흔드세요!',
    weights: { tempo: 'build', attackRoute: 'kangin', press: 'high', mentality: 'balance' }
  }
};

const ML_TACTICAL_WEIGHTS = {
  tempo: { 'build': { posBonus: 4, staminaCost: 3 }, 'standard': { posBonus: 2, staminaCost: 5 }, 'direct': { posBonus: 6, staminaCost: 7 } },
  press: { 'tenback': { defBonus: 7, staminaCost: 2 }, 'region': { defBonus: 4, staminaCost: 5 }, 'high': { defBonus: 6, staminaCost: 9 } },
  mentality: { 'lock': { defBonus: 8, attBonus: -4 }, 'balance': { defBonus: 3, attBonus: 3 }, 'attack': { defBonus: -5, attBonus: 9 } }
};
