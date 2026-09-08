# ListM8-MCP: Datenbeschaffung

Vertragsstand: 2026-09-08. Für Quellen im Katalog ist dies der Standardweg.
Die manuellen Actor-Referenzen und Skripte gelten nur als Fallback außerhalb des Katalogs.
Zur Laufzeit ist das von `list_lead_sources` gelieferte Formularschema maßgeblich.

## Tool-Signaturen

Alle fünf Werkzeuge verlangen `leads:write`, auch die Leseoperationen.

```text
list_lead_sources()
estimate_lead_source_run(source_key: string, params: object,
                        max_items?: integer, max_total_charge_micro_usd?: integer)
start_lead_source_run(source_key: string, params: object,
                     max_items?: integer, max_total_charge_micro_usd?: integer)
get_lead_source_run(run_id: string)
cancel_lead_source_run(run_id: string)
```

MCP verwendet für äußere Argumente snake_case. `params` und die DTO-Antworten verwenden
camelCase. Nicht mit den REST-Envelopes oder REST-Argumenten vermischen.

### Katalog lesen

`list_lead_sources()` liefert `{ "sources": [...] }`, ohne Parameter und ohne Actor-Start.
Eine Apify-Verbindung ist dafür nicht nötig. Jede Definition enthält:

- `key`, `label`, `description`; die Texte sind Übersetzungsschlüssel.
- `formFields` mit `name`, `type`, `label`, `required`, `default`, `min`, `max`, `options`.
- `primaryActor`, `fallbackActor`, `chain`, `pricing` und `regionRules`.
- `pricing.updatedAt`, `pricing.unit`, `pricing.pricesMicroUsd` nach Apify-Staffel.

Feldtypen: `text`, `number`, `select`, `boolean`, `country`. Optionen sind Objekte mit
`value` und `label`. Unbekannte Parameter werden abgelehnt. Defaults ergänzen fehlende Werte;
Pflichtfelder dürfen nicht leer sein. Aktueller Katalog:

| Quelle | Feld | Typ | Default | Zulässige Werte |
|---|---|---|---|---|
| beide | `query` | text, Pflicht | keiner | 1 bis 200 Zeichen, getrimmt |
| Maps | `location` | text, Pflicht | keiner | 1 bis 200 Zeichen, getrimmt |
| Maps | `minimumStars` | select | `""` | `""`, `"3"`, `"3.5"`, `"4"`, `"4.5"` |
| Maps | `minimumReviews` | number | 0 | Ganze Zahl, 0 bis 1000000 |
| Maps | `onlyWithWebsite` | boolean | false | `true` oder `false`, kein String |
| beide | `maxItems` | number, Pflicht | 500 | Ganze Zahl, 1 bis 5000 |
| beide | `country` | country, Pflicht | DE | ISO-3166-1 alpha-2 in Großbuchstaben |
| SERP | `language` | select, Pflicht | de | `de`, `en` |

Maps bedeutet `google_maps_local`, SERP bedeutet `google_serp_companies`.
Maps hat keinen Radiusparameter. SERP hat kein eigenes Ortsfeld; den Ort in `query` aufnehmen.
Impressum wird gemäß `regionRules.imprintCountries` nur für DE, AT und CH ausgeführt.

### Schätzen und starten

Schätzung und Start verwenden identische Argumente. `max_items` ist optional, ganzzahlig
von 1 bis 5000 und überschreibt `params.maxItems`. `max_total_charge_micro_usd` ist optional,
ganzzahlig von 1 bis 1000000000. Ohne Wert gilt der Apify-Benutzerstandard, initial 20000000.

| Micro-USD | USD |
|---|---|
| 500000 | 0,50 |
| 1000000 | 1,00 |
| 20000000 | 20,00 |
| 1000000000 | 1000,00 |

`estimate_lead_source_run` liest die Apify-Kontoinformationen und startet keinen Actor.
Die Antwort kommt direkt, ohne REST-Envelope:

```json
{
  "sourceKey": "google_maps_local",
  "maxItems": 50,
  "tier": "GOLD",
  "estimatedCostMicroUsd": 400000,
  "minCostMicroUsd": 260000,
  "maxCostMicroUsd": 400000,
  "maxTotalChargeMicroUsd": 20000000,
  "budgetLimited": false,
  "pricingUpdatedAt": "2026-09-08"
}
```

