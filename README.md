# ⚽ K-Tactics Lab 2026

![Live Demo](https://img.shields.io/badge/Live_Demo-online-10b981.svg)
![Tech: Vanilla Web](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JS-06b6d4.svg)
![Submission: DAKER 2026](https://img.shields.io/badge/DAKER-Hackathon%20Submission-blue.svg)

> **2026 World Cup Korean National Team Tactics Solution & Interactive Manager Simulator**  
> *2026 월드컵 대한민국 국가대표팀 전술 솔루션 및 대중 참여형 감독 시뮬레이터*

---

## 📌 1. Overview (서비스 개요)
**K-Tactics Lab 2026** 은 대한민국 축구 국가대표팀이 2026 북중미 월드컵 본선 무대를 치르며 실전에서 직면한 핵심 전술적 쟁점들을 축구 팬(유저)이 직접 '국가대표 수석 감독'이 되어 해결해 보는 **대중 참여형 인터랙티브 전술 샌드박스 시뮬레이터** 다. 

단순히 몇 가지 문제를 푸는 퀴즈(Quiz)가 아니다. 복잡한 설치나 회원가입 없이 브라우저에서 1초 만에 실행되며, 4대 포메이션 및 구장 11명·벤치 9명(총 20인 공식 명단) 교체 자유도를 갖춘 샌드박스 위에서 **3대 경기 국면 (① 공격 전개, ② 측면 수비, ③ 경기 운영)** 별 전술을 지휘하고, 실시간 대중 여론 지지도(Vibe Meter)와 팀 밸런스(FBref 기반)의 변화를 체감할 수 있다.

---

## 🚨 2. Problem (문제 정의 및 언론 출처 근거)
**"기존 축구 콘텐츠는 일방적 비평만 있고, 전문 게임은 대중이 접근하기에 너무 무겁다."**

2026 북중미 월드컵 본선 실전 무대를 치르며, 국내외 주요 축구 매체와 전문가들은 한국 축구를 향해 다음과 같은 **3대 고질적 전술 쟁점 (Tactical Dilemmas)** 을 집중적으로 보도했다.

* **▲ U자형 빌드업 논란:** 중앙 침투 실종 및 의미 없는 횡·백패스 반복, 결국 남아공전 졸전으로 귀결 ([MBC, 2026a](https://imnews.imbc.com/replay/2026/nwdesk/article/6833724_37004.html); [Hankook Ilbo, 2026](https://www.hankookilbo.com/news/article/A2026062608010004313))
* **▲ 풀백 수비 자동문:** 상대 풀백의 적극적 공세에 뒷공간 노출 및 수비 조직력 붕괴 ([Korea Daily, 2026](https://www.koreadaily.com/article/20260625003112534); [Financial News, 2026](https://www.fnnews.com/news/202606251312188929))
* **▲ 해줘 축구(스타 의존):** 체계적 플랜 B 없이 개인 역량에 의존하다 완패, 무더위 핑계 등 총체적 난국 ([MBC, 2026b](https://imnews.imbc.com/news/2026/sports/article/6832790_36946.html); [Kyeonggi Ilbo, 2026](https://www.kyeonggi.com/article/20260626580030))


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
| **Simulation Engine** | `로컬 Poisson 몬테카를로 (LLM 미사용)` | 공식 20인 FBref 스탯(`data/squad_stats_2026.js`)에서 λ를 유도해 브라우저 단에서 **1,000회 Poisson 몬테카를로**로 승/무/패 확률분포를 연산. 결정론적·검증가능·$0 |
| **AI Layer** | `멀티 프로바이더 LLM 체인 (서버리스 프록시)` | Coach V 채팅·사전분석·AI 상대감독을 Vercel 서버리스 함수(`api/coach.js`)로 호출. `callLLM()` 체인이 Gemini 2.5 Flash-Lite → Groq `gpt-oss-120b` 순으로 시도하고 전부 실패 시 스크립트 폴백. API 키는 서버에 은닉되어 심사자는 키 없이 사용, 무료 티어라 비용 ≈ $0 |
| **Image Export & Share** | `html2canvas v1.4.1 + Web Share API` | 최종 명함 카드를 2배수 고화질 PNG로 캡처하고, 네이티브 공유·클립보드·'도전 링크(URL 인코딩)'로 바이럴 유도 |
| **Hosting & Deploy** | `Vercel (Static + Serverless Functions)` | 정적 자산은 CDN, AI만 서버리스 함수로. 별도 인프라 관리 없이 무료 티어로 **운영 비용 ≈ $0**. `file://` 오프라인 폴백 보장 |

---

## ✨ 4. Key Features (핵심 기능)

1. **👑 높은 자유도의 스쿼드 & 포메이션 샌드박스 (Squad Sandbox)**
   * 4-3-3, 3-5-2 등 4종 포메이션 실시간 전환 및 PC 마우스 드래그 앤 드롭 / 모바일 클릭 맞교환(Click-to-Swap)으로 구장 11명·벤치 9명(총 20인)을 자유롭게 교체한다.
2. **⚔️ 3대 경기 국면 (Game Phases) 전술 제어 센터 및 2-Phase 턴 루프**
   * **① 공격 전개:** U자형 빌드업 타파를 위한 하프스페이스 침투 및 백패스 금지 토글
   * **② 측면 수비:** 자동문 수비 해결을 위한 인버티드 풀백, 쓰리백 스토퍼 역할 지정
   * **③ 경기 운영:** '해줘 축구' 의존도를 낮추기 위한 60분 이후 플랜 B 조커 투입
   * **전·후반 이원화 루프:** 전반전 기본 스탯 및 체력 소모(Stamina Fatigue) 반영 후, 하프타임 전술 다이얼 조정이 후반전 1,000회 몬테카를로 확률 연산 및 PK 승부차기에 직접 개입한다.
3. **📊 실시간 팀 밸런스 진단 최상단 배치 (FBref 기반 Core Metrics)**
   * 좌측 패널 최상단 1순위 위젯으로 **공격 파괴력(슈팅·득점 기여), 측면 수비 안정도, 중원 장악력, 체력 유지력**을 직관적으로 노출하여, 전술 선택의 실질적 성적표를 명확히 제시한다.
4. **🤖 실제 LLM 수석 코치 'Coach V' + AI 상대 감독 (멀티 프로바이더 LLM 연동)**
   * Coach V는 현재 보드 상태(스탯·다이얼·라인업·상대 브리핑)를 주입받아 **실제 LLM** 이 그라운디드 조언을 하며, 자유 질문 채팅을 지원한다. 공격수를 골문에 두는 등 전술 기행에는 즉각 **[비상 경보]**.
   * **AI 상대 감독:** 킥오프 시 LLM이 우리 XI를 스카우팅해 카운터 포메이션·전술을 **구조화 JSON**으로 결정하고, 그 결과가 몬테카를로 시뮬에 실제 반영된다(적대적 에이전틱 루프). 네트워크·무료 한도 실패 시 전부 스크립트 폴백.
   * 팬 지지율(`vibeScore`)은 경기 성패와 분리된 2차 스토리 지표이며, 하단 실시간 여론 중계창은 **경기 상태로 조건 선택되는 오프라인 댓글 뱅크**(손흥민 벤치·고압박 체력 등)로 채워진다.
5. **🚪 선수단 락커룸 & 심층 스카우팅 리포트**
   * 2026 월드컵에 실제 출전한 20인 멤버를 포지션별로 조회하고, 선수 카드를 클릭해 FBref 기반 지표와 심층 데이터 리포트를 확인한다.
6. **🏆 1,000회 몬테카를로 매치 시뮬레이션 & 바이럴 도전 공유**
   * 실전 시뮬레이션은 **승/무/패 확률분포**와 '명장 지략가' 타이틀 명함을 제공하고, **Web Share(네이티브 공유)·클립보드·PNG 캡처**로 인증하거나 **"이 전술 이겨봐" 도전 링크(URL 인코딩)** 로 친구에게 도전장을 보낼 수 있다.

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
6. **AI 비용 아키텍처: "어디에 LLM을 쓰지 않는가"의 설계**
   * *이유:* 경기 결과는 로컬 Poisson 몬테카를로(모델 없음), 여론 댓글은 오프라인 생성 뱅크(런타임 $0), 라이브 LLM은 사용자 액션 기반 Coach V·AI 상대감독에만 국한했다. 타이머로 도는 여론 스트림에 콜당 LLM을 쓰지 않는 것이 핵심 결정. 모델 선택 근거·프롬프트 설계·비용 티어는 [`docs/AI_ENGINEERING.md`](docs/AI_ENGINEERING.md)에 정리했다.

---

## 📁 6. Project Structure (프로젝트 구조)
```text
k-tactics-lab/
├── index.html       # 메인 UI, 3단 그리드, 락커룸/모달, 남아공전 히어로 온보딩 모달
├── index.css        # 글래스모피즘 디자인 시스템, 반응형 레이아웃, Keyframe 애니메이션
├── app.js           # 전술 엔진, 로컬 몬테카를로 시뮬, Coach V/AI 상대감독 클라이언트, Vibe, 락커룸
├── api/
│   └── coach.js     # Vercel 서버리스 프록시 (LLM 체인 Gemini→Groq, 키 은닉, chat/analysis/opponent)
├── data/
│   ├── squad_stats_2026.js  # 2026 WC 출전 공식 20인 FBref 파생 스탯
│   └── fan_comments_2026.js # 상태 태깅 여론 댓글 뱅크 (오프라인 생성 자산, 런타임 $0)
├── scripts/
│   ├── parse_stats.py        # FBref per-90 → 4대 능력치 변환 (오프라인)
│   └── gen_fan_comments.py   # 여론 뱅크 생성기 (오프라인, 선택)
├── docs/
│   └── AI_ENGINEERING.md     # 데이터 파이프라인·모델 선택·프롬프트·비용 아키텍처 근거
├── vercel.json      # 서버리스 함수 설정
├── .env.example     # GEMINI_API_KEY / GROQ_API_KEY 예시 (실제 키는 커밋 금지)
├── PROPOSAL.md      # DAKER 해커톤 공식 제출용 기획서
└── README.md        # 프로젝트 아키텍처 및 실행 안내서 (본 문서)
```

---

## 🚀 7. Getting Started (실행 및 배포 안내)

앱 본체는 빌드가 전혀 필요 없다. AI(Coach V/상대감독)만 서버리스 함수를 쓰며, 없이도 전 기능이 스크립트 폴백으로 동작한다. (No build required!)

### 💻 Local Run (로컬 실행)
1. 본 저장소를 다운로드(ZIP) 혹은 `git clone` 한다.
```bash
git clone https://github.com/liminal-cipher/k-tactics-lab-2026.git
cd k-tactics-lab-2026
```
2. 폴더 내의 **`index.html`** 파일을 더블 클릭하여 웹 브라우저(Chrome, Safari, Edge 등)로 열면 즉시 실행된다. (이때 AI는 스크립트 폴백으로 동작)

### 🤖 AI 활성화 — 선택 (Vercel 배포)
Coach V의 실시간 LLM과 AI 상대감독은 서버리스 함수가 필요하다.
1. 무료 API 키 발급: [Google AI Studio](https://aistudio.google.com/apikey)(Gemini) 또는 [Groq Console](https://console.groq.com/keys) 중 하나 이상
2. Vercel에 저장소 연결(Import) 후 환경변수 **`GEMINI_API_KEY`** 및/또는 **`GROQ_API_KEY`** 설정 (키가 있는 프로바이더만 체인에서 활성화)
3. 로컬 개발 시: `npx vercel dev` (localhost:3000에서 `/api/coach` 라이브)
> 키는 서버에만 저장되어 노출되지 않으며, 심사자는 배포 URL 방문만으로 **키 없이** 사용한다.

### 🌐 Live Demo URL (온라인 배포)
* **Live Demo (공식, AI 라이브):** [https://k-tactics-lab-2026.vercel.app](https://k-tactics-lab-2026.vercel.app)
* 정적 미러 (GitHub Pages, AI는 스크립트 폴백 동작): [https://liminal-cipher.github.io/k-tactics-lab-2026/](https://liminal-cipher.github.io/k-tactics-lab-2026/)

---
📄 **License:** This project is developed for the DAKER Hackathon 2026. All rights reserved.
