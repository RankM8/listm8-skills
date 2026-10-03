# ListM8-MCP: Import- und Bestands-Tools

Vertragsstand: 2026-10-03 (ListM8 `develop` plus `feat/develop-ui-polish`). Die Referenz deckt die
Tools ab, die in der Datenbeschaffung gebraucht werden. Die vollständige Werkzeugliste liefert die
Tool-Discovery des MCP-Servers; jede Werkzeugbeschreibung dort ist der aktuelle Vertrag und geht
dieser Referenz im Zweifel vor.

## Was ListM8 heute (nicht) kann

- ListM8 scrapt **nicht**. Es gibt keinen Quellenkatalog, keine serverseitigen Quellenläufe, keine
  Beschaffungsaufträge und kein serverseitiges Impressum oder Verifizieren.
- Der Kunde scrapt mit **eigenem Apify- oder Outscraper-Konto** außerhalb von ListM8, bereinigt die
  Ergebnisse und lädt sie hoch: über die Oberfläche (Leads, CSV-Import) oder per MCP `import_leads`,
  optional in eine Liste (`create_list`, `list_id`).
- Kosten fallen beim Anbieter an. ListM8 erfasst sie nicht; wer sie festhalten will, trägt sie in
  `source` der Liste ein (`costUsd`).
- Es gibt keinen Probelauf als Produktfunktion. Der Pilot ist ein kleiner, freigegebener Scrape beim
  Anbieter.

## Konventionen

- Argumente der Tools sind snake_case (`list_id`, `lead_ids`, `attribute_mappings`).
- Fehler kommen als Tool-Ergebnis mit `isError: true` und dem Text `<code>: <Meldung>`. Die Codes
  stehen unten bei den Tools.
- Scopes: `leads:read` zum Lesen, `leads:write` zum Schreiben (schließt Lesen ein). Fehlt der Scope,
  Verbindung und Berechtigungen der MCP-Verbindung klären.
- Antworten tragen teils ein Feld `appUrl` mit einem Link in die App; dem Nutzer gern weitergeben.

## Überblick

| Tool | Zweck | Scope |
|---|---|---|
| `check_leads_exist` | E-Mails und Domains gegen den Bestand prüfen (Dedup vor Anreicherung und Import) | read |
| `export_leads` | Bestand als `json`, `csv` oder kompakter Index (`index`) | read |
| `list_lists` | Eigene Listen mit Zählern und Herkunft | read |
| `get_list` | Eine Liste mit Metadaten und Leads (paginiert) | read |
| `search_leads` | Globale Suche im Lead-Bestand | read |
| `create_list` | Liste mit Herkunft anlegen | write |
| `import_leads` | Leads importieren (asynchron, `job_id`) | write |
| `get_job_status` | Status eines asynchronen Jobs | read |
| `bulk_set_lead_attributes` | Dieselben Attributwerte auf viele Leads setzen | write |
| `add_leads_to_campaign` | Vorhandene Leads einer Kampagne zuordnen | write |
| `mark_leads_contacted` | Kontaktstatus mehrerer Leads setzen | write |
| `delete_list` | Liste löschen, optional sichere Leads mit | write |

## Signaturen

```text
check_leads_exist(emails?: string[], domains?: string[])
export_leads(format?: "json"|"csv"|"index" = "json", list_id?: integer,
             contact_status?: string = "", limit?: integer, offset?: integer = 0)
list_lists(limit?: integer = 25, offset?: integer = 0)
get_list(list_id: integer, limit?: integer = 25, offset?: integer = 0)
search_leads(query?: string = "", contact_status?: string = "", attribute_key?: string = "",
             attribute_value?: string = "", in_campaign?: string = "",
             limit?: integer = 20, offset?: integer = 0)
create_list(name: string, description?: string = "", source?: object)
import_leads(leads: object[], campaign_id?: integer, list_id?: integer,
             attribute_mappings?: object)
get_job_status(job_id: string)
bulk_set_lead_attributes(lead_ids: integer[], attributes: object, create_missing?: boolean = false)
add_leads_to_campaign(campaign_id: integer, list_id?: integer, lead_ids?: integer[])
mark_leads_contacted(emails?: string[], lead_ids?: integer[], status?: string = "contacted",
                     source?: string = "mcp", confirm_reset?: boolean = false)
delete_list(list_id: integer, delete_leads?: boolean = false, confirm_delete?: boolean = false)
```

## Bestand prüfen

### check_leads_exist

Bis zu 1000 Einträge je Aufruf (E-Mails und Domains zusammen). E-Mail-Treffer berücksichtigen auch
Zweitadressen. Ein Domain-Treffer (`firma.de`, ohne Protokoll und `www`) trifft Websites und
E-Mail-Domains und heißt „Firma ist bekannt“: ein Warnsignal, kein automatischer Ausschluss. Treffer
sind pro Eintrag auf 10 begrenzt; `summary.truncated=true` meldet das (meist eine zu breite Domain,
Eingabe eingrenzen).

