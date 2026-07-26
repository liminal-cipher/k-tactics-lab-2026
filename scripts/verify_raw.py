#!/usr/bin/env python3
# ==========================================================================
# K-Tactics Lab 2026 - Raw Data Verification
# Compares the hand-transcribed PLAYERS literals in scripts/parse_stats.py
# against the original FBref CSV exports in data/raw/.
# Usage:  python scripts/verify_raw.py
# Exit:   0 = every measured field matches, 1 = at least one mismatch
# ==========================================================================

import csv, importlib.util, io, os, sys
from datetime import date, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..'))
RAW = os.path.join(REPO, 'data', 'raw')

spec = importlib.util.spec_from_file_location('ps', os.path.join(HERE, 'parse_stats.py'))
ps = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ps)

# FBref romanises names; parse_stats.py keys on Korean. 20 players with > 0 MP.
NAME = {
    'Son Heung-min': '손흥민', 'Lee Kang-in': '이강인', 'Oh Hyeon-gyu': '오현규',
    'Hwang Hee-chan': '황희찬', 'Cho Gue-sung': '조규성', 'Yang Hyun-jun': '양현준',
    'Eom Ji-sung': '엄지성', 'Hwang In-beom': '황인범', 'Lee Jae-sung': '이재성',
    'Paik Seung-ho': '백승호', 'Kim Jin-gyu': '김진규', 'Jens Castrop': '옌스 카스트로프',
    'Seol Young-woo': '설영우', 'Lee Tae-seok': '이태석', 'Kim Moon-hwan': '김문환',
    'Kim Min-jae': '김민재', 'Lee Han-beom': '이한범', 'Lee Gi-hyuk': '이기혁',
    'Park Jinseob': '박진섭', 'Kim Seung-gyu': '김승규',
}
SKIP = ('Squad Total', 'Opponent Total', '')


def load(fname):
    """Most FBref exports carry a group-header row above the real header;
    the roster export does not. Find the header by looking for 'Player'."""
    path = os.path.join(RAW, fname)
    with open(path, encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))
    hi = next(i for i, r in enumerate(rows) if 'Player' in r)
    hdr = rows[hi]
    out = {}
    for r in rows[hi + 1:]:
        if not r:
            continue
        # FBref repeats column names across groups: "Gls"/"Ast" appear as both a
        # count (Performance) and a rate (Per 90 Minutes), "Save%" twice in the
        # keeper table. First occurrence wins, which is the raw count.
        rec = {}
        for k, v in zip(hdr, r):
            rec.setdefault(k, v)
        name = rec.get('Player', '').strip()
        if name in SKIP:
            continue
        if 'Min' in hdr and not rec.get('Min', '').strip():
            continue                      # squad members with no minutes
        out[name] = rec
    return out


def num(v, cast=float):
    v = (v or '').strip()
    return None if v == '' else cast(v)


std = load('fbref_standard.csv')
sho = load('fbref_shooting.csv')
msc = load('fbref_misc.csv')
gkp = load('fbref_goalkeeping.csv')
ros = load('fbref_roster.csv')

print('=' * 74)
print(' 원자료 대조: data/raw/*.csv  vs  scripts/parse_stats.py PLAYERS')
print('=' * 74)

# --- scope -----------------------------------------------------------------
csv_names = set(std)
lit_names = {p['n'] for p in ps.PLAYERS}
mapped = {NAME[k] for k in csv_names if k in NAME}
unmapped = [k for k in csv_names if k not in NAME]
print(f'\n[범위] CSV 출전자 {len(csv_names)}명 · 리터럴 {len(lit_names)}명 · '
      f'이름 매핑 실패 {len(unmapped)}건 {unmapped if unmapped else ""}')
if mapped != lit_names:
    print(f'  !! 명단 불일치  CSV에만: {mapped - lit_names}  리터럴에만: {lit_names - mapped}')
else:
    print('  명단 일치: 출전 기록이 있는 선수 전원이 리터럴에 있고, 그 반대도 참이다.')

