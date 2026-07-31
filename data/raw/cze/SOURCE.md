# 원자료 출처 (FBref) — 체코

`OPP_STRENGTH.CZE` (att/def) 유도의 근거가 되는 원본 표다. 수집 완료 (B‴1).

## 출처

- 사이트: FBref (Sports Reference)
- 페이지: 체코 대표팀 / 2026 FIFA World Cup
- URL: https://fbref.com/en/squads/2740937c/Czech-Republic-Men-Stats
- 다운로드 일자: 2026-07-31
- 범위: **본선 3경기 (조별리그만).** 06-11 vs KOR (L 1-2, 우리 쪽 `kor/fbref_scores_and_fixtures.csv`에 W 2-1로 대조 가능), 06-18 vs RSA (D 1-1), 06-24 vs MEX (L 0-3) = 1무2패 조 최하위, **2득 6실**. 조별에서 탈락해 토너먼트 경기가 없으므로 KOR과 스코프가 정확히 같다 (`Squad Total` MP=3).

## 파일 (필수 3개 + 선택 1개, `kor/`과 동일한 이유는 `data/raw/README.md` 참조)

| 파일 | FBref 표 | 쓰는 필드 |
| :-- | :-- | :-- |
| `fbref_standard.csv` | Standard Stats | MP, Min, 90s, Gls, Ast |
| `fbref_shooting.csv` | Shooting | 90s, Sh, SoT, Sh/90, SoT/90 |
| `fbref_misc.csv` | Miscellaneous Stats | 90s, Fls, Fld, Int, TklW, Crs |
| `fbref_goalkeeping.csv` (선택) | Goalkeeping | GK, MP, Min, GA, Saves, Save% — 현재 산식(`parse_opponents.py`의 `derive()`)은 쓰지 않는다. B‴2에서 수비를 실점·피유효슈팅으로 잡기로 확정했기 때문. KOR처럼 GK 전용 공식(`82+(Save%−70)×0.3`)을 얹을 경우에 대비해 받아만 둔다. |

## 뽑는 방법

`kor/SOURCE.md`와 동일: 각 표 우측 상단 `Share & Export` → `Get table as CSV`. 그룹 헤더 행 지우지 말 것, UTF-8 저장.

## 주의

- 국가대표팀 표는 클럽 표와 달리 **대회 기간 소집 선수만** 나온다. `Squad Total`/`Opponent Total` 합계 행은 선수로 세면 안 되고, 반대로 **팀 단위 계산에는 이 두 행이 정답**이다 (`parse_opponents.py`가 그렇게 쓴다).
- **`90s` 열의 분모 함정.** 이 합계 행의 `90s`는 선수 90분의 합(≈33)이 아니라 **팀 경기 수**(체코 3.0)다. 선수 행을 더해서 나누면 모든 비율이 약 11배 작아진다.
