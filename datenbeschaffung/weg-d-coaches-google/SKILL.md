---
name: weg-d-coaches-google
description: Weg D des Datenbeschaffungs-Pakets — coaches and personal brands via Google SERP scraping, covering both segments in one flow: B2B coaches (Executive, Leadership, Vertrieb, Agile) and B2C coaches (Fitness, Ernährung, Mindset, Spiritualität, Dating). Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg D — Coaches über Google

Coaches sind die Zielgruppe mit dem höchsten Noise-Anteil im Paket: um jede Coaching-Nische
sitzen Ausbildungsakademien, Verbände, Verzeichnisse und Kursplattformen, die für dieselben
Begriffe ranken. Die Trefferquote entscheidet sich an der Query, nicht am Volumen.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`../datenbeschaffung-referenzen/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden). Positioniert sich die Zielgruppe stärker über einen
Kanal als über die eigene Website, sind `weg-d-coaches-linkedin` (B2B) oder `weg-d-instagram-*`
(B2C) die besseren Wege — einmal gegenprüfen, dann hier weiter.

## Schritt 0 — Segment festlegen (erste Frage)

**B2B-Coach oder B2C-Coach?** Steuert Queries, Noise-Profil und Ausschlüsse. Ist die Antwort aus
dem ICP-Satz eindeutig, nicht nachfragen.

| | **B2B-Coach** | **B2C-Coach** |
|---|---|---|
| Verkauft an | Unternehmen, Führungskräfte, Selbstständige | Privatpersonen |
| Typischer Noise | Beratungshäuser, Coaching-Akademien, IHK und Wirtschaftsförderung | Studio-Ketten, Kliniken und Praxen, Kursplattformen, Verzeichnisse |

## Schritt 1 — Query-Strategie je Nische

Zwei bis drei Varianten, immer mit Stadt.

**B2B-Segment**

| Nische | Query-Varianten (für `--keywords`) |
|---|---|
| Executive Coach | Executive Coach, Executive Coaching, C-Level Coaching |
| Leadership | Leadership Coach, Führungskräftecoaching, Führungskräfteentwicklung |
| Vertrieb | Vertriebscoach, Vertriebstrainer, B2B Vertriebstraining |
| Gründer / Startup | Gründer Coach, Startup Coaching, Unternehmer Coaching |
| Business allgemein | Business Coach, Business Coaching, Unternehmenscoach |
| Team | Team Coaching, Teamcoach, Teamentwicklung Coach |
| Change / Organisation | Change Management Coach, Organisationsentwicklung Coach, Transformationscoach |
| Agile | Agile Coach, Scrum Coach, Agile Transformation Coach |

**B2C-Segment**

| Nische | Query-Varianten (für `--keywords`) |
|---|---|
| Fitness | Fitness Coach, Personal Training, 1:1 Coaching Fitness |
| Mindset / Life | Life Coach, Mindset Coaching, Persönlichkeitsentwicklung Coach |
| Ernährung | Ernährungscoach, Ernährungscoaching, Ernährungsberatung (mehr Noise) |
| Spiritualität | Spiritueller Coach, Spirituelles Coaching, Bewusstseinscoach |
| Dating / Beziehung | Dating Coach, Beziehungscoach, Liebescoach |

Nische nicht dabei: Nischenname + Stadt, deutsches Synonym, Premium-Variante („1:1", „Coaching").
**Welche Variante wie viel bringt, steht belegt in `../datenbeschaffung-referenzen/references/erfahrungswerte.md`** —
samt Formulierungsregeln („Coach" statt „Trainer", Komposita zusammenschreiben, `Vertriebscoach`
statt `Sales Coaching`) und `-site:`-Obergrenze. Die Reihenfolge dort ist keine Kosmetik: bei
Ernährung liegen zwischen bester und schlechtester Variante 12 Prozentpunkte.

```
python3 ../datenbeschaffung-referenzen/scripts/build_queries.py --keywords "Ernährungscoach,Ernährungscoaching" \
  --cities "Berlin" --exclude 8