# --- measured fields -------------------------------------------------------
# (라벨, 리터럴 키, CSV 소스, CSV 열, 허용 오차)
FIELDS = [
    ('MP',      'mp',  std, 'MP',     0),
    ('Starts',  'st',  std, 'Starts', 0),
    ('Min',     'min', std, 'Min',    0),
    ('90s',     's90', std, '90s',    0.001),
    ('Gls',     'g',   std, 'Gls',    0),
    ('Ast',     'as',  std, 'Ast',    0),
    ('Sh/90',   'sh',  sho, 'Sh/90',  0.001),
    ('SoT/90',  'sot', sho, 'SoT/90', 0.001),
    ('Fls',     'fls', msc, 'Fls',    0),
    ('Fld',     'fld', msc, 'Fld',    0),
    ('Crs',     'crs', msc, 'Crs',    0),
    ('Int',     'int', msc, 'Int',    0),
    ('TklW',    'tkl', msc, 'TklW',   0),
]

rom = {v: k for k, v in NAME.items()}
bad, checked = [], 0
for p in ps.PLAYERS:
    r = rom.get(p['n'])
    for label, key, src, col, tol in FIELDS:
        rec = src.get(r)
        if rec is None:
            bad.append((p['n'], label, 'CSV 행 없음', p[key]))
            continue
        got, want = num(rec.get(col)), p[key]
        checked += 1
        if got is None:
            got = 0.0
        if abs(got - float(want)) > tol:
            bad.append((p['n'], label, got, want))

# goalkeeper save%
gk = [p for p in ps.PLAYERS if p.get('save_pct') is not None]
for p in gk:
    rec = gkp.get(rom[p['n']])
    checked += 1
    got = num(rec.get('Save%')) if rec else None
    if got is None or abs(got - p['save_pct']) > 0.001:
        bad.append((p['n'], 'Save%', got, p['save_pct']))

print(f'\n[실측 필드] {len(ps.PLAYERS)}명 × 13필드 + GK Save% = {checked}개 대조')
if bad:
    print(f'  불일치 {len(bad)}건')
    print(f"  {'선수':<16}{'필드':<9}{'CSV':>10}{'리터럴':>10}")
    for n, f, g, w in bad:
        print(f'  {n:<16}{f:<9}{str(g):>10}{str(w):>10}')
else:
    print('  불일치 0건. 손으로 옮긴 값이 원본과 전부 일치한다.')

# --- shots recovered from per-90 ------------------------------------------
print('\n[교차 검증] Sh/90 × 90s 로 복원한 슈팅 개수가 CSV의 실제 Sh 와 같은가')
sbad = 0
for p in ps.PLAYERS:
    rec = sho.get(rom[p['n']])
    if not rec:
        continue
    for per, tot in (('Sh/90', 'Sh'), ('SoT/90', 'SoT')):
        want = num(rec.get(tot), int)
        got = round((num(rec.get(per)) or 0) * (num(rec.get('90s')) or 0))
        if want is None:
            continue
        if got != want:
            sbad += 1
            print(f'  불일치 {p["n"]} {tot}: 복원 {got} vs CSV {want}')
print(f'  불일치 {sbad}건' + ('' if sbad else ' (per-90 값이 실제 개수에서 나왔음이 원본으로 확인됨)'))

# --- editorial fields ------------------------------------------------------
print('\n[편집 필드] 아래 두 항목은 FBref 값을 그대로 쓰지 않았다')
pos_diff, age_diff = [], []
for p in ps.PLAYERS:
    rec = std.get(rom[p['n']])
    if not rec:
        continue
    cpos = rec['Pos'].strip()
    lpos = p['p'].replace('/', '')
    if cpos != lpos:
        pos_diff.append((p['n'], cpos, p['p']))
    cage, lage = num(rec['Age'], int), int(p['a'].split('-')[0])
    if cage != lage:
        age_diff.append((p['n'], cage, p['a']))

print(f'\n  Pos 불일치 {len(pos_diff)}명')
for n, c, l in pos_diff:
    print(f'    {n:<16} CSV {c:<6} → 리터럴 {l}')
