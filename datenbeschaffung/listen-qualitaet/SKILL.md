---
name: listen-qualitaet
description: Dieser Skill wird nach jedem Datenbeschaffungs-Lauf oder bei „Liste prüfen“, „Liste bereinigen“, „Leads qualitätssichern“ und „Liste importieren“ verwendet. Prüft bei MCP-Katalogläufen die bestehende Ergebnisliste ohne Doppelimport. Bereinigt und importiert Roh-CSV nur im manuellen Fallback-Pfad.
---

# Listen-Qualität: die Pflicht-Endstation

## Zuerst den Herkunftspfad unterscheiden

**MCP-Katalogpfad:** Ein Lauf über `start_lead_source_run` hat Bestandsabgleich, DACH-Impressum,
Verifizierung und Import bereits serverseitig durchgeführt. Keine Roh-CSV verlangen und die
manuellen Schritte 1 bis 3 sowie 5 unten **nicht** ausführen.

1. Mit `get_lead_source_run(run_id)` den Endzustand feststellen. Bei `failed` oder `cancelled`
   Fehler beziehungsweise Abbruch und tatsächliche Kosten melden, keine vollständige Liste zusagen.
2. `leadListId` prüfen. Bei null keine Liste oder Stichprobe erfinden. Bei vorhandener ID die
   bestehende Liste und deren Leads über die verfügbaren ListM8-Listenwerkzeuge lesen.
3. `countersJson` nach `../datenbeschaffung-referenzen/references/listm8-mcp.md` berichten.
   `verifiedCatchAll` und `verifiedUnknown` getrennt von gültigen Adressen nennen. `doNotContactHits`
   umfasst alle bekannten Treffer mit Kontaktstatus ungleich `not_contacted`; nicht erneut anschreiben.
4. Die Stichprobe aus Schritt 4 durchführen. Bei weniger als 20 verfügbaren Leads alle prüfen
   und die kleinere Stichprobe ausdrücklich nennen. Die Quote darf nicht als belastbare 20er-Probe gelten.
5. Vorhandene Liste, Run-ID, Query, Status, Zähler, Kosten und Stichprobenquote melden.
   Herkunft und Kostenbelege aus der serverseitigen Provenienz erhalten. Kein zweites `create_list`,
   `import_leads`, kein lokaler Dedupe und keine erneute kostenpflichtige Verifizierung ausführen.
6. Bei ungenügendem Fit die Liste nicht löschen oder handpolieren. Vor einem neuen Beschaffungslauf
   Query verbessern, erneut schätzen und freigeben lassen. Bei zu kleiner Probe nicht ungeprüft skalieren.
7. Nur auf ausdrücklichen Folgeauftrag an den Outreach-Workflow zur Kampagnenzuordnung und
   `start_lead_run` für Qualifizierung, Recherche und E-Mail-Variablen weitergeben.

**Gezieltes Nachholen:** Bei `completed` und `countersJson.unverified > 0` die
unbeantworteten Kontakte getrennt berichten. Nur auf ausdrücklichen Folgeauftrag
mit Freigabe der weiteren Kosten `retry_lead_source_verification(run_id)` aufrufen.
Danach dieselbe Run-ID bis terminal verfolgen. Keine neue Liste und kein separater
Import; Budgetdeckel und Ergebnisliste bleiben erhalten. Ein echtes Unknown-Urteil
ist keine unbeantwortete Prüfung. Bei `conflict` den aktuellen Lauf erneut lesen.

**Hier endet der MCP-Katalogpfad.** Die folgenden CSV-, Actor- und Importanweisungen gelten nur
für manuelle Nicht-Katalog-Quellen oder separat angelieferte Rohdateien.

## Fallback: Roh-CSV prüfen und importieren

**Vorprüfungsmodus vor `enrichment-waterfall`:** Nur Schritte 1, 2 und 4 auf der noch nicht
importierten Datei durchführen. Zeilen ohne E-Mail für die gezielte Anreicherung separat
behalten. Schritt 3 erst nach der Adressergänzung und Schritt 5 ausschließlich bei der finalen
Übergabe ausführen. Danach neue Adressen gegen den Bestand prüfen und nur bisher ungeprüfte
Adressen verifizieren. Dieser Modus ist keine abgeschlossene Übergabe.

Nimmt die Roh-CSV eines Weg-Skills (Format: `../datenbeschaffung-referenzen/references/csv-spalten.md`) und macht daraus
eine übergebene, rückverfolgbare Liste. Kein Weg endet ohne diesen Skill.

