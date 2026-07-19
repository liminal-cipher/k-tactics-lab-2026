#!/usr/bin/env python3
# ==========================================================================
# K-Tactics Lab 2026 — FBref Data Ingestion & Rating Conversion Script
# Source: FBref Korea Republic, World Cup 2026 (Standard, Shooting, Misc Stats)
# Usage:  python scripts/parse_stats.py
# Output: data/squad_stats_2026.js (overwrites)
# ==========================================================================

import math, os

ATK_BASE  = {'GK':20,'DF':40,'DF/MF':50,'MF/DF':58,'MF':57,'FW/MF':67,'MF/FW':67,'FW':72}
DEF_BASE  = {'GK':82,'DF':74,'DF/MF':66,'MF/DF':65,'MF':53,'FW/MF':43,'MF/FW':43,'FW':36}
MID_BASE  = {'GK':40,'DF':50,'DF/MF':62,'MF/DF':65,'MF':73,'FW/MF':65,'MF/FW':65,'FW':53}
STAM_ADJ  = {'GK': 0,'DF': 3,'DF/MF': 3,'MF/DF': 3,'MF': 4,'FW/MF': 2,'MF/FW': 2,'FW': 1}

def clamp(v,lo,hi): return max(lo,min(hi,round(v)))

def calc_attack(pos,s90,sh90,sot90,gls,ast):
    w=min(1.0,s90/2.0)
    return clamp(ATK_BASE.get(pos,55)+min(10,sh90*2.5)*w+min(6,sot90*4)*w+gls*5+ast*3,30,95)

def calc_defense(pos,s90,int_t,tkl_t,fls_t,save_pct=None):
    if pos=='GK' and save_pct is not None:
        return clamp(82+(save_pct-70)*0.3,70,96)
    d=max(s90,0.5); w2=min(1.0,s90/1.5)
    return clamp(DEF_BASE.get(pos,50)+min(12,(int_t/d)*5)*w2+min(8,(tkl_t/d)*4)*w2-min(4,max(0,(fls_t/d)-2.0))*w2,30,96)

def calc_midfield(pos,s90,crs,ast,fld,gls):
    d=max(s90,0.5); w3=min(1.0,s90/2.0)
    return clamp(MID_BASE.get(pos,55)+min(12,(crs/d)*3)*w3+ast*4+min(5,fld)+gls*2,30,96)

def calc_stamina(pos,age):
    return clamp(85-(max(0,age-27)*0.6)+min(3,max(0,25-age)*0.4)+STAM_ADJ.get(pos,1),70,93)

