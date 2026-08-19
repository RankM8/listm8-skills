#!/usr/bin/env python3
"""Baut SERP-Queries: Suchbegriffe x Städte, plus -site:-Ausschlüsse.

    python3 build_queries.py --keywords "sanitärinstallateur,heizungsbau" --region de \
        [--cities "Köln,Bonn"] [--exclude 8] [--noise ../references/noise-domains.md]

Ausgabe: eine Query pro Zeile (das Format, das scraperlink und der offizielle
Google-Search-Actor als Multi-Query akzeptieren). Regeln: eine Region pro Lauf,
Ort steht in der Query (Geotargeting damit unnötig, belegt 19.08.2026).

--cities "" baut Queries OHNE Stadt (z. B. E-Com/überregionale Nischen);
ohne --cities gilt die Städteliste der Region.
"""
from __future__ import annotations

import argparse
import pathlib
import re

CITIES = {
    "de": ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf",
           "Leipzig", "Hannover", "Nürnberg", "Dresden", "Bremen", "Essen", "Dortmund", "Bonn"],
    "de-erweitert": ["Mannheim", "Karlsruhe", "Wiesbaden", "Münster", "Augsburg", "Aachen",
                     "Mönchengladbach", "Braunschweig", "Kiel", "Freiburg", "Krefeld", "Mainz",
                     "Lübeck", "Erfurt", "Rostock"],
    "at": ["Wien", "Graz", "Salzburg", "Linz", "Innsbruck"],
    "ch": ["Zürich", "Bern", "Basel", "Luzern", "Genf"],
}

# Die schlimmsten SERP-Treiber als Default-Ausschluss (Rest filtert process_serp.py).
DEFAULT_EXCLUDES = ["gelbeseiten.de", "11880.com", "dasoertliche.de", "myhammer.de",
                    "werkenntdenbesten.de", "check24.de", "indeed.com", "stepstone.de"]


def noise_domains(path: pathlib.Path, limit: int) -> list[str]:
    if not path.exists():
        return DEFAULT_EXCLUDES[:limit]
    text = path.read_text(encoding="utf-8")
    found = re.findall(r"\b([a-z0-9][a-z0-9.-]+\.[a-z]{2,})\b", text)
    ordered = list(dict.fromkeys(d for d in found if "*" not in d))
    return ordered[:limit]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--keywords", required=True, help="kommagetrennt")
    ap.add_argument("--region", choices=list(CITIES) + ["custom"], default="de")
    ap.add_argument("--cities", help='kommagetrennt — überschreibt --region; "" = ohne Stadt')
    ap.add_argument("--exclude", type=int, default=6,
                    help="Anzahl -site:-Ausschlüsse je Query aus noise-domains.md (0 = keine; Google mag <10)")
    ap.add_argument("--exclude-domains",
                    help='konkrete Domains statt der Zählung, kommagetrennt — z. B. der bewährte '
                         'Kern aus erfahrungswerte.md: "indeed.com,stepstone.de,kleinanzeigen.de,..."')
    ap.add_argument("--noise", type=pathlib.Path,
                    default=pathlib.Path(__file__).parent.parent / "references/noise-domains.md")
    args = ap.parse_args()

    keywords = [k.strip() for k in args.keywords.split(",") if k.strip()]
    # --cities "" ist eine bewusste Entscheidung (ohne Stadt), kein Fallback auf die Region.
    cities = (CITIES[args.region] if args.cities is None
              else [c.strip() for c in args.cities.split(",") if c.strip()])
    if args.exclude_domains is not None:
        excludes = [d.strip().lower() for d in args.exclude_domains.split(",") if d.strip()]
    else:
        excludes = noise_domains(args.noise, args.exclude) if args.exclude else []
    suffix = (" " + " ".join(f"-site:{d}" for d in excludes)) if excludes else ""

    for kw in keywords:
        for city in cities or [""]:
            print((f"{kw} {city}" if city else kw) + suffix)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