Trichter-Prinzip beachten: Diese Stufe sortiert MECHANISCH (Duplikate, Sperren, kaputte Daten) und
prüft per Stichprobe. Sie beurteilt NICHT die inhaltliche Passung einzelner Leads: das macht die
Qualifizierung in der App, und die arbeitet bewusst offen.

## Schritt 1: Format & Datenqualität

`build_csv.py` hat das meiste erledigt; hier nur verifizieren:

- Header exakt wie `csv-spalten.md`, UTF-8, korrekte Umlaute
- `quelle`-Spalte gefüllt (Actor + Datum): ohne Herkunft keine Übergabe
- Auffälligkeiten aus `hinweis` zusammenfassen: Anteil `rollen-adresse` (info@ ist ok, aber
  berichten), Anteil `keine-website` (die bekommen zwangsläufig den schwächsten
  Personalisierungs-Anker: bei > 30 % dem Nutzer anbieten, sie in eine eigene Datei abzuspalten)

## Schritt 2: Dedup + Bestand-Abgleich

MIT MCP nach `../datenbeschaffung-referenzen/references/outreach-uebergabe.md`, Schritt 0,
sofern im manuellen Fallback des Masters noch nicht geschehen:

```
export_leads(format="index")  →  bestand-index.json
python3 ../datenbeschaffung-referenzen/scripts/dedup.py --index bestand-index.json --in roh.csv --out neu.csv
```

Der Report nennt: behalten / schon im Bestand / **do_not_contact entfernt** (namentlich, die werden
NIE angeschrieben) / Domain-Warnungen / ohne E-Mail behalten. OHNE MCP entfällt dieser Schritt.
Duplikate innerhalb der Datei hat `build_csv.py` bereits entfernt; im Bericht ausdrücklich sagen,
dass der Bestand-Abgleich fehlte.

**E-Mail-Gate:** Zeilen, die nach der Anreicherung (Impressum-/Kontaktseiten-Stufe des Wegs)
immer noch keine E-Mail haben, jetzt in eine eigene Datei abspalten (`leads-…-ohne-email.csv`)
und die Zahl berichten: sie gehen NICHT in Verifizierung und Übergabe (der Import verlangt
eine gültige E-Mail pro Zeile).

## Schritt 3: Verifizierung

Verifizierung ist ein eigener Schritt mit dem gepinnten E-Mail-Verifier aus
`../datenbeschaffung-referenzen/references/apify-actors.md` (Actor-ID und Preis NUR von dort.
nie aus dem Gedächtnis): **außer** der Weg hat schon validiert (Impressum-Primär liefert
`email_status` mit; dann nur UNDELIVERABLE aussortieren). Kosten vorher nennen (Kostenfreigabe
im Master, Zahlen aus `kosten.md`). Ergebnis: nur zustellbare Adressen bleiben; Bounce-Ziel < 3 %.

## Schritt 4: 20er-Sample (die eine strenge Prüfung)

20 zufällige Leads von Hand prüfen: Website öffnen ist erlaubt und erwünscht. Je Lead eine Frage:
**Ist das plausibel ein potenzieller Kunde laut ICP-Satz?**

- **≥ 16 / 20 passen** → Liste ist gut. Weiter.
- **< 16 / 20** → NICHT nachpolieren, sondern die Ursache beheben: Query/Filter im Weg-Skill
  nachschärfen, den neuen Lauf schätzen und freigeben lassen. Erst dann wiederholen. Handpolieren einer
  schiefen Liste ist verlorene Zeit: Trichter-Prinzip heißt nicht „Müll durchwinken".

Dem Nutzer die Stichprobe zeigen (Firma, Website, passt/passt-nicht mit einem Halbsatz).

## Schritt 5: Übergabe

`../datenbeschaffung-referenzen/references/outreach-uebergabe.md` folgen:

- MIT MCP: `check_leads_exist` (Autoritäts-Check) → `create_list` (mit Herkunft + realen Kosten) →
  `import_leads(list_id, attribute_mappings)` → `get_job_status` → Report-Zahlen 1:1 berichten.
  In eine Kampagne (`add_leads_to_campaign`) nur auf ausdrücklichen Wunsch.
- OHNE MCP: finale CSV liefern + Import-Anleitung, mit dem ehrlichen Hinweis, welche Prüfungen
  (Bestand, do_not_contact) erst der App-Import übernimmt.

## Schritt 6: Abschlussbericht

Eine Tabelle: roh → nach Dedup/Bestand → nach Verifizierung → Sample-Quote → übergeben.
Dazu reale Kosten des Gesamtlaufs und die eine Lernnotiz für den nächsten Lauf (z. B. „Kategorie X
war Beifang → in den Anti-ICP" oder „Portal Y in noise-domains.md ergänzt").
