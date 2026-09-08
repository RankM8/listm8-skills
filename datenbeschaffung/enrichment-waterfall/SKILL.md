---
name: enrichment-waterfall
description: Dieser Skill wird für verbliebene Kontaktlücken hochwertiger Leads aus Nicht-Katalog-Quellen geladen. Beschreibt kostenpflichtige Anreicherung mit FullEnrich oder BetterContact nach Impressum und Kontaktseiten-Fallback. Nicht Bestandteil der ListM8-MCP-Standardkette und kein direkter Einstieg.
---

# Enrichment-Waterfall: die letzte, teuerste Stufe

## Einordnung: nur für den manuellen Fallback

Für `google_maps_local` und `google_serp_companies` läuft die Grundkette bereits in ListM8:
Quellenabruf, Bestandsabgleich, Impressum für E-Mail-Lücken in DACH, Verifizierung und Import.
Die fünf Beschaffungs-Tools und Reportfelder stehen in
`../datenbeschaffung-referenzen/references/listm8-mcp.md`.

Diesen Waterfall nicht automatisch nach einem Kataloglauf starten. FullEnrich und BetterContact
gehören **nicht** zur Standardkette. Der folgende Ablauf bleibt für qualifizierte Kontaktlücken
von Nicht-Katalog-Quellen erhalten und braucht eine eigene Kostenfreigabe. Vor jedem Export
Kontaktstatus prüfen, gesperrte beziehungsweise bereits kontaktierte Leads ausschließen und
bereits vorliegende Anreicherung nicht erneut bezahlen.

## Fallback-Verfahren

Ein Waterfall-Tool fragt je Kontakt ein gutes Dutzend Datenanbieter nacheinander ab, bis ein Treffer
kommt. Der Kurs nennt dafür 80 bis 98 % Abdeckung gegenüber 40 bis 60 % bei einem einzelnen Anbieter.
Ergebnis: die persönliche Arbeits-E-Mail des Entscheiders (`vorname.nachname@`) statt der
Sammeladresse. Mobilnummern beziehungsweise Durchwahlen sind deutlich teurer.

**Dieser Skill ist nie der erste Anreicherungsschritt.**

## Die Reihenfolge (Kurs-Regel, nicht verhandelbar)

1. Leads über einen manuellen Fallback-Weg sammeln.
2. `impressum-enrichment` (DACH) bzw. `kontaktseiten-fallback` (international): **immer**, auch
   wenn danach der Waterfall folgt: Adresse, Entscheidername, HRB und die info@-Adresse gibt es
   öffentlich; der Abruf kann trotzdem Kosten verursachen. Der Waterfall braucht Name und Domain als Input.
3. dieser Skill, **optional**, für die verbliebene Lücke wertvoller Leads.

Schritt 2 nicht überspringen: Öffentlich verfügbare Impressumsdaten zuerst nutzen und
den Personennamen als Grundlage für den Waterfall beschaffen.

## Werkzeug

FullEnrich oder BetterContact. FullEnrich lässt sich laut Kurs-Lektion per MCP anbinden: steht der
Connector, läuft die Anreicherung ohne Oberfläche. Sonst CSV hochladen, Ergebnis herunterladen.
Beide bündeln dieselbe Idee, die Auswahl entscheidet der Preis am Tag des Kaufs.

## Kostenlogik (ehrlich, und vor jedem Lauf nennen)

| Posten | Kosten |
|---|---|
| Gefundene E-Mail | **1 Credit** |
| Gefundene Mobilnummer | **10 Credits** |
| Credit-Preis (Stand der Kurs-Lektion) | ~55 $ je 1.000 Credits → E-Mail ≈ 5,5 Cent, Mobilnummer ≈ 55 Cent |
| Einstiegspaket | ab ~29 $ für rund 500 E-Mails |

Bezahlt wird nur der Treffer: kein Fund, kein Credit.

Rechenbeispiel: 500 qualifizierte Leads nur mit E-Mail = 500 Credits. Dieselben 500 zusätzlich mit
Mobilnummer = 5.500 Credits, also gut das Zehnfache. Diese Preise sind ein Stand, kein Fakt: vor
dem Kauf auf der Tool-Seite nachsehen und mit dem aktuellen Preis rechnen.

## Wann sich der Fallback lohnt

