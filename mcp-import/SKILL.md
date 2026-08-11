---
name: mcp-import
description: Use when user says "mcp:import", "importiere leads via mcp", "leads hochladen mcp", "csv leads importieren", "outscraper import mcp", or triggers /mcp:import.
---

# MCP Import — Lead-Listen hochladen

Dieser Skill laedt Lead-Listen ueber das MCP-Tool `import_leads` (Scope `leads:write`) in ListM8 — aus CSV-Dateien (z.B. OutScraper-Exporte), JSON oder Inline-Daten. Mit `campaign_id` werden die Leads der Kampagne zugeordnet (Status `processing`); ohne entstehen unkategorisierte Leads in der globalen Liste. Der Import startet KEINE Verarbeitung — anschliessend `mcp-pipeline` (serverseitiger Lauf via `start_lead_run`) oder die Manuell-Skills.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp-import <datei> 80` | Datei parsen, in Kampagne 80 importieren |
| `/mcp-import <datei>` | Kampagne via list_campaigns waehlen (oder "ohne Kampagne") |
| `importiere diese leads: ...` | Inline-Daten importieren |

## Phase 1: Daten parsen (Claude-seitig)

`import_leads` nimmt KEINE Dateien an — Claude parst lokal und uebergibt ein JSON-Array:

1. CSV/XLSX mit Read/Bash lesen; Trennzeichen und Encoding pruefen (UTF-8 sicherstellen, Umlaute!).
2. Spalten auf Kernfelder mappen: `email` (Pflicht), `company`, `website`, `phoneNumber`, `city`.
   OutScraper-Referenz-Mapping: `name`→company, `site`→website, `phone`→phoneNumber, `city`→city.
3. Zusaetzliche Spalten, die erhalten bleiben sollen (Rating, Kategorie, Adresse …): als flache Extra-Keys am Lead-Objekt lassen und in `attribute_mappings` deklarieren:
   ```json
   { "rating": {"action": "create_new", "name": "Google Rating", "fieldType": "text"},
     "branche": {"action": "map_existing", "fieldKey": "branche"} }
   ```
4. Vorab-Check: Zeilen ohne gueltige E-Mail zaehlen und dem User melden — das Tool weist den GESAMTEN Call ab, wenn ungueltige E-Mails enthalten sind. Die ersten 20 Zeilendiagnosen stehen direkt im `isError`-Text nach dem Prefix `validation_failed:`; es gibt kein strukturiertes `invalid_rows`-Feld. Ungueltige Zeilen vor dem Call entfernen und im Report ausweisen.

## Phase 2: Import

```
import_leads(
  campaign_id = <ID oder weglassen>,
  leads = [ {...}, ... ],          // max 10000 pro Call
  attribute_mappings = {...}       // optional
)
```

- Bei > 10000 Leads: in 10000er-Chunks aufteilen, sequentiell importieren.
- Response: `job_id` — der Import laeuft async ueber den Fair-Scheduler.
- Dedup macht das Backend: listen-intern + gegen bestehende Leads; bestehende Leads werden nur zur Kampagne verlinkt (kein Duplikat, keine Feld-Ueberschreibung).

## Phase 3: Ergebnis pruefen & Report

1. Kurz warten, dann `list_leads(campaign_id, fit_level="", research_status="", campaign_status="processing")` bzw. bei kampagnenlosem Import die globale UI-Liste als Referenz nennen.
2. Report: uebergeben / importiert-sichtbar / vorab entfernte ungueltige Zeilen / job_id.

## Fehlerbehandlung

Erwartete Tool-Fehler sind MCP-Tool-Results mit `isError: true`; ihr Text beginnt mit `<lowercase_code>:`. Es gibt kein strukturiertes Fehler-Payload.

| Code | Aktion |
|------|--------|
| `validation_failed` mit inline aufgefuehrten Zeilen | Genannte Zeilen fixen/entfernen, erneut senden |
| `limit_reached` | Chunk verkleinern bzw. User informieren (Plan-Limit MAX_LEADS) |
| `campaign_not_found` | campaign_id pruefen (`list_campaigns`) |
| `insufficient_scope` | Token mit Scope `leads:write` verwenden |

## Hinweise

- `secondaryEmails` wird vom Bulk-Import-Pfad nicht verarbeitet (nur via `write_lead_details`).

## Verwandt

- `/mcp-campaign` (Kampagne zuerst), `/mcp-pipeline` (naechster Schritt)
- die Tool-Beschreibungen des MCP-Servers