print(f'\n  Age 불일치 {len(age_diff)}명 (정수 연도 기준)')
for n, c, l in age_diff:
    print(f'    {n:<16} CSV {c:<6} → 리터럴 {l}')

# --- age provenance --------------------------------------------------------
# FBref renders age as "years-days" relative to the day the page was served.
# If the literals were transcribed from one real page, every player's age must
# resolve to the SAME snapshot date. Fabricated ages would scatter.
print('\n[나이 출처 추적] 리터럴의 YY-DDD 를 생년월일로 되돌리면 어느 날짜가 나오는가')


def as_of(birth, yy, dd):
    b = date(*map(int, birth.split('-')))
    return date(b.year + yy, b.month, b.day) + timedelta(days=dd)


lit_dates, ros_dates, missing = {}, {}, []
for p in ps.PLAYERS:
    rec = ros.get(rom[p['n']])
    if not rec or not rec.get('Birth Date', '').strip():
        missing.append(p['n'])
        continue
    b = rec['Birth Date'].strip()
    yy, dd = (int(x) for x in p['a'].split('-'))
    lit_dates[p['n']] = as_of(b, yy, dd)
    ryy, rdd = (int(x) for x in rec['Age'].strip().split('-'))
    ros_dates[p['n']] = as_of(b, ryy, rdd)

for label, dd in (('리터럴 나이', lit_dates), ('roster CSV 나이', ros_dates)):
    uniq = sorted(set(dd.values()))
    if len(uniq) == 1:
        print(f'  {label:<16} {len(dd)}명 전원이 {uniq[0]} 한 날짜로 수렴')
    else:
        print(f'  {label:<16} 날짜가 {len(uniq)}종으로 흩어짐: {uniq[:6]}')
        for n, d in sorted(dd.items(), key=lambda kv: kv[1]):
            print(f'     {n:<16} {d}')
if missing:
    print(f'  생년월일 없음: {missing}')
if len(set(lit_dates.values())) == 1 and len(set(ros_dates.values())) == 1:
    gap = (list(lit_dates.values())[0] - list(ros_dates.values())[0]).days
    print(f'  두 날짜 차이 {gap}일. 정수 연도가 어긋난 {len(age_diff)}명은 그 사이에 생일이 지난 선수다.')

# --- impact of the editorial fields on the 4 abilities ---------------------
print('\n[영향 분석] 편집 필드를 CSV 값으로 되돌리면 능력치가 어떻게 바뀌는가')


def calc(p, pos=None, age=None):
    pos = pos or p['p']
    age = age if age is not None else int(p['a'].split('-')[0])
    a = ps.calc_attack(pos, p['s90'], p['sh'], p['sot'], p['g'], p['as'])
    d = p.get('override_def') or ps.calc_defense(
        pos, p['s90'], p['int'], p['tkl'], p['fls'], p.get('save_pct'))
    m = ps.calc_midfield(pos, p['s90'], p['crs'], p['as'], p['fld'], p['g'])
    s = ps.calc_stamina(pos, age)
    return a, d, m, s


CSVPOS = {'DFMF': 'DF/MF', 'FWMF': 'FW/MF', 'MFDF': 'MF/DF', 'MFFW': 'MF/FW'}
shift = 0
print(f"  {'선수':<16}{'현재 (공/수/중/체)':>22}{'CSV 기준':>22}")
for p in ps.PLAYERS:
    rec = std.get(rom[p['n']])
    if not rec:
        continue
    cpos = CSVPOS.get(rec['Pos'].strip(), rec['Pos'].strip())
    cage = num(rec['Age'], int)
    now, alt = calc(p), calc(p, cpos, cage)
    if now != alt:
        shift += 1
        print(f'  {p["n"]:<16}{str(now):>22}{str(alt):>22}')
print(f'  값이 바뀌는 선수 {shift}명 / {len(ps.PLAYERS)}명')

