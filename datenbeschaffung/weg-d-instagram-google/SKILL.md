---
name: weg-d-instagram-google
description: Weg D des Datenbeschaffungs-Pakets — B2C coaches and personal brands found through Google SERP with the site:instagram.com strategy, then qualified via Instagram profile data (bio, link in bio, follower count). Contact path runs profile link → website → Impressum, never through Instagram itself. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg D — Instagram-Coaches über Google

Der Weg für B2C-Coaches (Fitness, Ernährung, Mindset, Dating, Spiritualität): Sie haben selten einen
Google-Maps-Eintrag und oft keine klassische Firmen-Website, aber fast immer ein Instagram-Profil.
Google indexiert diese Profile samt Anzeigename und Bio-Anfang — das ergibt eine billige Vorstufe,
bevor Instagram selbst angefasst wird.

Zusatznutzen: Wer mit seinem Profil bei Google rankt, ist meist professioneller aufgestellt als der
Durchschnitt der Nische.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`../datenbeschaffung-referenzen/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden).

## Ehrliche Erwartungswerte (vor dem ersten Lauf nennen)

- **Google deckelt `site:`-Suchen.** Eine `site:instagram.com`-Query liefert real nur ~50–80
  Ergebnisse, egal wie viele Seiten angefordert werden; ab Seite 3–4 kommt kaum Neues. Das ist eine
  technische Grenze, kein Query-Problem — die Antwort darauf sind **mehr Queries, nicht mehr Seiten**.
- **Trefferquote:** ~50–80 % relevante Coach-Profile nach dem Filtern. Höher als bei anderen
  Instagram-Wegen, weil `site:instagram.com` plus Nischenbegriff schon stark vorfiltert.
- **Link in Bio:** ~70–80 % der Coaches haben einen (Website, Linktree, Calendly).
- **E-Mail/Telefon direkt aus Instagram: fast nie.** Coaches arbeiten mit DM-Funnels und
  Landingpages. Der Kontaktweg ist Profil-Link → Website → Impressum.

## Schritt 1 — Queries in drei Schichten bauen

Coaches formulieren ihre Bios sehr unterschiedlich, deshalb drei Query-Typen kombinieren statt eine
perfekte Query zu suchen:

| Schicht | Muster | Wofür |
|---|---|---|
| 1 — exakt | `site:instagram.com "Fitness Coach" Köln` | höchste Präzision, Brot und Butter |
| 2 — breit | `site:instagram.com Fitness Coach Köln` | fängt „Fitness \| Coach", „Dein Coach für …" |
| 3 — ortsunabhängig | `site:instagram.com "Fitness Coach" Deutschland` / `Germany` / `coaching` | Instagram-Profile ranken oft NICHT stadtspezifisch — diese Schicht ist Pflicht, nicht Kür |

Fürs Premium-Segment die Verkaufs-Signale in die Query nehmen: `"1:1"`, `"Erstgespräch"`,
`"Online Coaching"`, `"Link in Bio"`. Weniger Ergebnisse, aber sehr hohe Trefferquote.

Städte aus `../datenbeschaffung-referenzen/references/staedte.md`, eine Region pro Durchlauf. Deutsche und englische
Begriffe mischen. `-site:`-Ausschlüsse sind hier überflüssig — `site:instagram.com` filtert bereits.

**Nicht `build_queries.py` verwenden:** Das Skript baut Firmen-SERP-Queries mit `-site:`-Ausschlüssen
und passt zu diesem Weg nicht. Die Queries hier von Hand zusammenstellen, eine je Zeile.

## Schritt 2 — SERP-Pilot

SERP-Actor: **Primär aus `../datenbeschaffung-referenzen/references/apify-actors.md`**. Alle Queries eines Laufs als
Multi-Query (eine je Zeile) übergeben — maximal ~20 Queries je Lauf, sonst steigt die Block-Rate.
`maxPagesPerQuery: 3–4` reicht (siehe Deckelung oben), Länder-Code passend zur Region.

Kosten vorher nennen (SERP ist der billige Teil, Größenordnung in `kosten.md`), Deckel ≤ 0,50 $.
Pilot: 2–3 Städte plus die ortsunabhängigen Queries.

## Schritt 3 — Profil-URLs herausziehen (Prüfregeln)

**`process_serp.py` hier NICHT verwenden:** Es filtert gegen `noise-domains.md`, und dort steht
instagram.com — es würde genau die gesuchten Treffer wegwerfen. Stattdessen mechanisch nach diesen
Regeln aus dem SERP-Dataset filtern:

1. Nur URLs der Form `instagram.com/<username>/` behalten. Raus fliegen `/p/`, `/reel/`, `/reels/`,
   `/tv/`, `/stories/`, `/explore/`, `/locations/` und Hashtag-Seiten.
2. Username aus dem Pfad ziehen, kleinschreiben, **darauf deduplizieren** — dieselbe Person taucht
   über mehrere Queries auf.
3. Anzeigename, Bio-Anfang und (falls vorhanden) den Follower-Hinweis aus Titel und Snippet
   übernehmen — das ist die kostenlose Vorqualifizierung.
4. Offensichtliche Nicht-Personen aussortieren: Magazine, Listen-Artikel, Marken- und Studio-Accounts
   ohne Personenbezug.

Auswertung dem Nutzer zeigen (gefundene Profile, Anteil mit Follower-Hinweis, 5–10 Beispiele) und
gegen den ICP halten: **ab ~70 % Fit skalieren**, darunter Query-Schichten nachschärfen. Die gemessene
Quote je Query-Schicht gehört mit Datum nach `../datenbeschaffung-referenzen/references/erfahrungswerte.md`.

## Schritt 4 — Skalierung

Restliche Städte und Nischenbegriffe als weitere Multi-Query-Läufe fahren, Ergebnisse
zusammenführen, erneut auf Username deduplizieren. Deckel: kalkulierte Kosten + 50 %.

## Schritt 5 — Instagram-Profile qualifizieren

Erst jetzt kostet es spürbar mehr je Datensatz. Actor für die Profil-Qualifizierung: **aus
`apify-actors.md`** (Instagram-Kategorie, Qualifizierung). Vor dem Lauf den aktuellen Preis über die
Actor-Details prüfen, dem Nutzer nennen und — wenn er in `kosten.md` noch fehlt — dort mit Datum
ergänzen. Keine Preise raten.

Was der Schritt liefert und wofür es taugt:

- **Follower-Zahl** (exakt statt Google-Schätzung) — Segmentierung
- **Vollständige Bio** — Personalisierungs-Anker
- **Link in Bio** — die eigentliche Kontakt-Quelle; nach Typ sortieren: eigene Website
  (→ `impressum-enrichment`, im DACH-Raum steht dort E-Mail und Telefon), Linktree/Beacons
  (mehrere Wege), Calendly (Coach sucht aktiv Kunden), kein Link (nur per DM erreichbar — für
  Cold Mail wertlos)
- **`relatedProfiles`**, falls der Actor sie mitliefert: kostenlose Zusatz-Leads, gegen die bekannten
  Usernames deduplizieren und dem Nutzer als optionale zweite Runde anbieten

## Schritt 6 — Roh-CSV bauen

```
python3 ../datenbeschaffung-referenzen/scripts/build_csv.py --in profile.json \
  --quelle "apify:<actor-id> <datum>" --land <de|at|ch> --out leads-<nische>-<region>-<datum>.csv
```

`instagram_url`, `follower`, `bio` und `link_typ` als Zusatzspalten mitgeben (`csv-spalten.md`).
Zeilen ohne E-Mail bleiben ohne E-Mail — die Impressum-Stufe entscheidet, ob daraus ein Lead wird.

## Schritt 7 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und keine
Übergabe.

## Bekannte Fallen und Plattform-Risiken

- **Instagram-Scraping ist volatil.** Actors brechen nach Plattform-Änderungen ohne Vorwarnung. Bei
  leeren oder halben Ergebnissen erst den Actor-Status prüfen, nicht die Queries umbauen.
- **Google-Snippets sind gecacht:** Follower-Zahlen aus dem Snippet können Monate alt sein. Verbindlich
  ist erst der Profil-Scrape.
- **Verschwundene Profile:** Von Google indexierte Accounts existieren nicht immer noch — leere
  Rückgaben sind normal, die Zeilen einfach überspringen.
- **ToS:** Nur öffentlich sichtbare Profildaten, kein Login, keine Ansprache über DMs. Kontaktiert
  wird ausschließlich über die E-Mail aus dem Impressum.