PLAYERS = [
  {'n':'손흥민','p':'FW','a':'34-005','mp':3,'st':2,'min':169,'g':0,'as':0,'s90':1.9,'sh':3.73,'sot':0.53,'int':0,'tkl':1,'fls':0,'fld':4,'crs':3,'rtg':92,'sh2':95,'cmp':94,'note':'3경기(169분) 출전 / Sh/90 3.73'},
  {'n':'이강인','p':'FW/MF','a':'25-144','mp':3,'st':3,'min':270,'g':0,'as':1,'s90':3.0,'sh':1.33,'sot':0.33,'int':0,'tkl':0,'fls':1,'fld':7,'crs':19,'rtg':90,'sh2':88,'cmp':92,'note':'3경기(270분 풀타임) 1도움 / Crs 19'},
  {'n':'오현규','p':'FW','a':'25-092','mp':3,'st':1,'min':129,'g':1,'as':0,'s90':1.4,'sh':2.79,'sot':1.40,'int':0,'tkl':0,'fls':0,'fld':1,'crs':1,'rtg':84,'sh2':87,'cmp':83,'note':'3경기(129분) 1골 / Sh/90 2.79'},
  {'n':'황희찬','p':'FW','a':'30-168','mp':3,'st':1,'min':108,'g':0,'as':0,'s90':1.2,'sh':0.83,'sot':0.0,'int':0,'tkl':1,'fls':1,'fld':2,'crs':0,'rtg':85,'sh2':85,'cmp':84,'note':'3경기(108분) 출전 / Sh/90 0.83'},
  {'n':'조규성','p':'FW','a':'28-169','mp':2,'st':0,'min':31,'g':0,'as':0,'s90':0.3,'sh':5.81,'sot':2.90,'int':0,'tkl':0,'fls':1,'fld':0,'crs':0,'rtg':83,'sh2':86,'cmp':85,'note':'2경기(31분) 출전 (소표본)'},
  {'n':'양현준','p':'FW/MF','a':'24-049','mp':1,'st':0,'min':20,'g':0,'as':0,'s90':0.2,'sh':4.50,'sot':4.50,'int':1,'tkl':1,'fls':1,'fld':0,'crs':0,'rtg':80,'sh2':79,'cmp':78,'note':'1경기(20분) 출전 (소표본)'},
  {'n':'엄지성','p':'MF/FW','a':'24-065','mp':2,'st':0,'min':42,'g':0,'as':0,'s90':0.5,'sh':0.0,'sot':0.0,'int':0,'tkl':2,'fls':0,'fld':1,'crs':3,'rtg':80,'sh2':80,'cmp':79,'note':'2경기(42분) 출전 / TklW 2'},
  {'n':'황인범','p':'MF','a':'29-296','mp':3,'st':3,'min':263,'g':1,'as':1,'s90':2.9,'sh':1.37,'sot':0.68,'int':4,'tkl':2,'fls':1,'fld':1,'crs':2,'rtg':89,'sh2':84,'cmp':90,'note':'3경기(263분) 1골 1도움 / Int/90 1.38'},
  {'n':'이재성','p':'FW/MF','a':'33-337','mp':2,'st':2,'min':117,'g':0,'as':0,'s90':1.3,'sh':1.54,'sot':0.77,'int':2,'tkl':3,'fls':1,'fld':4,'crs':0,'rtg':86,'sh2':81,'cmp':88,'note':'2경기(117분) 선발 / TklW 3, Fld 4'},
  {'n':'백승호','p':'MF','a':'29-118','mp':3,'st':3,'min':204,'g':0,'as':0,'s90':2.3,'sh':0.0,'sot':0.0,'int':1,'tkl':0,'fls':1,'fld':2,'crs':1,'rtg':84,'sh2':80,'cmp':85,'note':'3경기(204분) 선발 / 슈팅 0회'},
  {'n':'김진규','p':'MF','a':'29-139','mp':2,'st':0,'min':52,'g':0,'as':0,'s90':0.6,'sh':1.73,'sot':0.0,'int':0,'tkl':1,'fls':0,'fld':1,'crs':1,'rtg':81,'sh2':77,'cmp':82,'note':'2경기(52분) 출전 / Sh/90 1.73'},
  {'n':'옌스 카스트로프','p':'MF','a':'22-349','mp':1,'st':0,'min':45,'g':0,'as':0,'s90':0.5,'sh':0.0,'sot':0.0,'int':0,'tkl':0,'fls':3,'fld':0,'crs':3,'rtg':81,'sh2':75,'cmp':81,'note':'1경기(45분) 출전 / Crs 3'},
  {'n':'설영우','p':'MF/DF','a':'27-220','mp':3,'st':3,'min':250,'g':0,'as':0,'s90':2.8,'sh':0.72,'sot':0.0,'int':1,'tkl':0,'fls':1,'fld':2,'crs':9,'rtg':85,'sh2':72,'cmp':84,'note':'3경기(250분) 선발 / Crs 9'},
  {'n':'이태석','p':'MF/DF','a':'23-350','mp':2,'st':2,'min':113,'g':0,'as':0,'s90':1.3,'sh':0.0,'sot':0.0,'int':0,'tkl':3,'fls':3,'fld':1,'crs':8,'rtg':81,'sh2':70,'cmp':80,'note':'2경기(113분) 선발 / TklW 3, Crs 8'},
  {'n':'김문환','p':'MF/DF','a':'30-346','mp':1,'st':1,'min':70,'g':0,'as':0,'s90':0.8,'sh':0.0,'sot':0.0,'int':1,'tkl':1,'fls':0,'fld':0,'crs':0,'rtg':81,'sh2':71,'cmp':82,'note':'1경기(70분) 출전 / Int 1, TklW 1'},
  {'n':'김민재','p':'DF','a':'29-240','mp':3,'st':3,'min':245,'g':0,'as':0,'s90':2.7,'sh':0.37,'sot':0.37,'int':2,'tkl':2,'fls':2,'fld':1,'crs':0,'rtg':91,'sh2':65,'cmp':89,'note':'3경기(245분) 선발 / Int 2, TklW 2 [수동 보정]','override_def':90},
  {'n':'이한범','p':'DF','a':'24-026','mp':3,'st':3,'min':270,'g':0,'as':0,'s90':3.0,'sh':0.67,'sot':0.0,'int':3,'tkl':2,'fls':7,'fld':2,'crs':2,'rtg':83,'sh2':58,'cmp':82,'note':'3경기(270분 풀타임) / Int 3, TklW 2'},
  {'n':'이기혁','p':'DF','a':'26-006','mp':3,'st':3,'min':270,'g':0,'as':0,'s90':3.0,'sh':0.0,'sot':0.0,'int':5,'tkl':4,'fls':2,'fld':1,'crs':2,'rtg':83,'sh2':55,'cmp':81,'note':'3경기(270분 풀타임) / Int 5, TklW 4 (팀내 최고)'},
  {'n':'박진섭','p':'DF/MF','a':'30-263','mp':2,'st':0,'min':32,'g':0,'as':0,'s90':0.4,'sh':2.81,'sot':2.81,'int':0,'tkl':0,'fls':0,'fld':1,'crs':0,'rtg':82,'sh2':62,'cmp':83,'note':'2경기(32분) 출전 / SoT 1 (소표본)'},
  {'n':'김승규','p':'GK','a':'35-286','mp':3,'st':3,'min':270,'g':0,'as':0,'s90':3.0,'sh':0.0,'sot':0.0,'int':0,'tkl':0,'fls':0,'fld':0,'crs':0,'rtg':89,'sh2':30,'cmp':91,'save_pct':75.0,'note':'3경기(270분 풀타임) / GA 3, Save% 75.0%'},
]

