# CSV-Spalten — DAS eine Format

> Jede Stufe der Datenbeschaffung schreibt und liest exakt dieses Format. Es ist deckungsgleich
> mit dem, was `import_leads` (Outreach-MCP) und der App-Import erwarten — die Übergabe ist damit
> ein Mapping-freier Schritt.

## Kernspalten (immer vorhanden, exakt diese Header)

| Spalte | Pflicht | Regeln |
|---|---|---|
| `email` | ja | lowercase, getrimmt. Ohne gültige E-Mail keine Zeile |
| `firstName` | nein | leer lassen statt raten — eine kaputte Anrede killt die Mail |
| `lastName` | nein | dito |
| `company` | nein | Anzeigename; Normalisierung (GmbH-Zusätze) macht build_csv.py in `companyClean` |
| `website` | nein* | mit Protokoll (https://…). *Praktisch Pflicht: ohne Website kein Personalisierungs-Anker — Leads ohne Website markiert build_csv.py in `hinweis` |
| `phoneNumber` | nein | E.164 bevorzugt (+49 …) |
| `city` | nein | Stadtname ohne PLZ |

## Zusatzspalten (werden beim Import zu Custom-Attributen)

| Spalte | Inhalt |
|---|---|
| `kategorie` | Branche/Kategorie aus der Quelle (z. B. Google-Maps-categoryName) |
| `quelle` | Herkunftsvermerk: `apify:<actor> <datum>` — Pflicht, macht Läufe rückverfolgbar |
| `companyClean` | normalisierter Firmenname für die Ansprache („Müller Bau" statt „Müller Bau GmbH & Co. KG") |
| `hinweis` | maschinelle Anmerkungen (z. B. `keine-website`, `rollen-adresse`) |

Weitere quellenspezifische Spalten sind erlaubt (z. B. `bewertung`, `reviews_count`, `linkedin_url`) —
sie wandern beim Import als Custom-Attribute mit und stehen der Personalisierung zur Verfügung.

## Regeln

1. **UTF-8 mit korrekten Umlauten.** Niemals ae/oe/ue-Ersatz.
2. **Eine Zeile = ein Lead = eine eindeutige E-Mail.** Dedup passiert VOR dem Schreiben (dedup.py).
3. **Länder-Split:** je Land eine Datei (`leads-de.csv`, `leads-at.csv`, `leads-ch.csv`).
4. **Rollen-Adressen** (info@, kontakt@, office@) sind erlaubt, werden aber in `hinweis` markiert —
   die Qualifizierung entscheidet, nicht der Scraper (Trichter-Prinzip).
5. Dateinamen: `leads-<nische>-<region>-<jjjjmmtt>.csv` — z. B. `leads-shk-koeln-20260819.csv`.
