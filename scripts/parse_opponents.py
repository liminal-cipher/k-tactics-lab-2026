#!/usr/bin/env python3
# ==========================================================================
# K-Tactics Lab 2026 — Opponent Team-Strength Derivation (B‴, 2026-07-31)
# Source: FBref squad pages, 2026 World Cup (Standard, Shooting, Misc)
# Scope: unlike parse_stats.py (20 individual player cards), this produces
#        exactly one {att, def} pair per team — the two numbers app.js reads
#        as OPP_STRENGTH[country]. See data/raw/README.md.
# Usage:  python scripts/parse_opponents.py
# Output: prints a curated-vs-derived comparison table. Does NOT write
#         app.js — B‴4's gate decides whether the derived values ship.
# ==========================================================================

import csv, io, math, os, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..'))
RAW = os.path.join(REPO, 'data', 'raw')

COUNTRIES = ['cze', 'mex', 'rsa']
REFERENCE = 'kor'   # every index is expressed relative to our own raw data

# Curated values currently hardcoded in app.js OPP_STRENGTH.
CURATED = {
    'MEX': {'att': 74, 'def': 72},
    'CZE': {'att': 68, 'def': 66},
    'RSA': {'att': 66, 'def': 70},
}

# The opening board sits at attack 70 / defense 70 (PROPOSAL §5.3), and
# secondHalfLambdas() consumes OPP_STRENGTH as a ratio against those HUD
# stats. So KOR's own raw data is pinned to 70 and every opponent is placed
# relative to it — that keeps the derived numbers on the scale the engine
# already speaks, instead of inventing a second one.
KOR_PIN = 70.0
SPREAD_K = 12.0     # log-ratio → rating points. See derive() docstring.
CLAMP = (55, 85)

# A rate of exactly zero has no finite log-ratio. Substituting an epsilon
# (1e-3) looks like a guard but is not one: log(1e-3/1.0)x12 is ~83 rating
# points, so the result just saturates CLAMP and prints as a confident 85.
# Instead the substitution is an explicit, documented floor — "at most one
# such event in four matches" — AND the caller is told it fired, so a
# degenerate sample is visible rather than silently rounded into the band.
DEGENERATE_FLOOR = 0.25


class DataProblem(Exception):
    """Raised when a CSV is present but not shaped the way this script needs."""


def load_rows(path):
    """Returns (players, totals). FBref repeats column names (Gls/Ast appear
    as season totals then again as per-90), so keep the FIRST occurrence —
    dict(zip(...)) would let the per-90 column silently overwrite the total."""
    with open(path, encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))
    try:
        hi = next(i for i, r in enumerate(rows) if 'Player' in r)
    except StopIteration:
        raise DataProblem(f'{os.path.basename(path)}: `Player` 헤더 행이 없다 '
                          '(FBref CSV 원본 그대로 저장했는지 확인)')
    header = rows[hi]
    players, totals = [], {}
    for r in rows[hi + 1:]:
        if not r or not r[0]:
            continue
        row = {}
        for k, v in zip(header, r):
            row.setdefault(k, v)
        if r[0] in ('Squad Total', 'Opponent Total'):
            totals[r[0]] = row
        else:
            players.append(row)
    for need in ('Squad Total', 'Opponent Total'):
        if need not in totals:
            raise DataProblem(
                f'{os.path.basename(path)}: `{need}` 합계 행이 없다. 팀 단위 유도는 이 행이 '
                '곧 입력이다 (선수 단위 parse_stats.py와 반대 — data/raw/README.md 참조)')
    return players, totals


