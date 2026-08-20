# Setup — Apify verbinden und Selbsttest

> Die EINE Setup-Referenz. Jeder Weg-Skill verweist hierher, keiner wiederholt sie.
> Zuletzt geprüft: 2026-08-19.

## Was gebraucht wird

| Was | Wo | Kosten |
|---|---|---|
| Apify-Account | apify.com | Free-Plan: 5 $ Startguthaben (reicht für die ersten Piloten). Starter ~39 $/Monat für laufende Beschaffung |
| API-Token | **https://console.apify.com/settings/integrations** (genau diese URL — kein anderer Pfad) | — |
| Outreach-MCP verbunden | Einrichtungs-Seite der App (MCP-Tab) | — (optional, aber empfohlen: Vorab-Abgleich + direkte Übergabe) |

## Die drei Zugriffswege auf Apify

In dieser Reihenfolge prüfen — der erste verfügbare gewinnt. Details und Aufruf-Muster: `zugriff.md`.

1. **Apify-MCP** (`mcp.apify.com`) — der Standardweg in Claude (Desktop-Connector oder Claude Code).
2. **REST-API** mit `Authorization: Bearer <token>` — funktioniert in jeder Umgebung, die HTTP kann.
3. **Apify-CLI** (`npm i -g apify-cli && apify login`) — für Terminal-Umgebungen.

## Selbsttest (Pflicht, bevor Geld ausgegeben wird)

Eine kostenlose Metadaten-Abfrage beweist, dass der Zugang steht:

- MCP: `search-actors` mit keywords "Google Maps" → liefert Treffer? Verbunden.
- REST: `curl -H "Authorization: Bearer <token>" https://api.apify.com/v2/acts?limit=1` → HTTP 200? Verbunden.
- CLI: `apify info` → zeigt den Account? Verbunden.

Schlägt der Selbsttest fehl: Token neu von der Integrations-Seite kopieren (häufigster Fehler:
abgelaufener oder falsch kopierter Token), MCP-Verbindung in der Oberfläche neu autorisieren.

## Modellwahl (für Claude-Umgebungen)

Für Scrape-Läufe reicht das Standard-Modell — die Arbeit machen die Actors, nicht das Modell.
Kein Grund für das teuerste Modell; wichtig ist ein Modell mit Tool-Unterstützung.

## Was NICHT gebraucht wird

- Kein Outscraper-Account (nur für sehr große Volumina, siehe `outscraper-bulk`-Skill)
- Kein LinkedIn-Account und keine Cookies (unsere LinkedIn-Empfehlung arbeitet ohne — Sperr-Risiko null)
- Kein Clay/PhantomBuster-Abo