# --- roster: squad scope ---------------------------------------------------
# load() drops rows with no minutes, so re-read the roster unfiltered.
print('\n[명단 범위] 소집 명단 대비 우리가 담은 20명은 무엇인가')
with open(os.path.join(RAW, 'fbref_roster.csv'), encoding='utf-8-sig') as f:
    rrows = list(csv.reader(f))
rhdr = rrows[0]
allsquad = [dict(zip(rhdr, r)) for r in rrows[1:] if r and r[1].strip()]
numbered = [r for r in allsquad if r['#'].strip()]
played = [r for r in allsquad if r['Min'].strip()]
noplay = [r for r in numbered if not r['Min'].strip()]
nonum = [r for r in allsquad if not r['#'].strip()]
print(f'  등번호를 받은 소집 인원 {len(numbered)}명')
print(f'  그중 출전 기록이 있는 선수 {len(played)}명 → 리터럴 {len(ps.PLAYERS)}명과 '
      + ('일치' if len(played) == len(ps.PLAYERS) else '불일치'))
print(f'  0분 미출전 {len(noplay)}명 (앱 스코프에서 제외): '
      + ', '.join(f"{r['Player']}({r['Pos']})" for r in noplay))
if nonum:
    print('  등번호 없는 행: ' + ', '.join(
        f"{r['Player']} (MP {r['MP'] or '공란'})" for r in nonum)
        + ' → 최종 명단 외 인원으로 보이며 20인 스코프에 영향 없음')

# --- playing time: independent copy of the same minutes --------------------
pt = load('fbref_playing_time.csv')
print('\n[교차 검증] playing_time 표의 MP·Min·Starts·90s 가 standard 표와 일치하는가')
ptbad = 0
for p in ps.PLAYERS:
    a, b = std.get(rom[p['n']]), pt.get(rom[p['n']])
    if not b:
        ptbad += 1
        print(f'  {p["n"]}: playing_time 행 없음')
        continue
    for col in ('MP', 'Min', 'Starts', '90s'):
        if num(a.get(col)) != num(b.get(col)):
            ptbad += 1
            print(f'  {p["n"]} {col}: standard {a.get(col)} vs playing_time {b.get(col)}')
print(f'  불일치 {ptbad}건' + ('' if ptbad else ' (서로 다른 두 표가 같은 출전 기록을 말한다)'))

# --- fixtures: does the narrative the proposal is built on hold? -----------
print('\n[서사 검증] 기획서가 전제하는 월드컵 조별리그 3경기')
with open(os.path.join(RAW, 'fbref_scores_and_fixtures.csv'), encoding='utf-8-sig') as f:
    fx = [r for r in csv.DictReader(f) if r.get('Comp', '').strip() == 'World Cup']
gf = sum(int(r['GF']) for r in fx)
ga = sum(int(r['GA']) for r in fx)
rec = ''.join(r['Result'] for r in fx)
for r in fx:
    print(f"  {r['Date']}  {r['Result']} {r['GF']}-{r['GA']}  vs {r['Opponent']:<18}"
          f"  우리 {r['Formation']} / 상대 {r['Opp Formation']}  주장 {r['Captain']}")
print(f"  합계 {rec.count('W')}승 {rec.count('D')}무 {rec.count('L')}패 · {gf}득점 {ga}실점")
litg = sum(p['g'] for p in ps.PLAYERS)
print(f'  리터럴 득점 합계 {litg} vs 경기 기록 {gf} → '
      + ('일치' if litg == gf else '불일치'))
hero = [r for r in fx if 'South Africa' in r['Opponent']]
if hero:
    h = hero[0]
    print(f"  히어로 시나리오(남아공전): {h['Date']} · 점유율 {h['Poss']}% · "
          f"주장 {h['Captain']} · 관중 {h['Attendance']}")

fail = bool(bad) or sbad or ptbad or mapped != lit_names or litg != gf
print('\n' + '=' * 74)
print(' 판정: ' + ('실측 필드 전부 일치' if not fail else '실측 필드에 불일치 있음'))
print('=' * 74)
sys.exit(1 if fail else 0)
