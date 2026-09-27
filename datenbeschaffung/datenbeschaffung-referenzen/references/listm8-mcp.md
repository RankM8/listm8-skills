# ListM8-MCP: Datenbeschaffung

Vertragsstand: 2026-09-26. Für Quellen im Katalog ist dies der Standardweg.
Die manuellen Actor-Referenzen und Skripte gelten nur als Fallback außerhalb des Katalogs.
Zur Laufzeit ist das von `list_lead_sources` gelieferte Formularschema maßgeblich.

## Tool-Signaturen

Alle hier beschriebenen Werkzeuge verlangen `leads:write`, auch die Leseoperationen.

```text
list_lead_sources()
estimate_lead_source_run(source_key: string, params: object,
                        max_items?: integer, max_total_charge_micro_usd?: integer)
start_lead_source_run(source_key: string, params: object,
                     max_items?: integer, max_total_charge_micro_usd?: integer)
get_lead_source_run(run_id: string)
cancel_lead_source_run(run_id: string)
retry_lead_source_verification(run_id: string)

estimate_sourcing_order(name, target_new_leads, max_total_charge_micro_usd,
                        matrix, max_cell_charge_micro_usd?, area_mode?, parallel_cells?)
create_sourcing_order(request_id, dieselben Argumente wie estimate_sourcing_order)
get_sourcing_order(order_id: string)
list_sourcing_order_cells(order_id: string, start?: integer, limit?: integer)
pause_sourcing_order(order_id) / resume_sourcing_order(order_id) / cancel_sourcing_order(order_id)
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

Feldtypen: `text`, `text_list`, `number`, `select`, `boolean`, `country`. Optionen sind Objekte mit
`value` und `label`. Unbekannte Parameter werden abgelehnt. Defaults ergänzen fehlende Werte;
Pflichtfelder dürfen nicht leer sein. Aktueller Katalog:

| Quelle | Feld | Typ | Default | Zulässige Werte |
|---|---|---|---|---|
| SERP | `query` | text, Pflicht | keiner | 1 bis 200 Zeichen, getrimmt |
| Maps | `categories` | text_list, Pflicht | keiner | 1 bis 400 Suchbegriffe; ein alter `query`-String wird als Liste mit einem Eintrag übernommen |
| Maps | `locations` | text_list | `[]` | 0 bis 400 Einträge: Ort, Stadtteil oder PLZ; ein alter `location`-String wird als Liste übernommen |
| Maps | `radiusKm` | number | keiner | Optional, Umkreis je Ort in km; 1 bis 100 im Beschaffungsauftrag, bis 2000 im Einzellauf; nur zusammen mit `locations` |
| Maps | `adminArea1` | select | keiner | Optional, Bundesland oder Kanton aus den Katalogoptionen; im Einzellauf nur zur Eingrenzung eines Orts, ohne Orte nur im Beschaffungsauftrag |
| Maps | `adminArea2` | text | keiner | Optional, Landkreis mit bis zu 200 Zeichen; wird in PLZ-Einheiten aufgeteilt, auch ohne `locations` |
| Maps | `minimumStars` | select | `""` | `""`, `"3"`, `"3.5"`, `"4"`, `"4.5"` |
| Maps | `minimumReviews` | number | 0 | Ganze Zahl, 0 bis 1000000 |
| Maps | `onlyWithWebsite` | boolean | false | `true` oder `false`, kein String |
| Maps | `maxItems` | number, optional | keiner | Ganze Zahl, 1 bis 5000, gilt je Suchbegriff und Gebietseinheit; leer bedeutet alle Orte des Gebiets |
| SERP | `maxItems` | number, Pflicht | 500 | Ganze Zahl, 1 bis 5000 |
| beide | `country` | country, Pflicht | DE | ISO-3166-1 alpha-2 in Großbuchstaben |
| SERP | `language` | select, Pflicht | de | `de`, `en` |

Maps bedeutet `google_maps_local`, SERP bedeutet `google_serp_companies`. Weitere optionale
Maps-Felder wie `exactCategory`, `excludeClosed`, `package`, `rescrapeCovered` und `coverageDays`
stehen mit Default und Bedeutung im Katalog. Die LinkedIn-Quelle nimmt 1 bis 500 Profile.
Maps nimmt `categories` und `locations` als Listen (Ort, Stadtteil oder PLZ), optional `radiusKm`
je Ort (1 bis 100 km im Auftrag, bis 2000 im Einzellauf), `adminArea1` (nur zur Eingrenzung eines
Orts; ohne Orte nur im Beschaffungsauftrag) und `adminArea2` (Landkreis, wird in PLZ-Einheiten
aufgeteilt). Jede Gebietseinheit ist ein Actor-Lauf mit allen Kategorien: ein Ort ist eine
`city`-Einheit, ein Ort mit Umkreis eine `circle`-Einheit, eine PLZ oder ein Stadtteil
`postal_code`-Einheiten, ein Landkreis PLZ-Einheiten. Bundesland, Kanton oder ganzes Land laufen
ausschließlich als Beschaffungsauftrag. SERP hat kein eigenes Ortsfeld; den Ort in `query` aufnehmen.
Impressum wird gemäß `regionRules.imprintCountries` nur für DE, AT und CH ausgeführt.

### Schätzen und starten

Schätzung und Start verwenden identische Argumente. `max_items` ist optional, ganzzahlig
von 1 bis 5000 und überschreibt `params.maxItems`; bei Maps gilt der Wert je Suchbegriff und
Gebietseinheit, ohne Wert läuft jede Einheit vollständig. `max_total_charge_micro_usd` ist optional,
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
  "pricingUpdatedAt": "2026-09-08",
  "searchCount": 1,
  "coveredCells": 0,
  "cellsToRun": 1,
  "warnings": [],
  "cells": [
    {
      "key": "DE:city:Köln",
      "covered": false,
      "effectiveCategories": ["Zahnarzt"],
      "areaUnit": {
        "type": "city",
        "name": "Köln",
        "countryCode": "DE",
        "state": "Nordrhein-Westfalen",
        "postalCodeCount": 44,
        "expectedPlaces": 50,
        "fanOutReason": null,
        "placeId": "ChIJ...",
        "center": { "lat": 50.94, "lng": 6.96 },
        "radiusKm": null,
        "minCostMicroUsd": 260000,
        "maxCostMicroUsd": 400000
      }
    }
  ]
}
```