- **Nur qualifizierte Zielkontakte.** Input ist eine noch nicht importierte, vorgeprüfte Rohdatei
  mit Personennamen und Domain je Zeile. Dafür den Vorprüfungsmodus von `listen-qualitaet`
  verwenden. Vor dem Waterfall keine Liste anlegen und keinen Import ausführen.
- **Bereits importierte Leads nicht neu importieren.** Neue persönliche Adressen können sonst
  zusätzliche Leads erzeugen. Für bestehende Leads einen gesonderten, ausdrücklich bestätigten
  Aktualisierungsweg anhand ihrer bestehenden IDs nutzen, nicht diesen Rohdatei-Ablauf.
- **Ohne Personennamen kein Lauf.** Das Tool sucht die Adresse einer bestimmten Person. Leere
  Namensfelder kosten zwar keinen Credit, liefern aber auch nichts: erst Impressum oder LinkedIn.
- **Budget knapp oder Angebot noch nicht validiert:** Masse über das Impressum abwickeln, Waterfall
  nur für die 50 bis 100 Top-Prospects, und dort nur E-Mails.
- **Angebot validiert, hoher Deckungsbeitrag, Engpass ist der Entscheiderzugang:** E-Mails für die
  ganze qualifizierte Liste sind vertretbar; Mobilnummern bleiben trotzdem der Spitze vorbehalten.
- **Mobilnummern** sind die eine Entscheidung, die einzeln begründet wird: rund 55 Cent für einen
  Kontakt. Standard ist nein: Ausnahme ist ein bereits qualifizierter Lead, den man über E-Mail
  und Zentrale nachweislich nicht erreicht.

Budget-Variante ohne gebündeltes Tool: der **manuelle Waterfall**: dieselbe Liste nacheinander
durch mehrere Einzelanbieter schicken (E-Mail-Suche zuerst), zwischen den Runden die Treffer
abziehen. Je Treffer günstiger, aber jede Runde bedeutet Export, Filtern, Re-Upload, das
Zusammenführen ist fehleranfällig, es gibt kein Tracking, welcher Anbieter geliefert hat, und
Mobilnummern kommen praktisch keine heraus. Nur bei kleinen Mengen und knappem Budget wählen.

## Ablauf

1. **Lücke bestimmen.** Aus der geprüften Liste die Zeilen ziehen, die nur eine Rollen-Adresse oder
   gar keine Adresse haben **und** im ICP oben stehen. Anzahl nennen: sie ist die Rechengrundlage.
2. **Kalkulieren und freigeben lassen.** n × 1 Credit für E-Mails, dazu nur bei ausdrücklichem
   Wunsch m × 10 Credits für Mobilnummern; in Dollar umrechnen, Deckel nennen. Ohne Freigabe des
   Nutzers kein Lauf (Kostenfreigabe im Master).
3. **Input bauen.** Je Zeile Vorname, Nachname, Firma und Domain: mehr braucht das Tool nicht.
4. **Lauf fahren** mit ausschließlich „Work Email", solange Mobilnummern nicht freigegeben sind.
5. **Ergebnis mergen.** Die persönliche Adresse ersetzt die Rollen-Adresse, die alte bleibt in der
   Zusatzspalte `email_rollen` zur Nachvollziehbarkeit stehen. Keine zusätzliche
   Kontaktaufnahme an die alte Adresse aus der Anreicherung ableiten. `quelle` um `+waterfall` ergänzen, `hinweis` um `persoenliche-adresse`, und die
   Provider-Angabe je Treffer als Zusatzspalte mitführen: sie macht den Lauf nachvollziehbar.
6. **Zurück an `listen-qualitaet`.** Jetzt den vollständigen manuellen Fallback-Pfad bis zur
   einmaligen Übergabe ausführen. Neue Adressen laufen dort durch die Verifizierung, sofern
   kein belastbarer Zustellbarkeits-Status vorliegt. Keine schon geprüften Adressen erneut bezahlen.

## Bekannte Fallen

- **Ganze Rohlisten durchjagen**: der teuerste Fehler dieses Wegs. Erst qualifizieren, dann anreichern.
- **Mobilnummern in Masse:** zehnfacher Preis für einen Kanal, den die wenigsten Kampagnen nutzen.
- **Doppelt anreichern:** Leads, die schon eine persönliche Adresse haben, vor dem Upload herausfiltern.
- **Preise aus dieser Datei als gesetzt behandeln.** Sie sind der Stand der Kurs-Lektion; die
  Kalkulation gegenüber dem Nutzer läuft immer mit dem tagesaktuellen Preis.
