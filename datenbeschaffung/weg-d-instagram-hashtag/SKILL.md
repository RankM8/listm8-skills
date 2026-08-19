---
name: weg-d-instagram-hashtag
description: Weg D des Datenbeschaffungs-Pakets — B2C coaches found through the hashtags they actually post under, discovered from 8-10 reference accounts instead of guessed, then classified by post caption signals. Complements the Google route by reaching coaches who rank nowhere. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg D — Instagram-Coaches über Hashtags

Der Weg für B2C-Coaches, die bei Google nicht auftauchen, aber regelmäßig posten. Gefunden werden sie
über die Hashtags ihrer Beiträge — und der Scrape liefert die **komplette Post-Caption** mit: Man
sieht, wie sich jemand positioniert, bevor man einen Cent für Profildaten ausgibt.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`_shared/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden).

## Ehrliche Erwartungswerte (vor dem ersten Lauf nennen)

- **Viele erfahrene Coaches nutzen kaum noch Hashtags.** Die Discovery in Schritt 1 kann dünn
  ausfallen — das ist ein valides Ergebnis, kein Fehler.
- **Ausbeute hängt fast vollständig am Tag:** nischenspezifische Tags (`#personaltrainerdeutschland`,
  `#beziehungscoach`) liefern 20–40 % Coaches, generische Tags (`#fitness`, `#motivation`) unter 5 %.
  Dort posten Privatpersonen.
- **Dieselben Accounts kommen mehrfach** — einmal je Post und je Hashtag. Die Rohzahl der Posts ist
  nie die Zahl der Leads; das gehört so in jeden Zwischenbericht.
- **Kontaktdaten:** `businessEmail` ist bei Coaches fast immer leer. Der Kontaktweg führt über
  Profil-Link → Website → Impressum.

## Schritt 1 — Hashtags datenbasiert finden (statt raten)

Nicht mit einer geratenen Tag-Liste starten. Stattdessen 8–10 Referenz-Coaches der Nische nehmen —
vom Nutzer genannt oder über eine Websuche zusammengestellt — und deren letzte Posts lesen.

1. Accounts kurz prüfen: existiert er, ist er öffentlich, wird regelmäßig gepostet? Fällt mehr als
   die Hälfte aus, lieber neu recherchieren als mit vier Accounts weiterarbeiten.
2. Posts scrapen (Discovery-Actor aus `_shared/references/apify-actors.md`, Instagram-Kategorie),
   **8 Posts je Account reichen** — gebraucht werden nur die Hashtags, nicht der Content.
3. Hashtags aus den Captions zählen, und zwar zweidimensional: wie oft insgesamt **und bei wie vielen
   verschiedenen Accounts**. Sortiert wird nach der Zahl der Accounts.

Auswahlregeln für die Tag-Liste:

- Tags, die nur **ein** Account nutzt, fliegen raus — das sind Markennamen oder Programmtitel.
- Tags, die **mehrere** Referenz-Coaches nutzen, sind die Kandidaten für den Piloten.
- Generische Ein-Wort-Tags (`#fitness`, `#liebe`, `#erfolg`) fliegen raus, auch wenn sie oft
  vorkommen — sie ziehen Privatpersonen an.

Ergibt die Discovery zu wenig, die gefundenen Tags als Startpunkt behalten und mit nischenspezifischen
Vorschlägen ergänzen. Dem Nutzer dabei sagen, welche Tags gemessen und welche vorgeschlagen sind.

### DACH-Targeting läuft über die Sprache des Tags

Englische Tags (`#personaltrainer`, `#lifecoach`) liefern überwiegend internationale Accounts. Für
DACH deutsche Varianten oder Stadtnamen im Tag nutzen (`#personaltrainerdeutschland`,
`#beziehungscoach`, `#lebensberatung`) — der größte einzelne Hebel auf die Ergebnisqualität.

## Schritt 2 — Erkennungsmerkmale festlegen (vor dem Scrape)

Aus dem ICP-Satz die Signale ableiten, an denen später klassifiziert wird. Vier Gruppen, je 5–20
Begriffe, gemeinsam mit dem Nutzer bestätigt:

| Gruppe | Beispiele |
|---|---|
| Caption-Keywords | Angebot, Ergebnis, Methode der Nische — deutsch und englisch |
| CTA-Muster | „DM für Infos", „Link in Bio", „Kostenloses Erstgespräch", „Jetzt bewerben" |
| Name-Keywords | Coach, Trainer, Berater, Mentor im Anzeigenamen |
| Username-Muster | `coach_vorname`, `pt_name`, `fit_name` |

