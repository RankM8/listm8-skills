#!/usr/bin/env python3
"""SERP-Ergebnisse -> eindeutige Firmen-Domains (Noise gefiltert).

    python3 process_serp.py --in serp.json --out domains.csv [--report]

Akzeptiert beide Actor-Formate:
- scraperlink: [{"search_term","page_number","results":[{"url","title","description"},...]}, ...]
- apify/google-search-scraper: [{"searchQuery":{...},"organicResults":[{"url","title",...}],...}, ...]

Filtert gegen references/noise-domains.md (inkl. *-Wildcards wie 11880-*.com), erkennt
geschlossene/Baustellen-Shops am Titel/Snippet und dedupliziert auf Root-Domain.
Baukasten-Plattformen (jimdo, wordpress.com, wix, ...) werden NUR als Plattform-Domain
gefiltert — Kunden-Subdomains (betrieb.jimdosite.com) sind Leads und bleiben drin.
--report zeigt, was gefiltert wurde — Portale, die durchrutschen, gehören in
noise-domains.md (Pflege-Regel).
"""
from __future__ import annotations

import argparse
import csv
import fnmatch
import json
import pathlib
import re
from collections import Counter
from urllib.parse import urlparse

CLOSED_PATTERNS = re.compile(
    r"onlineshop entsteht|online-pause|coming soon|wartungsarbeiten|passwort.gesch", re.I)

# Website-Baukästen: Kunden-Websites leben auf Subdomains DIESER Domains — genau diese
# Betriebe sind für viele ICPs (Webdesign!) die Zielgruppe. Für sie gilt der Filter nur
# exakt (Plattform-Startseite), nie für Subdomains (noise-domains.md, Abschnitt Baukästen).
BUILDER_PLATFORMS = {"jimdo.com", "jimdosite.com", "wordpress.com", "wix.com", "wixsite.com",
                     "weebly.com", "webnode.com", "webador.de", "shopify.com", "myshopify.com"}


def load_noise(path: pathlib.Path) -> tuple[set[str], list[str]]:
    """Exakte Domains und *-Wildcard-Muster aus noise-domains.md."""
    domains: set[str] = set()
    patterns: list[str] = []
    if path.exists():
        text = path.read_text(encoding="utf-8")
        for d in re.findall(r"\b([a-z0-9][a-z0-9.-]+\.[a-z]{2,})\b", text):
            domains.add(d)
        patterns = re.findall(r"\b([a-z0-9][a-z0-9*.-]*\*[a-z0-9*.-]*\.[a-z]{2,})\b", text)
    return domains, patterns


def is_noise(dom: str, noise: set[str], patterns: list[str]) -> bool:
    if dom in noise:
        return True
    if any(fnmatch.fnmatch(dom, p) for p in patterns):
        return True
    # Subdomain-Treffer (portal.gelbeseiten.de) — außer bei Baukästen, dort sind
    # Subdomains Kunden-Websites und damit potenzielle Leads.
    return any(dom.endswith("." + n) for n in noise if n not in BUILDER_PLATFORMS)


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

    noise, patterns = load_noise(args.noise)
    with open(args.infile, encoding="utf-8") as fh:
        rows = iter_results(json.load(fh))

    seen: dict[str, dict] = {}
    filtered: Counter[str] = Counter()
    for row in rows:
        dom = root_domain(row["url"])
        if not dom:
            continue
        if is_noise(dom, noise, patterns):
            filtered[dom] += 1
            continue
        if CLOSED_PATTERNS.search(row["title"] + " " + row["description"]):
            filtered[dom] += 1
            continue
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
