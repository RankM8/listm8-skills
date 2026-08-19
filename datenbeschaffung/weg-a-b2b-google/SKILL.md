---
name: weg-a-b2b-google
description: Weg A des Datenbeschaffungs-Pakets — B2B service providers (Agenturen, Kanzleien, Beratungen, IT-Dienstleister, Makler, Planungsbüros) via Google SERP scraping plus Impressum enrichment for contact data. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg A — B2B-Dienstleister über Google

Der Weg für Firmen, die man über ihre Website findet, nicht über einen Maps-Eintrag: Agenturen,
Kanzleien, Beratungen, Systemhäuser, Makler-, Architektur- und Ingenieurbüros. Zweistufig —
SERP liefert Domains, Kontaktdaten kommen erst danach über `impressum-enrichment`.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`_shared/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden).

Braucht der Nutzer Kontaktdaten ab Werk und ist die Zielgruppe über Firmografien beschreibbar,
ist `weg-a-apollo` der kürzere Weg — einmal erwähnen, dann hier weitermachen.

## Schritt 1 — Query-Strategie je Branche

Zwei bis drei Varianten je Branche, immer mit Stadt. Die dritte ist optional und wird bei knappem
Budget zuerst gestrichen.

| Branche | Query-Varianten (für `--keywords`) |
|---|---|
| Recruiting / Personalvermittlung | Recruiting Agentur, Personalvermittlung, Headhunter |
| Personalberatung | Personalberatung, Executive Search, Personalberater |
| Zeitarbeit | Zeitarbeitsfirma, Personaldienstleister, Arbeitnehmerüberlassung |
| Marketingagentur | Marketingagentur, Marketing Agentur, Online Marketing Agentur |
| Werbeagentur | Werbeagentur, Kreativagentur, Full-Service Agentur |
| PR-Agentur | PR Agentur, PR-Agentur, Presseagentur |
| Social-Media-Agentur | Social Media Agentur, Social-Media-Agentur, Social Media Marketing |
| SEO-Agentur | SEO Agentur, SEO-Agentur, Suchmaschinenoptimierung |
| Webdesign / Digitalagentur | Webdesign Agentur, Webdesign, Webagentur |
| IT-Dienstleister | IT-Dienstleister, IT Systemhaus, IT-Service |
| Softwareentwicklung | Softwareentwicklung, Software Agentur, App Entwicklung |
| Unternehmensberatung | Unternehmensberatung, Managementberatung, Strategieberatung |
| Steuerberater | Steuerberater, Steuerkanzlei, Steuerberatung |
| Anwaltskanzlei | Anwaltskanzlei, Rechtsanwalt, Wirtschaftskanzlei |
| Finanzberatung | Finanzberater, Finanzberatung, Vermögensberater |
| Versicherungsmakler | Versicherungsmakler, Versicherungsberater, Versicherungsagentur |
| Immobilienmakler | Immobilienmakler, Immobilienbüro, Makler |
| Architekturbüro | Architekturbüro, Architekt, Architektur |
| Ingenieurbüro | Ingenieurbüro, Ingenieurgesellschaft, Planungsbüro |
| E-Commerce-Agentur | E-Commerce Agentur, Online-Shop Agentur, Shopify Agentur |
| Film / Video | Filmproduktion, Videoproduktion, Imagefilm |
| Business-Fotografie | Business Fotograf, Werbefotograf, Corporate Fotografie |
| Eventagentur | Eventagentur, Veranstaltungsagentur, Event Management |
| Druckerei | Druckerei, Digitaldruck, Offsetdruck |
| Übersetzung | Übersetzungsbüro, Übersetzungsagentur, Übersetzer |

Branche nicht in der Tabelle: dasselbe Muster ableiten — Branchenname, deutsches Synonym,
Leistungsvariante. Formulierungsregeln und die `-site:`-Obergrenze stehen in
`_shared/references/erfahrungswerte.md`; Queries nicht von Hand bauen:

```
python3 _shared/scripts/build_queries.py --keywords "Recruiting Agentur,Personalvermittlung,Headhunter" \
  --cities "München" --exclude 8