## Schritt 3 — Pilot (Pflicht)

Hashtag-Actor aus `apify-actors.md` (Instagram-Kategorie, Discovery), Hashtags **ohne `#`** übergeben.

```json
{
  "hashtags": ["<tag-1>", "<tag-2>", "<tag-3>"],
  "resultsType": "posts",
  "resultsLimit": 20
}
```

**`resultsLimit` gilt je Hashtag** — bei drei Tags sind es bis zu 60 Posts. Das ist der häufigste
Kostenfehler dieses Wegs. Preis je Post vor dem Lauf über die Actor-Details prüfen, dem Nutzer nennen
und, falls er in `kosten.md` noch fehlt, dort mit Datum ergänzen. Deckel ≤ 0,50 $.

## Schritt 4 — Klassifizieren (Prüfregeln, kein Skript)

Zuerst auf `ownerUsername` deduplizieren und die Signale **über alle Posts eines Accounts hinweg**
zusammenzählen — mehr Posts bedeuten mehr Datenpunkte, nicht mehr Leads. Dann jeden Account in eine
der fünf Kategorien einsortieren:

| Kategorie | Regel |
|---|---|
| Klarer Treffer | Caption-Keywords **und** CTA-Muster **und** ein Name-/Username-Signal |
| Wahrscheinlicher Coach | ein starkes Caption-Signal **und** ein Name-/Username-Signal |
| Grenzfall | nur Caption-Keywords oder nur ein Namens-Match |
| Falsche Nische | Coach-Signale, aber keine Nischen-Keywords |
| Kein Signal | nichts davon — Privatperson oder Marke |

Zusätzlicher Ausschluss: Accounts mit durchgehend zweistelligem Engagement bei vierstelliger
Followerzahl und ohne jedes Angebot sind Hobby-Accounts.

**Orientierung für die Pilot-Entscheidung:** 20–40 % klare Treffer sind ausgezeichnet, 10–20 % solide,
5–10 % mittelmäßig (engere Tags wählen), unter 5 % heißt: die Tags sind zu generisch, neu wählen und
den Piloten wiederholen. Skaliert wird — wie überall — ab ~70 % ICP-Fit in der Treffergruppe. Die
gemessene Quote je Tag-Typ gehört mit Datum nach `_shared/references/erfahrungswerte.md`.

## Schritt 5 — Skalierung und Profil-Anreicherung

Skalieren heißt: dieselben Tags mit höherem `resultsLimit`, plus die zweite Reihe der Tag-Liste.
Klassifiziert wird mit exakt denselben Regeln wie im Piloten — sonst sind die Quoten nicht vergleichbar.

Erst danach die Profile der bestätigten Treffer anreichern (Qualifizierungs-Actor aus
`apify-actors.md`): Bio, Followerzahl, Link in Bio. Den Link nach Typ sortieren — eigene Website
(→ `impressum-enrichment`), Linktree, Calendly, kein Link (nur per DM erreichbar, für Cold Mail
wertlos). E-Mail und Telefon zusätzlich aus dem Bio-Text lesen, wo vorhanden.

## Schritt 6 — Roh-CSV bauen

```
python3 _shared/scripts/build_csv.py --in profile.json \
  --quelle "apify:<actor-id> <datum>" --land <de|at|ch> --out leads-<nische>-<region>-<datum>.csv
```

`instagram_url`, `follower`, `bio`, `link_typ` und `gefunden_via_hashtag` als Zusatzspalten mitgeben
(`csv-spalten.md`) — die beste Caption ist der stärkste Personalisierungs-Anker dieses Wegs.

## Schritt 7 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und keine
Übergabe.

## Bekannte Fallen und Plattform-Risiken

- **Instagram-Scraping ist volatil.** Hashtag-Actors brechen nach Plattform-Änderungen; leere
  Ergebnisse zuerst am Actor-Status prüfen, nicht an den Tags. Auch die Reichweite einzelner Tags
  schwankt — Werte aus einem alten Lauf sind keine Zusage für den nächsten.
- **ToS:** Nur öffentlich sichtbare Posts und Profile, kein Login, keine Ansprache über DMs.
  Kontaktiert wird ausschließlich über die E-Mail aus dem Impressum.
