#!/usr/bin/env python3
"""SERP-Ergebnisse -> eindeutige Firmen-Domains (Noise gefiltert).

    python3 process_serp.py --in serp.json --out domains.csv [--report]

Akzeptiert beide Actor-Formate:
- scraperlink: [{"search_term","page_number","results":[{"url","title","description"},...]}, ...]
- apify/google-search-scraper: [{"searchQuery":{...},"organicResults":[{"url","title",...}],...}, ...]

Filtert gegen references/noise-domains.md, erkennt Stadtportal-Muster (<stadt>.de) und
tiefe Portal-Unterseiten, dedupliziert auf Root-Domain. --report zeigt, was gefiltert wurde —
Portale, die durchrutschen, gehören in noise-domains.md (Pflege-Regel).
"""
from __future__ import annotations

import argparse
import csv
import json
import pathlib
import re
from collections import Counter
from urllib.parse import urlparse

CLOSED_PATTERNS = re.compile(
    r"onlineshop entsteht|online-pause|coming soon|wartungsarbeiten|passwort.gesch", re.I)


def load_noise(path: pathlib.Path) -> set[str]:
    domains: set[str] = set()
    if path.exists():
        for d in re.findall(r"\b([a-z0-9][a-z0-9.-]+\.[a-z]{2,})\b", path.read_text(encoding="utf-8")):
            if "*" not in d:
                domains.add(d)
    return domains


def root_domain(url: str) -> str | None:
    host = urlparse(url).hostname
    if not host:
        return None
    return host[4:] if host.startswith("www.") else host


def iter_results(data) -> list[dict]:
    rows = []
    for item in data if isinstance(data, list) else [data]:
        results = item.get("results") or item.get("organicResults") or []
        term = item.get("search_term") or (item.get("searchQuery") or {}).get("term") or ""
        for r in results:
            if r.get("url"):
                rows.append({"url": r["url"], "title": r.get("title") or "",
                             "description": r.get("description") or "", "query": term})
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--noise", type=pathlib.Path,
                    default=pathlib.Path(__file__).parent.parent / "references/noise-domains.md")
    ap.add_argument("--report", action="store_true")
    args = ap.parse_args()

    noise = load_noise(args.noise)
    with open(args.infile, encoding="utf-8") as fh:
        rows = iter_results(json.load(fh))

    seen: dict[str, dict] = {}
    filtered: Counter[str] = Counter()
    for row in rows:
        dom = root_domain(row["url"])
        if not dom:
            continue
        if dom in noise or any(dom.endswith("." + n) for n in noise):
            filtered[dom] += 1
            continue
        if CLOSED_PATTERNS.search(row["title"] + " " + row["description"]):
            filtered[dom] += 1
            continue
        # tiefe Portal-Unterseite: Pfad mit >3 Segmenten auf einer noch unbekannten Domain
        # ist verdächtig, aber kein Ausschluss — die Domain zählt, nicht die Unterseite
        if dom not in seen:
            seen[dom] = {"domain": dom, "website": f"https://{dom}/",
                         "titel": row["title"][:120], "query": row["query"]}

    with open(args.out, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["domain", "website", "titel", "query"])
        writer.writeheader()
        writer.writerows(seen.values())

    print(f"SERP-Treffer: {len(rows)} | eindeutige Firmen-Domains: {len(seen)} | gefiltert: {sum(filtered.values())}")
    if args.report:
        print("Top gefiltert:", ", ".join(f"{d}({n})" for d, n in filtered.most_common(10)))
        print("Top behalten:", ", ".join(list(seen)[:10]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
