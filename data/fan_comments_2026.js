// ==========================================================================
// K-Tactics Lab 2026 - Fan Sentiment Comment Bank
// Pattern: offline generation + runtime conditioning.
//   - Generated once (offline) and hand-curated, tagged by match state.
//   - At runtime the client SELECTS by live state (data/fan_comments_2026.js
//     is a static asset, $0, works on file://). No per-comment LLM call.
//   - The client also skips anything shown in the last few picks, so the
//     stream never repeats back-to-back (see pickFanComment in app.js).
//   - Regenerate/expand with scripts/gen_fan_comments.py (offline, optional).
//
// Shape: { text, type: 'normal'|'vip'|'hater', tags: [...] }
// Tags: general, pre, half, full,
//       sonBenched, nopassback, halfspace, kangin, directTempo, buildTempo,
//       highPress, tenback, attackMentality, lockMentality,
//       fatigue, strongAttack, weakDefense
// Emotional anchor: the real 2026 WC RSA(남아공) exit, Son benched,
// Hong Myung-bo "tactical vacuum", the U-shape backpass problem.
// ==========================================================================

const FAN_COMMENTS_2026 = [
  // ---- General / setup (pre-match) ----
  { text: '드디어 감독이 바뀌니까 뭔가 해볼 맛 나네 ㅋㅋ', type: 'normal', tags: ['general', 'pre'] },
  { text: '이번엔 제발 남아공전 악몽 반복하지 말자 감독님...', type: 'normal', tags: ['general', 'pre'] },
  { text: '전술판 만지는 거 보니까 벌써 심장 두근거린다', type: 'vip', tags: ['general', 'pre'] },
  { text: '월드컵 조별탈락 그 굴욕, 이번엔 우리 손으로 갚자!', type: 'vip', tags: ['general', 'pre'] },
  { text: '어차피 또 백패스나 돌리다 끝나는 거 아님? ^^', type: 'hater', tags: ['general', 'pre'] },
  { text: '킥오프 전부터 라인업 보는 재미가 쏠쏠하네', type: 'normal', tags: ['general', 'pre'] },
  { text: '오늘은 다르다 오늘은 다르다 되뇌는 중...', type: 'normal', tags: ['general', 'pre'] },
  { text: '감독 데뷔전이다 실력 좀 보자 어디', type: 'hater', tags: ['general', 'pre'] },
  { text: '경기 전 셋업부터 클래스가 보인다 이거지', type: 'vip', tags: ['general', 'pre'] },
  { text: '두근두근 이번 판은 뭔가 될 것 같은 느낌', type: 'normal', tags: ['general', 'pre'] },
  { text: '제발 이번엔 준비된 전술 좀 보여줘요', type: 'normal', tags: ['general', 'pre'] },
  { text: '기대 반 걱정 반인데 일단 믿어본다', type: 'normal', tags: ['general', 'pre'] },

  // ---- General (any time) ----
  { text: '황금세대 꿀조 받고도 탈락한 거 아직도 화남 ㅡㅡ', type: 'hater', tags: ['general'] },
  { text: '감독 데스크에 앉으니까 책임감 장난 아니네', type: 'normal', tags: ['general'] },
  { text: '이 판을 국대 코치진이 봐야 함 진짜', type: 'vip', tags: ['general'] },
  { text: '전술 하나 바꿀 때마다 여론이 출렁이네 ㅋㅋ', type: 'normal', tags: ['general'] },
  { text: '축구는 감독놀음이라는 말 실감난다', type: 'vip', tags: ['general'] },
  { text: '이러니저러니 해도 결국 결과로 말하는 거지', type: 'hater', tags: ['general'] },
  { text: '디테일 하나하나가 승부를 가른다니까', type: 'normal', tags: ['general'] },
  { text: '감독님 화이팅 이번엔 진짜 믿는다', type: 'vip', tags: ['general'] },

  // ---- Son Heung-min benched (THE controversy) ----
  { text: '손흥민을 왜 또 빼?! 남아공전 데자뷰냐고!!', type: 'hater', tags: ['sonBenched'] },
  { text: '캡틴 벤치에 앉히는 감독은 대체 무슨 배짱임...', type: 'hater', tags: ['sonBenched'] },
  { text: '손흥민 없는 공격 라인 상상만 해도 갑갑하다 ㅠ', type: 'normal', tags: ['sonBenched'] },
  { text: '그때도 손흥민 빼서 졌잖아. 역사 반복하지 마요', type: 'hater', tags: ['sonBenched'] },
  { text: '캡틴을 믿어야지! 다시 선발로 넣어주세요 감독님', type: 'vip', tags: ['sonBenched'] },
  { text: '손흥민 벤치는 국민정서법 위반입니다 진짜', type: 'hater', tags: ['sonBenched'] },
  { text: '아니 세계적인 공격수를 왜 앉혀두냐고 ㅠㅠ', type: 'normal', tags: ['sonBenched'] },
  { text: '이 조합에 쏘니 없으면 누가 골 넣냐', type: 'hater', tags: ['sonBenched'] },
  { text: '손흥민 빠진 순간 지지율 바닥 뚫는 소리 들림', type: 'hater', tags: ['sonBenched'] },

  // ---- nopassback (U-shape ban) ----
  { text: 'U자 백패스 금지!! 이게 진짜 사이다 축구지 ㅋㅋㅋ', type: 'vip', tags: ['nopassback'] },
  { text: '드디어 답답한 후방 돌리기 안 하네 여론 폭발한다', type: 'vip', tags: ['nopassback'] },
  { text: '백패스 봉인 좋긴 한데 실수로 뺏기면 역습 조심', type: 'normal', tags: ['nopassback'] },
  { text: '전진 패스 딱딱 꽂히니까 보는 맛이 다르다', type: 'vip', tags: ['nopassback'] },
  { text: '이제 좀 앞으로 가는 축구 하네 십년 묵은 체증이 ㅋㅋ', type: 'normal', tags: ['nopassback'] },
  { text: '백패스 금지령 지지합니다 이게 국대 축구지', type: 'vip', tags: ['nopassback'] },
  { text: '센터백이 공 잡으면 바로 전방으로! 시원하다', type: 'normal', tags: ['nopassback'] },
  { text: '무의미한 U자 돌리기 안 보니까 살 것 같다', type: 'vip', tags: ['nopassback'] },

  // ---- halfspace (channel infiltration) ----
  { text: '하프스페이스 파고드니까 골 냄새가 스멀스멀 난다', type: 'vip', tags: ['halfspace'] },
  { text: '풀백 센터백 사이 그 틈 공략 아주 영리하네', type: 'normal', tags: ['halfspace'] },
  { text: '측면만 돌던 공이 위험지역으로 들어간다 굿', type: 'vip', tags: ['halfspace'] },
  { text: '하프스페이스 침투 교과서 축구네 감독 공부 좀 했다', type: 'normal', tags: ['halfspace'] },
  { text: '이 각도로 찔러주는 거 상대 수비 미치겠지 ㅋㅋ', type: 'normal', tags: ['halfspace'] },
  { text: '반공간 활용 좋다 근데 마무리가 관건이다', type: 'normal', tags: ['halfspace'] },

  // ---- kangin free role (star reliance = 해줘축구 tension) ----
  { text: '이강인 프리롤 미쳤다 킬패스 뿌려라!!', type: 'vip', tags: ['kangin'] },
  { text: '강인이한테 공 몰아주는 거 낭만 그 자체', type: 'normal', tags: ['kangin'] },
  { text: '또 해줘축구냐... 한 명한테 의존하다 막히면 끝인데', type: 'hater', tags: ['kangin'] },
  { text: '강인이 좋긴 한데 상대가 이강인만 막으면 어쩔', type: 'hater', tags: ['kangin'] },
  { text: '개인 기량 의존은 딱 남아공전에서 데인 건데 불안', type: 'hater', tags: ['kangin'] },
  { text: '프리롤 로망은 이해하지만 팀 전술이 먼저 아님?', type: 'normal', tags: ['kangin'] },

  // ---- direct tempo (fast counter) ----
  { text: '다이렉트 역습 속도 봐라 상대 뒷공간 다 털린다', type: 'vip', tags: ['directTempo'] },
  { text: '빠르게 찔러 넣는 거 화끈하네 근데 체력은?', type: 'normal', tags: ['directTempo'] },
  { text: '수직 축구 좋다 답답한 거 못 참는 국민 취향 저격', type: 'vip', tags: ['directTempo'] },
  { text: '역습 한 방 축구 짜릿하긴 한데 점유율은 포기?', type: 'normal', tags: ['directTempo'] },

  // ---- build-up tempo (slow possession) ----
  { text: '지공 빌드업... 또 느릿느릿 돌리다 끝나는 거 아녀', type: 'hater', tags: ['buildTempo'] },
  { text: '점유율 축구도 좋은데 너무 느리면 지루하다', type: 'normal', tags: ['buildTempo'] },
  { text: '차근차근 쌓는 거 이해하는데 답답한 건 어쩔 수 없다', type: 'hater', tags: ['buildTempo'] },
  { text: '공은 우리가 다 갖고 있는데 왜 골이 안 나냐', type: 'hater', tags: ['buildTempo'] },

  // ---- high press ----
  { text: '전방 압박 화끈하네! 근데 후반 체력 걱정된다', type: 'normal', tags: ['highPress'] },
  { text: '게겐프레싱 가즈아!! 상대 빌드업 숨통을 조여라', type: 'vip', tags: ['highPress'] },
  { text: '압박 강도 미쳤다 상대가 공을 못 잡네 ㅋㅋ', type: 'vip', tags: ['highPress'] },
  { text: '고강도 압박 좋은데 60분 넘으면 다리 풀릴 텐데', type: 'normal', tags: ['highPress'] },
  { text: '뺏자마자 다시 조이는 거 이게 현대축구지', type: 'vip', tags: ['highPress'] },
  { text: '압박은 좋다만 뒷공간 관리 안 되면 역습 헌납이다', type: 'hater', tags: ['highPress'] },

  // ---- tenback / lock (park the bus) ----
  { text: '텐백 치지 말자 제발... 똥볼 축구 지겹다', type: 'hater', tags: ['tenback', 'lockMentality'] },
  { text: '수비만 하다가 또 한 방 먹는 거 아니냐 불안하다', type: 'hater', tags: ['tenback', 'lockMentality'] },
  { text: '리드 지킬 땐 잠그는 것도 전략이지 인정', type: 'normal', tags: ['lockMentality'] },
  { text: '10명이 박스 앞에 서있는 거 보니 속 터진다 ㅡㅡ', type: 'hater', tags: ['tenback'] },
  { text: '버스 세우기 시전... 이겨도 욕먹는 축구다 이건', type: 'hater', tags: ['tenback'] },
  { text: '굳히기 들어가는 건 좋은데 너무 일찍 잠그면 위험', type: 'normal', tags: ['lockMentality'] },
  { text: '수비 축구 볼 거면 내가 왜 감독 시켰냐 ㅋㅋ', type: 'hater', tags: ['tenback', 'lockMentality'] },
  { text: '실리축구도 필요할 때가 있긴 하지 상황 봐서', type: 'normal', tags: ['lockMentality'] },

  // ---- attack mentality (all-out) ----
  { text: '전원 닥공!! 이게 국민이 원하던 축구다 ㅠㅠ', type: 'vip', tags: ['attackMentality'] },
  { text: '올인 좋은데 뒷공간 뻥 뚫리면 어쩌려고 ㄷㄷ', type: 'hater', tags: ['attackMentality', 'weakDefense'] },
  { text: '추격 올인 심장 쫄깃하다 지금이 승부처지', type: 'vip', tags: ['attackMentality'] },
  { text: '수비 라인 확 끌어올렸네 배짱 하나는 인정한다', type: 'normal', tags: ['attackMentality'] },
  { text: '닥공 좋다! 지고 있으면 이래야지 뭐라도 해봐야', type: 'vip', tags: ['attackMentality'] },
  { text: '전원 공격은 도박인데... 뚫리면 대참사다', type: 'hater', tags: ['attackMentality'] },

  // ---- fatigue (stamina drained) ----
  { text: '선수들 다리에 쥐났다 ㅠㅠ 빨리 교체 좀요!', type: 'normal', tags: ['fatigue', 'half'] },
  { text: '체력 방전인데 안 바꾸네 이러다 후반에 무너진다', type: 'hater', tags: ['fatigue'] },
  { text: '지친 다리로 무슨 압박이냐 벤치 카드 써야지', type: 'hater', tags: ['fatigue'] },
  { text: '주전들 헉헉대는 거 보인다 교체 타이밍이다', type: 'normal', tags: ['fatigue', 'half'] },
  { text: '체력 게이지 빨간불 뜬 선수 빼야 하는 거 아님?', type: 'normal', tags: ['fatigue'] },
  { text: '다들 방전됐는데 조커 안 넣고 뭐하냐 감독님', type: 'hater', tags: ['fatigue', 'half'] },
  { text: '후반 되면 체력전인데 지금부터 걱정된다', type: 'normal', tags: ['fatigue'] },
  { text: '벤치에 싱싱한 다리 있는데 왜 안 쓰냐고', type: 'hater', tags: ['fatigue', 'half'] },

  // ---- strong attack ----
  { text: '공격력 지표 미쳤는데?? 이건 대량 득점 각이다', type: 'vip', tags: ['strongAttack'] },
  { text: '이 라인업 화력이면 스페인도 해볼 만하다!', type: 'vip', tags: ['strongAttack'] },
  { text: '공격 밸런스 예술이네 골 폭죽 기대해도 되나', type: 'vip', tags: ['strongAttack'] },
  { text: '이 정도 공격력이면 상대 골키퍼 바쁘겠다 ㅋㅋ', type: 'normal', tags: ['strongAttack'] },
  { text: '화력 하나는 역대급이다 이제 마무리만 잘하면', type: 'normal', tags: ['strongAttack'] },

  // ---- weak defense ----
  { text: '수비 밸런스 이거 괜찮음? 측면 자동문 또 열린다', type: 'hater', tags: ['weakDefense'] },
  { text: '뒷문 부실한데 실점 각 보인다 감독님 조심!', type: 'hater', tags: ['weakDefense'] },
  { text: '풀백 뒷공간 저거 남아공한테 또 털린 그 장면인데', type: 'hater', tags: ['weakDefense'] },
  { text: '공격도 좋은데 수비 안 챙기면 도로묵이다', type: 'normal', tags: ['weakDefense'] },
  { text: '실점하면 다 무너진다 뒷문 단속부터 하자', type: 'normal', tags: ['weakDefense'] },

  // ---- half-time (the tactical crossroads) ----
  { text: '하프타임이다! 후반 승부수 뭐로 둘지 기대된다', type: 'normal', tags: ['half'] },
  { text: '전반 보니까 후반 교체 타이밍이 진짜 중요하겠다', type: 'vip', tags: ['half'] },
  { text: '45분 끝났다 감독님 라커룸 스피치 각 잡아주세요', type: 'normal', tags: ['half'] },
  { text: '후반 시작하면 상대도 바꿔올 텐데 우리 카드는?', type: 'normal', tags: ['half'] },
  { text: '전반 흐름 나쁘지 않았어 후반에 몰아치자!', type: 'vip', tags: ['half'] },
  { text: '하프타임 조정이 승부를 가른다 감독 능력 볼 시간', type: 'vip', tags: ['half'] },
  { text: '지금 다이얼 잘 만져야 후반에 터진다 집중!', type: 'normal', tags: ['half'] },
  { text: '전반 아쉬웠으면 지금 확 바꿔야지 뭐 기다려', type: 'hater', tags: ['half'] },
  { text: '조커 언제 넣을지 지금 정해두는 게 좋음', type: 'normal', tags: ['half'] },
  { text: '후반 초반 10분이 승부처다 준비 단단히 하자', type: 'vip', tags: ['half'] },
  { text: '전반 스코어 보고 심장이 벌렁벌렁 후반 부탁해요', type: 'normal', tags: ['half'] },
  { text: '라커룸에서 뭐라고 하느냐가 후반 경기력 좌우한다', type: 'normal', tags: ['half'] },
  { text: '하프타임에 멍 때리면 그대로 진다 감독님 판단!', type: 'hater', tags: ['half'] },
  { text: '후반 45분 남았다 지금 세팅이 결과를 만든다', type: 'vip', tags: ['half'] },

  // ---- full-time framing ----
  { text: '이게 우리가 봤어야 할 경기다... 감동이다 진짜', type: 'vip', tags: ['full'] },
  { text: '결과 나왔다! 이 정도면 그때보다 백배 낫다', type: 'normal', tags: ['full'] },
  { text: '내가 감독이었어도 이렇게 했다 ㅋㅋ 공감 100%', type: 'vip', tags: ['full', 'general'] },
  { text: '경기 끝! 이 전술 캡처해서 협회에 보내야 함', type: 'vip', tags: ['full'] },
  { text: '후반 운영까지 완벽했다 명장의 탄생인가', type: 'vip', tags: ['full'] },
  { text: '아쉬운 부분도 있었지만 방향성은 확실했다', type: 'normal', tags: ['full'] }
];
