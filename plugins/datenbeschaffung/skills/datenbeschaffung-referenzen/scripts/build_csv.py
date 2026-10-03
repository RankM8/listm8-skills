#!/usr/bin/env python3
"""Rohdaten (Apify-Dataset-JSON) -> DAS eine CSV-Format (references/csv-spalten.md).

    python3 build_csv.py --in maps.json --quelle "apify:compass/crawler-google-places 2026-08-19" \
        --out leads-shk-koeln-20260819.csv [--land de]

Versteht die Feldnamen der gepinnten Actors (Maps: title/website/emails/phone/city/categoryName;
Impressum: company_name/email/phone_number/...; generisch: email/company/...).
Dedupliziert auf E-Mail (lowercase; ohne E-Mail auf Website bzw. Firma+Stadt), normalisiert
Firmennamen (companyClean), markiert Rollen-Adressen, fehlende Websites und fehlende E-Mails
in `hinweis`.

Zeilen OHNE E-Mail bleiben standardmäßig erhalten (`keine-email` in `hinweis`) — sie sind der
Input für die Impressum-/Kontaktseiten-Stufe. Erst die finale Übergabe-CSV läuft mit
--require-email (verwirft E-Mail-lose Zeilen, siehe references/csv-spalten.md).
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
# Die Rechtsform muss ein eigenes Wort sein (Trenner oder Whitespace davor) — sonst
# verstümmelt der Suffix-Match Namen wie "Freitag" (ag), "Krug" (ug), "Sonntag" (ag).
LEGAL_SUFFIX = re.compile(
    r"(?:\s*[|–-]\s*|\s+|^)(gmbh\s*&\s*co\.?\s*kg|gmbh|ug\s*\(haftungsbeschränkt\)|ug|ag|kg|ohg|gbr|e\.\s*k\.|e\.k\.|inh\..*)$",
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
    ap.add_argument("--require-email", action="store_true",
                    help="Zeilen ohne E-Mail verwerfen — NUR für die finale Übergabe-CSV")
    args = ap.parse_args()

    with open(args.infile, encoding="utf-8") as fh:
        data = json.load(fh)

    out: dict[str, dict] = {}
    skipped_no_email = 0
    skipped_unusable = 0
    for row in data if isinstance(data, list) else [data]:
        if args.land and str(row.get("countryCode", "")).lower() not in (args.land.lower(), ""):
            continue
        email = pick(row, "email", "emails").lower()
        if "@" not in email:
            email = ""
        company = pick(row, "company", "title", "company_name", "companyName", "name")
        website = pick(row, "website", "url", "target_url", "domain")
        if website and "://" not in website:
            website = "https://" + website
        if not email:
            if args.require_email:
                skipped_no_email += 1
                continue
            if not website and not company:
                # weder anschreibbar noch anreicherbar — nutzlos
                skipped_unusable += 1
                continue
        # Dedup-Schlüssel: E-Mail; ohne E-Mail die Website (gleicher Betrieb doppelt
        # gescrapt), sonst Firma+Stadt.
        city = pick(row, "city") or pick(row.get("company_address") or {}, "city")
        key = email or (
            "site:" + re.sub(r"^https?://(www\.)?", "", website).rstrip("/").lower()
            if website else "co:" + company.lower() + "|" + city.lower()
        )
        if key in out:
            continue
        hints = []
        if email and email.startswith(ROLE_PREFIXES):
            hints.append("rollen-adresse")
        if not email:
            hints.append("keine-email")
        if not website:
            hints.append("keine-website")
        contact = row.get("contact_person") or {}
        out[key] = {
            "email": email,
            "firstName": pick(contact, "first_name") or pick(row, "firstName", "first_name"),
            "lastName": pick(contact, "last_name") or pick(row, "lastName", "last_name"),
            "company": company,
            "website": website,
            "phoneNumber": pick(row, "phoneNumber", "phone", "phone_number", "phones"),
            "city": city,
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
    no_mail = sum(1 for r in out.values() if "keine-email" in r["hinweis"])
    roles = sum(1 for r in out.values() if "rollen-adresse" in r["hinweis"])
    report = (f"Leads: {len(out)} | ohne E-Mail (Impressum-Kandidaten): {no_mail} | "
              f"ohne Website: {no_web} | Rollen-Adressen: {roles}")
    if skipped_no_email:
        report += f" | verworfen (--require-email): {skipped_no_email}"
    if skipped_unusable:
        report += f" | verworfen (weder E-Mail noch Website/Firma): {skipped_unusable}"
    print(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
