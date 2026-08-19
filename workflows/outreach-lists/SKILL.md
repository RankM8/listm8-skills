---
name: outreach-lists
description: Use when user says "outreach:lists", "Listen anzeigen", "Liste anlegen", "Liste löschen", "was habe ich schon gescrapt", "Bestand prüfen", "Leads exportieren", "Bestandsindex", "Liste in Kampagne", "bulk taggen", or wants to manage lead lists in the Outreach app via MCP.
---

# Outreach Lists — Listen verwalten über den MCP

Verwaltet Lead-Listen: die benannten Gruppierungen zwischen Datenbeschaffung und Kampagne.
Leads bleiben dabei immer normale Leads im globalen Bestand — eine Liste ist eine Klammer mit
Herkunft, kein zweiter Datentopf.

Scope: `leads:read` fürs Lesen/Exportieren, `leads:write` für Anlegen/Löschen/Verlinken.

## Die Werkzeuge und wann welches

| Aufgabe | Tool | Hinweise |
|---|---|---|
| „Was habe ich schon (gescrapt)?" | `list_lists` | Zähler je Liste: total, in Kampagnen, kontaktiert; Herkunft (`source`) zeigt Actor/Query/Datum/Kosten |
| Liste durchsehen | `get_list(list_id, limit, offset)` | Neutraler Browse mit Kampagnen-Mitgliedschaften — OHNE die Pipeline-Filterlogik von `list_leads` |
| Liste anlegen | `create_list(name, description, source)` | `source` IMMER füllen ({tool, actor, query, runAt, costUsd}) — sie ersetzt jedes manuelle Scrape-Log |
| Leads hineinbekommen | `import_leads(leads, list_id, attribute_mappings)` | Dedupliziert selbst: Bestands-Leads werden nur verlinkt; Report nennt `linked_to_list` + `do_not_contact_hits` |
| Bestand prüfen (Bulk) | `check_leads_exist(emails, domains)` | Bis 1.000 kombiniert je Call; E-Mail-Match inkl. Zweitadressen; Domain-Treffer = „Firma bekannt" (Warnung, kein Ausschluss) |
| Bestand exportieren | `export_leads(format, list_id, contact_status, limit, offset)` | `json`/`csv` für Menschen und Tools; **`index`** ist der kompakte Abgleichsindex für den Vorab-Dedup vor Scrape-Läufen |
| Liste → Kampagne | `add_leads_to_campaign(campaign_id, list_id \| lead_ids)` | Überspringt `do_not_contact` IMMER und meldet es; verlinkte Leads starten als „processing" — KI-Läufe startet erst `start_lead_run` |
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
die Datenbeschaffung matcht damit lokal, bevor Anreicherung Geld kostet.

**„Schieb Liste X in Kampagne Y"** → erst `get_list` (Zahlen + kontaktiert-Anteil zeigen) →
Bestätigung → `add_leads_to_campaign(campaign_id, list_id)` → Report (added / already / dnc-skipped).

## Grenzen (ehrlich benennen)

Kein Bulk-Löschen einzelner Leads außerhalb von Listen, kein Listen-Merge, keine Regel-Listen —
wer das braucht: Liste neu zusammenstellen (`search_leads` + `import_leads` mit `list_id`
verlinkt Bestands-Leads ohne Duplikate).
