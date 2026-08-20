---
name: outscraper-bulk
description: Stufe 2 des Datenbeschaffungs-Pakets — bulk Google Maps harvesting via Outscraper for very large volumes (>10.000 leads, whole countries) where a 12-24 hour job turnaround is acceptable. Never the first option; the Apify routes deliver in minutes. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Outscraper-Bulk — die zweite Stufe für sehr große Volumina

> ## ⚠️ Laufzeit: 12–24 Stunden je Job
> Das ist keine Ausnahme, das ist der Normalfall. Deshalb ist dieser Weg **nie die erste Wahl**:
> `weg-c-local-maps` liefert dieselbe Datenart über Apify in Minuten. Outscraper lohnt erst, wenn
> ein Lauf mehrere Bundesländer oder Kantone in einem Rutsch abräumen soll und der Nutzer die
> Wartezeit ausdrücklich akzeptiert. Diese Warnung gehört ungefragt in den ersten Satz, bevor
> irgendein Job startet.

Sinnvoll ab: **>10.000 Leads**, ganze Länder, wiederkehrende Flächen-Scrapes. Darunter ist der
Apify-Weg schneller, billiger zu steuern und iterativ korrigierbar.

## Pilot-Pflicht (Leitsatz 3 des Masters — gilt HIER erst recht)

Kein Flächenjob ohne Pilot: Bei 12–24 h Laufzeit merkt der Nutzer eine falsche Kategorie
oder Region erst einen Tag und viel Geld später. Deshalb VOR dem großen Job:

1. **Pilot über `weg-c-local-maps`** (Apify, Minuten statt Stunden) mit denselben Kategorien
   auf EINER repräsentativen Stadt der Zielfläche — 30–50 Places reichen.
2. **~70 %-Schwelle:** Passen mindestens ~70 % der Pilot-Treffer zum ICP-Satz, ist die
   Kategorien-Wahl bestätigt. Darunter: Kategorien nachschärfen und Pilot wiederholen —
   NICHT den Flächenjob starten.
3. Erst danach den Outscraper-Job bauen (Schritt 2) — mit exakt den pilot-bestätigten Kategorien.

## Zugang (nicht Apify)

Outscraper ist ein eigener Anbieter mit eigenem Konto und eigenem Schlüssel — `zugriff.md` gilt hier
nicht. Gebraucht wird ein `OUTSCRAPER_API_KEY`; Jobs laufen gegen `POST /tasks` mit dem Header
`X-API-KEY`, der Status über `GET /requests/{id}`.

Drei Regeln, die sonst Arbeit kosten:

1. **`"ui": true` in jedem Job.** Ohne dieses Feld erscheint der Job nicht im Web-Dashboard
   (app.outscraper.com/tasks) — und das Dashboard ist bei 12–24 h die einzige brauchbare
   Kontrollfläche.
2. **Nicht durchgehend pollen.** Kurz nach dem Start einmal den Status prüfen, dann das Dashboard.
3. **Ergebnisse sind nur ~2 Stunden nach Abschluss über die API abrufbar**, im Dashboard länger.
   Wer nachts fertig wird, holt die Datei morgens aus dem Dashboard — nicht per API.

## Schritt 1 — Kategorien statt Freitext

Wie bei Weg C gilt: **englische Google-Maps-Kategorien, nie Freitext.** Freitext liefert
erfahrungsgemäß rund 85 % Müll. `language: "de"` sorgt trotzdem für deutsche Ergebnisfelder.

Erfahrungswerte aus echten Läufen (E-Mail-Rate = Anteil mit Adresse im Rohergebnis):

| Kategorie | Menge | E-Mail-Rate | Bewertung |
|---|---|---|---|
| `medical spa` | hoch | ~70 % | Kern-Kategorie Beauty/Medical |
| `skin care clinic` | mittel | ~75 % | spezialisiert, sehr gute Qualität |
| `plastic surgeon` / `cosmetic surgeon` | niedrig | ~80 % | Premium-Leads, untereinander stark überlappend |
| `beauty salon` | sehr hoch | ~65 % | breit, gute Ausbeute |
| `medical clinic` | hoch | ~60 % | viele Allgemeinmediziner — nur mit Anti-ICP |
| `internet marketing service` | hoch | ~70 % | Marketing/SEO |
| `financial consultant` | hoch | ~65 % | breite Finanz-Kategorie |
| `doctor` | sehr hoch | ~50 % | **vermeiden** — zu breit, frisst das Limit |
| `restaurant` | extrem hoch | — | nur mit enger Region, sonst Massen-Beifang |
| `plumber` | hoch | niedrig | Handwerk hat oft keine E-Mail hinterlegt |

