---
name: datenbeschaffung
description: This skill should be used when the user says "Datenbeschaffung", "Leads beschaffen", "Leadliste aufbauen", "Leads scrapen", "Liste bauen", "wo finde ich Leads", "Zielgruppe scrapen", "Lead-Recherche starten", or wants to acquire cold-outreach leads for any niche. The ONLY entry point of the acquisition package — it guides through setup, ICP, the decision tree (Weg A-E) and always hands over to list quality. Never invoke a weg-* skill directly.
---

# Datenbeschaffung — der Master

Führt vom leeren Start zur geprüften Leadliste in der App. Dieser Skill trifft die Weg-Entscheidung
und orchestriert — die eigentliche Arbeit machen die Weg-Skills und `listen-qualitaet`.

## Leitsätze (gelten für den gesamten Lauf)

1. **Trichter-Prinzip.** Keine Stufe muss perfekt sein — jede filtert für die nächste. Die Liste darf
   Beifang enthalten; die Qualifizierung in der App arbeitet bewusst offen, erst Review und
   20er-Sample sind streng. Einzige harte Grenze überall: `do_not_contact`.
2. **Kosten IMMER vorab.** Vor jedem kostenpflichtigen Lauf: Kalkulation aus `../datenbeschaffung-referenzen/references/kosten.md`
   nennen („Das kostet etwa X $ — ok?") und einen harten Deckel setzen. Keine Ausnahme.
3. **Pilot-Zwang.** Kein Skalieren ohne Pilotlauf (eine Stadt, ~50 Ergebnisse) und ohne genannte
   Trefferquote. Skaliert wird ab **~70 % ICP-Fit** im Piloten; darunter erst Query/Filter nachschärfen.
4. **Actor-IDs nur aus `../datenbeschaffung-referenzen/references/apify-actors.md`.** Nie raten.
5. **Deutsch mit korrekten Umlauten**, in jedem Output.

## Phase 0 — Setup prüfen (einmal je Umgebung)

`../datenbeschaffung-referenzen/references/setup.md` folgen: Zugriffsweg feststellen (MCP/REST/CLI, siehe `zugriff.md`),
kostenlosen Selbsttest fahren. Zusätzlich prüfen: Ist der **Outreach-MCP** verbunden
(`ping`-Tool vorhanden)? Wenn ja, den Nutzer informieren, dass Bestand-Abgleich und direkte
Übergabe aktiv sind. Wenn nein: weiterarbeiten, am Ende CSV-Fallback — aber einmal erwähnen,
was mit MCP zusätzlich ginge.

## Phase 1 — ICP + Anti-ICP erheben

`../datenbeschaffung-referenzen/references/icp.md` folgen. Ergebnis ist EIN Satz + Ausschlüsse, vom Nutzer bestätigt:

> „[Rolle] in [Branche] mit [Größe] in [Region], erkennbar an [Trigger]. Nicht: [Anti-ICP]."

Ohne bestätigten ICP-Satz wird nicht gescrapt. Ist die Zielgruppe unklar: die 10-Wunschkunden-Frage
aus `icp.md` stellen.

## Phase 2 — Decision Tree: welcher Weg?

Die Kernfrage: **Wo trifft man diese Zielgruppe am wahrscheinlichsten?**

| Zielgruppe | Weg | Skill |
|---|---|---|
| Lokale Betriebe, Handwerk, Praxen, Gastro (haben Google-Maps-Eintrag) | **C** | `weg-c-local-maps` — der Standardweg für die meisten DACH-Fälle |
| B2B-Dienstleister, Agenturen, Kanzleien (Web-präsent, nicht zwingend Maps) | **A** | `weg-a-b2b-google` · Alternative mit Kontaktdaten ab Werk: `weg-a-apollo` |
| E-Commerce / Onlineshops | **B** | `weg-b-ecom-google` · Beratung ohne Scrape: `weg-b-storeleads` |
| Coaches & Personal Brands | **D** | `weg-d-coaches-google`, `weg-d-coaches-linkedin`, `weg-d-instagram-google`, `weg-d-instagram-hashtag` — Auswahl nach Kanalpräsenz der Zielkunden |
| Plattform-Verkäufer (Amazon/Etsy/eBay) | **E** | `weg-e-plattform` |
| Sehr große Volumina (>10.000, Zeit egal) | Stufe 2 | `outscraper-bulk` — NIE als Erstes anbieten (Jobs dauern 12–24 h) |

Passt kein Weg → **Recherchemodus** (Phase 2b). Dem Nutzer die Wahl mit einem Satz Begründung
vorlegen, nicht den ganzen Baum erklären.

### Phase 2b — Recherchemodus (kein Weg passt)

1. Apify-Store durchsuchen (`search-actors`, breit + spezifisch), Kandidaten nach den Kriterien
   aus `apify-actors.md` bewerten (Nutzer, Rating, Preis normalisiert, Pflege-Risiko, kein Login-Zwang).
2. Mini-Pilot mit hartem Deckel (≤ 0,50 $), Ergebnis vorlegen.
3. Findet Apify nichts: Outscraper prüfen (Laufzeit-Warnung!). Auch leer: zurück zur
   10-Wunschkunden-Frage — die Quelle ist der Weg.
4. **Jeden Fund in `apify-actors.md` mit Datum eintragen** — Recherche wird nie doppelt bezahlt.

## Phase 3 — Vorab-Abgleich (nur mit MCP)

VOR dem ersten kostenpflichtigen Lauf: Bestandsindex ziehen und bekannte Domains in die
Query-Ausschlüsse geben — `../datenbeschaffung-referenzen/references/outreach-uebergabe.md`, Schritt 0. Bekannte Leads
dürfen gar nicht erst Geld kosten.

## Phase 4 — Weg-Skill ausführen

Den gewählten Weg-Skill laden und fahren. Er endet IMMER mit einer Roh-CSV im Format aus
`csv-spalten.md` — nie mit einer Übergabe, nie mit einem eigenen Qualitäts-Urteil.

## Phase 5 — Pflicht-Endstation

`listen-qualitaet` laden und vollständig durchlaufen. Kein Lauf endet mit einer Roh-CSV.

## Berichtsform

Nach jedem Lauf ein kompakter Block: Weg, Query/Filter, Pilot-Trefferquote, Stückzahlen je Stufe
(roh → nach Dedup → nach Qualität → übergeben), reale Kosten, und was beim nächsten Lauf anders
gemacht würde. Die Herkunft steht dauerhaft an der Liste in der App (`source` bei `create_list`).
