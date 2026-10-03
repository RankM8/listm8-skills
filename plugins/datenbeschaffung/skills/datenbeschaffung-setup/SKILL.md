---
name: datenbeschaffung-setup
description: Richtet das Plugin datenbeschaffung ein und prüft die Voraussetzungen. Verwenden bei „Datenbeschaffung einrichten“, „Apify verbinden“, „Apify-Token“, „Outscraper einrichten“, „funktioniert mein Scraping-Zugang“ oder direkt nach der Installation des Plugins. Prüft Outreach-Verbindung, Apify-Zugang (kostenloser Selbsttest), optional Outscraper, räumt alte Skill-Kopien auf – ohne kostenpflichtige Läufe.
---

# Datenbeschaffung einrichten

Ziel: Alles steht, damit der Einstieg `datenbeschaffung` ohne Hänger durchläuft. **Nichts
Kostenpflichtiges** in diesem Ablauf – kein Actor-Lauf, kein Scrape, keine Verifizierung. Nur
kostenlose, lesende Prüfungen.

Die Details zu Konto, Token und Zugriffswegen stehen in
`../datenbeschaffung-referenzen/references/setup.md` und `zugriff.md`. Dieser Skill führt nur durch
die Prüfung, er wiederholt sie nicht.

**Token bleiben beim Kunden:** Apify- oder Outscraper-Schlüssel nie im Chat abfragen, ausgeben oder
irgendwohin senden. Der Nutzer hinterlegt sie selbst (Apify-Connector, Umgebungsvariable, CLI-Login).

## 1. Umgebung erkennen

Claude Code (Shell und Dateisystem vorhanden), Claude App / claude.ai / Cowork (keine Shell) oder
ChatGPT Desktop / Codex. In einem Satz nennen; davon hängt der Apify-Zugriffsweg ab.

## 2. Outreach-Verbindung prüfen

Für Bestandsabgleich und Import braucht die Datenbeschaffung die Verbindung zur Outreach-App.

- `list_lists` aufrufen (nur lesend).
  - **Antwort kommt:** Verbindung steht, Anzahl der Listen nennen.
  - **Kein Outreach-Tool vorhanden:** Das Plugin `outreach` aus demselben Marketplace installieren
    (bringt die Verbindung mit) und dort `outreach-setup` ausführen. Ohne Verbindung geht
    Datenbeschaffung trotzdem, aber ohne Bestandsabgleich; das Ergebnis kommt dann als CSV über die
    Oberfläche der App.

## 3. Apify-Zugang prüfen (Pflicht)

Den ersten verfügbaren Weg nehmen (Reihenfolge und Aufrufe: `zugriff.md`):

1. **Apify-MCP** vorhanden (`search-actors`, `call-actor` …)? → `search-actors` mit keywords
   „Google Maps“ ausführen. Treffer = verbunden.
2. **REST** mit `APIFY_TOKEN` in der Umgebung (Claude Code, Codex)? → `curl -s -o /dev/null -w "%{http_code}"
   -H "Authorization: Bearer $APIFY_TOKEN" "https://api.apify.com/v2/acts?limit=1"` → `200` = verbunden.
   Den Token dabei nie ausgeben.
3. **Apify-CLI** installiert? → `apify info` zeigt das Konto = verbunden.

Nichts davon: Den Nutzer durch `setup.md` führen (Konto anlegen, Token unter
https://console.apify.com/settings/integrations kopieren, Apify-Connector verbinden bzw. Token als
Umgebungsvariable setzen). Danach erneut prüfen.

Der E-Mail-Verifier für `listen-qualitaet` ist ebenfalls ein Apify-Actor; ein eigener Zugang ist
nicht nötig.

## 4. Outscraper (optional)

Nur nötig für sehr große Volumina (`outscraper-bulk`, ab etwa 10.000 Leads). Frage: „Planst du
Beschaffungen in dieser Größe?“

- **Ja:** prüfen, ob `OUTSCRAPER_API_KEY` gesetzt ist (nur ob vorhanden, nicht den Wert zeigen).
  Fehlt er, auf das Outscraper-Konto des Nutzers verweisen; der Schlüssel bleibt bei ihm.
- **Nein:** überspringen.

## 5. Alte Skill-Kopien aufräumen (nur Claude Code, Codex, Cursor)

Frühere Installationen per `npx skills add` liegen als Kopien z. B. in `~/.claude/skills/`,
`~/.agents/skills/`, `~/.codex/skills/` oder im Projektordner unter `.claude/skills/`.

1. Ordner suchen mit den Namen `datenbeschaffung*`, `weg-*`, `listen-qualitaet`,
   `impressum-enrichment`, `kontaktseiten-fallback`, `enrichment-waterfall`, `outscraper-bulk`.
2. Liste zeigen und fragen, ob sie gelöscht werden sollen.
3. Erst nach Bestätigung löschen, danach in Claude Code `/reload-plugins`.

## 6. Updates

In Claude Code sind Updates fremder Marketplaces standardmäßig aus. Empfehlen: `/plugin` →
Marketplaces → `outreach-plugins` → Auto-Update einschalten. Sonst `datenbeschaffung-update`.

## Abschluss

Kurz berichten: Umgebung, Outreach-Verbindung ja/nein (Anzahl Listen), Apify-Zugang ja/nein und
über welchen Weg, Outscraper ja/nein/nicht nötig, aufgeräumte Kopien, Auto-Update ja/nein. Danach
weiter mit dem Einstieg `datenbeschaffung`.
