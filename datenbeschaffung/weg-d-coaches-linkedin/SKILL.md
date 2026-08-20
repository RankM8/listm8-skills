---
name: weg-d-coaches-linkedin
description: Weg D des Datenbeschaffungs-Pakets — B2B coaches, consultants and personal brands via LinkedIn profile search with structured filters (job title, location, headcount, seniority). No LinkedIn login and no cookies required, so the customer's own account is never at risk. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg D — Coaches über LinkedIn

Der Weg für B2B-Coaches, Berater und Personal Brands: Menschen, die sich beruflich positionieren,
tun das auf LinkedIn — mit Jobtitel, Firma, Standort und Werdegang. Das macht das Filtern präziser
als jede Website-Suche, denn gefiltert wird die Person, nicht die Domain.

**Das Verkaufsargument:** Der gepinnte Actor arbeitet **ohne LinkedIn-Login und ohne Cookies**.
Es wird kein Kundenkonto hinterlegt, also gibt es kein Sperr-Risiko — hartes Auswahlkriterium
aus `../datenbeschaffung-referenzen/references/apify-actors.md`.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`../datenbeschaffung-referenzen/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden).

## Schritt 1 — Filter statt Freitext (die wichtigste Regel)

**Belegt am 19.08.2026: eine freie Suchquery erzeugt rund zwei Drittel Noise.** Recruiter,
HR-Rollen, Coaching-Akademien und Konzern-Angestellte landen in den Ergebnissen und werden voll
bezahlt. Deshalb gilt ohne Ausnahme:

- **Jobtitel** gehört in `currentJobTitles` — nie in die Query.
- **Standort** gehört in `locations` (bzw. bei Segmentierung in die Zielländer, siehe Schritt 3) —
  nie als Ortsname in die Query.
- `searchQuery` ist nur eine Ergänzung: sie durchsucht das ganze Profil (About, Experience, Skills)
  und darf einen einzigen Oberbegriff enthalten. Sie ersetzt keinen Filter.

Alle Titelvarianten kommen in **ein** `currentJobTitles`-Array, deutsch und englisch gemischt
(englische Begriffe treffen auf LinkedIn oft besser) — ein Lauf mit sechs Varianten liefert dasselbe
wie sechs Läufe, nur schneller und ohne Dubletten. Beispiel Vertriebscoach:
`["Vertriebscoach", "Sales Coach", "Vertriebstrainer", "Sales Trainer", "B2B Sales Coach"]`.

Für eine Nische ohne Vorlage: deutschen und englischen Begriff nehmen, jeweils mit „Coach",
„Coaching" und „Trainer" kombinieren, alles in ein Array.

### Vorfilter, die vor dem Download greifen

| Filter | Wofür |
|---|---|
| `excludeCurrentJobTitles` | Recruiter, HR Manager, Talent Acquisition, Professor, Dozent, Student — die bekannten Noise-Rollen |
| `companyHeadcount: ["A","B"]` | Selbstständige (A) und 1–10 Mitarbeiter (B) — passt für Solo-Coaches; weglassen, wenn auch Coaches in Beratungshäusern gesucht sind |
| `seniorityLevelIds: ["320","300"]` | Owner/Partner und VP — nur fürs Premium-Segment |
| `profileLanguages` | Deutsch/Englisch, wenn die Ansprache das braucht |

Jeder dieser Filter spart Geld, weil aussortierte Profile gar nicht erst geliefert werden.

## Schritt 2 — Pilot im Short-Mode (Pflicht)

Actor: **Primär aus `../datenbeschaffung-referenzen/references/apify-actors.md`** (LinkedIn-Kategorie), Modus `Short`.
Short liefert Name, Headline, aktuelle Firma und Standort — genug, um die Trefferquote zu
beurteilen, und deutlich billiger als das volle Profil.

```json
{
  "profileScraperMode": "Short",
  "searchQuery": "<ein Oberbegriff>",
  "currentJobTitles": ["<alle Titelvarianten>"],
  "excludeCurrentJobTitles": ["Recruiter", "HR Manager", "Talent Acquisition", "Student"],
  "companyHeadcount": ["A", "B"],
  "locations": ["Germany"],
  "maxItems": 100
}
```

Kosten vorher nennen (Short-Preis je Profil: `kosten.md`), Deckel ≤ 0,50 $. Auswertung: Headline und
Titel gegen den ICP halten — **ab ~70 % Fit skalieren**, darunter Titelvarianten schärfen oder
`companyHeadcount` lockern und den Piloten wiederholen.

## Schritt 3 — Skalierung

Gleicher Input, `maxItems` hoch. Ab ~500 Profilen greift LinkedIns Limit von rund 1.000 Ergebnissen
je Query — dann `autoQuerySegmentation: true` setzen, das zerlegt die Suche intern.

**Falle:** `autoQuerySegmentation` und `locations` vertragen sich nicht („conflicting location
settings", 0 Ergebnisse). Bei Segmentierung stattdessen `autoQuerySegmentationTargetCountries`
(`DE`, `AT`, `CH`) verwenden.

## Schritt 4 — Full-Mode nur für die validierte Menge

Der Full-Mode (vollständiges Profil, optional mit E-Mail-Suche) kostet ein Vielfaches des
Short-Profils — Preise in `kosten.md`, Varianten in `apify-actors.md`. Deshalb die Kostenlogik
dieses Wegs: **Short entdeckt, Full reichert an.** Erst wenn die Short-Liste steht und der Nutzer
sie gesichtet hat, läuft Full über genau diese Profile. Beide Kostenstufen vorher benennen und den
Nutzer zwischen „nur Profildaten" und „mit E-Mail-Suche" wählen lassen.

## Schritt 5 — Roh-CSV bauen

```
python3 ../datenbeschaffung-referenzen/scripts/build_csv.py --in linkedin.json \
  --quelle "apify:<actor-id> <datum>" --land <de|at|ch> --out leads-<nische>-<region>-<datum>.csv
```

`linkedin_url`, `headline` und `connections` als Zusatzspalten mitgeben — sie wandern beim Import
als Custom-Attribute mit und sind starke Personalisierungs-Anker (`csv-spalten.md`).

Profile ohne E-Mail sind normal: LinkedIn ist eine Personen-, keine Kontaktdatenquelle. Wo eine
Firmen-Website vorliegt, schließt `impressum-enrichment` die Lücke; sonst die Lücke akzeptieren
(Trichter-Prinzip) und weitergeben.

## Schritt 6 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und keine
Übergabe.

## Bekannte Fallen

- **Short-Mode:** LinkedIn hängt die Headline an das `lastName`-Feld („Müller, Executive Coach") —
  beim CSV-Bau trennen, sonst steht die Headline in der Anrede. `connectionsCount` ist im Short-Mode
  immer 0, taugt dort also nicht als Filter.
- **Coaching-Akademien** bilden Coaches aus und sind selbst keine — sie gehören in den Anti-ICP.
- **ToS:** Gescrapt werden öffentlich sichtbare Profildaten. Kein Login, keine Automatisierung im
  Kundenkonto, keine Kontaktaufnahme über die Plattform — der Kontaktweg ist ausschließlich die
  E-Mail aus der Anreicherung.
