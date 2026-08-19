---
name: listen-qualitaet
description: Pflicht-Endstation jedes Datenbeschaffungs-Laufs — turns a raw scrape CSV into a verified, deduplicated list handed over to the Outreach app (or a clean CSV without MCP). Invoked by the datenbeschaffung master after every weg-* skill; also usable directly when the user says "Liste prüfen", "Liste bereinigen", "Leads qualitätssichern", "Liste importieren".
---

# Listen-Qualität — die Pflicht-Endstation

Nimmt die Roh-CSV eines Weg-Skills (Format: `../datenbeschaffung-referenzen/references/csv-spalten.md`) und macht daraus
eine übergebene, rückverfolgbare Liste. Kein Weg endet ohne diesen Skill.

Trichter-Prinzip beachten: Diese Stufe sortiert MECHANISCH (Duplikate, Sperren, kaputte Daten) und
prüft per Stichprobe. Sie beurteilt NICHT die inhaltliche Passung einzelner Leads — das macht die
Qualifizierung in der App, und die arbeitet bewusst offen.

## Schritt 1 — Format & Datenqualität

`build_csv.py` hat das meiste erledigt; hier nur verifizieren:

- Header exakt wie `csv-spalten.md`, UTF-8, korrekte Umlaute
- `quelle`-Spalte gefüllt (Actor + Datum) — ohne Herkunft keine Übergabe
- Auffälligkeiten aus `hinweis` zusammenfassen: Anteil `rollen-adresse` (info@ ist ok, aber
  berichten), Anteil `keine-website` (die bekommen zwangsläufig den schwächsten
  Personalisierungs-Anker — bei > 30 % dem Nutzer anbieten, sie in eine eigene Datei abzuspalten)

## Schritt 2 — Dedup + Bestand-Abgleich

MIT MCP (`outreach-uebergabe.md`, Schritt 0, falls in Phase 3 des Masters noch nicht geschehen):

```
export_leads(format="index")  →  bestand-index.json
python3 ../datenbeschaffung-referenzen/scripts/dedup.py --index bestand-index.json --in roh.csv --out neu.csv
```

Der Report nennt: behalten / schon im Bestand / **do_not_contact entfernt** (namentlich, die werden
NIE angeschrieben) / Domain-Warnungen. OHNE MCP: dedup.py mit leerem Index laufen lassen
(dedupliziert dann nur innerhalb der Datei) und im Bericht sagen, dass der Bestand-Abgleich fehlte.

## Schritt 3 — Verifizierung

Regel aus `apify-actors.md`: Verifizierung ist ein eigener Schritt (0,0006 $/Adresse,
`michael.g/email-verifier-validator`) — **außer** der Weg hat schon validiert (Impressum-Primär
liefert `email_status` mit; dann nur UNDELIVERABLE aussortieren). Kosten vorher nennen (Leitsatz 2
des Masters). Ergebnis: nur zustellbare Adressen bleiben; Bounce-Ziel < 3 %.

## Schritt 4 — 20er-Sample (die eine strenge Prüfung)

20 zufällige Leads von Hand prüfen — Website öffnen ist erlaubt und erwünscht. Je Lead eine Frage:
**Ist das plausibel ein potenzieller Kunde laut ICP-Satz?**

- **≥ 16 / 20 passen** → Liste ist gut. Weiter.
- **< 16 / 20** → NICHT nachpolieren, sondern die Ursache beheben: Query/Filter im Weg-Skill
  nachschärfen und den Scrape wiederholen (der Pilot hätte das meist gezeigt). Handpolieren einer
  schiefen Liste ist verlorene Zeit — Trichter-Prinzip heißt nicht „Müll durchwinken".

Dem Nutzer die Stichprobe zeigen (Firma, Website, passt/passt-nicht mit einem Halbsatz).

## Schritt 5 — Übergabe

`../datenbeschaffung-referenzen/references/outreach-uebergabe.md` folgen:

- MIT MCP: `check_leads_exist` (Autoritäts-Check) → `create_list` (mit Herkunft + realen Kosten) →
  `import_leads(list_id, attribute_mappings)` → `get_job_status` → Report-Zahlen 1:1 berichten.
  In eine Kampagne (`add_leads_to_campaign`) nur auf ausdrücklichen Wunsch.
- OHNE MCP: finale CSV liefern + Import-Anleitung, mit dem ehrlichen Hinweis, welche Prüfungen
  (Bestand, do_not_contact) erst der App-Import übernimmt.

## Schritt 6 — Abschlussbericht

Eine Tabelle: roh → nach Dedup/Bestand → nach Verifizierung → Sample-Quote → übergeben.
Dazu reale Kosten des Gesamtlaufs und die eine Lernnotiz für den nächsten Lauf (z. B. „Kategorie X
war Beifang → in den Anti-ICP" oder „Portal Y in noise-domains.md ergänzt").
