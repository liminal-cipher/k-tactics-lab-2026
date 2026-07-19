// ==========================================================================
// K-Tactics Lab 2026 - Fan Sentiment Comment Bank
// Pattern: offline generation + runtime conditioning.
//   - Generated once (offline) and hand-curated, tagged by match state.
//   - At runtime the client SELECTS by live state (data/fan_comments_2026.js
//     is a static asset, $0, works on file://). No per-comment LLM call.
//   - Regenerate/expand with scripts/gen_fan_comments.py (offline, optional).
//
// Shape: { text, type: 'normal'|'vip'|'hater', tags: [...] }
// Tags: general, pre, half, full,
//       sonBenched, nopassback, kangin, highPress, tenback,
//       attackMentality, lockMentality, fatigue, strongAttack, weakDefense
// Emotional anchor: the real 2026 WC RSA(남아공) exit, Son benched,
// Hong Myung-bo "tactical vacuum", the U-shape backpass problem.
// ==========================================================================

const FAN_COMMENTS_2026 = [
  // ---- General / setup ----
  { text: '드디어 감독이 바뀌니까 뭔가 해볼 맛 나네 ㅋㅋ', type: 'normal', tags: ['general', 'pre'] },
  { text: '이번엔 제발 남아공전 악몽 반복하지 말자 감독님...', type: 'normal', tags: ['general', 'pre'] },
  { text: '전술판 만지는 거 보니까 벌써 심장 두근거린다', type: 'vip', tags: ['general', 'pre'] },
  { text: '월드컵 조별탈락 그 굴욕, 이번엔 우리 손으로 갚자!', type: 'vip', tags: ['general', 'pre'] },
  { text: '어차피 또 백패스나 돌리다 끝나는 거 아님? ^^', type: 'hater', tags: ['general', 'pre'] },
  { text: '황금세대 꿀조 받고도 탈락한 거 아직도 화남 ㅡㅡ', type: 'hater', tags: ['general'] },
  { text: '감독 데스크에 앉으니까 책임감 장난 아니네', type: 'normal', tags: ['general'] },
  { text: '이 판을 국대 코치진이 봐야 함 진짜', type: 'vip', tags: ['general'] },

  // ---- Son Heung-min benched (THE controversy) ----
  { text: '손흥민을 왜 또 빼?! 남아공전 데자뷰냐고!!', type: 'hater', tags: ['sonBenched'] },
  { text: '캡틴 벤치에 앉히는 감독은 대체 무슨 배짱임...', type: 'hater', tags: ['sonBenched'] },
  { text: '손흥민 없는 공격 라인 상상만 해도 갑갑하다 ㅠ', type: 'normal', tags: ['sonBenched'] },
  { text: '그때도 손흥민 빼서 졌잖아. 역사 반복하지 마요', type: 'hater', tags: ['sonBenched'] },
  { text: '캡틴을 믿어야지! 다시 선발로 넣어주세요 감독님', type: 'vip', tags: ['sonBenched'] },

  // ---- nopassback (U-shape ban) ----
  { text: '오 U자 백패스 금지!! 이게 진짜 사이다 축구지 ㅋㅋㅋ', type: 'vip', tags: ['nopassback'] },
  { text: '드디어 답답한 후방 돌리기 안 하네 여론 폭발한다', type: 'vip', tags: ['nopassback'] },
  { text: '백패스 봉인 좋긴 한데 실수로 뺏기면 역습 조심', type: 'normal', tags: ['nopassback'] },

  // ---- kangin free role ----
  { text: '이강인 프리롤 미쳤다 킬패스 뿌려라!!', type: 'vip', tags: ['kangin'] },
  { text: '강인이한테 공 몰아주는 거 낭만 그 자체', type: 'normal', tags: ['kangin'] },

  // ---- high press ----
  { text: '전방 압박 화끈하네! 근데 후반 체력 걱정된다', type: 'normal', tags: ['highPress'] },
  { text: '게겐프레싱 가즈아!! 상대 빌드업 숨통을 조여라', type: 'vip', tags: ['highPress'] },

  // ---- tenback / lock (park the bus) ----
  { text: '텐백 치지 말자 제발... 똥볼 축구 지겹다', type: 'hater', tags: ['tenback', 'lockMentality'] },
  { text: '수비만 하다가 또 한 방 먹는 거 아니냐 불안하다', type: 'hater', tags: ['tenback', 'lockMentality'] },
  { text: '리드 지킬 땐 잠그는 것도 전략이지 인정', type: 'normal', tags: ['lockMentality'] },

  // ---- attack mentality (all-out) ----
  { text: '전원 닥공!! 이게 국민이 원하던 축구다 ㅠㅠ', type: 'vip', tags: ['attackMentality'] },
  { text: '올인 좋은데 뒷공간 뻥 뚫리면 어쩌려고 ㄷㄷ', type: 'hater', tags: ['attackMentality', 'weakDefense'] },

  // ---- fatigue (stamina drained) ----
  { text: '선수들 다리에 쥐났다 ㅠㅠ 빨리 교체 좀요!', type: 'normal', tags: ['fatigue', 'half'] },
  { text: '체력 방전인데 안 바꾸네 이러다 후반에 무너진다', type: 'hater', tags: ['fatigue'] },
  { text: '지친 다리로 무슨 압박이냐 벤치 카드 써야지', type: 'hater', tags: ['fatigue'] },

  // ---- strong attack ----
  { text: '공격력 지표 미쳤는데?? 이건 대량 득점 각이다', type: 'vip', tags: ['strongAttack'] },
  { text: '이 라인업 화력이면 스페인도 해볼 만하다!', type: 'vip', tags: ['strongAttack'] },

  // ---- weak defense ----
  { text: '수비 밸런스 이거 괜찮음? 측면 자동문 또 열린다', type: 'hater', tags: ['weakDefense'] },
  { text: '뒷문 부실한데 실점 각 보인다 감독님 조심!', type: 'hater', tags: ['weakDefense'] },

  // ---- half-time ----
  { text: '하프타임이다! 후반 승부수 뭐로 둘지 기대된다', type: 'normal', tags: ['half'] },
  { text: '전반 보니까 후반 교체 타이밍이 진짜 중요하겠다', type: 'vip', tags: ['half'] },

  // ---- full-time framing ----
  { text: '이게 우리가 봤어야 할 경기다... 감동이다 진짜', type: 'vip', tags: ['full'] },
  { text: '결과 나왔다! 이 정도면 그때보다 백배 낫다', type: 'normal', tags: ['full'] },
  { text: '내가 감독이었어도 이렇게 했다 ㅋㅋ 공감 100%', type: 'vip', tags: ['full', 'general'] }
];
