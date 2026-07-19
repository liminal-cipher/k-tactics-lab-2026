#!/usr/bin/env python3
# ==========================================================================
# K-Tactics Lab 2026 - Offline Fan-Comment Bank Generator
# --------------------------------------------------------------------------
# Pattern: OFFLINE GENERATION + RUNTIME CONDITIONING.
#   The live app never calls an LLM for the fan-comment stream (it fires on a
#   timer, so per-comment LLM calls would be a cost trap). Instead we generate
#   a large, state-tagged bank ONCE here, offline, and the client selects from
#   it at runtime for $0 (see data/fan_comments_2026.js + pickFanComment()).
#
# Usage:  GEMINI_API_KEY=... python scripts/gen_fan_comments.py > new_lines.txt
#   Then review and merge the printed objects into data/fan_comments_2026.js.
#   Running is OPTIONAL: the committed bank is already hand-curated. This tool
#   exists to expand/refresh variety later.
#
# Dependencies: Python stdlib only (urllib). No pip install.
# ==========================================================================

import json, os, sys, urllib.request, urllib.error

MODEL = "gemini-2.5-flash-lite"
TAGS = [
    "general", "sonBenched", "nopassback", "kangin", "highPress",
    "tenback", "attackMentality", "lockMentality", "fatigue",
    "strongAttack", "weakDefense", "half", "full",
]

PROMPT = f"""너는 대한민국 축구 국가대표팀 온라인 커뮤니티의 팬들이다.
2026 북중미 월드컵에서 한국은 비기기만 하면 32강이던 남아공전을 1-0으로 지며 조별탈락했고,
그 경기에서 손흥민을 선발 제외한 것과 홍명보 감독의 '전술 부재', U자형 후방 백패스가 최대 논란이었다.

아래 태그별로 팬 실시간 채팅 댓글을 생성하라. 각 댓글은 한국어 한 문장, 짧고 감정적이며 현실적인 커뮤니티 말투.
type은 normal(중립), vip(열성 응원), hater(비판적) 중 하나.

태그 목록: {", ".join(TAGS)}

각 태그마다 3개씩, 다음 JSON 배열 형식으로만 출력하라:
[{{"text": "...", "type": "normal|vip|hater", "tags": ["<태그>"]}}]
"""

def main():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.stderr.write("GEMINI_API_KEY 환경변수가 필요합니다.\n")
        sys.exit(1)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}"
    body = {
        "contents": [{"role": "user", "parts": [{"text": PROMPT}]}],
        "generationConfig": {"maxOutputTokens": 2048, "temperature": 1.0,
                             "responseMimeType": "application/json"},
    }
    req = urllib.request.Request(
        url, data=json.dumps(body).encode("utf-8"),
        headers={"content-type": "application/json"}, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.stderr.write(f"HTTP {e.code}: {e.read().decode('utf-8', 'ignore')}\n")
        sys.exit(1)

    text = "".join(p.get("text", "") for p in data["candidates"][0]["content"]["parts"]).strip()
    try:
        items = json.loads(text)
    except json.JSONDecodeError:
        sys.stderr.write("모델 응답이 JSON이 아닙니다. 원문:\n" + text + "\n")
        sys.exit(1)

    # Emit JS-object lines ready to paste into data/fan_comments_2026.js
    for it in items:
        t = it.get("text", "").replace("'", "’")
        typ = it.get("type", "normal")
        tags = it.get("tags", ["general"])
        print(f"  {{ text: '{t}', type: '{typ}', tags: {json.dumps(tags, ensure_ascii=False)} }},")

if __name__ == "__main__":
    main()