Bei Maps zählen `searchCount`, `coveredCells` und `cellsToRun` Gebietseinheiten. Jede Zelle in
`cells[]` trägt `areaUnit` mit `type` (`state`, `city`, `postal_code`, `circle`, `multi`), `name`,
`countryCode`, `state`, `postalCodeCount`, `expectedPlaces`, `fanOutReason` (`budget`, `runtime`,
`target`, `district` oder null), `placeId`, `center`, `radiusKm` (nur `circle`), `minCostMicroUsd`
und `maxCostMicroUsd`; eine PLZ-Liste gehört nicht dazu. Ein `fanOutReason` bedeutet, dass eine
große Einheit vor dem Einfrieren in PLZ-Einheiten aufgefächert wurde. `warnings` listet
Vorschau-Warnschlüssel wie `overlapping_units` (Ortsliste überlappt sich teilweise, dann die
Liste bereinigen).

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
| Identität | `id`, `sourceKey`, `paramsJson`, `maxItems` (bei Maps null, wenn ohne Grenze) |
| Zustand | `status`, `currentStep`, `cancelRequestedAt`, `failureKind`, `failureMessage` |
| Ergebnis | `leadListId`, `countersJson`, `warnings` |
| Kosten | `maxTotalChargeMicroUsd`, `estimatedCostMicroUsd`, `actualCostMicroUsd` |
| Zeitpunkte | `createdAt`, `startedAt`, `finishedAt` |
| Schritte | `steps`, geordnet nach `sequenceNo` |

