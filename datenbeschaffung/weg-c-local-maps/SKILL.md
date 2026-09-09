---
name: weg-c-local-maps
description: Dieser Skill wird vom Datenbeschaffungs-Master für lokale Betriebe, Handwerk, Praxen, Gastro oder Unternehmen mit Google-Maps-Eintrag geladen. Verwendet die ListM8-MCP-Quelle google_maps_local mit Kostenschätzung, Freigabe und serverseitiger Verarbeitung. Kein direkter Nutzereinstieg.
---

# Weg C: Lokale Unternehmen über Google Maps

Die Quelle `google_maps_local` verwenden. Voraussetzung sind ein bestätigter ICP, der aktuelle
Katalog aus `list_lead_sources()` und ein in ListM8 verbundenes Apify-Konto.
Kostenfreigabe, Polling und Abschluss nach `../master/SKILL.md` durchführen.

## Parameter aus dem ICP ableiten

Nur Formularfelder des aktuellen Katalogs an `params` übergeben. Keine Actor-Inputs wie
`searchStringsArray`, `scrapeContacts` oder `maxCrawledPlacesPerSearch` senden.

| Kundenangabe | Parameter | Typ und Grenzen |
|---|---|---|
| Branchen oder Suchbegriffe | `categories` | Pflicht, Liste mit 1 bis 400 Texten |
| Orte, Stadtteile oder PLZ | `locations` | Liste mit 0 bis 400 Texten; leer nur zusammen mit `adminArea2` |
| Umkreis je Ort | `radiusKm` | Optional, Zahl in km; 1 bis 100 im Beschaffungsauftrag, bis 2000 im Einzellauf |
| Bundesland oder Kanton | `adminArea1` | Optional, Katalogoption; im Einzellauf nur zur Eingrenzung eines Orts |
| Landkreis | `adminArea2` | Optional, Text bis 200 Zeichen; wird in PLZ-Einheiten aufgeteilt |
| Land | `country` | ISO-Ländercode in Großbuchstaben, Default `DE` |
| Mindestbewertung | `minimumStars` | String: `""`, `"3"`, `"3.5"`, `"4"`, `"4.5"`; Default `""` |
| Mindestzahl Bewertungen | `minimumReviews` | Ganze Zahl, 0 bis 1000000; Default 0 |
| Nur Firmen mit Website | `onlyWithWebsite` | JSON-Bool, Default `false` |
| Maximale Treffer | `maxItems` | Optional, ganze Zahl 1 bis 5000, je Suchbegriff und Gebietseinheit; leer bedeutet alle Orte |

Ein Land je Lauf verwenden. Ein Umkreis ist über `radiusKm` je Ort möglich; kein Sprachfeld
ergänzen, die Maps-Sprache wird serverseitig aus dem Land abgeleitet. Gebietswahl: Orte,
Stadtteile oder PLZ als Liste in `locations`; ein Landkreis über `adminArea2`. Bundesland,
Kanton oder ganzes Land laufen ausschließlich als Beschaffungsauftrag (`create_sourcing_order`
mit `area_mode` `bundesland` oder `land`), nie als Einzellauf. Jede Gebietseinheit ist ein
Actor-Lauf mit allen Kategorien; große Einheiten werden nach Budget, Laufzeit oder Ziel in
PLZ-Einheiten aufgefächert.

`maxItems` möglichst leer lassen und die Menge über den Kostendeckel steuern: Der Actor rechnet
je gescraptem Ort ab, und ein vollständiger Gebietslauf ist brauchbarer als abgeschnittene
Läufe. Ein gesetzter Wert gilt je Suchbegriff und Einheit, nicht für den ganzen Lauf.

Konkrete Branchenbegriffe wie „Zahnarzt“, „Elektriker“ oder „Sanitär Heizung“ wählen. Jeder
Eintrag in `categories` ist ein eigener Suchbegriff je Einheit und kostet entsprechend; die
Liste nicht mit Synonymen aufblähen. Bewertung und Bewertungszahl nur nach ICP setzen, nicht
reflexhaft.

Für Personalisierung `onlyWithWebsite=true` vorschlagen. Bei Website-losen Zielkunden `false`
verwenden und erklären: Das bedeutet **kein Website-Filter**, nicht „nur ohne Website“.

## Pilot schätzen und bestätigen

Mit einer Stadt beginnen. Beispielargumente für `estimate_lead_source_run` mit einem
ausdrücklich gewählten Pilotdeckel von 0,50 USD; `maxItems` ist hier bewusst als
Pilotbegrenzung gesetzt und gilt je Suchbegriff und Gebietseinheit, im Beispiel also für den
einen Suchbegriff in der einen Stadt-Einheit:

```json
{
  "source_key": "google_maps_local",
  "params": {
    "categories": ["Zahnarzt"],
    "locations": ["Köln"],
    "country": "DE",
    "minimumStars": "4",
    "minimumReviews": 10,
    "onlyWithWebsite": true,
    "maxItems": 50
  },
  "max_total_charge_micro_usd": 500000
}
```

