---
name: weg-c-local-maps
description: Weg C des Datenbeschaffungs-Pakets — local businesses (Handwerk, Praxen, Gastro, Dienstleister mit Google-Maps-Eintrag) via Google Maps scraping with built-in contact enrichment. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg C — Local Business über Google Maps

Der Standardweg für die meisten DACH-Zielgruppen. Belegt (19.08.2026, SHK Köln): 440 Places in
10 Minuten, **77 % mit E-Mail direkt aus dem Scrape** — einstufig für die große Mehrheit,
Impressum nur noch als Lückenfüller.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`../datenbeschaffung-referenzen/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden).

## Schritt 1 — Kategorien statt Freitext

**Nie Freitext-Queries.** Google Maps arbeitet mit englischen Kategorien — Freitext liefert
überwiegend Beifang. 3–5 verwandte Kategorien je Lauf, nicht 20:

| Zielgruppe | Kategorien (searchStringsArray) |
|---|---|
| SHK / Sanitär / Heizung | `plumber`, `heating contractor`, `hvac contractor` |
| Elektro | `electrician`, `electrical installation service` |
| Dachdecker / Bau | `roofing contractor`, `general contractor` |
| Zahnärzte / Praxen | `dentist`, `dental clinic` (Vorsicht: `doctor` ist zu breit) |
| Gastro | `restaurant` gezielt mit Küche/Stadtteil eingrenzen — sonst Massen-Beifang |
| Kfz | `auto repair shop`, `car dealer` |

Unbekannte Zielgruppe: die Kategorie eines bekannten Ziel-Betriebs auf Google Maps nachschlagen
(dort steht sie unter dem Namen) — nicht raten.

## Schritt 2 — Pilot (Pflicht)

Actor: **Primär aus `../datenbeschaffung-referenzen/references/apify-actors.md`** (Maps-Kategorie). Standard-Input:

```json
{
  "searchStringsArray": ["<kategorie-1>", "<kategorie-2>"],
  "locationQuery": "<Pilotstadt>, <Land>",
  "maxCrawledPlacesPerSearch": 30,
  "language": "de",
  "website": "withWebsite",
  "skipClosedPlaces": true,
  "scrapeContacts": true
}
```

Deckel ≤ 0,50 $. Kosten vorher nennen (Pilot liegt unter 0,25 $, siehe `kosten.md`).
Auswertung: `categoryName` gegen den ICP halten — **ab ~70 % Fit skalieren**, darunter Kategorien
schärfen und Pilot wiederholen. Beifang-Kategorien (Baumärkte, Handel, Ketten) notieren: sie werden
in Schritt 4 herausgefiltert und wandern in den Anti-ICP.

Hinweis zum `website`-Filter: `withWebsite` ist für Cold Mail fast immer richtig (ohne Website kein
Personalisierungs-Anker). Ausnahme nur, wenn der ICP gerade Betriebe OHNE Website sucht
(z. B. Webdesign-Angebote) — dann `allPlaces` und die Lücke ist das Verkaufsargument.

## Schritt 3 — Skalierung

Gleicher Input, `maxCrawledPlacesPerSearch` hoch (250–500 je Kategorie), `locationQuery` kann
direkt Bundesland oder Land sein (der Actor teilt intern — keine Stadt-Schleife nötig, siehe
`staedte.md`). Ein Land pro Lauf. Deckel: kalkulierte Kosten + 50 %.
Laufzeit: mehrere Minuten je 100 Places — alle 2–4 Minuten pollen.

## Schritt 4 — Roh-CSV bauen

```
python3 ../datenbeschaffung-referenzen/scripts/build_csv.py --in maps.json \
  --quelle "apify:<actor-id> <datum>" --land <de|at|ch> --out leads-<nische>-<region>-<datum>.csv
```

Danach ICP-Fremde Kategorien aussortieren (die notierten Beifang-Kategorien) — mechanisch nach
`kategorie`-Spalte, nicht Lead für Lead.

## Schritt 5 — Die E-Mail-Lücke (die ~20–25 % ohne E-Mail)

Nur wenn das Volumen gebraucht wird ODER Entscheider-Namen gewünscht sind:
`impressum-enrichment` mit den Websites der Leads ohne E-Mail aufrufen. Sonst die Lücke
akzeptieren (Trichter-Prinzip) und weitergeben.

## Schritt 6 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und
keine Übergabe.

## Bekannte Fallen

- Duplikate über Kategorien hinweg dedupliziert der Actor per placeId selbst; über LÄUFE hinweg
  fängt es `dedup.py` (Bestand-Index) — deshalb Vorab-Abgleich nicht überspringen.
- Ballungsräume doppeln Betriebe mit mehreren Standorten — gleiche E-Mail = ein Lead
  (macht build_csv.py automatisch; 440 Places → ~308 eindeutige E-Mail-Leads ist normal).
- Jeder zusätzliche Filter kostet je Place extra — nur nutzen, was der ICP wirklich braucht.