```

## Schritt 2 — Pilot (Pflicht)

Eine Stadt, alle Query-Varianten in EINEM Lauf (eine Query je Zeile im Multi-Query-Feld des
Actors). Actor: **Primär aus `_shared/references/apify-actors.md`** (SERP-Kategorie) — dort steht
auch die Schreibweise des Länder-Codes, die sich zwischen Primär und Fallback unterscheidet.
5 Seiten je Query (`erfahrungswerte.md`), ein Land pro Lauf. Kosten vorher nennen
(`_shared/references/kosten.md`: SERP-Discovery für eine Nische DACH-weit bleibt unter 1 $),
harter Deckel ≤ 0,50 $ für den Piloten.

```
python3 _shared/scripts/process_serp.py --in serp-pilot.json --out domains-pilot.csv --report
```

Auswertung gegen den ICP: **ab ~70 % Fit skalieren.** Darunter erst Queries schärfen (spezifischer
statt mehr Seiten) und Piloten wiederholen. Der `--report` nennt die häufigsten gefilterten
Domains — Portale, die durchgerutscht sind, gehören in `noise-domains.md`, bevor skaliert wird.

Kein Lead ist, was zwar eine eigene Website hat, aber selbst kein Dienstleister ist: Verzeichnis
oder Portal, Jobbörse, Branchenverband oder Kammer (IHK, HWK), reine SaaS-Plattform,
Franchise-Zentrale ohne Standort, News- oder Lexikonartikel über die Branche.

## Schritt 3 — Skalierung

Gleiche Queries, Städteliste aus `_shared/references/staedte.md`, ein Land je Lauf (der
Länder-Code gilt pro Lauf, deshalb DE/AT/CH getrennt starten — parallel ist erlaubt).
Alle Stadt-mal-Query-Kombinationen eines Landes gehen in EINEN Lauf; das spart Actor-Overhead,
nicht Geld. Danach alle Datasets zusammenführen und einmal durch `process_serp.py` schicken —
der Dedup auf Root-Domain wirkt dadurch über Städte hinweg.

Deckel: kalkulierte Kosten + 50 %. Läuft ein Lauf länger als ein paar Minuten: pollen, nicht neu starten.

## Schritt 4 — Kontaktdaten holen

Die Domain-CSV aus Schritt 3 an `impressum-enrichment` geben (dort stehen Actor, Betriebsregeln
und Kosten). Wichtig: **Domain-Liste vorher gegen den Bestand abgleichen** (`dedup.py`) — bekannte
Leads dürfen keine Anreicherung kosten. Nicht-DACH-Domains und Onepager ohne Impressum landen im
`kontaktseiten-fallback`, nicht in einer zweiten Impressum-Runde.

## Schritt 5 — Roh-CSV bauen

```
python3 _shared/scripts/build_csv.py --in impressum.json \
  --quelle "apify:<serp-actor>+impressum <datum>" --land <de|at|ch> \
  --out leads-<branche>-<region>-<datum>.csv
```

## Schritt 6 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme. Diesem Skill gehört kein Qualitäts-Urteil und
keine Übergabe.

## Bekannte Fallen

- **Zu viele `-site:`-Ausschlüsse leeren das Ergebnis.** Über 8–10 je Zeile liefert der Actor
  nichts zurück — die Filterung gehört in `process_serp.py`, nicht in die Query.
- **Leere Trefferseiten weiter hinten sind normal** (Google liefert ab Seite 4–5 oft nichts mehr).
  Kein Fehler, kein Neustart — die Seiten sind bereits bezahlt.
- **Google-Titel ist kein Firmenname.** `build_csv.py` normalisiert, aber SEO-Titel wie
  „Marketingagentur München | Ihre Nr. 1" ergeben keinen brauchbaren `companyClean` — solche
  Zeilen markiert die Qualitätsstufe, hier nicht von Hand nacharbeiten.
- **Die SERP-Stufe kennt keine Firmengröße.** Der Größen-Filter des ICP greift erst über
  Impressum-Daten (HRB, Entscheider) und die Qualifizierung — im Piloten nicht darauf warten.
