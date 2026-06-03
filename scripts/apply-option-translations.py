#!/usr/bin/env python3
"""
price-options.generated.json(ko) + scripts/translations/options-{en,zh,ja}.json
→ 각 옵션의 name/caption에 en/zh/ja 병합 후 Sanity production 주입.

dry-run:  python3 scripts/apply-option-translations.py
apply  :  python3 scripts/apply-option-translations.py --apply
"""
import sys, json, re, os, urllib.request, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

opts_by_slug = json.load(open(os.path.join(HERE, "price-options.generated.json")))
TR = {
    "en": json.load(open(os.path.join(HERE, "translations/options-en.json"))),
    "zh": json.load(open(os.path.join(HERE, "translations/options-zh.json"))),
    "ja": json.load(open(os.path.join(HERE, "translations/options-ja.json"))),
}


def localize(field):
    """{'ko': '...'} → {'ko','en','zh','ja'} (번역 없으면 ko 유지)"""
    if not field or not field.get("ko"):
        return field
    ko = field["ko"]
    out = {"ko": ko}
    for lang in ("en", "zh", "ja"):
        out[lang] = TR[lang].get(ko, ko)
    return out


def build():
    missing = set()
    result = {}
    for slug, opts in opts_by_slug.items():
        new_opts = []
        for o in opts:
            o2 = dict(o)
            if o.get("name", {}).get("ko"):
                o2["name"] = localize(o["name"])
                for lang in ("en", "zh", "ja"):
                    if o["name"]["ko"] not in TR[lang]:
                        missing.add(o["name"]["ko"])
            if o.get("caption", {}).get("ko"):
                o2["caption"] = localize(o["caption"])
            new_opts.append(o2)
        result[slug] = new_opts
    return result, missing


def token():
    env = open(os.path.join(ROOT, ".env.local")).read()
    return re.search(r"SANITY_API_TOKEN=(.+)", env).group(1).strip()


def id_map(tok):
    q = urllib.parse.quote('*[_type=="treatment"]{"slug":slug.current,_id}')
    url = f"https://ecoamz42.api.sanity.io/v2024-01-01/data/query/production?query={q}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}"})
    data = json.loads(urllib.request.urlopen(req).read())
    return {r["slug"]: r["_id"] for r in data["result"] if r.get("slug")}


def apply(result):
    tok = token()
    ids = id_map(tok)
    muts = []
    for slug, opts in result.items():
        _id = ids.get(slug)
        if not _id:
            print("  ⚠️ slug 미존재:", slug)
            continue
        muts.append({"patch": {"id": _id, "set": {"priceOptions": opts}}})
    body = json.dumps({"mutations": muts}).encode()
    url = "https://ecoamz42.api.sanity.io/v2024-01-01/data/mutate/production"
    req = urllib.request.Request(
        url, data=body,
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
        method="POST",
    )
    resp = json.loads(urllib.request.urlopen(req).read())
    print("  ✅ 주입 완료:", resp.get("transactionId"), "/ 문서", len(muts), "건")


def main():
    result, missing = build()
    total = sum(len(v) for v in result.values())
    print(f"=== {len(result)}개 시술 / {total}개 옵션, 4개국어 병합 ===")
    if missing:
        print(f"⚠️ 번역 누락 {len(missing)}건:", list(missing)[:10])
    else:
        print("✅ 모든 옵션명 번역 매칭됨")
    if "--apply" in sys.argv:
        apply(result)
    else:
        print("dry-run. --apply 로 production 주입.")


if __name__ == "__main__":
    main()
