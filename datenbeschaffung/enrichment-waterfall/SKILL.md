---
name: enrichment-waterfall
description: Letzter Anreicherungs-Baustein des Datenbeschaffungs-Pakets — cascading paid enrichment (FullEnrich/BetterContact) that closes the remaining contact gap for high-value leads with personal work emails and, rarely, mobile numbers. Invoked after impressum-enrichment and kontaktseiten-fallback; never triggered directly.
---

# Enrichment-Waterfall — die letzte, teuerste Stufe

Ein Waterfall-Tool fragt je Kontakt ein gutes Dutzend Datenanbieter nacheinander ab, bis ein Treffer
kommt. Der Kurs nennt dafür 80–98 % Abdeckung gegenüber 40–60 % bei einem einzelnen Anbieter.
Ergebnis: die persönliche Arbeits-E-Mail des Entscheiders (`vorname.nachname@`) statt der
Sammeladresse — und, deutlich teurer, seine Mobilnummer bzw. Durchwahl.

**Dieser Skill ist nie der erste Anreicherungsschritt.**

## Die Reihenfolge (Kurs-Regel, nicht verhandelbar)

1. Leads sammeln (Weg-Skill) →
2. `impressum-enrichment` (DACH) bzw. `kontaktseiten-fallback` (international) — **immer**, auch
   wenn danach der Waterfall folgt: Adresse, Entscheidername, HRB und die info@-Adresse gibt es
   dort umsonst, und der Waterfall braucht Name + Domain überhaupt erst als Input →
3. dieser Skill, **optional**, für die verbliebene Lücke wertvoller Leads.

Wer Schritt 2 überspringt, zahlt für Daten, die im Impressum kostenlos stehen — und liefert dem
Tool keine Namen, mit denen es arbeiten kann.

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

Bezahlt wird nur der Treffer — kein Fund, kein Credit.

Rechenbeispiel: 500 qualifizierte Leads nur mit E-Mail = 500 Credits. Dieselben 500 zusätzlich mit
Mobilnummer = 5.500 Credits, also gut das Zehnfache. Diese Preise sind ein Stand, kein Fakt: vor
dem Kauf auf der Tool-Seite nachsehen und mit dem aktuellen Preis rechnen.

## Wann es sich lohnt — und wann nicht

- **Nur qualifizierte Zielkontakte.** Nie eine Rohliste durchjagen. Input ist eine Liste, die durch
  `listen-qualitaet` gegangen ist und je Zeile einen Personennamen und eine Domain trägt.
- **Ohne Personennamen kein Lauf.** Das Tool sucht die Adresse einer bestimmten Person. Leere
  Namensfelder kosten zwar keinen Credit, liefern aber auch nichts — erst Impressum oder LinkedIn.
- **Budget knapp oder Angebot noch nicht validiert:** Masse über das Impressum abwickeln, Waterfall
  nur für die 50–100 Top-Prospects, und dort nur E-Mails.
- **Angebot validiert, hoher Deckungsbeitrag, Engpass ist der Entscheiderzugang:** E-Mails für die
  ganze qualifizierte Liste sind vertretbar; Mobilnummern bleiben trotzdem der Spitze vorbehalten.
- **Mobilnummern** sind die eine Entscheidung, die einzeln begründet wird: rund 55 Cent für einen
  Kontakt. Standard ist nein — Ausnahme ist ein bereits qualifizierter Lead, den man über E-Mail
  und Zentrale nachweislich nicht erreicht.

Budget-Variante ohne gebündeltes Tool: der **manuelle Waterfall** — dieselbe Liste nacheinander
durch mehrere Einzelanbieter schicken (E-Mail-Suche zuerst), zwischen den Runden die Treffer
abziehen. Je Treffer günstiger, aber jede Runde bedeutet Export, Filtern, Re-Upload, das
Zusammenführen ist fehleranfällig, es gibt kein Tracking, welcher Anbieter geliefert hat, und
Mobilnummern kommen praktisch keine heraus. Nur bei kleinen Mengen und knappem Budget wählen.

## Ablauf

1. **Lücke bestimmen.** Aus der geprüften Liste die Zeilen ziehen, die nur eine Rollen-Adresse oder
   gar keine Adresse haben **und** im ICP oben stehen. Anzahl nennen — sie ist die Rechengrundlage.
2. **Kalkulieren und freigeben lassen.** n × 1 Credit für E-Mails, dazu nur bei ausdrücklichem
   Wunsch m × 10 Credits für Mobilnummern; in Dollar umrechnen, Deckel nennen. Ohne Freigabe des
   Nutzers kein Lauf (Leitsatz 2 des Masters).
3. **Input bauen.** Je Zeile Vorname, Nachname, Firma und Domain — mehr braucht das Tool nicht.
4. **Lauf fahren** mit ausschließlich „Work Email", solange Mobilnummern nicht freigegeben sind.
5. **Ergebnis mergen.** Die persönliche Adresse ersetzt die Rollen-Adresse, die alte bleibt in der
   Zusatzspalte `email_rollen` stehen (die info@ zusätzlich anzuschreiben erhöht laut Kurs die
   Kontaktchance). `quelle` um `+waterfall` ergänzen, `hinweis` um `persoenliche-adresse`, und die
   Provider-Angabe je Treffer als Zusatzspalte mitführen — sie macht den Lauf nachvollziehbar.
6. **Zurück an `listen-qualitaet`.** Auch dieser Baustein übergibt nichts selbst. Neue Adressen
   laufen dort durch die Verifizierung, sofern das Tool keinen eigenen Zustellbarkeits-Status
   mitliefert.

## Bekannte Fallen

- **Ganze Rohlisten durchjagen** — der teuerste Fehler dieses Wegs. Erst qualifizieren, dann anreichern.
- **Mobilnummern in Masse:** zehnfacher Preis für einen Kanal, den die wenigsten Kampagnen nutzen.
- **Doppelt anreichern:** Leads, die schon eine persönliche Adresse haben, vor dem Upload herausfiltern.
- **Preise aus dieser Datei als gesetzt behandeln.** Sie sind der Stand der Kurs-Lektion; die
  Kalkulation gegenüber dem Nutzer läuft immer mit dem tagesaktuellen Preis.
