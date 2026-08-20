# CSV-Spalten — DAS eine Format

> Jede Stufe der Datenbeschaffung schreibt und liest exakt dieses Format. `import_leads`
> (Outreach-MCP) übernimmt davon die Kernfelder `email`, `company`, `website`, `phoneNumber`,
> `city` direkt — ALLE anderen Spalten (auch `firstName`/`lastName`!) brauchen beim Import
> eine Deklaration in `attribute_mappings`, sonst werden sie stillschweigend verworfen
> (Details: `outreach-uebergabe.md`, Schritt 3). Der App-Import bietet die Zusatzspalten
> interaktiv als Attribute an.

## Kernspalten (immer vorhanden, exakt diese Header)

| Spalte | Pflicht | Regeln |
|---|---|---|
| `email` | ja* | lowercase, getrimmt. *Pflicht erst in der ÜBERGABE-CSV (Import/CSV-Fallback). Während der Anreicherung darf sie leer sein — genau diese Zeilen füttern die Impressum-/Kontaktseiten-Stufe (build_csv.py behält sie und markiert `keine-email` in `hinweis`; erst `--require-email` bei der finalen Fassung verwirft sie) |
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

Weitere quellenspezifische Spalten sind erlaubt (z. B. `bewertung`, `reviews_count`, `linkedin_url`).
Sie stehen der Personalisierung zur Verfügung — beim MCP-Import aber NUR, wenn sie in
`attribute_mappings` deklariert sind (siehe Kopfnotiz); der App-Import bietet sie interaktiv an.

## Regeln

1. **UTF-8 mit korrekten Umlauten.** Niemals ae/oe/ue-Ersatz.
2. **Eine Zeile = ein Lead = eine eindeutige E-Mail.** Dedup passiert VOR dem Schreiben (dedup.py).
3. **Länder-Split:** je Land eine Datei (`leads-de.csv`, `leads-at.csv`, `leads-ch.csv`).
4. **Rollen-Adressen** (info@, kontakt@, office@) sind erlaubt, werden aber in `hinweis` markiert —
   die Qualifizierung entscheidet, nicht der Scraper (Trichter-Prinzip).
5. Dateinamen: `leads-<nische>-<region>-<jjjjmmtt>.csv` — z. B. `leads-shk-koeln-20260819.csv`.