```

Für B2C zusätzlich `superprof.de` und `yelp.com` in die Ausschlüsse tauschen, für B2B
`kununu.com` und `glassdoor.com` — je gegen einen Kern-Ausschluss, die Grenze bleibt bei 8–10.

## Schritt 2 — Pilot (Pflicht)

Eine Stadt, alle Query-Varianten in EINEM Lauf, 7 Seiten je Query (`erfahrungswerte.md`: Seite 4–7
fängt die Coaches mit schwachem SEO — also die mit Bedarf). Actor: **Primär aus
`../datenbeschaffung-referenzen/references/apify-actors.md`** (SERP-Kategorie). Kosten vorab nennen (`kosten.md`),
Deckel ≤ 0,50 $. Pilotstadt: B2B Frankfurt oder München, B2C Berlin oder Wien.

```
python3 ../datenbeschaffung-referenzen/scripts/process_serp.py --in serp-pilot.json --out coaches-pilot.csv --report
```

**Ab ~70 % Fit skalieren.** Für Ernährung und Spiritualität sind 60–70 % nach Filterung schon ein
gutes Ergebnis (belegt) — hier lieber eine Query-Variante tauschen als die Seitenzahl erhöhen.
Durchgerutschte Portale vor dem Skalieren in `noise-domains.md` eintragen.

## Schritt 3 — Was kein Lead ist

Beide Segmente: Verzeichnis, Bewertungsportal, Jobbörse, Kursplattform (Udemy, Eventbrite,
Meetup), Coaching-Ausbildung oder Zertifizierungsstelle, Verband, Fachpublikation, Artikel über
Coaches. **B2B zusätzlich:** Beratungshaus ohne Coaching-Angebot, IHK, Handelskammer,
Wirtschaftsförderung, reine Keynote-Speaker, HR-Software. **B2C zusätzlich:** Studio- und
Gym-Ketten, Kliniken, Krankenkassen-Portale und Arztpraxen (bei Ernährung der stärkste Treiber),
Physiotherapie ohne Coaching, reine Kursanbieter ohne 1:1, religiöse Organisationen und Klöster
(bei Spiritualität).

Grenzfälle bleiben bewusst drin (Trichter-Prinzip): Ernährungsberater als „Therapeut" oder
„Diätassistent", spirituelle Anbieter als „Medium" oder „Energieheiler", Dating-Coaches als reine
Content-Creator. Oft gute Leads — die Qualifizierung entscheidet. Nützliches Signal bei Ernährung:
steht „Ernährungsberatung" nur als Unterseite unter `/leistungen/` oder `/behandlungen/`, ist es
fast immer eine Arztpraxis.

## Schritt 4 — Skalierung

Städte aus `../datenbeschaffung-referenzen/references/staedte.md`, ein Land je Lauf (der Länder-Code gilt pro Lauf) —
DE/AT/CH getrennt, gern parallel; alle Stadt-mal-Query-Kombinationen eines Landes in EINEN Lauf.
Danach alle Datasets zusammenführen und einmal durch `process_serp.py`: so greift der Dedup auf
Root-Domain über Städte hinweg — ein Coach, der drei Städte bedient, ist ein Lead. Deckel:
kalkulierte Kosten + 50 %. Für die Schweiz Begriffe prüfen („Personal Trainer Zürich" schlägt
„Fitness Coach Zürich").

## Schritt 5 — Kontaktdaten und Roh-CSV

Domain-CSV an `impressum-enrichment` (Actor, Betriebsregeln, Kosten stehen dort). Bei Coaches ist
der Entscheider die Person selbst — die Entscheiderfelder sind hier mehr wert als bei Firmen.
Onepager ohne auslesbares Impressum gehen in den `kontaktseiten-fallback`.

```
python3 ../datenbeschaffung-referenzen/scripts/build_csv.py --in impressum.json \
  --quelle "apify:<serp-actor>+impressum <datum>" --land <de|at|ch> \
  --out leads-<nische>-<region>-<datum>.csv
```

## Schritt 6 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und
keine Übergabe.

## Bekannte Fallen

- **Zu viele `-site:`-Ausschlüsse leeren den Lauf.** Über 8–10 je Zeile kommt nichts zurück.
- **Generische Coaching-Begriffe ziehen AVGS- und Karrierecoaching an** — spezifischer
  formulieren statt Ausschlüsse stapeln.
- **Der Google-Titel ist bei Coaches Personenname plus Claim.** Vor- und Nachname kommen aus dem
  Impressum, nicht aus dem SERP — `build_csv.py` kann daraus keinen Firmennamen bauen.
