# 원자료 출처 (FBref)

`data/squad_stats_2026.js`의 근거가 되는 원본 표다. 이 폴더의 CSV는 가공하지 않은 다운로드본이며,
`scripts/parse_stats.py`의 입력 근거를 검증하는 용도로 저장소에 동봉한다.

## 출처

- 사이트: FBref (Sports Reference)
- 페이지: 대한민국 대표팀 / 2026 FIFA World Cup
- URL: https://fbref.com/en/squads/473f0fbf/Korea-Republic-Men-Stats
- 다운로드 일자: 2026-07-25
- 범위: 본선 3경기. 능력치 산출 대상은 출전 기록이 있는 20명 (Min > 0)

## 파일

능력치 4종을 실제로 만드는 것은 앞의 4개다. 뒤의 3개는 검증용으로, 앞의 값이 맞는지
다른 각도에서 대조하기 위해 같이 받아 두었다.

| 파일 | FBref 표 | 행 | 쓰는 필드 |
| :-- | :-- | --: | :-- |
| `fbref_standard.csv` | Standard Stats | 26 | Player, Pos, Age, MP, Starts, Min, 90s, Gls, Ast |
| `fbref_shooting.csv` | Shooting | 20 | Player, 90s, Sh, SoT, Sh/90, SoT/90 |
| `fbref_misc.csv` | Miscellaneous Stats | 20 | Player, 90s, Fls, Fld, Int, TklW, Crs |
| `fbref_goalkeeping.csv` | Goalkeeping | 1 | Player, MP, Min, GA, Saves, Save% |
| `fbref_roster.csv` | Squad Roster | 27 | Player, Pos, Club, Birth Date, Age, MP, Min |
| `fbref_playing_time.csv` | Playing Time | 26 | Player, MP, Min, Starts, Compl, Subs |
| `fbref_scores_and_fixtures.csv` | Scores & Fixtures | 23 | Date, Comp, Result, GF, GA, Opponent, Poss, Captain, Formation |

각 파일의 역할은 다음과 같다.

- **standard / shooting / misc** — 공격·수비·중원 능력치의 입력이다. 슈팅과 미스에는 출전한 20명만,
  스탠다드에는 소집 26명 전원이 실린다. 이 6명 차이가 곧 `Min > 0` 필터로 걸러지는 인원이다.
- **goalkeeping** — 김승규 한 명뿐이지만 별도 표가 필요하다. 골키퍼 수비 능력치만 다른 공식
  (`82 + (Save% − 70) × 0.3`)을 쓰기 때문이며, Save% 75.0이 그 입력이다.
- **roster** — 생년월일이 여기에만 있다. 체력 능력치가 나이를 입력으로 쓰므로 필요하고,
  소속 클럽과 포지션 표기를 대조하는 데도 쓴다.
- **playing_time** — 출전 시간을 두 번째 출처로 다시 확인하는 용도다. standard와 값이 어긋나면
  둘 중 하나를 잘못 받은 것이다.
- **scores_and_fixtures** — 선수 기록이 아니라 경기 기록이다. 기획서 3.1이 근거로 삼는
  "실제 남아공전은 스리백이었다"를 확인하는 자료다. 예선·친선 경기까지 포함된 전체 일정표라
  본선 3경기만 골라 봐야 한다(`Comp` 열이 `World Cup`인 행).

## 대조 결과

`python scripts/verify_raw.py` 로 `scripts/parse_stats.py` 안의 하드코딩 값과 이 CSV를 전수 대조한다.
2026-07-25 실행 결과는 **측정 필드 261개 전부 일치, 불일치 0건**이다. 함께 확인되는 것들.

- 출전 시간 합계가 정확히 **2,970분** = 3경기 × 11명 × 90분. 수집 범위에 빠진 사람이 없다는 뜻이다.
- `Sh/90 × 90s` 를 되돌리면 정수 `Sh` 열이 그대로 복원된다.
- 하드코딩된 나이 20개가 **2026-07-13 한 날짜로 수렴**한다. 생년월일이 제각각인 20명의 나이가
  한 날짜로 모인다는 것은 그 값들이 실제 데이터에서 나왔다는 증거다.
- 본선 3경기는 `2026-06-11 체코 2-1 승`, `06-18 멕시코 0-1 패`, `06-24 남아공 0-1 패`이며
  세 경기 모두 포메이션이 **3-4-3**으로 기록되어 있다.

알려진 차이 2가지. 어느 쪽도 능력치 산출에 쓰이지 않는다.

- **로스터에만 조유민(Cho Yu-min)이 있다.** 로스터 27명, 경기 기록 표 26명. 출전 기록이 없어
  스탠다드·슈팅·미스 어디에도 나오지 않는다.
- **로스터의 나이는 2026-06-11 기준**이라 하드코딩 값(2026-07-13 기준)과 32일 차이가 난다.
  포지션 표기도 6명이 다르다(로스터는 주 포지션, 경기 기록 표는 그 대회의 실제 출전 위치).

## 뽑는 방법

각 표 우측 상단 `Share & Export` → `Get table as CSV` → 나오는 텍스트를 그대로 저장한다.
FBref가 앞에 붙이는 그룹 헤더 행(`,,,Playing Time,Playing Time,...`)은 **지우지 말 것.**
`verify_raw.py`가 `Player`가 들어 있는 행을 찾아 헤더로 삼으므로 원본 그대로여야 한다.
인코딩은 UTF-8로 저장한다.

## 다시 파싱할 때 걸리는 함정

- **같은 이름의 열이 두 번 나온다.** `fbref_standard.csv`는 `Gls`·`Ast`·`G+A`·`G-PK`를 누적값과
  per-90으로 각각 한 번씩, `fbref_goalkeeping.csv`는 `Save%`를 두 번 싣는다. `dict(zip(...))`로
  읽으면 **뒤엣것이 앞엣것을 덮어써서** per-90 값이 누적값 자리에 들어간다. 첫 번째 것만 남기는
  `setdefault` 방식으로 읽어야 한다.
- **표 끝에 `Squad Total`·`Opponent Total` 행이 붙는다.** 둘 다 MP 3 · Min 270이라 선수로 세면
  합계가 2,970이 아니라 3,510이 된다.
- **`fbref_roster.csv`만 형식이 다르다.** 그룹 헤더 행이 없고 첫 열이 `Player`가 아니라 `#`다.

## 주의

- 이 CSV는 **참조용이다.** 앱은 읽지 않는다. 앱이 읽는 것은 `data/squad_stats_2026.js` 하나뿐이다.
- 선수 이름이 로마자(Son Heung-min, Jens Castrop 등)로 나오므로 한글 이름과의 매핑은
  대조 스크립트가 처리한다.