Antwort: `email_matches`, `domain_matches` und `summary` mit `emails_checked`, `emails_found`,
`emails_new`, `domains_checked`, `domains_matched`, `do_not_contact_hits`, `truncated`. Vor bezahlter
Anreicherung und noch einmal unmittelbar vor `import_leads` ausführen. `do_not_contact`-Leads
niemals in eine Kampagne importieren.

### export_leads

- `format="index"`: je Lead nur `{e: E-Mail, d: Root-Domain der Website oder null, s: Kontaktstatus}`
  plus Zweitadressen. Einmal vor einem Scrape ziehen, lokal gegen die Scrape-Ergebnisse matchen und
  bekannte Domains in die Query-Ausschlüsse geben.
- `format="json"` liefert Zeilen, `format="csv"` CSV-Text. Beide ohne Qualifizierungsinfo
  (Urteile gelten pro Kampagne).
- `list_id` begrenzt auf eine Liste, ohne Angabe gilt der gesamte Bestand. `contact_status` filtert
  (leer = alle). `limit` 1 bis 10000 (Standard 1000, beim Index 10000), paginiert über `offset`;
  die Antwort trägt `total` und `remaining`.

### list_lists, get_list, search_leads

- `list_lists` (`limit` 1 bis 100): je Liste `id`, `name`, `description`, `source`, `leads_total`,
  `leads_in_campaigns`, `leads_contacted`. Beantwortet „was habe ich schon gescrapt?“; vor einem
  neuen Scrape ansehen.
- `get_list` (`limit` 1 bis 200): Metadaten plus eine Seite Leads (`id`, `email`, `company`,
  `website`, `city`, Kontaktstatus, Kampagnenzugehörigkeit), ohne Qualifizierungsinfo; `total`,
  `remaining`.
- `search_leads`: Suchtext (mindestens 2 Zeichen, leer erlaubt bei gesetztem Strukturfilter) gegen
  E-Mail, Firma, Website und Ort. Filter `contact_status` (`not_contacted`,
  `exported_to_instantly`, `contacted`, `replied`, `opportunity`, `do_not_contact`),
  `attribute_key` plus `attribute_value` (Custom-Attribut, exakte Übereinstimmung ohne
  Groß-/Kleinschreibung), `in_campaign` (`none` oder `any`). `limit` 1 bis 100. Liefert Kontaktstatus
  sowie Kampagnen- und Listenzugehörigkeit. Für einzelne Existenzprüfungen im Bulk
  `check_leads_exist` bevorzugen.

## Importieren

### create_list

`name` (3 bis 255 Zeichen), `description` (bis 2000 Zeichen), `source` (freies Objekt für die
Herkunft). Empfohlene Form:

```json
{"tool": "apify", "actor": "compass/crawler-google-places", "query": "sanitär köln",
 "runAt": "2026-10-03", "costUsd": 1.6}
```

Antwort: `list` mit `id`, `name`, `description`, `source`. Die Herkunft beantwortet später „was habe
ich schon gescrapt?“ und ersetzt ein manuelles Scrape-Log.

### import_leads

Bis zu 10000 Leads je Aufruf; Aufruf asynchron, Antwort mit `job_id`.

- Jede Zeile ist ein JSON-Objekt mit **Pflichtfeld `email`** (gültig). Optional: `company`,
  `website`, `phoneNumber`, `city`.
- **Alle anderen Schlüssel** (auch `firstName`, `lastName`, `companyClean`, `hinweis`, `quelle`)
  werden nur gespeichert, wenn sie in `attribute_mappings` deklariert sind; sonst gehen sie verloren.
  Mapping je Spalte entweder
  `{"action":"create_new","name":"Anzeigename","fieldType":"text"}` oder
  `{"action":"map_existing","fieldKey":"bestehender_key"}`.
- `campaign_id` verknüpft die Leads mit einer Kampagne (Pipeline-Status `processing`); ohne Angabe
  liegen sie unkategorisiert im Bestand.
- `list_id` (aus `create_list`) sammelt ALLE Leads des Imports in der Liste, neue wie bereits
  bekannte.
- Der Import startet **keine** KI-Verarbeitung. Qualifizierung, Recherche und E-Mail-Texte starten
  erst über `start_lead_run`.
- Antwort: `status`, `job_id`, `received`, `queued`, `campaign_id`, `list_id`, `appUrl`, `message`.

