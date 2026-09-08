---
name: datenbeschaffung
description: Dieser Skill wird bei „Datenbeschaffung“, „Leads beschaffen“, „Leadliste aufbauen“, „Leads scrapen“, „Liste bauen“ oder „wo finde ich Leads“ verwendet. Einziger Einstieg des Datenbeschaffungs-Pakets. Führt über ICP, ListM8-MCP-Katalog, bestätigte Kostenschätzung und serverseitigen Lauf zur Ergebnisliste. Manuelle Quellen nur als Fallback außerhalb des Katalogs verwenden; weg-* nicht direkt starten.
---

# Datenbeschaffung mit ListM8

Vom bestätigten Zielkundenprofil zur geprüften Lead-Liste führen. Für Katalogquellen die
ListM8-MCP-Tools verwenden. Quelle, Bestandsabgleich, Impressum, E-Mail-Verifizierung und Import
laufen serverseitig. Keine Actor-Schleifen, CSV-Zwischenschritte oder parallelen manuellen
Anreicherungen für diese Läufe aufbauen.

## Leitsätze

1. **Trichter-Prinzip.** Beschaffung liefert Kandidaten, keine garantierten Wunschkunden. Die
   fachliche Qualifizierung und der spätere Review bleiben eigene Schritte.
2. **Kosten vorab bestätigen lassen.** Vor jedem kostenpflichtigen Start eine aktuelle Schätzung
   zeigen und einen ausdrücklichen Kostendeckel freigeben lassen. Gilt auch für Piloten und Wiederholungen.
3. **Pilot vor Skalierung.** Mit einer Stadt und etwa 50 Treffern beginnen. Ab 80 % ICP-Fit
   einen größeren Lauf planen; darunter Query oder Filter schärfen. Jeden neuen Lauf erneut schätzen.
4. **Kontaktstatus respektieren.** `do_not_contact` niemals überschreiben oder umgehen. Auch andere
   kontaktierte Bestandsleads nicht ungeprüft erneut anschreiben. Ein Listenmitglied ist keine Versandfreigabe.
5. **Deutsch mit korrekten Umlauten.** Keine Gedankenstriche in Kunden-Copy verwenden.

## Phase 0: MCP und Katalog prüfen

`list_lead_sources()` aufrufen und die vollständige Antwort auswerten. Der Aufruf startet nichts
und braucht noch keine Apify-Verbindung. Alle Beschaffungs-Tools verlangen den Scope `leads:write`.

- `sources` nach passenden Quellen durchsuchen. `formFields`, Defaults, Grenzen, Optionen,
  `chain`, `pricing` und `regionRules` lesen. Übersetzungsschlüssel verständlich wiedergeben.
- Für den Start muss der eigene Apify-Token in der Integration von ListM8 hinterlegt sein.
  Den Token nicht im Chat abfragen, ausgeben oder an einen anderen Dienst senden.
- Fehlen die Tools, zuerst ListM8-MCP-Verbindung und Berechtigungen klären. Ist eine
  Katalogquelle nur wegen eines Verbindungsfehlers nicht erreichbar, nicht über direkten
  Apify-Zugriff ausweichen.
- Bei `payment_required` die Apify-Verbindung, das Guthaben beziehungsweise die gemeldete
  Kontingentgrenze klären. Keine kostenpflichtige Retry-Schleife starten.

Signaturen, Felder und Fehler stehen in
`../datenbeschaffung-referenzen/references/listm8-mcp.md`.

## Phase 1: ICP und Anti-ICP bestätigen

`../datenbeschaffung-referenzen/references/icp.md` lesen. Ergebnis als einen Satz mit Ausschlüssen
bestätigen lassen, bevor ein Scrape startet:

> „[Rolle] in [Branche] mit [Größe] in [Region], erkennbar an [Trigger]. Nicht: [Anti-ICP].“

Bei unklarer Zielgruppe die 10-Wunschkunden-Frage aus der Referenz verwenden.

## Phase 2: Quelle auswählen

Den aktuellen Katalog als Autorität behandeln, nicht diese Momentaufnahme:

| Zielgruppe | Katalogquelle | Weg-Skill |
|---|---|---|
| Lokale Betriebe, Handwerk, Praxen, Gastro | `google_maps_local` | `weg-c-local-maps` |
| Firmen über Websites, etwa B2B-Dienstleister, Agenturen, Kanzleien, Shops oder Coaches | `google_serp_companies` | `weg-a-b2b-google` |