Das ist ein Formbeispiel, kein zugesagter Preis. Vor **jedem** Start die tatsächliche Schätzung,
Spanne, Staffel, Preisstand und den harten Kostendeckel bestätigen lassen. Bei geändertem
Suchbegriff, Filter, Volumen oder Budget erneut schätzen. `budgetLimited` ausdrücklich melden;
fehlendes Budget nicht eigenständig erhöhen. Den bestätigten Deckel beim Start mitsenden.
Apify rechnet über das eigene Kundenkonto ab, ListM8 zeigt und erfasst die externen Kosten.

`start_lead_source_run` nimmt den Lauf asynchron an und liefert:

```json
{
  "run_id": "9cf34fa3-90e3-47ac-bdc5-f76712059a3d",
  "job_id": "fcf2be51-ea36-44e2-9f45-e6c366c8027f",
  "status": "pending"
}
```

`run_id` ist die Beschaffungs-UUID. `job_id` gehört zum initialen Job, nicht zur ganzen Kette.
Nicht mit `leadListId` oder der späteren `lead_run_id` aus der Qualifizierung verwechseln.
Bei unklarer Startantwort zuerst den Verlauf in ListM8 prüfen, statt einen zweiten Lauf zu starten.

### Lauf lesen und abbrechen

`get_lead_source_run(run_id)` liefert direkt den vollständigen Lauf-DTO:

| Bereich | Felder |
|---|---|
| Identität | `id`, `sourceKey`, `paramsJson`, `maxItems` |
| Zustand | `status`, `currentStep`, `cancelRequestedAt`, `failureKind`, `failureMessage` |
| Ergebnis | `leadListId`, `countersJson` |
| Kosten | `maxTotalChargeMicroUsd`, `estimatedCostMicroUsd`, `actualCostMicroUsd` |
| Zeitpunkte | `createdAt`, `startedAt`, `finishedAt` |
| Schritte | `steps`, geordnet nach `sequenceNo` |

Zeitpunkte verwenden ISO 8601. Nicht verfügbare Werte sind null. `leadListId` ist eine
ganzzahlige ID oder null, keine UUID. `steps` enthalten `id`, `stepKey`, `sequenceNo`, `status`,
`actorId`, `apifyRunId`, `fallbackApifyRunId`, `apifyDatasetId`, `jobId`, `itemCount`,
`costMicroUsd`, `startedAt`, `finishedAt` und `errorMessage`.

`cancel_lead_source_run(run_id)` liefert denselben DTO. Ohne laufenden Remote-Actor kann der
Lauf sofort `cancelled` sein. Andernfalls bleibt er zunächst offen, während der Worker den
Actor beendet und Kosten übernimmt. `cancelRequestedAt` ist nur die Abbruchanforderung.
Bis zum Endzustand weiter mit `get_lead_source_run` abfragen. Bereits entstandene Kosten
bleiben bestehen; bereits importierte Leads nicht löschen.

## Zustände und Kette

| Ebene | Werte |
|---|---|
| Lauf | `pending`, `running`, `completed`, `failed`, `cancelled` |
| Endzustände | `completed`, `failed`, `cancelled` |
| Schrittstatus | `pending`, `running`, `completed`, `failed`, `skipped`, `cancelled` |
| Trefferstatus | `new`, `known`, `enriched`, `verified`, `discarded`, `imported` |
| E-Mail-Prüfung | `valid`, `catch_all`, `invalid`, `unknown` |

| Reihenfolge | Schritt | Serverseitige Aufgabe |
|---|---|---|
| 1 | `source` | Quelle abrufen; Fallback bei bestätigtem Fehler oder leerem Ergebnis nach Serverregeln |
| 2 | `dedupe` | Bestandsabgleich über E-Mail und Domain |
| 3 | `imprint` | E-Mail-Lücken neuer Kandidaten über Impressum ergänzen, nur DACH |
| 4 | `verify` | Neue E-Mails prüfen; ungültige verwerfen, Catch-all und unbekannte markieren |
| 5 | `import` | Neue Liste anlegen, neue Leads importieren und bekannte verknüpfen |

Bekannte Treffer überspringen kostenpflichtige Anreicherung und Verifizierung. Dedupe findet
**nach** der Quellensuche statt, nicht vor deren Kosten. Kein kostenloses Aussortieren aller
Bestandsleads vor dem Quellenabruf versprechen. Ein `skipped`-Schritt ist nicht automatisch ein
Fehler. Kein manueller Actor-Start nötig, um übersprungene Schritte „nachzuholen“.

`get_lead_source_run` etwa alle 30 bis 60 Sekunden bis zum Endzustand abfragen. Bei
Unterbrechungen dieselbe Run-ID weiterverwenden. `completed` garantiert weder die angeforderte
Treffermenge noch eine durchgehend kontaktierbare Liste.

## Zähler im Report

