---
name: outreach-lists
description: Use when user says "outreach:lists", "Listen anzeigen", "Liste anlegen", "Liste löschen", "was habe ich schon gescrapt", "Bestand prüfen", "Leads exportieren", "Bestandsindex", "Liste in Kampagne", "bulk taggen", or wants to manage lead lists in the Outreach app via MCP.
---

# Outreach Lists — Listen verwalten über den MCP

> **Live-Ansicht (Claude Code mit Plugin `outreach`):** Ergebnisse von `list_leads`, `import_leads`/`get_job_status` und Lead-Runs erscheinen dort als Karte bzw. im Band über dem Prompt. Dann die Liste **nicht noch einmal als Tabelle** wiederholen – nur kurz zusammenfassen, was der Nutzer wissen oder entscheiden muss. In anderen Umgebungen (Claude-Chat, ChatGPT, Codex) wie gewohnt als kurze Liste ausgeben.

Verwaltet Lead-Listen: die benannten Gruppierungen zwischen Datenbeschaffung (extern, z. B. Apify/Outscraper) und Kampagne.
Leads bleiben dabei immer normale Leads im globalen Bestand — eine Liste ist eine Klammer mit
Herkunft, kein zweiter Datentopf.

Scope: `leads:read` fürs Lesen/Exportieren, `leads:write` für Anlegen/Löschen/Verlinken.

## Die Werkzeuge und wann welches

| Aufgabe | Tool | Hinweise |
|---|---|---|
| „Was habe ich schon (gescrapt)?" | `list_lists` | Zähler je Liste: total, in Kampagnen, kontaktiert; Herkunft (`source`) zeigt, was der Nutzer dort hinterlegt hat (z. B. Tool/Actor/Query/Datum/Kosten) |
| Liste durchsehen | `get_list(list_id, limit, offset)` | Neutraler Browse (`limit` 1–200, Standard 25) mit Kampagnen-Mitgliedschaften — OHNE die Pipeline-Filterlogik von `list_leads` |
| Liste anlegen | `create_list(name, description, source)` | `source` IMMER füllen (frei, z. B. {tool, actor, query, runAt, costUsd}) — sie ersetzt jedes manuelle Scrape-Log |
| Leads hineinbekommen | `import_leads(leads, list_id, attribute_mappings)` | Dedupliziert selbst: Bestands-Leads werden nur verlinkt; läuft async (`job_id`, per `get_job_status` abwarten), das Job-Result nennt `linked_to_list` + `do_not_contact_hits` |
| Bestand prüfen (Bulk) | `check_leads_exist(emails, domains)` | Bis 1.000 kombiniert je Call; E-Mail-Match inkl. Zweitadressen; Domain-Treffer = „Firma bekannt" (Warnung, kein Ausschluss); Treffer je Eingabe auf 10 gekappt (`summary.truncated`) |
| Bestand exportieren | `export_leads(format, list_id, contact_status, limit, offset)` | `json`/`csv` für Menschen und Tools (Seiten bis 10.000 Zeilen, `limit`/`offset`); **`index`** ist der kompakte Abgleichsindex ({e, d, s} je Lead) für den Vorab-Dedup vor externen Scrape-Läufen |
| Liste → Kampagne | `add_leads_to_campaign(campaign_id, list_id \| lead_ids)` | Überspringt `do_not_contact` IMMER und meldet es; verlinkte Leads starten als „processing" — KI-Läufe startet erst `start_lead_run`. HARTES LIMIT 1000: Bei Listen > 1000 Leads wirft `list_id` `limit_reached` — dann IDs via `get_list` (limit max. 200, offset) paginiert holen oder per `export_leads(list_id=…, limit/offset)` und in Chunks bis 1000 über `lead_ids` verlinken |
| Batch taggen | `bulk_set_lead_attributes(lead_ids, attributes, create_missing)` | Gleiche Attributwerte auf bis zu 1.000 Leads in EINEM Call; für je-Lead-verschiedene Werte `write_lead_details` |
| Global suchen/filtern | `search_leads(query, attribute_key/attribute_value, in_campaign)` | Strukturfilter erlauben leere Text-Query; `in_campaign="none"` = noch unverplantes Rohmaterial |
| Liste löschen | `delete_list(list_id, delete_leads, confirm_delete)` | s. Löschregeln |

## Löschregeln (dem Nutzer VOR dem Löschen erklären)

- Ohne `delete_leads`: nur die Klammer verschwindet, jeder Lead bleibt.
- Mit `delete_leads=true` (verlangt `confirm_delete=true`): gelöscht werden NUR Leads, die nie
  kontaktiert wurden, in keiner Kampagne und in keiner anderen Liste sind — alles andere wird
  entkoppelt. Der Report nennt beide Zahlen. Das ist das Undo für Test-Importe und gibt das
  `max_leads`-Limit frei.
- Löschen ist endgültig — immer erst `get_list` zeigen, dann die ausdrückliche Bestätigung des
  Nutzers einholen, dann löschen.

## Typische Abläufe

**„Zeig mir meine Listen"** → `list_lists` → kompakte Tabelle (Name, total/in Kampagnen/kontaktiert,
Herkunft, Datum).

**„Sind die schon im Bestand?" (vor einem Import)** → E-Mails/Domains sammeln →
`check_leads_exist` → Zusammenfassung: X neu, Y bekannt, Z do_not_contact (namentlich — die
werden NIE importiert oder angeschrieben).

**„Gib mir den Abgleichsindex"** → `export_leads(format="index")` → als Datei speichern —
damit gleicht der Nutzer die extern gescrapten Ergebnisse lokal ab, bevor Anreicherung oder Verifizierung Geld kostet.

**„Schieb Liste X in Kampagne Y"** → erst `get_list` (Zahlen + kontaktiert-Anteil zeigen) →
Bestätigung → `add_leads_to_campaign(campaign_id, list_id)` → Report (added / already / dnc-skipped).
Bei > 1000 Leads in der Liste: IDs paginiert holen (`get_list` mit limit max. 200 oder `export_leads(format="json", list_id=…, limit=1000, offset hochzählen)`), je 1000 als
`lead_ids`-Chunk verlinken, Reports aufsummieren — `list_id` direkt würde `limit_reached` werfen.
Danach startet `start_lead_run` die Verarbeitung (vorher `list_lead_runs(active_only=true)` prüfen).

## Grenzen (ehrlich benennen)

Kein Bulk-Löschen einzelner Leads außerhalb von Listen, kein Listen-Merge, keine Regel-Listen —
wer das braucht: Liste neu zusammenstellen (`search_leads` + `import_leads` mit `list_id`
verlinkt Bestands-Leads ohne Duplikate).
