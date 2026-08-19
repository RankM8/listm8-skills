#!/usr/bin/env python3
"""Rohdaten (Apify-Dataset-JSON) -> DAS eine CSV-Format (references/csv-spalten.md).

    python3 build_csv.py --in maps.json --quelle "apify:compass/crawler-google-places 2026-08-19" \
        --out leads-shk-koeln-20260819.csv [--land de]

Versteht die Feldnamen der gepinnten Actors (Maps: title/website/emails/phone/city/categoryName;
Impressum: company_name/email/phone_number/...; generisch: email/company/...).
Dedupliziert auf E-Mail (lowercase), normalisiert Firmennamen (companyClean), markiert
Rollen-Adressen und fehlende Websites in `hinweis`.
"""
from __future__ import annotations

import argparse
import csv
import json
import re

FIELDS = ["email", "firstName", "lastName", "company", "website", "phoneNumber", "city",
          "kategorie", "quelle", "companyClean", "hinweis"]
ROLE_PREFIXES = ("info@", "kontakt@", "office@", "mail@", "hallo@", "hello@", "service@",
                 "kontakt.", "buero@", "zentrale@", "post@")
LEGAL_SUFFIX = re.compile(
    r"\s*(\||-|–)?\s*(gmbh\s*&\s*co\.?\s*kg|gmbh|ug\s*\(haftungsbeschränkt\)|ug|ag|kg|ohg|gbr|e\.\s*k\.|e\.k\.|inh\..*)$",
    re.I)


def clean_company(name: str) -> str:
    base = name.split("|")[0].split("—")[0].split(" – ")[0].strip()
    prev = None
    while prev != base:
        prev = base
        base = LEGAL_SUFFIX.sub("", base).strip(" ,-")
    return base or name.strip()


def pick(row: dict, *keys: str) -> str:
    for k in keys:
        v = row.get(k)
        if isinstance(v, list):
            v = v[0] if v else None
        if v:
            return str(v).strip()
    return ""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="infile", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--quelle", required=True, help='z. B. "apify:compass/crawler-google-places 2026-08-19"')
    ap.add_argument("--land", help="nur Zeilen mit diesem countryCode behalten (de/at/ch)")
    args = ap.parse_args()

    with open(args.infile, encoding="utf-8") as fh:
        data = json.load(fh)

    out: dict[str, dict] = {}
    skipped_no_email = 0
    for row in data if isinstance(data, list) else [data]:
        if args.land and str(row.get("countryCode", "")).lower() not in (args.land.lower(), ""):
            continue
        email = pick(row, "email", "emails").lower()
        if not email or "@" not in email:
            skipped_no_email += 1
            continue
        if email in out:
            continue
        company = pick(row, "company", "title", "company_name", "companyName", "name")
        website = pick(row, "website", "url", "target_url", "domain")
        if website and "://" not in website:
            website = "https://" + website
        hints = []
        if email.startswith(ROLE_PREFIXES):
            hints.append("rollen-adresse")
        if not website:
            hints.append("keine-website")
        contact = row.get("contact_person") or {}
        out[email] = {
            "email": email,
            "firstName": pick(contact, "first_name") or pick(row, "firstName", "first_name"),
            "lastName": pick(contact, "last_name") or pick(row, "lastName", "last_name"),
            "company": company,
            "website": website,
            "phoneNumber": pick(row, "phoneNumber", "phone", "phone_number", "phones"),
            "city": pick(row, "city") or pick(row.get("company_address") or {}, "city"),
            "kategorie": pick(row, "kategorie", "categoryName", "category", "branche"),
            "quelle": args.quelle,
            "companyClean": clean_company(company) if company else "",
            "hinweis": ";".join(hints),
        }

    with open(args.out, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(out.values())

    no_web = sum(1 for r in out.values() if "keine-website" in r["hinweis"])
    roles = sum(1 for r in out.values() if "rollen-adresse" in r["hinweis"])
    print(f"Leads: {len(out)} | ohne E-Mail übersprungen: {skipped_no_email} | "
          f"ohne Website: {no_web} | Rollen-Adressen: {roles}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
