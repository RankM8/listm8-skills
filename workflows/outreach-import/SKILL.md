---
name: outreach-import
description: Use when user says "outreach:import", "mcp:import", "importiere leads via mcp", "leads hochladen mcp", "csv leads importieren", "outscraper import mcp", or triggers /mcp:import.
---

# MCP Import — Lead-Listen hochladen

Dieser Skill laedt Lead-Listen ueber das MCP-Tool `import_leads` (Scope `leads:write`) in ListM8 — aus CSV-Dateien (z.B. OutScraper-Exporte), JSON oder Inline-Daten. Mit `campaign_id` werden die Leads der Kampagne zugeordnet (Status `processing`); ohne entstehen unkategorisierte Leads in der globalen Liste. Der Import startet KEINE Verarbeitung — anschliessend `/outreach-pipeline` (serverseitiger Lauf via `start_lead_run`) oder die Manuell-Skills.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-import <datei> 80` | Datei parsen, in Kampagne 80 importieren |
| `/outreach-import <datei>` | Kampagne via list_campaigns waehlen (oder "ohne Kampagne") |
| `importiere diese leads: ...` | Inline-Daten importieren |

## Phase 0: Zielkontext prüfen

`get_context()` aufrufen und Konto, Tenant, Basis-URL sowie konfigurierte Umgebung mit dem Auftrag abgleichen. Ein `prod`-Kernel unterscheidet Staging nicht verlässlich; fehlende `deployment_environment` nicht aus dem Hostnamen erraten. Für den geprüften Import `leads:read` und `leads:write` verlangen. Bei abweichendem Kontext stoppen.

## Phase 1: Daten lokal lesen und vorprüfen

Keine Dateipfade oder URLs an den Server übergeben. `preview_import` akzeptiert entweder Inline-JSON in `leads` oder Inline-CSV in `csv`, nicht beides; maximal 500 Zeilen und 1 MiB. XLSX lokal in JSON umwandeln. Für CSV `column_mapping={"name":"company","site":"website"}` und bei Bedarf `delimiter=";"` nutzen. `import_leads` selbst erhält weiterhin ein JSON-Array:

1. CSV/XLSX mit Read/Bash lesen; Trennzeichen und Encoding pruefen (UTF-8 sicherstellen, Umlaute!).
2. Spalten auf Kernfelder mappen: `email` (Pflicht), `company`, `website`, `phoneNumber`, `city`.
   OutScraper-Referenz-Mapping: `name`→company, `site`→website, `phone`→phoneNumber, `city`→city.
3. Zusaetzliche Spalten, die erhalten bleiben sollen (Rating, Kategorie, Adresse …): als flache Extra-Keys am Lead-Objekt lassen und in `attribute_mappings` deklarieren:
   ```json
   { "rating": {"action": "create_new", "name": "Google Rating", "fieldType": "text"},
     "branche": {"action": "map_existing", "fieldKey": "branche"} }
   ```
4. Vorab-Check: Zeilen ohne gueltige E-Mail zaehlen und dem User melden — das Tool weist den GESAMTEN Call ab, wenn ungueltige E-Mails enthalten sind. Die ersten 20 Zeilendiagnosen stehen direkt im `isError`-Text nach dem Prefix `validation_failed:`; es gibt kein strukturiertes `invalid_rows`-Feld. Ungueltige Zeilen vor dem Call entfernen und im Report ausweisen.
5. Vorab-Dedup bei gescrapten Listen: VOR dem Import `check_leads_exist` (bzw. den kompletten Listen-Flow aus `/outreach-lists`) fahren — Bestands-Leads und `do_not_contact`-Treffer dem User zeigen, bevor Geld oder Kampagnenplaetze draufgehen.

## Phase 2: Gebundene Vorschau und Import

`preview_import(leads=[…], campaign_id=…, list_id=…, attribute_mappings={…})` aufrufen. Zeilenergebnisse, bekannte E-Mails, Kontaktsperren, Website-Zusammenführungen und Attributplan prüfen. Bestehende E-Mail-Treffer werden nicht blind überschrieben; Website-Konsolidierung kann eine andere bestehende Primäridentität schützen. Attribute ohne Website werden im bestehenden Bulkpfad nicht übernommen; die Vorschau weist das aus.

Nach Freigabe exakt die zurückgegebenen `execution`-Felder zusammen mit `preview_token` an `import_leads` senden. Nur vorhandene optionale Felder übernehmen; fehlende Felder nicht als null ergänzen (insbesondere `attribute_mappings` verlangt bei Angabe ein Objekt):

```text
import_leads(
  leads=<preview.execution.leads>,
  campaign_id=<preview.execution.campaign_id>,
  list_id=<preview.execution.list_id>,
  attribute_mappings=<preview.execution.attribute_mappings>,
  preview_token=<preview.preview_token>
)
```

Token gilt 30 Minuten. Payload, Mapping, Ziele und relevanter Bestand werden vor dem Einplanen und nochmals im Worker unter dem User-Mutationslock geprüft. Bei `import_preview_conflict` oder Ablauf eine neue Vorschau holen; den Token niemals einfach weglassen, um den Konflikt zu umgehen. Eine abgelehnte Worker-Ausführung kann Job-Metadaten hinterlassen, verändert aber keine Leads.

- Größere Datenmengen in maximal 500er-Chunks teilen, jeweils unmittelbar vor Ausführung prüfen und sequentiell importieren. Der vorherige Import kann den Bestand für den nächsten Chunk ändern.
- Der alte ungebundene `import_leads`-Aufruf bleibt technisch kompatibel (maximal 10.000), ist aber kein geprüfter Import.
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

Erwartete Tool-Fehler sind MCP-Tool-Results mit `isError: true`; ihr Text beginnt mit `<lowercase_code>:`. Es gibt kein strukturiertes Fehler-Payload.

| Code | Aktion |
|------|--------|
| `validation_failed` mit inline aufgefuehrten Zeilen | Genannte Zeilen fixen/entfernen, erneut senden |
| `limit_reached` | Chunk verkleinern bzw. User informieren (Plan-Limit MAX_LEADS) |
| `campaign_not_found` / `list_not_found` | IDs pruefen (`list_campaigns` / `list_lists`) |
| `insufficient_scope` | Token mit Scope `leads:write` verwenden |
| Job `failed` in get_job_status | Fehlertext aus dem Job-Result berichten; Import NICHT blind wiederholen (Teilzustand pruefen via list_leads) |

## Hinweise

- `secondaryEmails` wird vom Bulk-Import-Pfad nicht verarbeitet (nur via `write_lead_details`).

## Verwandt

- `/outreach-lists` (Vorab-Dedup, Listen-Verwaltung, Liste→Kampagne)
- `/outreach-campaign` (Kampagne zuerst), `/outreach-pipeline` (naechster Schritt)
- die Tool-Beschreibungen des MCP-Servers