Suchbegriff, Ort beziehungsweise Land, Filter und maximale Treffermenge aus dem ICP ableiten.
Eine Quelle mit kurzer Begründung vorschlagen. Nur wenn keine Katalogquelle den benötigten
Quellentyp abdeckt, den Fallback-Abschnitt verwenden.

## Phase 3: Schätzen und Freigabe einholen

Den passenden Weg-Skill für das Parameter-Mapping lesen. Dann
`estimate_lead_source_run` mit den geplanten Formularwerten und dem Kostendeckel aufrufen.

Vor der Freigabe nennen:

- Quelle, Suchbegriff, Region, Filter und maximale Trefferzahl.
- `tier`, `pricingUpdatedAt`, Schätzung sowie Spanne aus `minCostMicroUsd` und `maxCostMicroUsd`.
- Den harten Deckel aus `maxTotalChargeMicroUsd` und den Hinweis auf `budgetLimited`.
- Abrechnung auf dem eigenen Apify-Konto. ListM8 erfasst die externen Kosten, verrechnet sie aber nicht.

Geldbeträge durch 1.000.000 teilen, um USD zu zeigen. Standard sind 20 USD je Lauf, falls der
Kunde keinen anderen Benutzerstandard hinterlegt hat. Den tatsächlich zurückgegebenen Deckel
verwenden und beim Start ausdrücklich mitsenden. Die Schätzung ist keine Preisgarantie.

`budgetLimited=true` bedeutet, dass der Deckel die Planung begrenzt. Keine vollständige
Treffermenge zusagen und den Deckel niemals still erhöhen. Weniger Treffer oder mehr Budget
erneut schätzen und bestätigen lassen. Pro Lauf sind 1 bis 5000 Treffer und höchstens 1000 USD
Deckel zulässig. Bei mehreren Läufen auch das Gesamtbudget bestätigen lassen.

Das ListM8-Lead-Kontingent gilt zusätzlich zum Apify-Budget. Die konkrete Importmenge wird erst
beim Import geprüft. Ein bezahlter Scrape garantiert daher weder ausreichendes Kontingent noch
eine fertige Liste.

## Phase 4: Einmal starten, bis zum Endzustand verfolgen

1. Nach Freigabe `start_lead_source_run` mit exakt den bestätigten Werten aufrufen.
2. `run_id` und `job_id` merken. `pending` heißt nur angenommen, nicht importiert.
3. Mit `get_lead_source_run(run_id)` in angemessenen Abständen, etwa alle 30 bis 60 Sekunden,
   abfragen. `currentStep`, Schrittstatus, Zähler und Kosten verständlich berichten.
4. Bis `completed`, `failed` oder `cancelled` weiter abfragen. Bei langer Laufzeit nicht neu
   starten. Nach einer Unterbrechung dieselbe gespeicherte Run-ID verwenden.
5. Bei unklarer Startantwort keine neue kostenpflichtige Ausführung blind wiederholen.
   Den Verlauf in ListM8 prüfen und die bereits angelegte Run-ID klären.
6. Auf Abbruchwunsch `cancel_lead_source_run(run_id)` aufrufen und weiterhin bis terminal pollen.
   `cancelRequestedAt` bestätigt nur die Anforderung. Bereits entstandene Kosten bleiben bestehen.

Serverseitige Kette: `source`, `dedupe`, `imprint`, `verify`, `import`.
Impressum gilt nur für DE, AT und CH und für fehlende E-Mail-Adressen. Bekannte Leads werden
nicht erneut kostenpflichtig angereichert. Ungültige E-Mails werden verworfen; `catch_all` und
`unknown` bleiben markiert importierbar und sind nicht gleichbedeutend mit sicher zustellbar.

Bei `failed` den Fehler aus `failureKind` und `failureMessage`, den letzten Schritt sowie die
Kosten berichten. `limit_exceeded` verlangt eine Klärung des ListM8-Kontingents. Nicht automatisch
von vorn beginnen. Bei jedem Endzustand `leadListId` tatsächlich prüfen; null bedeutet keine
verfügbare Ergebnisliste. Bereits importierte Leads nach einem Abbruch nicht löschen.

