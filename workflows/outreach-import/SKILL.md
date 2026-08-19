---
name: outreach-import
description: Use when user says "outreach:import", "mcp:import", "importiere leads via mcp", "leads hochladen mcp", "csv leads importieren", "outscraper import mcp", or triggers /mcp:import.
---

# MCP Import — Lead-Listen hochladen

Dieser Skill laedt Lead-Listen ueber das MCP-Tool `import_leads` (Scope `leads:write`) in ListM8 — aus CSV-Dateien (z.B. OutScraper-Exporte), JSON oder Inline-Daten. Mit `campaign_id` startet die Pipeline (Status `processing`); ohne entstehen unkategorisierte Leads in der globalen Liste.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp:import <datei> 80` | Datei parsen, in Kampagne 80 importieren |
| `/mcp:import <datei>` | Kampagne via list_campaigns waehlen (oder "ohne Kampagne") |
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
4. Vorab-Check: Zeilen ohne gueltige E-Mail zaehlen und dem User melden — das Tool weist den GESAMTEN Call ab, wenn ungueltige E-Mails enthalten sind (die Fehlermeldung nennt die ersten 20 betroffenen Zeilen im Text). Ungueltige Zeilen vor dem Call entfernen und im Report ausweisen.
5. Vorab-Dedup bei gescrapten Listen: VOR dem Import `check_leads_exist` (bzw. den kompletten Listen-Flow aus `/outreach-lists`) fahren — Bestands-Leads und `do_not_contact`-Treffer dem User zeigen, bevor Geld oder Kampagnenplaetze draufgehen.

## Phase 2: Import

```
import_leads(
  campaign_id = <ID oder weglassen>,
  list_id = <ID oder weglassen>,   // von create_list — sammelt ALLE Leads des Imports in einer Liste
  leads = [ {...}, ... ],          // max 10000 pro Call
  attribute_mappings = {...}       // optional
)
```

- Bei > 10000 Leads: in 10000er-Chunks aufteilen, sequentiell importieren.
- `list_id` fuer gescrapte/beschaffte Listen immer setzen (Herkunft + spaeteres Aufraeumen via `delete_list`) — Listen-Verwaltung: `/outreach-lists`.
- Response: `job_id` — der Import laeuft async ueber den Fair-Scheduler.
- Dedup macht das Backend: listen-intern + gegen bestehende Leads; bestehende Leads werden nur zur Kampagne verlinkt (kein Duplikat, keine Feld-Ueberschreibung).

## Phase 3: Job pollen & Report

Der Import ist ERST fertig, wenn der Job es sagt — nie nach festem Warten zaehlen:

1. `get_job_status(job_id)` pollen (anfangs alle ~5 s, bei grossen Imports alle 15–30 s), bis `status` = `completed` oder `failed`. Ein 10.000er-Import kann mehrere Minuten laufen.
2. Das Job-Result enthaelt die Wahrheit: `imported`, `duplicates` (nur verlinkt), `linked_to_list` (bei `list_id`), `do_not_contact_hits` (Bestands-Leads mit Kontaktsperre) und ggf. Zeilen-Fehler. Diese Zahlen 1:1 an den User berichten — NICHT stattdessen `list_leads` zaehlen (waehrend der Job laeuft, fehlen Leads, und der Report wuerde Doppel-Importe provozieren).
3. Optional zur Sichtkontrolle danach: `list_leads(campaign_id, fit_level="", research_status="", campaign_status="processing")`.
4. Report: uebergeben / importiert / Duplikate / do_not_contact-Treffer / vorab entfernte ungueltige Zeilen / job_id.

## Fehlerbehandlung

| Code | Aktion |
|------|--------|
| `VALIDATION_FAILED` | Fehlermeldung nennt die ungueltigen Zeilen (max 20) im Text — fixen/entfernen, erneut senden |
| `LIMIT_REACHED` | Chunk verkleinern bzw. User informieren (Plan-Limit MAX_LEADS) |
| `CAMPAIGN_NOT_FOUND` / `LIST_NOT_FOUND` | IDs pruefen (`list_campaigns` / `list_lists`) |
| Job `failed` in get_job_status | Fehlertext aus dem Job-Result berichten; Import NICHT blind wiederholen (Teilzustand pruefen via list_leads) |

## Hinweise

- `secondaryEmails` wird vom Bulk-Import-Pfad nicht verarbeitet (nur via `write_lead_details`).

## Verwandt

- `/outreach-lists` (Vorab-Dedup, Listen-Verwaltung, Liste→Kampagne)
- `/mcp:campaign` (Kampagne zuerst), `/mcp:pipeline` (naechster Schritt)
- die Tool-Beschreibungen des MCP-Servers