Bei Maps-Läufen trägt `countersJson` zusätzlich `unitReports` (Objekt je Einheitenschlüssel mit
`paidPlaces`, `imported`, `categoryMismatchShare`, `closed`, `withoutWebsite`,
`foreignCountryHits`, `emailFromAddon`, `emailFromImprint`), `postalCodeHits` (Treffer je PLZ),
`coveredPostalCodes` (Liste) und `hitsSoFar` (Dataset-Zähler des laufenden Actor-Laufs).
Warnschlüssel für Gebietsläufe: `area_unresolved` (Actor konnte das Gebiet nicht auflösen, kein
Gedächtnis), `city_fanned_out_to_postal` (Ort im Lauf in PLZ-Einheiten aufgeteilt),
`unit_budget_limited` (Einheit durch Deckel begrenzt, Fortsetzung führt sie erneut aus),
`foreign_country_hits` (Treffer außerhalb des Landes verworfen), `category_mismatch_share`
(hoher Anteil Nachbarkategorien), `area_mismatch` (weniger als 70 Prozent der Treffer im Gebiet)
und `non_geographic` (PLZ ohne Fläche, ohne Kosten übersprungen). Für jeden Lauf zusätzlich:
`lead_limit_reached` (Lead-Kontingent reichte nicht; übernommen wurde, was Platz hatte, der Rest
ist verworfen und die Abdeckung wird nicht gespeichert, das Gebiet gilt also nicht als erledigt)
und `budget_exhausted` (Kostendeckel erreicht; bereits bezahlte Treffer gehen noch bis zum Import,
der Lauf ist unvollständig). Die Werte im Report nennen, nicht wegdiskutieren.

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

Erwartete MCP-Fehler kommen als Tool-Ergebnis mit `isError: true`. Quellen- und
Auftragswerkzeuge liefern denselben Text: `<code>: {"code": …, "message": …, "detail": …}`.
Der äußere Code ordnet ein, **`detail.code` nennt den genauen Grund**; darauf reagieren, nicht
auf den Wortlaut von `message`. Nur ein fehlender Scope bei den Quellenwerkzeugen kommt als
`insufficient_scope: <message>` ohne JSON. Die HTTP-Spalte ordnet die REST-Gegenstücke ein.

| HTTP-Einordnung | MCP-Code | `detail.code` / Zusatzfelder | Vorgehen |
|---|---|---|---|
| 402 | `usage_limit_exceeded` | `metric`, `usage`, `limit` | ListM8-Plan oder Lead-Kontingent erschöpft; auf den Plan verweisen, nicht auf Apify-Guthaben |
| 402 | `apify_not_connected` | `apify.connection_missing` | Apify-Konto in ListM8 verbinden lassen; nicht wiederholen |
| 402 | `payment_required` | `apify_payment_required` (Quellen) | Apify-Guthaben aufladen lassen; ohne `detail.code` Apify-Verbindung und Guthaben prüfen |
| 400 | `validation_failed` | `lead_source.area_requires_order` | Bundesland, Kanton oder Land wurde als Einzellauf angefragt; in den Beschaffungsauftrag mit `area_mode` `bundesland` oder `land` wechseln |
| 400 | `validation_failed` | `geo.too_many_units` | Mehr als 50 Gebietseinheiten im Einzellauf beziehungsweise 400 im Auftrag; Gebiet verkleinern oder aufteilen |
| 400 | `validation_failed` | `geo.invalid_area_unit` | Gebietseinheit unbekannt oder nicht auflösbar; Ort, PLZ, Landkreis oder Bundesland gegen den Katalog prüfen |
| 400 | `validation_failed` | andere, samt `detail.field` | Parameter anhand des Katalogs korrigieren, erneut schätzen und Änderung bestätigen lassen |
| 400/413 | `matrix_input_too_large` | — | Auftragsmatrix verkleinern |
| 404 | `not_found` | — | Quellenschlüssel beziehungsweise eigene Run- oder Auftrags-ID prüfen; fremde und unbekannte sind nicht unterscheidbar |
| 409 | `conflict` | `lead_source.budget_too_small` mit `minimumRequiredMicroUsd` | Deckel mindestens auf das Mindestbudget heben und neu bestätigen lassen |
| 409 | `conflict` | `lead_source.verification_retry_conflict` | Nachprüfung nur für einen abgeschlossenen Lauf mit ungeprüften oder noch nicht übernommenen Treffern und Ergebnisliste, oder ein paralleler Aufruf setzt denselben Versuch gerade fort; Lauf neu lesen, nicht blind wiederholen |
| 409 | `conflict` | `lead_source.verification_retry_order_active` | Auftrag läuft noch, oder im selben Auftrag läuft schon eine andere Nachprüfung; erst nach deren Ende nachprüfen |
| 409 | `conflict` | `lead_source.verification_retry_budget` | Im Auftragsbudget ist für die Nachprüfung nichts mehr frei; Budget mit dem Nutzer klären |
| 409 | `state_conflict` | — | Auftrag in einem Zustand, der die Aktion nicht erlaubt; Status lesen, nicht blind wiederholen |
| 409 | `idempotency_conflict` | — | `request_id` wurde schon mit anderen Argumenten benutzt; neue UUID nur bei bewusst neuem Auftrag |
| 409 | `resume_blocked` | — | Fortsetzen gerade nicht möglich; Zellen und Status lesen |
| 429 | `rate_limited` (Quellen) | `geo.quota_exceeded` | Tageskontingent für Freitext-Orte erreicht; bekannte PLZ und Orte nutzen oder morgen weiter |
| 502 | `provider_unavailable` (Aufträge) / `operation_failed` (Quellen) | — | Anbieter vorübergehend nicht erreichbar; später erneut |
| Berechtigung | `insufficient_scope` (Quellen) / `forbidden` (Aufträge) | — | ListM8-MCP-Verbindung mit `leads:write` klären |
| 401 bei REST | Authentifizierung fehlt | — | Verbindung neu autorisieren, keine Tokens im Chat austauschen |

