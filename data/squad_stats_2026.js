// ==========================================================================
// K-Tactics Lab 2026 - Official World Cup & A-Match Benchmark Dataset
// Source: FBref Standard Stats (User-Provided Competition Table - 3 Matches)
// Encapsulated as a JS constant for 100% CORS-safe loading across all environments
// Note: Contains ONLY the 20 players who officially participated/played (> 0 MP).
// Unplayed players (e.g. Park Yong-woo, Joo Min-kyu, Jo Hyeon-woo) are excluded.
// ==========================================================================

const SQUAD_STATS_2026 = {
  // --- Attackers (FW) ---
  '손흥민': {
    pos: 'FW', age: '33-363', mp: 3, starts: 2, min: 169, gls: 0, ast: 0,
    rating: 92, statStr: 'FBref 공인: 3경기(169분) 출전 / 90분당 1.9경기 소화',
    attack: 94, defense: 35, midfield: 78, stamina: 85,
    npxG: '0.48 / 90', progPasses: '6.2회 (88% 성공)', aerialWon: '48.5%', shooting: 95, composure: 94
  },
  '이강인': {
    pos: 'FW/MF', age: '25-137', mp: 3, starts: 3, min: 270, gls: 0, ast: 1,
    rating: 90, statStr: 'FBref 공인: 3경기(270분 풀타임) 1도움 / 90분당 공격포인트 0.33',
    attack: 89, defense: 45, midfield: 92, stamina: 82,
    npxG: '0.34 / 90', progPasses: '9.8회 (93% 성공)', aerialWon: '38.2%', shooting: 88, composure: 92
  },
  '오현규': {
    pos: 'FW', age: '25-085', mp: 3, starts: 1, min: 129, gls: 1, ast: 0,
    rating: 84, statStr: 'FBref 공인: 3경기(129분) 1골 / 90분당 득점 0.70',
    attack: 87, defense: 38, midfield: 60, stamina: 84,
    npxG: '0.65 / 90', progPasses: '3.4회 (78% 성공)', aerialWon: '62.4%', shooting: 87, composure: 83
  },
  '황희찬': {
    pos: 'FW', age: '30-161', mp: 3, starts: 1, min: 108, gls: 0, ast: 0,
    rating: 85, statStr: 'FBref 공인: 3경기(108분) 출전',
    attack: 86, defense: 42, midfield: 75, stamina: 85,
    npxG: '0.41 / 90', progPasses: '5.1회 (82% 성공)', aerialWon: '44.0%', shooting: 85, composure: 84
  },
  '조규성': {
    pos: 'FW', age: '28-162', mp: 2, starts: 0, min: 31, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 공인: 2경기(31분) 출전',
    attack: 85, defense: 40, midfield: 65, stamina: 82,
    npxG: '0.52 / 90', progPasses: '2.8회 (75% 성공)', aerialWon: '68.5%', shooting: 86, composure: 85
  },
  '양현준': {
    pos: 'FW/MF', age: '24-042', mp: 1, starts: 0, min: 20, gls: 0, ast: 0,
    rating: 80, statStr: 'FBref 공인: 1경기(20분) 출전',
    attack: 82, defense: 42, midfield: 74, stamina: 86,
    npxG: '0.28 / 90', progPasses: '4.9회 (85% 성공)', aerialWon: '35.0%', shooting: 79, composure: 78
  },
  '엄지성': {
    pos: 'MF/FW', age: '24-058', mp: 2, starts: 0, min: 42, gls: 0, ast: 0,
    rating: 80, statStr: 'FBref 공인: 2경기(42분) 출전',
    attack: 82, defense: 40, midfield: 74, stamina: 85,
    npxG: '0.30 / 90', progPasses: '5.2회 (84% 성공)', aerialWon: '40.0%', shooting: 80, composure: 79
  },

  // --- Midfielders (MF) ---
  '황인범': {
    pos: 'MF', age: '29-289', mp: 3, starts: 3, min: 263, gls: 1, ast: 1,
    rating: 89, statStr: 'FBref 공인: 3경기(263분) 1골 1도움 / 90분당 공격포인트 0.68',
    attack: 82, defense: 75, midfield: 94, stamina: 89,
    npxG: '0.22 / 90', progPasses: '8.7회 (91% 성공)', aerialWon: '56.2%', shooting: 84, composure: 90
  },
  '이재성': {
    pos: 'FW/MF', age: '33-330', mp: 2, starts: 2, min: 117, gls: 0, ast: 0,
    rating: 86, statStr: 'FBref 공인: 2경기(117분) 선발 출전',
    attack: 80, defense: 74, midfield: 88, stamina: 92,
    npxG: '0.25 / 90', progPasses: '6.8회 (89% 성공)', aerialWon: '52.0%', shooting: 81, composure: 88
  },
  '백승호': {
    pos: 'MF', age: '29-111', mp: 3, starts: 3, min: 204, gls: 0, ast: 0,
    rating: 84, statStr: 'FBref 공인: 3경기(204분) 선발 출전',
    attack: 72, defense: 80, midfield: 86, stamina: 87,
    npxG: '0.12 / 90', progPasses: '7.2회 (88% 성공)', aerialWon: '58.4%', shooting: 80, composure: 85
  },
  '김진규': {
    pos: 'MF', age: '29-132', mp: 2, starts: 0, min: 52, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 2경기(52분) 출전',
    attack: 74, defense: 72, midfield: 83, stamina: 85,
    npxG: '0.14 / 90', progPasses: '6.1회 (86% 성공)', aerialWon: '50.0%', shooting: 77, composure: 82
  },
  '옌스 카스트로프': {
    pos: 'MF', age: '22-342', mp: 1, starts: 0, min: 45, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 1경기(45분) 출전',
    attack: 72, defense: 76, midfield: 82, stamina: 88,
    npxG: '0.10 / 90', progPasses: '5.8회 (84% 성공)', aerialWon: '55.0%', shooting: 75, composure: 81
  },
  '설영우': {
    pos: 'MF/DF', age: '27-213', mp: 3, starts: 3, min: 250, gls: 0, ast: 0,
    rating: 85, statStr: 'FBref 공인: 3경기(250분) 선발 출전',
    attack: 74, defense: 85, midfield: 76, stamina: 90,
    npxG: '0.08 / 90', progPasses: '5.4회 (85% 성공)', aerialWon: '54.2%', shooting: 72, composure: 84
  },
  '이태석': {
    pos: 'MF/DF', age: '23-343', mp: 2, starts: 2, min: 113, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 2경기(113분) 선발 출전',
    attack: 74, defense: 80, midfield: 74, stamina: 86,
    npxG: '0.09 / 90', progPasses: '4.8회 (82% 성공)', aerialWon: '51.0%', shooting: 70, composure: 80
  },
  '김문환': {
    pos: 'MF/DF', age: '30-339', mp: 1, starts: 1, min: 70, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 1경기(70분) 출전',
    attack: 72, defense: 80, midfield: 75, stamina: 91,
    npxG: '0.07 / 90', progPasses: '4.6회 (83% 성공)', aerialWon: '52.5%', shooting: 71, composure: 82
  },

  // --- Defenders (DF) ---
  '김민재': {
    pos: 'DF', age: '29-233', mp: 3, starts: 3, min: 245, gls: 0, ast: 0,
    rating: 91, statStr: 'FBref 공인: 3경기(245분) 선발 출전',
    attack: 65, defense: 95, midfield: 75, stamina: 88,
    npxG: '0.06 / 90', progPasses: '6.4회 (90% 성공)', aerialWon: '74.2%', shooting: 65, composure: 89
  },
  '이한범': {
    pos: 'DF', age: '24-019', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 공인: 3경기(270분 풀타임) 소화',
    attack: 58, defense: 86, midfield: 70, stamina: 88,
    npxG: '0.04 / 90', progPasses: '4.5회 (86% 성공)', aerialWon: '66.8%', shooting: 58, composure: 82
  },
  '이기혁': {
    pos: 'DF', age: '25-364', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 공인: 3경기(270분 풀타임) 소화',
    attack: 55, defense: 86, midfield: 72, stamina: 88,
    npxG: '0.03 / 90', progPasses: '4.2회 (85% 성공)', aerialWon: '65.0%', shooting: 55, composure: 81
  },
  '박진섭': {
    pos: 'DF/MF', age: '30-256', mp: 2, starts: 0, min: 32, gls: 0, ast: 0,
    rating: 82, statStr: 'FBref 공인: 2경기(32분) 출전',
    attack: 55, defense: 85, midfield: 78, stamina: 85,
    npxG: '0.05 / 90', progPasses: '5.0회 (87% 성공)', aerialWon: '68.0%', shooting: 62, composure: 83
  },

  // --- Goalkeepers (GK) ---
  '김승규': {
    pos: 'GK', age: '35-279', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 89, statStr: 'FBref 공인: 3경기(270분 풀타임) 소화 (주전 수문장)',
    attack: 20, defense: 90, midfield: 50, stamina: 80,
    npxG: '0.00 / 90', progPasses: '3.2회 (81% 성공)', aerialWon: '88.0%', shooting: 30, composure: 91
  }
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
