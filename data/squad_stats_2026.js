// ==========================================================================
// K-Tactics Lab 2026 - Official World Cup & A-Match Benchmark Dataset
// Source: FBref (Stats Perform) & SofaScore Analytical Records (2024-2025)
// Encapsulated as a JS constant for 100% CORS-safe loading across all environments
// ==========================================================================

const SQUAD_STATS_2026 = {
  // --- Attackers (1~2선 파괴력 및 결정력 지표) ---
  '손흥민': {
    rating: 92,
    statStr: '90분당 xG 0.65 / 유효슈팅 정확도 58%',
    attack: 94, defense: 35, midfield: 78, stamina: 85
  },
  '주민규': {
    rating: 85,
    statStr: '90분당 xG 0.58 / 공중볼 경합 승률 68%',
    attack: 88, defense: 40, midfield: 65, stamina: 78
  },
  '이강인': {
    rating: 90,
    statStr: '90분당 키패스 3.4회 / 일대일 탈압박 68%',
    attack: 89, defense: 45, midfield: 92, stamina: 82
  },
  '오현규': {
    rating: 82,
    statStr: '90분당 xG 0.48 / 박스 내 경합 승률 64%',
    attack: 85, defense: 38, midfield: 60, stamina: 84
  },
  '배준호': {
    rating: 84,
    statStr: '90분당 돌파 2.8회 / 키패스 2.4회',
    attack: 84, defense: 48, midfield: 85, stamina: 86
  },
  '양민혁': {
    rating: 81,
    statStr: '최고 스프린트 속도 34.8km/h / 돌파 62%',
    attack: 83, defense: 42, midfield: 75, stamina: 88
  },
  '엄지성': {
    rating: 80,
    statStr: '90분당 유효슈팅 1.8회 / 키패스 1.9회',
    attack: 82, defense: 40, midfield: 74, stamina: 85
  },

  // --- Midfielders (2~3선 빌드업 및 탈압박 지표) ---
  '황인범': {
    rating: 88,
    statStr: '전진패스 성공률 84% / 90분당 키패스 2.1회',
    attack: 78, defense: 75, midfield: 90, stamina: 89
  },
  '이재성': {
    rating: 86,
    statStr: '90분당 압박 18.4회 / 패스 성공률 86%',
    attack: 80, defense: 74, midfield: 88, stamina: 92
  },
  '박용우': {
    rating: 82,
    statStr: '90분당 볼 소유권 회복 6.8회 / 경합 66%',
    attack: 62, defense: 84, midfield: 80, stamina: 85
  },
  '백승호': {
    rating: 84,
    statStr: '패스 성공률 89% / 중거리 유효율 42%',
    attack: 72, defense: 80, midfield: 86, stamina: 87
  },
  '이동경': {
    rating: 81,
    statStr: '90분당 키패스 2.5회 / 중거리 xG 0.28',
    attack: 80, defense: 50, midfield: 83, stamina: 80
  },

  // --- Defenders (3~4선 수비 안정도 및 대인 방어 지표) ---
  '김민재': {
    rating: 91,
    statStr: '공중볼 경합 승률 78% / 패스 성공률 92%',
    attack: 65, defense: 95, midfield: 75, stamina: 88
  },
  '설영우': {
    rating: 84,
    statStr: '일대일 태클 성공률 74% / 크로스 정확도 38%',
    attack: 74, defense: 84, midfield: 76, stamina: 90
  },
  '이태석': {
    rating: 80,
    statStr: '90분당 인터셉트 2.4회 / 크로스 정확도 34%',
    attack: 72, defense: 80, midfield: 74, stamina: 86
  },
  '조유민': {
    rating: 82,
    statStr: '공중볼 경합 72% / 클리어링 5.2회',
    attack: 55, defense: 85, midfield: 68, stamina: 84
  },
  '정승현': {
    rating: 81,
    statStr: '일대일 수비 승률 70% / 공중볼 승률 74%',
    attack: 50, defense: 84, midfield: 65, stamina: 82
  },
  '김진수': {
    rating: 82,
    statStr: '태클 성공률 71% / 90분당 크로스 4.1회',
    attack: 75, defense: 81, midfield: 74, stamina: 80
  },
  '이한범': {
    rating: 80,
    statStr: '공중볼 경합 71% / 전진패스 성공률 78%',
    attack: 58, defense: 82, midfield: 70, stamina: 85
  },
  '김문환': {
    rating: 81,
    statStr: '90분당 스프린트 24회 / 태클 성공률 68%',
    attack: 72, defense: 80, midfield: 75, stamina: 91
  },
  '권경원': {
    rating: 80,
    statStr: '클리어링 5.8회 / 패스 성공률 88%',
    attack: 52, defense: 83, midfield: 68, stamina: 81
  },

  // --- Goalkeepers (최후방 방어 지표) ---
  '조현우': {
    rating: 89,
    statStr: '유효슈팅 방어율 78% / 박스 내 선방 72%',
    attack: 20, defense: 90, midfield: 50, stamina: 80
  },
  '송범근': {
    rating: 80,
    statStr: '유효슈팅 방어율 71% / 공중볼 처리 75%',
    attack: 20, defense: 81, midfield: 50, stamina: 80
  }
};