Faustregeln: 3–5 verwandte Kategorien liefern bessere Listen als 20; sich stark überlappende
Kategorien (`plastic surgeon` + `cosmetic surgeon`) erzeugen vor allem Duplikate; `exactMatch: true`
reduziert Müll, funktioniert aber nur mit offiziellen Google-Kategorien. Neue gemessene
Kategorie-Werte gehören mit Datum nach `../datenbeschaffung-referenzen/references/erfahrungswerte.md`.

## Schritt 2 — Job bauen

Der Job ist eine JSON-Konfiguration für `google_maps_service_v2`. Die Regeln, die den Unterschied
machen:

- **Maximal ~10 Kategorien je Job** — mehr treibt nur die Duplikatenrate.
- **Ein Land je Job.** `region` und die `locations` müssen zusammenpassen; Länder mischen macht
  Dedup und CSV-Split kaputt.
- **`ui: true`** (siehe oben).
- `locations` im Format `"<Land>><Region>"`, z. B. `CH>Kanton Zürich`, `DE>Bayern`, `AT>Wien` —
  Regionen des Ziellandes, nicht Städte.
- `enrichments: ["contacts_n_leads", "emails_validator_service"]` — Kontaktdaten plus SMTP-Prüfung;
  ohne die zweite ist der Filter in Schritt 4 nicht möglich.
- `limit` (Gesamt) und `organizationsPerQueryLimit` (je Query) bewusst setzen — sie deckeln die Kosten.
- `dropDuplicates: "true"`, `useZipCodes: true` für tiefere Abdeckung.
- `ignoreWithoutEmails: false` lassen: aussortiert wird später mechanisch, nicht beim Scrape
  (Trichter-Prinzip).

Kosten je Lauf vorab beim Anbieter kalkulieren und dem Nutzer nennen — Leitsatz 2 des Masters gilt
auch hier, obwohl `kosten.md` nur Apify-Preise belegt.

## Schritt 3 — Ergebnis holen

Nach Abschluss die Datei aus dem Dashboard laden (XLSX oder CSV). **Keine Ablage-Struktur im Repo, kein
Scrape-Log, keine Tracking-Datei pflegen** — die Herkunft und der Bestand leben in der App
(`../datenbeschaffung-referenzen/references/outreach-uebergabe.md`, `create_list` mit `source`). Wer wissen will, was schon
gescrapt wurde, fragt die Listen der App ab, nicht eine Markdown-Datei.

## Schritt 4 — SMTP-Status filtern (der eine harte Filter)

Die Spalte `email.emails_validator.status` entscheidet:

| Status | Aktion |
|---|---|
| `RECEIVING` | **behalten** — Server nimmt Mail an |
| `UNKNOWN` | entfernen (Catch-All, Timeout) |
| `INVALID` | entfernen |
| `BLACKLISTED` | entfernen |
| leer | entfernen (keine Adresse) |

Erfahrungswert der Verteilung: **~71 % RECEIVING, ~15 % INVALID, ~13 % UNKNOWN.** Gut ein Viertel des
Rohergebnisses fällt hier also weg — die Zahl vorher nennen, sonst wirkt die fertige Liste überraschend
klein. `UNKNOWN` ist bewusst kein Grenzfall: Catch-All-Adressen treiben die Bounce-Rate, und die
Zustellbarkeit der Domain ist wertvoller als der einzelne Lead.

Wo Alt-Dateien noch `email_1`/`email_2`/`email_3` statt `email` enthalten (Format vor März 2025):
`email_1` in `email` überführen, den zugehörigen Validator-Status mitnehmen, Rest verwerfen.

## Schritt 5 — Roh-CSV bauen

Spalten-Zuordnung: `name` → `company`, `email` → `email`, `site` → `website`, `phone` →
`phoneNumber`, `city` → `city`, `category` → `kategorie`. Danach in das eine Format bringen:

```
python3 ../datenbeschaffung-referenzen/scripts/build_csv.py --in outscraper.json \
  --quelle "outscraper:google_maps_service_v2 <datum>" --land <de|at|ch> \
  --out leads-<nische>-<region>-<datum>.csv
```

Deduplizierung über Läufe hinweg macht `../datenbeschaffung-referenzen/scripts/dedup.py` gegen den Bestandsindex — nicht von
Hand, und nicht über eine eigene Konsolidierungs-Datei.

## Schritt 6 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und keine
Übergabe.

## Bekannte Fallen

- **Job gestartet, aber unsichtbar** → `ui: true` vergessen. Der Job läuft trotzdem; die Request-ID
  aus der Startantwort ist dann der einzige Zugriff.
- **Ergebnis weg** → die 2-Stunden-Frist der API verstrichen. Immer aus dem Dashboard laden.
- **Riesige Rohdatei, kleine Liste** → normal: SMTP-Filter (~29 %) und Bestand-Abgleich ziehen
  zusammen deutlich ab. Beide Stufen im Bericht getrennt ausweisen.
- **Spaltenzahl schwankt** je nach Job-Alter (94–158 Spalten) — nie auf Spaltenpositionen verlassen.
