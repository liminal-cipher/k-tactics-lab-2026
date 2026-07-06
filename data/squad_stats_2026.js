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
    attack: 94, defense: 35, midfield: 78, stamina: 85
  },
  '이강인': {
    pos: 'FW/MF', age: '25-137', mp: 3, starts: 3, min: 270, gls: 0, ast: 1,
    rating: 90, statStr: 'FBref 공인: 3경기(270분 풀타임) 1도움 / 90분당 공격포인트 0.33',
    attack: 89, defense: 45, midfield: 92, stamina: 82
  },
  '오현규': {
    pos: 'FW', age: '25-085', mp: 3, starts: 1, min: 129, gls: 1, ast: 0,
    rating: 84, statStr: 'FBref 공인: 3경기(129분) 1골 / 90분당 득점 0.70',
    attack: 87, defense: 38, midfield: 60, stamina: 84
  },
  '황희찬': {
    pos: 'FW', age: '30-161', mp: 3, starts: 1, min: 108, gls: 0, ast: 0,
    rating: 85, statStr: 'FBref 공인: 3경기(108분) 출전',
    attack: 86, defense: 42, midfield: 75, stamina: 85
  },
  '조규성': {
    pos: 'FW', age: '28-162', mp: 2, starts: 0, min: 31, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 공인: 2경기(31분) 출전',
    attack: 85, defense: 40, midfield: 65, stamina: 82
  },
  '양현준': {
    pos: 'FW/MF', age: '24-042', mp: 1, starts: 0, min: 20, gls: 0, ast: 0,
    rating: 80, statStr: 'FBref 공인: 1경기(20분) 출전',
    attack: 82, defense: 42, midfield: 74, stamina: 86
  },
  '엄지성': {
    pos: 'MF/FW', age: '24-058', mp: 2, starts: 0, min: 42, gls: 0, ast: 0,
    rating: 80, statStr: 'FBref 공인: 2경기(42분) 출전',
    attack: 82, defense: 40, midfield: 74, stamina: 85
  },

  // --- Midfielders (MF) ---
  '황인범': {
    pos: 'MF', age: '29-289', mp: 3, starts: 3, min: 263, gls: 1, ast: 1,
    rating: 89, statStr: 'FBref 공인: 3경기(263분) 1골 1도움 / 90분당 공격포인트 0.68',
    attack: 82, defense: 75, midfield: 94, stamina: 89
  },
  '이재성': {
    pos: 'FW/MF', age: '33-330', mp: 2, starts: 2, min: 117, gls: 0, ast: 0,
    rating: 86, statStr: 'FBref 공인: 2경기(117분) 선발 출전',
    attack: 80, defense: 74, midfield: 88, stamina: 92
  },
  '백승호': {
    pos: 'MF', age: '29-111', mp: 3, starts: 3, min: 204, gls: 0, ast: 0,
    rating: 84, statStr: 'FBref 공인: 3경기(204분) 선발 출전',
    attack: 72, defense: 80, midfield: 86, stamina: 87
  },
  '김진규': {
    pos: 'MF', age: '29-132', mp: 2, starts: 0, min: 52, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 2경기(52분) 출전',
    attack: 74, defense: 72, midfield: 83, stamina: 85
  },
  '예נס 카스트로프': {
    pos: 'MF', age: '22-342', mp: 1, starts: 0, min: 45, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 1경기(45분) 출전',
    attack: 72, defense: 76, midfield: 82, stamina: 88
  },
  '설영우': {
    pos: 'MF/DF', age: '27-213', mp: 3, starts: 3, min: 250, gls: 0, ast: 0,
    rating: 85, statStr: 'FBref 공인: 3경기(250분) 선발 출전',
    attack: 74, defense: 85, midfield: 76, stamina: 90
  },
  '이태석': {
    pos: 'MF/DF', age: '23-343', mp: 2, starts: 2, min: 113, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 2경기(113분) 선발 출전',
    attack: 74, defense: 80, midfield: 74, stamina: 86
  },
  '김문환': {
    pos: 'MF/DF', age: '30-339', mp: 1, starts: 1, min: 70, gls: 0, ast: 0,
    rating: 81, statStr: 'FBref 공인: 1경기(70분) 출전',
    attack: 72, defense: 80, midfield: 75, stamina: 91
  },

  // --- Defenders (DF) ---
  '김민재': {
    pos: 'DF', age: '29-233', mp: 3, starts: 3, min: 245, gls: 0, ast: 0,
    rating: 91, statStr: 'FBref 공인: 3경기(245분) 선발 출전',
    attack: 65, defense: 95, midfield: 75, stamina: 88
  },
  '이한범': {
    pos: 'DF', age: '24-019', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 공인: 3경기(270분 풀타임) 소화',
    attack: 58, defense: 86, midfield: 70, stamina: 88
  },
  '이기혁': {
    pos: 'DF', age: '25-364', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 83, statStr: 'FBref 공인: 3경기(270분 풀타임) 소화',
    attack: 55, defense: 86, midfield: 72, stamina: 88
  },
  '박진섭': {
    pos: 'DF/MF', age: '30-256', mp: 2, starts: 0, min: 32, gls: 0, ast: 0,
    rating: 82, statStr: 'FBref 공인: 2경기(32분) 출전',
    attack: 55, defense: 85, midfield: 78, stamina: 85
  },

  // --- Goalkeepers (GK) ---
  '김승규': {
    pos: 'GK', age: '35-279', mp: 3, starts: 3, min: 270, gls: 0, ast: 0,
    rating: 89, statStr: 'FBref 공인: 3경기(270분 풀타임) 소화 (주전 수문장)',
    attack: 20, defense: 90, midfield: 50, stamina: 80
  }
};