Schätzung lesen: Je Einheit in `cells[].areaUnit` den Typ, den Namen, die erwarteten Orte
(`expectedPlaces`), die Kostenspanne aus `minCostMicroUsd` und `maxCostMicroUsd` sowie einen
`fanOutReason` nennen. Bei `overlapping_units` in `warnings` die Ortsliste bereinigen und erneut
schätzen. Bei `lead_source.area_requires_order` in den Auftragsweg wechseln, siehe unten.

Schätzung, Spanne, Apify-Staffel, Preisstand, `budgetLimited` und Kostendeckel vorlegen.
Der Beispieldeckel ist keine Preiszusage. Reicht er nicht, Zielmenge oder Budget abstimmen,
erneut schätzen und bestätigen lassen. **Erst danach** `start_lead_source_run` mit demselben
JSON-Argumentobjekt aufrufen. Keine Schätzpreise aus alten manuellen Actor-Läufen übernehmen.

`max_items` ist eine optionale äußere Grenze und überschreibt `params.maxItems`; ohne Angabe
läuft jede Einheit vollständig. Den effektiven Wert und die Einheiten (`cells[].areaUnit`) in der
Schätzung prüfen und dem Nutzer die Kostenspanne je Einheit nennen.
Ohne expliziten Kostendeckel gilt der Benutzerstandard, initial 20 USD. Für Starts den
bestätigten Deckel ausdrücklich mitsenden; erlaubt sind 1 bis 1000000000 Micro-USD.

## Ausführen und skalieren

`run_id` aus dem Start merken und mit `get_lead_source_run` bis `completed`, `failed` oder
`cancelled` pollen. Details und Abbruchregeln stehen in
`../datenbeschaffung-referenzen/references/listm8-mcp.md`.

Serverseitig laufen Quellenabruf, Bestandsabgleich, DACH-Impressum für E-Mail-Lücken,
Verifizierung und Import in eine neue Liste. Kein eigenes Dataset abholen, keine Roh-CSV
bauen und keinen zusätzlichen Impressum- oder Verifier-Actor für diese Kette starten.

Den Pilot anhand der importierten Liste auf ICP-Fit prüfen. Ab 80 % einen größeren Lauf
planen. Darunter Suchbegriff, Region oder Filter verbessern. Jedes neue Gebiet und jede neue
Kategorie erneut schätzen und bestätigen lassen; ein Einzellauf erlaubt höchstens 50 Einheiten
(`geo.too_many_units`). Mehrere Läufe benötigen ein abgestimmtes Gesamtbudget.

Bundesland, Kanton oder ganzes Land als Beschaffungsauftrag fahren: `estimate_sourcing_order`
und `create_sourcing_order` mit `area_mode` `bundesland` oder `land`, Ziel, Gesamtbudget und
optional `parallel_cells` (leer: 1 bei Bundeslandeinheiten, sonst 2). Vorher sagen: Pause lässt
laufende Einheiten zu Ende laufen, bei Bundesländern dauert das Minuten; Abbruch bricht den
Actor-Lauf ab und verbucht Teilkosten. Fortschritt über `list_sourcing_order_cells`
(`hitsSoFar` je Einheit) und `get_sourcing_order` (Auftragszähler). Details in
`../datenbeschaffung-referenzen/references/listm8-mcp.md`.

## Report und Grenzen

Den vollständigen Laufreport lesen und insbesondere berichten:

- `found`, `known`, `newCandidates` und `enrichedByImprint`.
- `verifiedValid`, `verifiedCatchAll`, `verifiedInvalid` und `verifiedUnknown`.
- `discardedNoContact`, `doNotContactHits`, `imported` und `leadListId`.
- `status`, `currentStep`, gegebenenfalls `failureKind` und `failureMessage`.
- `estimatedCostMicroUsd`, `actualCostMicroUsd` und `maxTotalChargeMicroUsd`, in USD umgerechnet.
- Je Einheit aus `countersJson.unitReports`: bezahlte Orte, importierte Leads, Anteil
  Nachbarkategorien, geschlossene und Website-lose Treffer sowie `warnings` wie
  `unit_budget_limited`, `area_unresolved` oder `area_mismatch`.

Eine Zielmenge ist keine Liefergarantie. Firmen ohne E-Mail können trotz Telefon verworfen
werden. Außerhalb DE, AT und CH wird Impressum übersprungen. Unklare oder Catch-all-Adressen
sind markierte Kandidaten, keine garantiert zustellbaren Kontakte. `imported` zählt neu importierte
eindeutige E-Mail-Adressen. Bekannte oder bereits kontaktierte Leads können zusätzlich mit der Liste verknüpft sein, ohne neue anschreibbare Leads zu sein.

An `../listen-qualitaet/SKILL.md` im **MCP-Katalogpfad** übergeben. Stichprobe und Report prüfen,
aber keinen zweiten Import starten. Qualifizierung, Recherche und E-Mail-Variablen folgen
auf Auftrag über `start_lead_run`, nicht innerhalb der Beschaffung.