## Phase 5: Ergebnis prüfen und weitergeben

`listen-qualitaet` im **MCP-Katalogpfad** verwenden. Zähler und bestehende Liste prüfen und die
Stichprobe durchführen, aber weder erneut deduplizieren oder verifizieren noch `create_list`
oder `import_leads` für dieselben Ergebnisse aufrufen.

Berichten: Run-ID, Quelle, Query und Filter, Status, Pilot-Fit, sämtliche relevanten Zähler,
Schätzung, tatsächliche Kosten, Kostendeckel sowie `leadListId`. `imported` zählt eindeutige
neu importierte E-Mail-Adressen, nicht die Gesamtgröße der Liste oder sicher kontaktierbare Leads.
Bekannte Leads können zusätzlich mit der Liste verknüpft sein.
`doNotContactHits`, `verifiedCatchAll` und `verifiedUnknown` gesondert nennen.

Danach auf ausdrücklichen Verarbeitungsauftrag die vorhandene Liste einer bestätigten Kampagne
zuordnen und über den Outreach-Workflow `start_lead_run` für `qualification`, `research` und
`email` verwenden. Das ist ein separater Lauf mit eigenem Budget und Voraussetzungen.
Keine erfundene `list_id` an `start_lead_run` übergeben und nicht automatisch alle Kampagnenleads
auswählen. Der Beschaffungslauf allein startet keine Qualifizierung und versendet keine E-Mails.

## Fallback: Quellen außerhalb des Katalogs

Die manuellen Anleitungen und Skripte bleiben für nicht abgedeckte Quellen erhalten.
Vorher prüfen, ob der aktuelle Katalog inzwischen eine passende Quelle enthält.

| Benötigte Quelle | Fallback-Skill |
|---|---|
| Apollo-Firmografien und Kontakte | `weg-a-apollo` |
| Shop-Technologie, Umsatzklasse oder Traffic-Daten | `weg-b-storeleads` |
| Coaches über LinkedIn oder Instagram | `weg-d-coaches-linkedin`, `weg-d-instagram-google`, `weg-d-instagram-hashtag` |
| Amazon, Etsy oder eBay | `weg-e-plattform` |
| Gesonderte Bulk-Quelle außerhalb des Katalogs | `outscraper-bulk`, erst nach Pilot und Laufzeitwarnung |

Allgemeine Shop- oder Coach-Suchbegriffe gehören ebenfalls zu `google_serp_companies`. Die
bestehenden Anleitungen `weg-b-ecom-google` und `weg-d-coaches-google` bleiben als historische
Fallback-Referenzen erhalten; ihre direkten Actor- und Importabläufe nicht für Katalogsuchen
ausführen. Ihre Nischenbegriffe können als Inspiration für `params.query` dienen.

Eine große Menge allein ist kein Grund, eine vorhandene Katalogquelle zu umgehen.
Für manuelle Fallbacks die Dateien
`../datenbeschaffung-referenzen/references/setup.md`,
`../datenbeschaffung-referenzen/references/zugriff.md`,
`../datenbeschaffung-referenzen/references/apify-actors.md` und
`../datenbeschaffung-referenzen/references/kosten.md` lesen. Aktuelles Actor-Schema prüfen, Preis nennen,
harten Deckel setzen und freigeben lassen. Actor-IDs nicht raten.

Mit verbundenem Outreach-MCP vor kostenpflichtiger Anreicherung den Bestand nach
`../datenbeschaffung-referenzen/references/outreach-uebergabe.md` abgleichen. Ohne Verbindung CSV-Fallback und fehlenden
Bestandsabgleich ausdrücklich melden. Den Weg-Skill bis zur Roh-CSV ausführen, nötigenfalls
`impressum-enrichment`, `kontaktseiten-fallback` oder `enrichment-waterfall` nutzen und immer
mit dem **manuellen Fallback-Pfad** von `listen-qualitaet` abschließen.

Passt auch kein vorhandener Fallback, den Apify-Store recherchieren, Kandidaten nach
`apify-actors.md` bewerten und einen freigegebenen Mini-Piloten fahren. Ergebnisse mit Datum
festhalten. Keine ungeprüften Actor-Empfehlungen als Katalogquelle darstellen.
