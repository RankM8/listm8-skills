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
| Branche oder Suchbegriff | `query` | Pflicht, Text mit 1 bis 200 Zeichen |
| Stadt oder Region | `location` | Pflicht, Text mit 1 bis 200 Zeichen |
| Land | `country` | ISO-Ländercode in Großbuchstaben, Default `DE` |
| Mindestbewertung | `minimumStars` | String: `""`, `"3"`, `"3.5"`, `"4"`, `"4.5"`; Default `""` |
| Mindestzahl Bewertungen | `minimumReviews` | Ganze Zahl, 0 bis 1000000; Default 0 |
| Nur Firmen mit Website | `onlyWithWebsite` | JSON-Bool, Default `false` |
| Maximale Treffer | `maxItems` | Ganze Zahl, 1 bis 5000; Default 500 |

Ein Land pro Lauf verwenden. Kein Radius- oder Sprachfeld ergänzen. Die Maps-Sprache wird
serverseitig aus dem Land abgeleitet. Ein gewünschter Umkreis ist kein unterstützter Filter;
eine verständliche Orts- oder Regionsangabe abstimmen, keine exakte Entfernung versprechen.

Konkrete Branchenbegriffe wie „Zahnarzt“, „Elektriker“ oder „Sanitär Heizung“ wählen. Kategorien
können bei der Begriffswahl helfen, sind aber kein separater MCP-Parameter. Keine erzwungenen
Multi-Query-Arrays bauen. Bewertung und Bewertungszahl nur nach ICP setzen, nicht reflexhaft.

Für Personalisierung `onlyWithWebsite=true` vorschlagen. Bei Website-losen Zielkunden `false`
verwenden und erklären: Das bedeutet **kein Website-Filter**, nicht „nur ohne Website“.

## Pilot schätzen und bestätigen

Mit etwa 50 Treffern in einer Stadt beginnen. Beispielargumente für
`estimate_lead_source_run` mit einem ausdrücklich gewählten Pilotdeckel von 0,50 USD:

```json
{
  "source_key": "google_maps_local",
  "params": {
    "query": "Zahnarzt",
    "location": "Köln",
    "country": "DE",
    "minimumStars": "4",
    "minimumReviews": 10,
    "onlyWithWebsite": true,
    "maxItems": 50
  },
  "max_total_charge_micro_usd": 500000
}
```

Schätzung, Spanne, Apify-Staffel, Preisstand, `budgetLimited` und Kostendeckel vorlegen.
Der Beispieldeckel ist keine Preiszusage. Reicht er nicht, Zielmenge oder Budget abstimmen,
erneut schätzen und bestätigen lassen. **Erst danach** `start_lead_source_run` mit demselben
JSON-Argumentobjekt aufrufen. Keine Schätzpreise aus alten manuellen Actor-Läufen übernehmen.

`max_items` ist eine optionale äußere Grenze und überschreibt `params.maxItems`. Möglichst
nur `params.maxItems` verwenden; bei einem Override den effektiven Wert in der Schätzung prüfen.
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
planen. Darunter Suchbegriff, Region oder Filter verbessern. Neue Mengen bis 5000 erneut
schätzen und bestätigen lassen. Mehrere Läufe benötigen ein abgestimmtes Gesamtbudget.

## Report und Grenzen

Den vollständigen Laufreport lesen und insbesondere berichten:

- `found`, `known`, `newCandidates` und `enrichedByImprint`.
- `verifiedValid`, `verifiedCatchAll`, `verifiedInvalid` und `verifiedUnknown`.
- `discardedNoContact`, `doNotContactHits`, `imported` und `leadListId`.
- `status`, `currentStep`, gegebenenfalls `failureKind` und `failureMessage`.
- `estimatedCostMicroUsd`, `actualCostMicroUsd` und `maxTotalChargeMicroUsd`, in USD umgerechnet.

Eine Zielmenge ist keine Liefergarantie. Firmen ohne E-Mail können trotz Telefon verworfen
werden. Außerhalb DE, AT und CH wird Impressum übersprungen. Unklare oder Catch-all-Adressen
sind markierte Kandidaten, keine garantiert zustellbaren Kontakte. `imported` zählt neu importierte
eindeutige E-Mail-Adressen. Bekannte oder bereits kontaktierte Leads können zusätzlich mit der Liste verknüpft sein, ohne neue anschreibbare Leads zu sein.

An `../listen-qualitaet/SKILL.md` im **MCP-Katalogpfad** übergeben. Stichprobe und Report prüfen,
aber keinen zweiten Import starten. Qualifizierung, Recherche und E-Mail-Variablen folgen
auf Auftrag über `start_lead_run`, nicht innerhalb der Beschaffung.