SECTION_LABELS = {
  'FW_group':  ['FW','FW/MF','MF/FW'],
  'MF_group':  ['MF','MF/DF'],
  'DF_group':  ['DF','DF/MF'],
  'GK_group':  ['GK'],
}

def build_js(players):
    out = [
        '// ==========================================================================',
        '// K-Tactics Lab 2026 - World Cup Benchmark Dataset (FBref-based, curated)',
        '// Source: FBref Korea Republic — World Cup 2026 (Standard/Shooting/Misc)',
        '// Formula: 4-dimensional rating derived from per-90 stats (scripts/parse_stats.py)',
        '// Last Updated: 2026-07-14 (KST)',
        '// Note: Contains ONLY the 20 players who officially participated (> 0 MP).',
        '// ==========================================================================',
        '',
        'const SQUAD_STATS_2026 = {',
    ]
    groups = [('Attackers (FW)',['FW','FW/MF','MF/FW']),('Midfielders (MF)',['MF','MF/DF']),('Defenders (DF)',['DF','DF/MF']),('Goalkeepers (GK)',['GK'])]
    for label, poss in groups:
        grp = [p for p in players if p['p'] in poss]
        if not grp: continue
        out.append(f'  // --- {label} ---')
        for p in grp:
            age = int(p['a'].split('-')[0])
            atk = calc_attack(p['p'],p['s90'],p['sh'],p['sot'],p['g'],p['as'])
            def_ = p.get('override_def') or calc_defense(p['p'],p['s90'],p['int'],p['tkl'],p['fls'],p.get('save_pct'))
            mid = calc_midfield(p['p'],p['s90'],p['crs'],p['as'],p['fld'],p['g'])
            stm = calc_stamina(p['p'],age)
            n = p['n']
            note = p['note']
            out.append(f"  '{n}': {{")
            out.append(f"    pos: '{p['p']}', age: '{p['a']}', mp: {p['mp']}, starts: {p['st']}, min: {p['min']}, gls: {p['g']}, ast: {p['as']},")
            out.append(f"    rating: {p['rtg']}, statStr: 'FBref 기반: {note}',")
            out.append(f"    attack: {atk}, defense: {def_}, midfield: {mid}, stamina: {stm},")
            out.append(f"    shooting: {p['sh2']}, composure: {p['cmp']}")
            out.append(f"  }},")
    out.append('};')
    out.append('')
    return '\n'.join(out)

if __name__ == '__main__':
    js_out = build_js(PLAYERS)
    out_path = os.path.normpath(os.path.join(os.path.dirname(__file__),'..','data','squad_stats_2026.js'))
    with open(out_path,'r',encoding='utf-8') as f:
        existing = f.read()
    marker = '\nconst OPPONENT_PROFILES'
    tail_idx = existing.find(marker)
    tail = existing[tail_idx:] if tail_idx != -1 else ''
    with open(out_path,'w',encoding='utf-8') as f:
        f.write(js_out + tail)
    print(f'Written to {out_path}')
    print()
    for p in PLAYERS:
        age=int(p['a'].split('-')[0])
        a=calc_attack(p['p'],p['s90'],p['sh'],p['sot'],p['g'],p['as'])
        d=p.get('override_def') or calc_defense(p['p'],p['s90'],p['int'],p['tkl'],p['fls'],p.get('save_pct'))
        m=calc_midfield(p['p'],p['s90'],p['crs'],p['as'],p['fld'],p['g'])
        s=calc_stamina(p['p'],age)
        print(f"  {p['n']:12s}  A:{a:2d}  D:{d:2d}  M:{m:2d}  S:{s:2d}")
