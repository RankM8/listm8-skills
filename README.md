# Outreach Plugins

Ein Marketplace mit zwei Plugins für Kunden der Outreach-Plattform – für Claude (App, claude.ai,
Cowork, Claude Code) und für ChatGPT Desktop und Codex.

| Plugin | Inhalt | Für wen |
|---|---|---|
| **outreach** | Kampagnen anlegen und ändern, Cold-Mail-Copy nach SOP, Leads importieren, qualifizieren, recherchieren, Mails generieren und prüfen, Launch vorbereiten. Bringt die MCP-Verbindung `akquise` (`outreach.akquise.de`) und in Claude Code die Live-Ansicht (Lead-Vorschau, Fortschritt der Läufe) mit. | alle |
| **datenbeschaffung** | Leads beschaffen mit Apify oder Outscraper im eigenen Konto, Liste prüfen, als CSV bzw. per `import_leads` übernehmen. | wer Leads selbst beschafft |

Die Skills passen zum Outreach-MCP mit **32 Tools** und **7 Prompts**. Der MCP verarbeitet
Leads und verwaltet Kampagnen und Listen; er scrapt nicht. Versand läuft beim Kunden
(Instantly o. Ä.), nicht in der Plattform.

## Installation

**Claude Code**

```
/plugin marketplace add RankM8/outreach-plugins
/plugin install outreach@outreach-plugins
/plugin install datenbeschaffung@outreach-plugins     (optional)
```

**Claude App / claude.ai / Cowork:** Customize → Plugins → Add marketplace →
`RankM8/outreach-plugins` → `outreach` (und optional `datenbeschaffung`) installieren →
im Plugin unter „Connectors“ die Verbindung `akquise` verbinden.

**ChatGPT Desktop / Codex**

```
codex plugin marketplace add RankM8/outreach-plugins
```

danach unter `/plugins` installieren und neue Session starten.

**Cursor & andere Agenten (nur Skills):** `npx skills add RankM8/outreach-plugins`, die
MCP-Verbindung separat über die App-Seite „MCP & Skills“.

Nach der Installation: Skill **`outreach-setup`** aufrufen (bzw. **`datenbeschaffung-setup`** für das
Plugin datenbeschaffung). Er prüft die Verbindung, räumt alte Skill-Kopien auf und zeigt die ersten Schritte.

**Kunden einer anderen Outreach-App als Akquise:** Die mitgelieferte Verbindung `akquise`
unverbunden lassen und den MCP der eigenen App über deren Seite „MCP & Skills“ hinzufügen.
Skills und Live-Ansicht erkennen ihn an seinen Tools.

**Updates:** Skill `outreach-update`. In Claude Code am besten Auto-Update einschalten
(`/plugin` → Marketplaces → `outreach-plugins`).

## Aufbau

```
.claude-plugin/marketplace.json     Marketplace für Claude (liest Codex mit)
.agents/plugins/marketplace.json    Marketplace für ChatGPT/Codex
plugins/
  outreach/
    .claude-plugin/plugin.json      Manifest Claude
    plugin.json                     Manifest portabel (OpenAI)
    .mcp.json / mcp.json            MCP-Verbindung akquise (Claude / OpenAI)
    hooks/                          Live-Ansicht für Claude Code (register.tsx, model.ts)
    types/  tests/                  Typen und Tests der Live-Ansicht
    skills/
      outreach            Einstieg, leitet weiter
      outreach-setup      Einrichtung und Prüfung
      outreach-update     Aktualisieren
      outreach-campaign   Kampagne bauen und ändern nach der Cold-Mailing-SOP
      outreach-copy       Cold-Mail-Copy-Regeln (verbindlich für campaign, generate, verify)
      outreach-import     Leads importieren
      outreach-lists      Listen verwalten
      outreach-qualify    Leads qualifizieren
      outreach-research   Leads recherchieren
      outreach-generate   Mail-Variablen erzeugen
      outreach-verify     Review (approve/reject)
      outreach-pipeline   voller serverseitiger Durchlauf
      outreach-launch     Domains, Postfächer, Warm-up, Instantly, Auswertung, Optimierung
  datenbeschaffung/
    .claude-plugin/plugin.json  plugin.json
    skills/
      datenbeschaffung    Einstieg: Setup → ICP → Weg A–E → Weg → Qualität
      datenbeschaffung-setup   Einrichtung: Outreach-Verbindung, Apify, Outscraper prüfen
      datenbeschaffung-update  Aktualisieren
      weg-*               die Beschaffungswege (Google, Apollo, Maps, Instagram, Plattformen …)
      outscraper-bulk     sehr große Volumina
      impressum-enrichment  kontaktseiten-fallback  enrichment-waterfall
      listen-qualitaet    Pflicht-Endstation: Dedup → Verifizierung → Stichprobe → Übergabe
      datenbeschaffung-referenzen   geteilte Referenzen und Skripte
                                    (die Skills lesen über ../datenbeschaffung-referenzen/)
```

## Pflege

- Jede Änderung, die Kunden erreichen soll: `version` in **beiden** Manifesten des betroffenen
  Plugins erhöhen (`.claude-plugin/plugin.json` und `plugin.json`) und `CHANGELOG.md` ergänzen.
  Ohne neue Version bekommen installierte Plugins nichts Neues.
- MCP-Tool-Änderungen im Produkt → betroffene Skills im selben Zug nachziehen.
- Live-Ansicht: `claude plugin test plugins/outreach`; Manifeste: `claude plugin validate .`
- Kein `bin/`-Ordner in einem Plugin (claude.ai lehnt das ganze Plugin sonst ab), keine Symlinks.
- Actor-Empfehlungen/Preise (`datenbeschaffung-referenzen/references/apify-actors.md`,
  `kosten.md`) tragen ein „zuletzt geprüft“-Datum.
