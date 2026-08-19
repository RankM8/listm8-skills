# ListM8 Skills — Outreach-Workflows + Datenbeschaffung

Das eine Skills-Repo für Kunden der Outreach-Plattform (ListM8 / Akquise-Whitelabel).
Privat — die Inhalte sind Teil des Produkts.

```
workflows/          Produkt-Workflows (brauchen den verbundenen Outreach-MCP)
  outreach-campaign   Kampagne bauen — geführt nach der Cold-Mailing-SOP (Copy, offene
                      Qualifizierung, Research-Anker: references/ im Skill-Ordner)
  outreach-import     Leads importieren (CSV/Scrape-Ergebnis, Attribute-Mapping)
  outreach-lists      Listen verwalten: Bestand prüfen, Abgleichsindex, Liste→Kampagne, Löschregeln
  outreach-qualify    Leads qualifizieren        outreach-research   Leads recherchieren
  outreach-generate   E-Mail-Variablen erzeugen  outreach-verify     Review (approve/reject)
  outreach-pipeline   Der Master fürs Verarbeiten — voller Durchlauf

datenbeschaffung/   Leads beschaffen (funktioniert auch ohne MCP — mit MCP besser)
  master              DER Einstieg: Setup → ICP → Decision Tree (Weg A-E) → Weg → Qualität
  weg-a-b2b-google    weg-a-apollo        weg-b-ecom-google   weg-b-storeleads
  weg-c-local-maps    weg-d-coaches-google / -linkedin / -instagram-google / -instagram-hashtag
  weg-e-plattform     impressum-enrichment  kontaktseiten-fallback  enrichment-waterfall
  outscraper-bulk     Stufe 2 für sehr große Volumina (12-24h-Jobs)
  listen-qualitaet    Pflicht-Endstation: Dedup → Verifizierung → 20er-Sample → Übergabe
  datenbeschaffung-referenzen   Geteilte Referenzen + Skripte (wird mitinstalliert;
                                die Skills lesen via ../datenbeschaffung-referenzen/)
```

## Installation

**Ein Befehl, alle Skills** (Claude Code, Cursor, Codex — GitHub-Zugriff auf dieses Repo nötig):

```
npx skills add RankM8/listm8-skills
```

**Ohne GitHub-Zugang:** Das Datenbeschaffungs-Paket gibt es als ZIP-Download in der App
(Einrichtung → Skills → „Leads beschaffen"). ZIP entpacken und dem KI-Assistenten als
Skills-Verzeichnis geben. Die Workflow-Funktionen stehen in Claude/ChatGPT auch ohne
Skills bereit — der MCP-Server liefert sie als eingebaute Prompts.

**Voraussetzung für `workflows/`:** verbundener Outreach-MCP (Einrichtungs-Seite der App,
MCP-Tab). Die Skills nutzen dessen Auth — kein separates Login.

## Einstiegspunkte für Nutzer

- Leads **beschaffen**: `datenbeschaffung` (der Master) — nie einen `weg-*`-Skill direkt starten.
- Leads **verarbeiten**: `/outreach-pipeline` — oder einzeln `/outreach-campaign`,
  `/outreach-import`, `/outreach-qualify`, `/outreach-research`, `/outreach-generate`,
  `/outreach-verify`, `/outreach-lists`.

## Pflege

- Actor-Empfehlungen/Preise (`datenbeschaffung-referenzen/references/apify-actors.md`,
  `kosten.md`) pflegt der monatliche Prüfstand aus dem ListM8-Repo — jede Zahl trägt
  ein „zuletzt geprüft"-Datum.
- MCP-Tool-Änderungen im Produkt → betroffene `workflows/`-Skills im selben Zug nachziehen.
- Neue Portale/Noise → `references/noise-domains.md`; neue belegte Trefferquoten →
  `references/erfahrungswerte.md`.