Alle Werte unter `countersJson` lesen. Fehlende Werte in älteren Serverantworten als „nicht
verfügbar“ markieren, nicht als null Treffer erfinden.

| Feld | Bedeutung |
|---|---|
| `found` | Im Lauf gespeicherte Quellentreffer |
| `known` | Beim Bestandsabgleich bekannte Treffer |
| `newCandidates` | Neue Kandidaten nach Abzug bekannter Treffer |
| `enrichedByImprint` | Treffer mit E-Mail aus der Impressum-Anreicherung |
| `verifiedValid` | Als gültig geprüfte E-Mail-Treffer |
| `verifiedCatchAll` | Catch-all-Prüfergebnisse, markiert importierbar |
| `verifiedInvalid` | Ungültige Prüfergebnisse, verworfen |
| `verifiedUnknown` | Unklare Prüfergebnisse, markiert importierbar, nicht als gültig ausgeben |
| `discardedNoContact` | Wegen fehlender E-Mail verworfene Treffer |
| `imported` | Neu importierte eindeutige E-Mail-Adressen, ohne bloß verknüpfte Bestandsleads |
| `doNotContactHits` | Bekannte Treffer mit Kontaktstatus ungleich `not_contacted` |

`doNotContactHits` umfasst nicht nur explizit gesperrte, sondern auch bereits kontaktierte
Leads. Diese können in der Liste erscheinen; daraus niemals eine erneute Kontaktfreigabe
ableiten. `imported` ist weder die gesamte Listenmitgliedschaft noch eine Zahl garantiert
zustellbarer Adressen. Bekannte Leads können zusätzlich in der Liste verknüpft sein. Verifizierungszähler zählen Treffer, nicht notwendigerweise eindeutige Adressen.
Überlappende Zähler nicht zu einer scheinbar exakten Verlustrechnung addieren.

## Fehler und Kontingente

Erwartete MCP-Fehler kommen als Tool-Ergebnis mit `isError: true` und Text
`<code>: <message>`, nicht als HTTP-Status oder strukturiertes Fehlerobjekt. Die HTTP-Spalte
ordnet die REST-Gegenstücke ein.

| HTTP-Einordnung | MCP-Code | Vorgehen |
|---|---|---|
| 402 | `payment_required` | Apify-Zugang, Guthaben oder gemeldete Kontingentgrenze klären; nicht blind wiederholen |
| 400 | `validation_failed` | Parameter anhand des Katalogs korrigieren, erneut schätzen und Änderung bestätigen lassen |
| 404 | `not_found` | Quellenschlüssel beziehungsweise eigene Run-ID prüfen; fremde und unbekannte Läufe sind nicht unterscheidbar |
| Berechtigung | `insufficient_scope` | ListM8-MCP-Verbindung mit `leads:write` klären |
| 401 bei REST | Authentifizierung fehlt | Verbindung neu autorisieren, keine Tokens im Chat austauschen |

Falsche JSON-Schema-Typen oder Werte außerhalb der Schema-Grenzen können bereits als
JSON-RPC-Fehler abgelehnt werden. Keine kostenpflichtige Ausführung als Validierungstest verwenden.

Das ListM8-Lead-Kontingent ist unabhängig vom Apify-Guthaben. Der Start prüft grundsätzlich
die Verfügbarkeit; die konkrete Menge wird erst vor dem Import geprüft. Ein Importfehler
`failureKind=limit_exceeded` kann deshalb nach bereits entstandenen Apify-Kosten auftreten.
Bei `failed` immer `failureKind`, `failureMessage`, Schrittfehler und tatsächliche Kosten lesen
und melden. Kein automatischer neuer Lauf als vermeintliche Reparatur.

## Abschluss und Weiterverarbeitung

`leadListId`, Zähler, Kosten und Stichprobe nach `../../listen-qualitaet/SKILL.md` prüfen.
Die bereits angelegte Liste verwenden. Kein zweites `create_list` oder `import_leads` für
Katalogergebnisse. Herkunft und Kostenbelege liegen an der Liste in `sourceJson`, einschließlich
der Schrittbelege. Nicht durch selbst erfundene Provenienz ersetzen.

Auf bestätigten Folgeauftrag die ausgewählten Listenleads einer Kampagne zuordnen und den
bestehenden Outreach-Workflow für `start_lead_run` nutzen. Vorher aktive Lead-Läufe prüfen.
Die Stufen heißen `qualification`, `research`, `email`. Auswahl und Budget separat abstimmen;
`start_lead_run` nimmt keine direkte `list_id` entgegen. Seine OpenRouter-Budgetgrenze ist
nicht der Apify-Deckel des Beschaffungslaufs.