def to_f(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def team_rates(country_dir):
    """Per-match team rates from the Squad Total / Opponent Total rows.

    NOTE the denominator: FBref's team `90s` on these rows is the number of
    TEAM matches (3.0 = three matches), not the sum of player-90s (~33).
    Dividing by the player-sum would understate every rate by ~11x."""
    _, std = load_rows(os.path.join(country_dir, 'fbref_standard.csv'))
    _, sho = load_rows(os.path.join(country_dir, 'fbref_shooting.csv'))
    _, msc = load_rows(os.path.join(country_dir, 'fbref_misc.csv'))

    us = std['Squad Total']
    n = to_f(us.get('90s'), 0.0)
    if n <= 0:
        raise DataProblem('fbref_standard.csv: `Squad Total`의 90s(경기 수)가 비었거나 0이다')

    def rate(row, key, where):
        # No silent default: a renamed or dropped FBref column would otherwise
        # become 0, get floored by _logr, and print as a plausible rating built
        # from a field that is not in the file.
        if key not in row or row[key] == '':
            raise DataProblem(f'{where}: `{key}` 열이 없다 (FBref 표 형식이 바뀌었는지 확인)')
        return to_f(row[key]) / n

    return {
        'mp': int(to_f(us.get('MP'), 0.0)),
        'gf90':   rate(us, 'Gls', 'standard/Squad Total'),
        'ga90':   rate(std['Opponent Total'], 'Gls', 'standard/Opponent Total'),
        'sh90':   rate(sho['Squad Total'], 'Sh', 'shooting/Squad Total'),
        'sot90':  rate(sho['Squad Total'], 'SoT', 'shooting/Squad Total'),
        'osh90':  rate(sho['Opponent Total'], 'Sh', 'shooting/Opponent Total'),
        'osot90': rate(sho['Opponent Total'], 'SoT', 'shooting/Opponent Total'),
        # Reported for context only, deliberately NOT in the formula — see derive().
        'int90':  rate(msc['Squad Total'], 'Int', 'misc/Squad Total'),
        'tkl90':  rate(msc['Squad Total'], 'TklW', 'misc/Squad Total'),
    }


def _logr(x, ref, label, flags):
    """log(x/ref). Records into `flags` when the degenerate floor is used."""
    if ref <= 0:
        flags.append(f'{label}: 기준값이 0')
        return 0.0
    if x <= 0:
        flags.append(f'{label}: 실측 0 → 하한 {DEGENERATE_FLOOR}/경기로 대체')
        return math.log(DEGENERATE_FLOOR / ref)
    return math.log(x / ref)


def derive(t, ref):
    """attack/defence on the engine's ~70 scale. Returns (values, flags).

    Blend of goals and shots-on-target, each as a log-ratio against KOR's
    own rate, then mapped onto rating points. Rationale:

    - log-ratio, not raw ratio: over 3-5 matches a raw goal ratio is
      explosive (MEX scored 3x KOR's rate → a linear map would put them at
      145). Logs compress the tail and treat "twice as good" and "half as
      good" symmetrically.
    - goals AND SoT, evenly weighted: goals are the outcome the engine
      actually models, but 3-5 matches of goals is a tiny sample. SoT is
      the more stable process signal and stops one scoreline dominating.
    - defence reads OPPONENT output (goals and SoT conceded), not our own
      Int/TklW. Interceptions and tackles measure defensive *activity*,
      which a deep-blocking side accumulates precisely because it concedes
      territory — they do not measure whether the defending worked. Goals
      and shots conceded do. (Int/TklW are still printed for reference.)
    - SPREAD_K=12 sets how many rating points one log unit buys. It is a
      scale choice, not an estimate: it is what keeps the output in the
      same 66-74 band the curated values occupy, so the derived numbers
      remain drop-in comparable rather than rescaling the whole engine."""
    flags = []
    att_raw = (0.5 * _logr(t['gf90'], ref['gf90'], '득점', flags)
               + 0.5 * _logr(t['sot90'], ref['sot90'], '유효슈팅', flags))
    # conceded more than the reference → weaker defence, hence the minus.
    def_raw = (0.5 * _logr(t['ga90'], ref['ga90'], '실점', flags)
               + 0.5 * _logr(t['osot90'], ref['osot90'], '피유효슈팅', flags))
    lo, hi = CLAMP
    att = int(round(max(lo, min(hi, KOR_PIN + SPREAD_K * att_raw))))
    dfn = int(round(max(lo, min(hi, KOR_PIN - SPREAD_K * def_raw))))
    return {'att': att, 'def': dfn}, flags


def main():
    print('=' * 78)
    print(' B‴ 상대 3국 실데이터 유도 — 큐레이션 vs 유도값')
    print('=' * 78)

    ref_dir = os.path.join(RAW, REFERENCE)
    if not os.path.isdir(ref_dir):
        print(f'\n기준 데이터 없음: {ref_dir} (data/raw/README.md의 폴더 레이아웃 참조)')
        sys.exit(1)
    try:
        ref = team_rates(ref_dir)
    except DataProblem as e:
        print(f'\n기준({REFERENCE.upper()}) 원자료 문제 — {e}')
        sys.exit(1)

    rates, derived, all_flags = {}, {}, {}
    for c in COUNTRIES:
        d = os.path.join(RAW, c)
        need = ['fbref_standard.csv', 'fbref_shooting.csv', 'fbref_misc.csv']
        missing = [f for f in need
                   if not os.path.exists(os.path.join(d, f))
                   or os.path.getsize(os.path.join(d, f)) == 0]
        if missing:
            print(f'\n[{c.upper()}] 미수집: {", ".join(missing)} (data/raw/{c}/SOURCE.md 참고)')
            continue
        try:
            rates[c.upper()] = team_rates(d)
        except DataProblem as e:
            print(f'\n[{c.upper()}] 원자료 문제 — {e}')
            continue
        derived[c.upper()], flags = derive(rates[c.upper()], ref)
        if flags:
            all_flags[c.upper()] = flags

    if not derived:
        print('\n수집된 국가 없음. B‴1(각 fbref_*.csv를 data/raw/<국가>/에 저장) 먼저 실행할 것.')
        sys.exit(0)

    print(f'\n[원자료 범위] 기준 KOR = {ref["mp"]}경기 '
          '(조별리그 1승 2패로 탈락해 조별 3경기가 전부)')
    for c, t in rates.items():
        tail = '조별리그만' if t['mp'] == 3 else f'조별 3 + 토너먼트 {t["mp"] - 3}경기'
        print(f'  {c}: {t["mp"]}경기 ({tail})')

    print(f'\n[경기당 실측] 기준 KOR: 득 {ref["gf90"]:.2f} / 실 {ref["ga90"]:.2f} / '
          f'유효슈팅 {ref["sot90"]:.2f} / 피유효슈팅 {ref["osot90"]:.2f}')
    print(f'{"팀":<5}{"득/경기":>9}{"실/경기":>9}{"유효슛":>9}{"피유효슛":>10}{"Int":>8}{"TklW":>8}')
    for c, t in rates.items():
        print(f'{c:<5}{t["gf90"]:>9.2f}{t["ga90"]:>9.2f}{t["sot90"]:>9.2f}'
              f'{t["osot90"]:>10.2f}{t["int90"]:>8.1f}{t["tkl90"]:>8.1f}')

    if all_flags:
        print('\n[표본 경고] 아래 값은 실측 0을 하한으로 대체해 계산했다 — 수치를 그대로 믿지 말 것')
        for c, fl in all_flags.items():
            for f in fl:
                print(f'  {c}: {f}')

    print(f'\n[비교] 큐레이션 vs 유도 (KOR을 {KOR_PIN:.0f}에 핀, k={SPREAD_K:.0f})')
    print(f'{"팀":<5}{"att(큐)":>9}{"att(유도)":>11}{"차":>6}   {"def(큐)":>9}{"def(유도)":>11}{"차":>6}')
    for code in COUNTRIES:
        C = code.upper()
        if C not in derived:
            continue
        cur, der = CURATED[C], derived[C]
        da, dd = der['att'] - cur['att'], der['def'] - cur['def']
        print(f'{C:<5}{cur["att"]:>9}{der["att"]:>11}{da:>+6}   '
              f'{cur["def"]:>9}{der["def"]:>11}{dd:>+6}')

    def order(key, src):
        return ' > '.join(c for c, _ in sorted(src.items(), key=lambda kv: kv[1][key], reverse=True))

    # Compare like with like: rank the curated side over only the countries
    # that actually have data, or a partial collection reads as a mismatch.
    seen = {c: CURATED[c] for c in derived}
    print('\n[서열 대조] 유도값이 큐레이션의 순서를 재현하는가'
          + ('' if len(derived) == len(COUNTRIES) else f'  (수집된 {len(derived)}개국 한정)'))
    print(f'  att  큐레이션: {order("att", seen)}   |  유도: {order("att", derived)}')
    print(f'  def  큐레이션: {order("def", seen)}   |  유도: {order("def", derived)}')

    print('\n다음 단계 (B‴4 게이트): node scripts/validate_model.js + .local/probe_page_herocurve.js로')
    print('[개막 0:1 유지] ∧ [개혁 리프트 ≥20%p] ∧ [자유 모드 곡선 정상] 확인 후 교체 여부 결정.')


if __name__ == '__main__':
    main()
