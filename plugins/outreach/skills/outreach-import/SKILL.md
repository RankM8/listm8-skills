---
name: outreach-import
description: Use when user says "outreach:import", "mcp:import", "importiere leads via mcp", "leads hochladen mcp", "csv leads importieren", "outscraper import mcp", "apify export importieren", or triggers /mcp:import. Importiert extern beschaffte Lead-Listen (CSV/JSON, z. B. Apify- oder Outscraper-Export) per import_leads.
---

# MCP Import — Lead-Listen hochladen

Dieser Skill lädt Lead-Listen über das MCP-Tool `import_leads` (Scope `leads:write`) in ListM8 — aus CSV-Dateien (z. B. Apify- oder Outscraper-Exporte), JSON oder Inline-Daten. Das Scraping selbst passiert außerhalb von ListM8 (der Kunde nutzt Apify, Outscraper o. Ä.); der MCP bekommt nur das Ergebnis. Mit `campaign_id` werden die Leads der Kampagne zugeordnet (Status `processing`); ohne entstehen unkategorisierte Leads im globalen Bestand. Der Import startet KEINE Verarbeitung — anschließend `/outreach-pipeline` (serverseitiger Lauf via `start_lead_run`) oder die Einzel-Skills.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-import <datei> 80` | Datei parsen, in Kampagne 80 importieren |
| `/outreach-import <datei>` | Kampagne via `list_campaigns` wählen (oder „ohne Kampagne") |
| `importiere diese leads: ...` | Inline-Daten importieren |

## Phase 1: Daten lokal lesen und vorbereiten

Keine Dateipfade oder URLs an den Server übergeben: `import_leads` erhält ein JSON-Array von Lead-Objekten (max. 10.000 pro Call).

1. CSV/XLSX mit Read/Bash lesen; Trennzeichen und Encoding prüfen (UTF-8 sicherstellen, Umlaute!). XLSX lokal in JSON umwandeln.
2. Spalten auf Kernfelder mappen: `email` (Pflicht), `company`, `website`, `phoneNumber`, `city`.
   Outscraper-Referenz-Mapping: `name`→company, `site`→website, `phone`→phoneNumber, `city`→city. Bei Apify-Exporten die Spaltennamen des jeweiligen Actors prüfen.
3. Zusätzliche Spalten, die erhalten bleiben sollen (Rating, Kategorie, Adresse …): als flache Extra-Keys am Lead-Objekt lassen und in `attribute_mappings` deklarieren (ohne Deklaration werden Extra-Keys nicht gespeichert):
   ```json
   { "rating": {"action": "create_new", "name": "Google Rating", "fieldType": "text"},
     "branche": {"action": "map_existing", "fieldKey": "branche"} }
   ```
   `create_new` braucht `name` und `fieldType`, `map_existing` einen `fieldKey`; sonst `validation_failed`.
4. Vorab-Check E-Mails: Das Tool weist den GESAMTEN Call ab, wenn eine Zeile keine gültige `email` hat. Die ersten 20 Zeilendiagnosen stehen im `isError`-Text nach dem Prefix `validation_failed:` („row N: …"); es gibt kein strukturiertes `invalid_rows`-Feld. Zeilen ohne gültige E-Mail vor dem Call entfernen, zählen und im Report ausweisen.
5. Vorab-Dedup: VOR dem Import `check_leads_exist` (E-Mails und/oder Domains, bis 1.000 je Call, in Chunks) fahren — Bestands-Leads und `do_not_contact`-Treffer dem Nutzer zeigen, bevor Kampagnenplätze oder Verarbeitungskosten draufgehen. Domain-Treffer heißen „Firma bekannt" (Warnung, kein Ausschluss). Den kompletten Listen-Flow beschreibt `/outreach-lists`.

## Phase 2: Import

```text
import_leads(leads=[…], campaign_id=…, list_id=…, attribute_mappings={…})
```

- `list_id` für beschaffte Listen immer setzen (Herkunft + späteres Aufräumen via `delete_list`); die Liste vorher mit `create_list` anlegen und die Herkunft in `source` festhalten. Listen-Verwaltung: `/outreach-lists`.
- Größere Datenmengen in Chunks (z. B. 1.000–5.000) sequentiell importieren und jeweils den Job abwarten; so bleibt ein Fehler eingrenzbar.
- Response: `job_id` (der Import läuft asynchron) und `received`; bei den Links der Antwort (`appUrl`) kann der Nutzer den Stand in der Oberfläche sehen.
- Dedup macht das Backend: listenintern und gegen bestehende Leads; bestehende Leads werden nur zur Kampagne bzw. Liste verlinkt (kein Duplikat, keine Feld-Überschreibung). `do_not_contact`-Leads werden nicht in Kampagnen aufgenommen und im Ergebnis gemeldet.

## Phase 3: Job pollen & Report

Der Import ist ERST fertig, wenn der Job es sagt — nie nach festem Warten zählen:

1. `get_job_status(job_id)` pollen (anfangs alle ~5 s, bei großen Imports alle 15–30 s), bis `status` = `completed` oder `failed`. Ein 10.000er-Import kann mehrere Minuten laufen.
2. Das Job-Result enthält die Wahrheit: `imported`, `consolidated`, `total`, `duplicates` und `internalDuplicates` (nur verlinkt bzw. listenintern), `linked_to_list` (bei `list_id`: `list_id`, `name`, `newly_linked`), `do_not_contact_hits` (Bestands-Leads mit Kontaktsperre) und `errors`. Diese Zahlen 1:1 an den Nutzer berichten — NICHT stattdessen `list_leads` zählen (während der Job läuft, fehlen Leads, und der Report würde Doppel-Importe provozieren).
3. Optional zur Sichtkontrolle danach: `list_leads(campaign_id, fit_level="", research_status="", campaign_status="processing")`.
4. Report: übergeben / importiert / Duplikate / do_not_contact-Treffer / vorab entfernte ungültige Zeilen / `job_id`.

## Fehlerbehandlung

Erwartete Tool-Fehler sind MCP-Tool-Results mit `isError: true`; ihr Text beginnt mit `<lowercase_code>:`. Es gibt kein strukturiertes Fehler-Payload.

| Code | Aktion |
|------|--------|
| `validation_failed` mit inline aufgeführten Zeilen | Genannte Zeilen fixen/entfernen, erneut senden |
| `validation_failed` zu `attribute_mappings` | Mapping nach dem Schema oben korrigieren |
| `limit_reached` | Chunk verkleinern (max. 10.000 pro Call) bzw. Nutzer informieren (Plan-Limit `max_leads`) |
| `campaign_not_found` / `list_not_found` | IDs prüfen (`list_campaigns` / `list_lists`) |
| `import_failed` | Meldung berichten, Import nicht blind wiederholen |
| `insufficient_scope` / `access_denied` | Token mit Scope `leads:write` verwenden |
| Job `failed` in `get_job_status` | Fehlertext aus dem Job-Result berichten; Import NICHT blind wiederholen (Teilzustand prüfen via `list_leads`) |

## Hinweise

- `secondaryEmails` wird vom Bulk-Import-Pfad nicht verarbeitet (nur via `write_lead_details`).
- Import und Verarbeitung sind getrennt: Nach dem Job-Ende `start_lead_run` (vorher `list_lead_runs(active_only=true)` prüfen).

## Verwandt

- `/outreach-lists` (Vorab-Dedup, Listen-Verwaltung, Liste→Kampagne)
- `/outreach-campaign` (Kampagne zuerst), `/outreach-pipeline` (nächster Schritt)
- die Tool-Beschreibungen des MCP-Servers