Fehler: `validation_failed` (leere Liste, ungültige oder fehlende E-Mail mit Zeilennummer, die ersten
20 Zeilen werden genannt, ungültiges Mapping), `limit_reached` (mehr als 10000 Zeilen oder
Plan-Kontingent erschöpft), `import_failed`. Zu große Dateien in Blöcke von höchstens 10000 teilen.

### get_job_status

`get_job_status(job_id)` bis zum Endzustand abfragen (nicht raten, wann der Import fertig ist).
Antwort: `job_id`, `appUrl`, `type`, `status` (`pending`, `processing`, `completed`, `failed`),
`result`, `error`, `created_at`, `updated_at` und, falls vorhanden, Fortschritt
(`progress_percent`, `progress_message`, `failure_reason`, `started_at`, `completed_at`).

`result` des Imports (die Zahlen 1:1 berichten):

| Feld | Bedeutung |
|---|---|
| `imported` | Neu importierte Leads |
| `consolidated` | Mit bestehenden Leads zusammengeführte Zeilen |
| `total` | Zeilen im Aufruf |
| `duplicates` | Bereits vorhandene Leads (werden nie doppelt angelegt) |
| `internalDuplicates` | Dubletten innerhalb der Eingabe |
| `do_not_contact_hits` | Treffer mit `do_not_contact` (`leadId`, `email`) |
| `linked_to_list` | Bei `list_id`: `list_id`, `name`, `newly_linked`; sonst null |
| `errors` | Zeilenfehler |

## Nachbearbeiten

- `bulk_set_lead_attributes`: dieselben Attributwerte auf bis zu 1000 Leads (höchstens 10
  Attribute), z. B. `{"kategorie":"Sanitär","quelle":"apify 2026-10-03"}`. Attribute werden über
  den `fieldKey` angesprochen; unbekannte Keys schlagen fehl, außer `create_missing=true` (legt sie
  als Textattribute an). Bestehende Werte werden überschrieben. Antwort: `updated`,
  `missing_lead_ids`, `attributes_written`, `attributes_created`. Für unterschiedliche Werte je Lead
  `write_lead_details` verwenden.
- `add_leads_to_campaign`: genau eines von `list_id` oder `lead_ids` (höchstens 1000). Mit `list_id`
  darf die Liste höchstens 1000 Leads haben, sonst `limit_reached`; größere Listen in
  `lead_ids`-Blöcken verlinken oder in der Oberfläche über „Zur Kampagne hinzufügen“ an der Liste
  zuordnen. Bereits zugeordnete Leads werden übersprungen, `do_not_contact`-Leads **nie** verlinkt.
  Antwort: `added`, `already_in_campaign`, `skipped_do_not_contact`. Die Qualifizierung beginnt in
  der Zielkampagne von vorn (Urteile gelten pro Kampagne), vorhandene Recherche wird wiederverwendet.
  Danach `start_lead_run`.
- `mark_leads_contacted`: setzt den globalen Kontaktstatus (höchstens 1000), entweder `emails` oder
  `lead_ids`. `status` ist `contacted` (Standard), `replied`, `opportunity`, `do_not_contact` oder
  `not_contacted` (Zurücksetzen nur mit `confirm_reset=true`). Status werden nie herabgestuft;
  `exported_to_instantly` setzt nur der Instantly-Push. Nicht gefundene Einträge stehen in
  `unmatched_emails` beziehungsweise `unmatched_lead_ids`. Dient dazu, extern kontaktierte Leads
  abzugleichen, damit niemand doppelt angeschrieben wird.

## Aufräumen

`delete_list(list_id, delete_leads=false, confirm_delete=false)` entfernt standardmäßig nur die
Gruppierung, alle Leads bleiben. Mit `delete_leads=true` (verlangt `confirm_delete=true`, sonst
`confirmation_required`) werden zusätzlich nur Leads gelöscht, die nie kontaktiert wurden, in keiner
Kampagne und in keiner anderen Liste sind; alle übrigen werden nur gelöst. Das macht Test-Importe
rückgängig und gibt das `max_leads`-Kontingent wieder frei. Antwort: `deleted_list`,
`leads_deleted`, `leads_detached`. Das Löschen von Leads ist unwiderruflich: nur auf ausdrücklichen
Wunsch.

## Weiterverarbeitung

Nach dem Import: Liste prüfen (`get_list`), auf Wunsch einer bestätigten Kampagne zuordnen
(`add_leads_to_campaign`) und über den Outreach-Workflow `start_lead_run` für `qualification`,
`research`, `email` verarbeiten. `start_lead_run` nimmt keine `list_id`; die Auswahl der Leads
erfolgt über die Kampagne. Vorher aktive Lead-Läufe prüfen (`list_lead_runs`). Kosten des KI-Laufs
sind getrennt vom Scrape beim Anbieter abzustimmen.
