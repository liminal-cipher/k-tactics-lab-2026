# ⚽ K-Tactics Lab 2026

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Tech: Vanilla Web](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JS-06b6d4.svg)
![Submission: DAKER 2026](https://img.shields.io/badge/DAKER-Hackathon%20Submission-10b981.svg)

> **2026 World Cup Korean National Team Tactics Solution & Interactive Manager Simulator**  
> *2026 월드컵 대한민국 국가대표팀 전술 솔루션 및 대중 참여형 감독 시뮬레이터*

---

## 📌 1. Overview (서비스 개요)
**K-Tactics Lab 2026** 은 대한민국 축구 국가대표팀이 2026 북중미 월드컵 본선 무대를 치르며 실전에서 직면한 핵심 전술적 쟁점들을 축구 팬(유저)이 직접 '국가대표 수석 감독'이 되어 해결해 보는 **대중 참여형 인터랙티브 전술 샌드박스 시뮬레이터** 다. 

단순히 몇 가지 문제를 푸는 퀴즈(Quiz)가 아니다. 복잡한 설치나 회원가입 없이 브라우저에서 1초 만에 실행되며, 4대 포메이션 및 16명 구장·벤치 선수 교체 자유도를 갖춘 샌드박스 위에서 **3대 경기 국면 (① 공격 전개, ② 측면 수비, ③ 경기 운영)** 별 전술을 지휘하고, 실시간 대중 여론 지지도(Vibe Meter)와 팀 밸런스(FBref 공인)의 변화를 체감할 수 있다.

---

## 🚨 2. Problem (문제 정의 및 언론 출처 근거)
**"기존 축구 콘텐츠는 일방적 비평만 있고, 전문 게임은 대중이 접근하기에 너무 무겁다."**

2026 북중미 월드컵 본선 실전 무대를 치르며, 국내외 주요 축구 매체와 전문가들은 한국 축구를 향해 다음과 같은 **3대 고질적 전술 쟁점 (Tactical Dilemmas)** 을 집중적으로 보도했다.

* **▲ U자형 빌드업 논란:** 중앙 침투 실종 및 의미 없는 횡·백패스 반복 ([Dong-A Ilbo, 2026a](https://www.donga.com/news/Sports/article/all/20260618/125890214/1); [Kyeonggi Ilbo, 2026](https://www.kyeonggi.com/article/20260620580031))
* **▲ 풀백 수비 자동문:** 오버래핑 시 뒷공간 노출 및 수비 조직력 붕괴 ([Chosun Ilbo, 2026](https://www.chosun.com/sports/football/2026/06/21/W6TKP9L8H2X9M0L/); [Yonhap News Agency, 2026a](https://www.yna.co.kr/view/AKR20260614102900007))
* **▲ 해줘 축구(스타 의존):** 체계적 팀 전술 부재와 손흥민·이강인 개인 역량 의존 및 플랜 B 조커 부재 ([Yonhap News Agency, 2026b](https://www.yna.co.kr/view/AKR20260625089100007); [Dong-A Ilbo, 2026b](https://www.donga.com/news/Sports/article/all/20260626/125910488/1))


그러나 이를 소비하는 미디어 생태계에는 명확한 공백이 존재한다.
* **기존 커뮤니티/댓글:** 언론이 지적한 문제를 일방적으로 성토할 뿐, 대중이 대안을 직접 설계하고 검증해 볼 맞춤형 도구가 없다.
* **전문 전술 게임(FM 등):** 현실적인 시뮬레이션을 제공하지만, 방대한 데이터와 복잡한 UI, 유료 결제 및 높은 하드웨어 사양으로 인해 일반 팬들이 가볍게 즐기기에는 진입장벽이 너무 높다.

**K-Tactics Lab 2026** 은 이 간극을 메우는 도구다. 언론 보도를 통해 검증된 3대 전술 쟁점을 **3대 경기 국면 (Game Phases)** 제어 시스템으로 구조화하여, 누구나 웹 브라우저 상에서 높은 자유도로 전술을 실험하고 대중 여론의 피드백을 즉각 체감할 수 있도록 설계했다.

---

## 🛠️ 3. Tech Stack (기술 스택)

| Component | Choice | Why (선택 이유) |
| :--- | :--- | :--- |
| **Core Framework** | `Vanilla HTML5 / CSS3 / JS (ES6+)` | 무거운 프레임워크나 빌드(`npm install`) 종속성 없이, 모바일/PC 브라우저에서 **1초 즉각 로딩** 및 심사위원 접근성 극대화 |
| **UI & Styling** | `Vanilla CSS Glassmorphism` | 스포츠 전술판 특유의 고급스러운 글래스모피즘 및 화면 진동(`Shake`), 테두리 발광(`Glow`) 등 동적 60fps 애니메이션 구현 |
| **Typography** | `Google Fonts API` | `Outfit`, `Plus Jakarta Sans`, `Noto Sans KR` 3종 폰트를 CDN으로 로딩하여, 영문·숫자 스탯의 가독성과 한글 렌더링 최적화 |
| **State & Interaction** | `Native JS State & HTML5 Drag/Touch APIs` | 외부 상태 관리 라이브러리 없이 전역 반응형 State 객체와 HTML5 `dataTransfer` 드래그 앤 드롭 + 모바일 클릭 맞교환(Click-to-Swap) 이원화 구현 |
| **Simulation Engine** | `Client-Side Monte Carlo Engine & FBref Data` | 공신력 있는 공식 20인 FBref 스탯(`data/squad_stats_2026.js`)을 기반으로, 브라우저 단에서 **1,000회 몬테카를로 확률 연산 및 2-Phase 턴 루프** 실시간 가동 |
| **Image Export** | `html2canvas v1.4.1` | 최종 시뮬레이션 명함 카드를 클라이언트 단에서 2배수 고화질 PNG 이미지로 캡처하여 소셜 미디어 바이럴 유도 |
| **Hosting & Deploy** | `Vercel / GitHub Pages` | 백엔드 서버 인프라 관리 없이 CDN을 통한 전 세계 무료 정적 웹 배포 및 **월 운영 비용 $0** 달성 |

---

## ✨ 4. Key Features (핵심 기능)

1. **👑 높은 자유도의 스쿼드 & 포메이션 샌드박스 (Squad Sandbox)**
   * 4-3-3, 3-5-2 등 4종 포메이션 실시간 전환 및 PC 마우스 드래그 앤 드롭 / 모바일 클릭 맞교환(Click-to-Swap)으로 16명 구장·벤치 선수를 자유롭게 교체한다.
2. **⚔️ 3대 경기 국면 (Game Phases) 전술 제어 센터 및 2-Phase 턴 루프**
   * **① 공격 전개:** U자형 빌드업 타파를 위한 하프스페이스 침투 및 백패스 금지 토글
   * **② 측면 수비:** 자동문 수비 해결을 위한 인버티드 풀백, 쓰리백 스토퍼 역할 지정
   * **③ 경기 운영:** '해줘 축구' 의존도를 낮추기 위한 60분 이후 플랜 B 조커 투입
   * **전·후반 이원화 루프:** 전반전 기본 스탯 및 체력 소모(Stamina Fatigue) 반영 후, 하프타임 전술 다이얼 조정이 후반전 1,000회 몬테카를로 확률 연산 및 PK 승부차기에 직접 개입한다.
3. **📊 실시간 팀 밸런스 진단 최상단 배치 (FBref 공인 Core Metrics)**
   * 좌측 패널 최상단 1순위 위젯으로 **공격 파괴력(xG), 측면 수비 안정도, 중원 장악력, 체력 유지력**을 직관적으로 노출하여, 전술 선택의 실질적 성적표를 명확히 제시한다.
4. **🤖 AI 수석 코치 'Coach V' 및 미니멀 여론 지수(Minimalist Vibe Bar)**
   * 공격수를 수비수에 배치하는 등 비정상적인 전술 기행을 벌이면 즉각 **[비상 경보]** 를 울린다.
   * 팬 지지율(`vibeScore`)은 경기 성패와 분리된 2차 스토리 지표로 운영되며, 하단 실시간 네티즌 중계창 헤더의 **초슬림 3px 프로그레스 바 및 알약 배지 (`지지율 50%`)** 를 통해 깔끔하고 직관적으로 표시된다.
5. **🚪 선수단 락커룸 & 심층 스카우팅 리포트**
   * 2026 월드컵에 실제 출전한 공식 인증 20인 멤버를 포지션별로 조회하고, 선수 카드를 클릭해 FBref 공인 지표와 심층 데이터 리포트를 확인한다.
6. **🏆 1,000회 몬테카를로 매치 시뮬레이션 & 바이럴 명함 캡처**
   * 조별리그 및 토너먼트 실전 시뮬레이션 결과와 '명장 지략가' 타이틀이 적힌 커스텀 명함을 고화질 PNG 이미지로 다운로드하여 SNS에 인증할 수 있다.

---

## 🧠 5. Key Design Decisions (핵심 설계 결정)

1. **프레임워크 확장: 단편적 3대 과제 → 종합 전술 샌드박스 & 국면별 제어**
   * *이유:* 단편적인 과제 제시 방식은 서비스 규모를 축소시켜 보인다. 포메이션 변환, 선수 맞교환, 롤 지정이 가능한 자유도 높은 샌드박스 위에서 언론이 지적한 쟁점을 **3대 경기 국면 (공격/수비/운영)** 으로 구조화하여 전문성과 몰입감을 극대화했다.
2. **인터랙션 구조: 단일 드래그 앤 드롭 → 디바이스 이원화(Hybrid) 설계**
   * *이유:* 기본 HTML5 Drag & Drop API는 iOS Safari 및 Android Chrome 터치 환경에서 제약이 크다. 모바일 심사위원 및 사용자들의 호환성을 100% 보장하기 위해, PC 환경은 드래그 앤 드롭, 모바일 환경은 클릭 기반 교체(Click-to-Swap)로 인터랙션을 이원화했다.
3. **밸런스 엔진: 2축 독립 평가 구조 (전술 스탯 vs 여론 지지도 분리)**
   * *이유:* 대중 지지율(`vibeScore`)이 높다고 경기를 이기는 인위적 왜곡을 방지하기 위해, **실제 승패는 FBref 기반 스탯과 상대팀 상성(Trade-off), 체력 소모, 1,000회 몬테카를로 시뮬레이션**으로만 연산하고, **여론 지지율은 감독의 대중적 흥행과 명함 타이틀을 결정하는 2차 지표**로 완전히 독립시켰다.
4. **UX/UI 미니멀리즘: 명확한 정보 위계 (전술 스탯 1순위 배치)**
   * *이유:* 시뮬레이터 본연의 전술 지휘에 대한 유저 몰입도를 극대화하기 위해, 좌측 패널 최상단에 실제 시뮬레이션 승패의 핵심인 **팀 밸런스 진단 스탯**을 1순위로 배치하고, 여론 지지율 미터기는 하단 실시간 중계창 헤더의 **초슬림 프로그레스 바**로 유기적으로 결합하여 직관성과 화면 구성의 균형을 완성했다.
5. **바이럴 전략: 일방적 링크 공유 → 명함 이미지 추출 메커니즘**
   * *이유:* 단순 URL 공유는 텍스트 위주라 클릭 유인 효과가 덜하다. 유저의 소셜 미디어 인증 욕구를 자극하기 위해, 최종 성적과 '명장 지략가' 타이틀이 적힌 커스텀 명함을 고화질 PNG 파일로 제공하는 바이럴 촉진 메커니즘을 설계했다.

---

## 📁 6. Project Structure (프로젝트 구조)
```text
k-tactics-lab/
├── index.html       # 메인 UI 레이아웃, 3단 그리드 패널, 락커룸 탭 및 모달 DOM 구조
├── index.css        # 글래스모피즘 디자인 시스템, 반응형 레이아웃 및 Keyframe 애니메이션
├── app.js           # 전술 스탯 연산 엔진, Vibe Meter 로직, 락커룸 필터 및 AI 코치 컨트롤러
├── data/
│   └── squad_stats_2026.js # 2026 월드컵 출전 공식 인증 20인 스쿼드 FBref 통계 데이터
├── PROPOSAL.md      # DAKER 해커톤 공식 제출용 기획서 (언론 출처 검증 및 참고문헌 수록)
└── README.md        # 프로젝트 아키텍처 및 실행 안내서 (본 문서)
```

---

## 🚀 7. Getting Started (실행 및 배포 안내)

본 프로젝트는 복잡한 사전에 필요한 인프라나 환경 설정이 전혀 없다. (No prerequisites, No Node.js build required!)

### 💻 Local Run (로컬 실행)
1. 본 저장소를 다운로드(ZIP) 혹은 `git clone` 한다.
```bash
git clone https://github.com/liminal-cipher/k-tactics-lab-2026.git
cd k-tactics-lab-2026
```
2. 폴더 내의 **`index.html`** 파일을 더블 클릭하여 웹 브라우저(Chrome, Safari, Edge 등)로 열면 즉시 실행된다.

### 🌐 Live Demo URL (온라인 배포)
* **Live Demo:** [https://liminal-cipher.github.io/k-tactics-lab-2026/](https://liminal-cipher.github.io/k-tactics-lab-2026/)

---
📄 **License:** This project is developed for the DAKER Hackathon 2026. All rights reserved.