Falsche JSON-Schema-Typen oder Werte außerhalb der Schema-Grenzen können bereits als
JSON-RPC-Fehler abgelehnt werden. Keine kostenpflichtige Ausführung als Validierungstest verwenden.

Das ListM8-Lead-Kontingent ist unabhängig vom Apify-Guthaben. Der Start prüft grundsätzlich
die Verfügbarkeit; die konkrete Menge wird erst vor dem Import geprüft. Ein Importfehler
`failureKind=limit_exceeded` kann deshalb nach bereits entstandenen Apify-Kosten auftreten.
Bei `failed` immer `failureKind`, `failureMessage`, Schrittfehler und tatsächliche Kosten lesen
und melden. Kein automatischer neuer Lauf als vermeintliche Reparatur.

## Beschaffungsaufträge für große Gebiete

Bundesland, Kanton oder ganzes Land sind nie ein Einzellauf, sondern ein Beschaffungsauftrag
mit Ziel (`target_new_leads`), Gesamtbudget (`max_total_charge_micro_usd`) und Parallelität.
`estimate_sourcing_order` und `create_sourcing_order` nehmen dieselben Argumente, nur
`create_sourcing_order` zusätzlich `request_id`, eine UUID je Auftrag. `area_mode` ist `orte_umkreis`, `bundesland` oder `land`; im Modus
`orte_umkreis` sind `locations` mit optionalem `radiusKm` oder `adminArea2` ohne `locations`
(Landkreis) erlaubt. `parallel_cells` ist optional (1 bis 5); leer bedeutet 1, sobald der Plan
Bundeslandeinheiten enthält, sonst 2. Ein Auftrag umfasst höchstens 400 Einheiten.

Die Antwort enthält `plan_summary` mit `searchCount`, `coveredCells`, `cellsToRun`,
`areaUnitTypes` und `warnings`. Vor `create_sourcing_order` das Gesamtbudget ausdrücklich
freigeben lassen; Resume vergrößert weder Budget noch Matrix.

Fortschritt: `list_sourcing_order_cells(order_id)` liefert je Zelle `areaUnit`, `hitsSoFar`,
`accountedCostMicroUsd`, `maxTotalChargeMicroUsd` (Deckel des Laufs) und `skipReason`
(`covered`, `covered_since_creation`, `non_geographic`, Stoppgründe); `get_sourcing_order`
liefert Status und Auftragszähler. Pause lässt laufende Einheiten samt Anreicherung und Import
zu Ende laufen, bei Bundeslandeinheiten dauert das Minuten. Abbruch bricht den laufenden
Actor-Lauf ab, Teilkosten werden verbucht, Gedächtnis wird nicht geschrieben. Beides dem
Nutzer vor dem Aufruf so sagen.

## Abschluss und Weiterverarbeitung

`leadListId`, Zähler, Kosten und Stichprobe nach `../../listen-qualitaet/SKILL.md` prüfen.
Die bereits angelegte Liste verwenden. Kein zweites `create_list` oder `import_leads` für
Katalogergebnisse. Herkunft und Kostenbelege liegen an der Liste in `sourceJson`, einschließlich
der Schrittbelege. Nicht durch selbst erfundene Provenienz ersetzen.

