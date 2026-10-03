---
name: outreach-setup
description: Richtet das Outreach-Plugin ein und prüft die Einrichtung. Verwenden bei „outreach einrichten“, „setup“, „Plugin einrichten“, „MCP verbinden“, „funktioniert die Verbindung“, „alte Skills aufräumen“ oder direkt nach der Installation. Führt durch Verbindung, Prüfung, Aufräumen alter Skill-Kopien und erste Schritte – ohne kostenpflichtige Aktionen.
---

# Outreach einrichten

Ziel: Das Plugin ist installiert, die Verbindung zur Outreach-App steht, es gibt keine doppelten
alten Skills, und der Nutzer weiß, wo er anfängt. **Nichts Kostenpflichtiges** in diesem Ablauf –
keine Lead-Läufe, kein Scraping, keine Generierung. Nur lesende Prüfungen.

## 1. Umgebung erkennen

Stelle fest, wo du läufst, und nenne es dem Nutzer in einem Satz:

| Umgebung | Woran erkennbar | Besonderheit |
|---|---|---|
| Claude Code (Terminal, Desktop-Code-Tab) | Zugriff auf Dateisystem und Shell | Live-Ansicht (Band, Lead-Vorschau) verfügbar |
| Claude App / claude.ai / Cowork | keine lokale Shell | Verbindung im Plugin unter „Connectors“ |
| ChatGPT Desktop / Codex | OpenAI-Umgebung | Verbindung beim ersten Aufruf; ChatGPT im Browser erst später |
| Cursor & andere | Skills ohne Plugin | MCP separat über die App-Seite „MCP & Skills“ |

## 2. Verbindung prüfen

Rufe `list_campaigns` auf (nur lesend).

- **Antwort kommt:** Verbindung steht. Nenne die Zahl der Kampagnen und weiter mit Schritt 3.
- **Kein Outreach-Tool verfügbar oder Anmeldung nötig:**
  - **Akquise-Kunden:** Das Plugin bringt die Verbindung `akquise` mit (`outreach.akquise.de`).
    - Claude Code: `/mcp` öffnen → `akquise` → anmelden.
    - Claude App / claude.ai: Customize → Plugins → `outreach` → Connectors → `akquise` → Verbinden.
    - ChatGPT Desktop / Codex: beim ersten Aufruf anmelden, in Codex alternativ `codex mcp login akquise`.
  - **Kunden einer anderen Outreach-App:** Die mitgelieferte Verbindung `akquise` unverbunden lassen.
    Den MCP der eigenen App über deren Seite „MCP & Skills“ hinzufügen; Skills und Live-Ansicht
    erkennen ihn automatisch an seinen Tools, der Name ist egal.
  - Danach `list_campaigns` erneut aufrufen.
- **Zwei Verbindungen zur selben Adresse** (eine von Hand angelegt, eine aus dem Plugin): Eine reicht.
  Dem Nutzer empfehlen, die von Hand angelegte zu entfernen.

## 3. Alte Skill-Kopien aufräumen (nur Claude Code, Codex, Cursor)

Frühere Installationen per `npx skills add` liegen als Kopien z. B. in `~/.claude/skills/`,
`~/.agents/skills/`, `~/.codex/skills/` oder im Projektordner unter `.claude/skills/`. Sie laden
zusätzlich zum Plugin und sind oft veraltet.

1. Suche Ordner mit den Namen `outreach-*`, `datenbeschaffung*`, `weg-*`, `listen-qualitaet`,
   `impressum-enrichment`, `kontaktseiten-fallback`, `enrichment-waterfall`, `outscraper-bulk`.
2. Zeige die Liste und frage, ob sie gelöscht werden sollen.
3. Erst nach Bestätigung löschen. Danach in Claude Code `/reload-plugins`.

In der Claude App bzw. claude.ai gibt es keine Kopien; dort entfällt der Schritt.

## 4. Datenbeschaffung

Frage: „Willst du neue Leads selbst beschaffen (Apify oder Outscraper im eigenen Konto)?“

- **Ja:** Plugin `datenbeschaffung` aus demselben Marketplace installieren und danach
  `datenbeschaffung-setup` ausführen (Apify-Zugang prüfen)
  (Claude Code: `/plugin install datenbeschaffung@outreach-plugins`; Claude App: Customize →
  Plugins → `datenbeschaffung`; Codex: `/plugins`).
- **Nein:** überspringen. Leads lassen sich jederzeit per CSV importieren (`outreach-import`).

## 5. Updates einschalten (Claude Code)

In Claude Code sind Updates fremder Marketplaces standardmäßig aus. Empfehlen:
`/plugin` → Marketplaces → `outreach-plugins` → Auto-Update einschalten. Sonst `outreach-update`.

## 6. Erste Schritte

- **Claude Code:** Die Live-Ansicht zeigt Lead-Vorschauen und laufende Lead-Runs über dem Prompt;
  `/outreach-runs` holt alle laufenden Läufe ins Band.
- Weiter mit dem Einstieg `outreach` oder direkt mit `outreach-campaign`.

## Abschluss

Kurz berichten: Umgebung, Verbindung (ja/nein, Anzahl Kampagnen), aufgeräumte Kopien,
Datenbeschaffung installiert ja/nein, Auto-Update ja/nein.
