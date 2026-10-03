# ListM8 Skills — Outreach-Workflows + Datenbeschaffung

Das eine Skills-Repo für Kunden der Outreach-Plattform (ListM8 / Akquise-Whitelabel).

Die Skills passen zum MCP-Server mit **32 Tools** und **7 Prompts** (`campaign_blueprint_guide`,
`qualify_leads`, `research_leads`, `generate_variables`, `verify_variables`, `run_leads`,
`run_full_pipeline`). Der MCP verarbeitet Leads und verwaltet Kampagnen und Listen; er scrapt
selbst nicht. Leads kommen über CSV-/Oberflächen-Import oder `import_leads` — beschafft werden sie
extern (Apify, Outscraper), siehe `datenbeschaffung/`.

Öffentlich — Installation und Updates laufen für jeden Kunden über `npx skills add`.

```
workflows/          Produkt-Workflows (brauchen den verbundenen Outreach-MCP)
  outreach-campaign   Kampagne bauen und ändern (create_campaign, export_campaign_blueprint,
                      edit_campaign) — geführt nach der Cold-Mailing-SOP (Copy, offene
                      Qualifizierung, Research-Anker: references/ im Skill-Ordner)
  outreach-import     Leads importieren (CSV/Apify-/Outscraper-Export, Attribute-Mapping, Vorab-Dedup)
  outreach-lists      Listen verwalten: Bestand prüfen, Abgleichsindex, Liste→Kampagne, Löschregeln
  outreach-qualify    Leads qualifizieren        outreach-research   Leads recherchieren
  outreach-generate   E-Mail-Variablen erzeugen  outreach-verify     Review (approve/reject)
  outreach-pipeline   Der Master fürs Verarbeiten — voller Durchlauf

datenbeschaffung/   Leads beschaffen — externer Weg über Apify/Outscraper (läuft beim Kunden,
                    nicht im MCP); der Bestandsabgleich und der Import laufen über den MCP
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

**Ein Befehl, alle Skills** (Claude Code, Cursor, Codex):

```
npx skills add RankM8/listm8-skills
```

**Ohne Kommandozeile:** Das Datenbeschaffungs-Paket gibt es zusätzlich als ZIP-Download in
der App (Seite „MCP & Skills“, `/mcp` → Skills → „Paket herunterladen (ZIP)“). Die Workflow-Funktionen stehen in
Claude/ChatGPT auch ohne Skills bereit — der MCP-Server liefert sie als eingebaute Prompts.

**Update:** einfach `npx skills add RankM8/listm8-skills` erneut ausführen.

**Voraussetzung für `workflows/`:** verbundener Outreach-MCP (Seite „MCP & Skills“ der App,
`/mcp`, Modus MCP). Die Skills nutzen dessen Auth — kein separates Login.

## Einstiegspunkte für Nutzer

- Leads **beschaffen**: `datenbeschaffung` (der Master) — nie einen `weg-*`-Skill direkt starten.
  Gescrapt wird extern (Apify/Outscraper); danach Abgleich mit `check_leads_exist` bzw. dem
  Abgleichsindex (`export_leads`) und Import mit `import_leads`.
- Leads **verarbeiten**: `/outreach-pipeline` — oder einzeln `/outreach-campaign`,
  `/outreach-import`, `/outreach-qualify`, `/outreach-research`, `/outreach-generate`,
  `/outreach-verify`, `/outreach-lists`.

## Pflege

- Actor-Empfehlungen/Preise (`datenbeschaffung-referenzen/references/apify-actors.md`,
  `kosten.md`) pflegt der monatliche Prüfstand aus dem ListM8-Repo — jede Zahl trägt
  ein „zuletzt geprüft"-Datum.
- MCP-Tool-Änderungen im Produkt → betroffene `workflows/`-Skills im selben Zug nachziehen
  (Tool-/Prompt-Zahlen oben mitpflegen).
- Neue Portale/Noise → `references/noise-domains.md`; neue belegte Trefferquoten →
  `references/erfahrungswerte.md`.