Auf bestätigten Folgeauftrag die ausgewählten Listenleads einer Kampagne zuordnen und den
bestehenden Outreach-Workflow für `start_lead_run` nutzen. Vorher aktive Lead-Läufe prüfen.
Die Stufen heißen `qualification`, `research`, `email`. Auswahl und Budget separat abstimmen;
`start_lead_run` nimmt keine direkte `list_id` entgegen. Sein `budget_usd` ist nicht der
Apify-Deckel des Beschaffungslaufs: Es begrenzt KI-Kosten plus die im KI-Lauf selbst gebuchten
externen Kosten, `spentUsd` in `get_lead_run_status` meldet dieselbe Summe.

## Unbeantwortete Prüfungen nachholen

`countersJson.unverified` zählt Treffer ohne Antwort nach Primärwiederholungen und
Ersatzverifizierung. Sie sind nicht importiert. Ein echtes Unknown-Prüfurteil
ist davon zu unterscheiden.

Nur nach ausdrücklicher Freigabe weiterer Kosten darf
`retry_lead_source_verification(run_id)` für einen abgeschlossenen Lauf mit
unbeantworteten Treffern und vorhandener Ergebnisliste aufgerufen werden.
Es gibt keine neue Quellensuche. Die gemeinsame Verifier-Policy einschließlich
Bounceverify läuft erneut; erfolgreiche Kontakte werden in dieselbe Liste
importiert. Kosten und offene Reserven verbleiben am alten Lauf und unter dessen
ursprünglichem Deckel. Keine zusätzliche Roh-CSV, Liste oder manueller Import.

Vorab prüft der Server Paywall und Lead-Kontingent: Frei sein muss ein Platz unter
`max_leads` für jede neue Adresse, die die Nachprüfung übernehmen könnte. Adressen, die
schon Leads sind, brauchen keinen Platz; sind alle schon Leads, ist keiner nötig.

Läufe eines Beschaffungsauftrags lassen sich erst nach dem Ende des Auftrags nachprüfen,
und je Auftrag läuft höchstens eine Nachprüfung. Reserviert wird nur aus dem noch freien
Auftragsbudget, höchstens bis zum Zelldeckel. Blockiert eine solche Nachprüfung
(Lead-Kontingent, Apify-Verbindung, Apify-Guthaben oder unbestätigte Kosten), endet der
Versuch: Der Lauf ist wieder `completed`, der blockierte Schritt nennt den Grund in
`errorMessage`, bereits bezahlte Prüfurteile bleiben erhalten. Den Grund dem Nutzer melden.
Nach der Behebung setzt ein erneuter Aufruf mit derselben Run-ID genau diesen Versuch ab
dem blockierten Schritt fort, auch wenn `unverified` schon 0 ist: Bezahlte Actor-Läufe
werden nachgelesen statt neu gekauft, auch bei ausgeschöpftem Auftragsbudget; reserviert
wird nur für neue Actor-Läufe. Fehlt nur noch der Import, braucht der Aufruf weder eine
Apify-Verbindung noch Budget.

Die Antwort liefert `runId`, `jobId`, `status` und `warnings`. Wieder bis zum
Endzustand pollen. `conflict` nennt in `detail.code` den Grund:
`lead_source.verification_retry_conflict` (Lauf nicht abgeschlossen, weder ungeprüfte noch
nachzuholende Treffer, fehlende Ergebnisliste, oder ein paralleler Aufruf setzt denselben
Versuch gerade fort), `lead_source.verification_retry_order_active` (Auftrag läuft noch,
oder im selben Auftrag läuft schon eine andere Nachprüfung) oder
`lead_source.verification_retry_budget` (freies Auftragsbudget reicht nicht); nicht blind
wiederholen. Ein 402 unterscheidet wie überall `usage_limit_exceeded` (Plan oder zu wenig
freie Plätze für die möglichen neuen Kontakte), `apify_not_connected` und
`payment_required` (Apify-Guthaben). Historische Warnungen können trotz gesunkenem
`unverified`-Zähler erhalten bleiben.
