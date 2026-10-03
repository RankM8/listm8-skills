# Launch, Nachtelefonieren und Optimierung

> Referenz zu `outreach-launch`. Versand, Antworten und Telefonate laufen beim Kunden in
> Instantly bzw. im eigenen Postfach, nicht in ListM8. Bei einem Widerspruch zu `outreach-copy`
> gilt `outreach-copy`, bei einem Widerspruch zur `SKILL.md` von `outreach-launch` gilt diese.

## Grundhaltung

Zwei Dinge trennen funktionierende Kampagnen von abgeschriebenen: langsames Hochfahren und Nachtelefonieren. Das erste entscheidet, ob die Mails ankommen. Das zweite entscheidet, ob aus Antworten Termine werden. Beide kosten keine Kreativität, nur Disziplin.

Und beide werden regelmäßig übersprungen. Deshalb hat die Hälfte der „Cold Mailing funktioniert nicht"-Fälle nichts mit Cold Mailing zu tun, sondern mit einem Kunden, der 300 Mails am ersten Tag rausgeschossen und danach auf Antworten gewartet hat, ohne einmal zum Telefon zu greifen.

## Kampagne einrichten (in Instantly)

1. [ ] Neue Kampagne erstellen, oder aus ListM8 heraus anlegen und verknüpfen (Reiter „Instantly" der ListM8-Kampagne)
2. [ ] Leads übernehmen: Push der freigegebenen Leads aus ListM8 (manuell oder per Auto-Push) oder CSV-Export aus ListM8 hochladen
3. [ ] Sequenz einrichten (Entry Mail + 4 FUPs — die fünf Steps aus der Kampagne): per Sequenz-Übertragung aus ListM8 oder von Hand
4. [ ] 2 Entry-Mail-Varianten als A/B-Test anlegen (in Instantly; eine erneute Sequenz-Übertragung aus ListM8 ersetzt die Sequenz dort nach Bestätigung, angelegte Varianten also mit)
5. [ ] Alle 10 Sender-Accounts der Kampagne zuweisen
6. [ ] Schedule: Mo-Fr, 08:00-16:00, Europe/Berlin (der Standard-Zeitplan einer aus ListM8 angelegten Kampagne ist 09:00-17:00, anpassen)
7. [ ] Max. 30 Mails pro Inbox pro Tag

## Langsam hochfahren

- **Woche 1:** 100-150 Mails/Tag (um Spam-Filter nicht zu triggern)
- **Woche 2:** 200-250 Mails/Tag
- **Woche 3+:** 300 Mails/Tag (Zielgeschwindigkeit)

Auch nach dem Warmup ist ein Postfach nicht auf 30 Mails am Tag eingestellt. Der Sprung von 0 auf Volllast ist genau das Muster, das Provider als Massenversand erkennen.

## Launch-Check

- [ ] Warmup läuft seit mind. 14 Tagen, Score in Ordnung
- [ ] E-Mails verifiziert (Bounce Rate Prognose unter 3 %)
- [ ] AI-Opener der ersten 40 Mails manuell geprüft (rund 20 Minuten Lesezeit; in ListM8 im Review bzw. mit `outreach-verify`)
- [ ] Betreffzeilen nach `outreach-copy`: 2-5 Wörter, kein Spam-Wort, nur erlaubte Platzhalter (z. B. `{{lead.company}}`, nie `{{firstName}}`)
- [ ] Variablen korrekt gemappt (Variablen-Zuordnung im Reiter „Instantly" vollständig, sonst blockiert der Push; Vorschau mit einem freigegebenen Lead angesehen)
- [ ] Sperrliste geladen: Kontaktstatus in ListM8 aktuell (`do_not_contact`, bereits Kontaktierte) und Blockliste in Instantly gepflegt
- [ ] Abmeldehinweis vorhanden, List-Unsubscribe-Header aktiv

Der wichtigste Punkt ist die Stichprobe der AI-Opener. Wenn dort mehr als 8 von 40 durchfallen, wird nicht gestartet, sondern der Prompt nachgeschärft: Ablehnungen mit Begründung (`reject_lead_variables`, dazu `set_lead_email_feedback`), Prompt-Änderung über `outreach-campaign` (`export_campaign_blueprint` → `edit_campaign`; das Ersetzen der AI-Variablen löscht alle erzeugten Werte, nur mit ausdrücklicher Zustimmung).

## Nachtelefonieren (PFLICHT - ab Tag 1)

**Das ist der Step, den Kunden am häufigsten überspringen. Ohne Nachtelefonieren ist Cold Mailing maximal halb so effektiv.**

Aufwand: 1-2 Stunden pro Tag.

### Warum Nachtelefonieren alles verändert

- Die Leute haben euren Namen schon gesehen
- Sie kennen eure Firma
- Sie haben eure Mail geöffnet (Instantly zeigt euch das)
- Der Anruf ist kein Kaltanruf mehr - es ist ein warmer Anruf
- „Hey, ich hatte Ihnen letzte Woche eine Mail geschickt zum Thema XY - haben Sie die gesehen?" ist der einfachste Gesprächseinstieg der Welt

### Wann wen anrufen

| Priorität | Wer | Warum |
|:----------|:----|:------|
| **1 (sofort)** | Positive Replies („Ja, gerne", „Klingt spannend") | Heißer Lead, sofort drauf |
| **2 (gleicher Tag)** | Negative aber höfliche Replies („Kein Interesse gerade") | Tür offen halten, kurzer Anruf |
| **3 (nach 2-3 Tagen)** | Opener, keine Reply | Haben die Mail geöffnet, Interesse ist da |
| **4 (nach FUP2)** | Nie geöffnet | Kalt, aber trotzdem anrufen - vielleicht anderer Ansprechpartner |

### Script für den Anruf

„Hallo [Name], hier ist [Absender] von [Firma]. Ich hatte Ihnen letzte Woche eine kurze Mail geschickt zum Thema [Offer in einem Satz]. Wollte nur kurz nachfragen ob die angekommen ist?"

Dann zuhören. Nicht pitchen. Die meisten Gespräche ergeben sich von selbst.

Die Anrede im Telefonat folgt der Ansprache der Kampagne (du, Sie oder das Team).

## KPI-Benchmarks

| Metrik | Schlecht | OK | Gut | Sehr gut |
|:-------|:---------|:---|:----|:---------|
| **Open Rate** | unter 40 % | 40-55 % | 55-70 % | 70 %+ |
| **Reply Rate** | unter 2 % | 2-4 % | 4-6 % | 6 %+ |
| **Bounce Rate** | über 3 % | 2-3 % | 1-2 % | unter 1 % |
| **Opportunity Rate** (positive Antworten) | unter 0,5 % | 0,5-1 % | 1-2 % | 2 %+ |
| **Positive Reply Rate** | unter 0,5 % | 0,5-1 % | 1-2 % | 2 %+ |
| **Spam-Beschwerdequote** | über 0,3 % | 0,1-0,3 % | unter 0,1 % | nahe 0 % |

Das Zielband aus der Kampagnen-Vorlage sind 4-6 % Reply Rate und eine Bounce Rate unter 3 % — wer darunter bzw. darüber liegt, prüft Liste und Erstansprache, bevor er weiter skaliert.

**Referenzwert:** eine Förder-Kampagne (4.473 Sequences): 82 % Open Rate, 3,15 % Reply Rate, 55 % Open Rate auf die Entry Mail

Review-Rhythmus: 30 Minuten pro Woche, ab Woche 4. Einzelne Tage sagen nichts - Reply Rates schwanken stark, Antworten kommen verzögert, und Follow-Ups tragen einen großen Teil der Ergebnisse. Bewertet wird pro Woche.

Die Zahlen kommen aus Instantly. Mit verbundener Instantly-Integration zeigt ListM8 zusätzlich Kontaktiert, Antworten und Opportunities aus dem Kontaktstatus-Sync; diese Werte zählen pro Lead global (ein Lead in mehreren Kampagnen zählt in jeder), für den Wochen-Review gilt deshalb die Instantly-Statistik.

Zur Beschwerdequote: Sie ist die einzige Zahl in der Tabelle, bei der ein Wert über der Schwelle unmittelbar die Zustellung aller Domains betrifft, nicht nur die Ergebnisse einer Kampagne. Getrieben wird sie fast immer von Copy und Zielgruppe - irreführende Betreffzeilen, ein Offer, das die Mail nicht hält, oder Empfänger, für die die Mail keinen Sinn ergibt.

## Sofort-Stopp-Schwellen

Diese Fälle werden nicht optimiert, sondern angehalten:

| Signal | Aktion |
|:-------|:-------|
| Beschwerdequote über 0,3 % | Versand sofort stoppen. Betreffzeilen und Zielgruppe prüfen, bevor es weitergeht |
| Bounce Rate über 5 % | Versand stoppen, Liste bereinigen und neu verifizieren, erst dann weiter |
| Reply Rate unter 0,5 % nach 200+ Mails pro Variante | Kampagne pausieren, Offer überdenken - nicht die Betreffzeile |
| Warmup-Score eines Postfachs fällt ab | Volumen dieses Postfachs reduzieren, nicht durch andere kompensieren |

Der Zielwert für Bounces liegt unter 3 %, die Notbremse bei 5 % - dazwischen wird nachgearbeitet, nicht gestoppt. Weiterlaufen lassen und hoffen ist bei Bounces und Beschwerden die teuerste Option: Jeder weitere Tag beschädigt die Domain-Reputation, und die kommt nicht zurück.

## Diagnose + Fix

| Problem | Wahrscheinliche Ursache | Fix |
|:--------|:----------------------|:----|
| Open Rate unter 40 % | Betreffzeile langweilig oder spammy | Neue Betreffzeilen testen, kürzer, nach den Mustern aus `outreach-copy` |
| Open Rate unter 40 % | Domain-Reputation schlecht | Warmup prüfen, ggf. neue Domains |
| Reply Rate unter 1 % | Offer zu schwach | Offer komplett überdenken (`outreach-copy`, Marketing-Offer) |
| Reply Rate unter 1 % | Mail zu lang oder zu generisch | Kürzen, AI-Personalisierung schärfen (`intro`-Prompt) |
| Reply Rate 1-3 % aber keine Termine | Nicht nachtelefoniert | Nachtelefonieren ernst nehmen |
| Viele negative Replies | Zielgruppe falsch | Liste prüfen, ICP schärfen |
| Hohe Bounce Rate (5 %+) | E-Mails nicht verifiziert | Verifizierung einbauen, schlechte Leads entfernen |
| Beschwerdequote steigt | Betreff verspricht mehr als die Mail hält | Betreffzeilen entschärfen, Zielgruppe prüfen |

Die Diagnose folgt immer der Kette: Beschwerden und Bounces zuerst, dann Open Rate, dann Reply Rate, dann Termine. Wer bei den Terminen anfängt zu optimieren, während die Bounce Rate bei 6 % liegt, behandelt das Symptom.

Ein Hinweis zur Open Rate: Sie wird über ein Pixel gemessen, und manche Mail-Programme laden dieses Pixel automatisch vor. Die Zahl ist deshalb tendenziell zu hoch und taugt als Trend, nicht als exakter Wert. Reply Rate und Beschwerdequote sind die härteren Signale.

## A/B-Test Reihenfolge

Was zuerst testen, was zuletzt:

1. **Offer** (größter Hebel) - komplett anderes Angebot testen
2. **Betreffzeile** - 2-3 Varianten parallel
3. **AI-Opener Angle** - Bewertungen vs. Website vs. Regional (der Angle steht im `intro`-Prompt; für einen Test die Leads auf zwei Kampagnen mit je eigenem Prompt aufteilen)
4. **CTA** - „Antworte kurz" vs. „Darf ich zusenden?" (kein Kalenderlink in der Entry Mail; ein Link frühestens ab Step 3, siehe `outreach-copy`)
5. **FUP-Timing** - 3 vs. 5 vs. 7 Tage Abstand (Standard bleibt 0/3/5/7/7 aus `outreach-copy`, Abweichung nur als bewusster Test)

### Regeln für saubere Tests

- **Immer nur eine Variable.** Wer Betreff und Offer gleichzeitig ändert, weiß hinterher nicht, was gewirkt hat
- **Mindestens 100 Mails pro Variante**, besser 200, bevor überhaupt verglichen wird
- **Mindestens 7 Tage laufen lassen** - Antworten kommen verzögert, und Wochentage verhalten sich unterschiedlich
- **Kleine Unterschiede sind kein Ergebnis.** 2,1 % gegen 2,4 % bei je 150 Mails ist Zufall, kein Gewinner
- **Verlierer abschalten, Gewinner skalieren** - nicht beide weiterlaufen lassen

Wenn nach 200 Mails pro Variante kein Unterschied erkennbar ist, sind die Varianten gleichwertig. Dann ist der Test beendet und die nächste Ebene der Liste kommt dran.

## Umgang mit Antworten

| Antworttyp | Umgang |
|:-----------|:-------|
| Positiv | Sofort anrufen, nicht erst zurückschreiben |
| „Kein Interesse gerade" | Höflich bedanken, Tür offenhalten, in 6 Monaten erneut - keine Diskussion |
| „Bitte keine Mails mehr" | Sofort in die zentrale Sperrliste, nicht nur aus der Kampagne entfernen |
| Verärgert | Einmal sachlich antworten, entschuldigen, sperren, Thema beenden |
| Formelles Schreiben | Lead sofort sperren, sachlich und zeitnah antworten, intern dokumentieren und an die zuständige Stelle geben |

Zwei Grundregeln: Ein Abmeldewunsch gilt dauerhaft und über alle Kampagnen und Postfächer hinweg. Und niemand diskutiert mit einem verärgerten Empfänger - das kostet nur Zeit und treibt die Beschwerdequote.

Die zentrale Sperrliste ist in ListM8 der Kontaktstatus `do_not_contact`: Solche Leads schließt ListM8 von allen AI-Läufen, Kampagnen und Pushes aus. Der Kontaktstatus-Sync der Instantly-Integration übernimmt Bounces und Abmeldungen aus Instantly automatisch als `do_not_contact` (Antworten als `replied`, Interessierte als `opportunity`). Gesperrt wird zusätzlich von Hand mit `mark_leads_contacted(emails=[…], status="do_not_contact")`, sobald eine Abmeldung per Antwort, Telefon oder Brief kommt. Ohne Instantly-Integration auch kontaktierte Leads so nachtragen (`status="contacted"`), damit niemand doppelt angeschrieben wird.

## Erwartungsmanagement

Cold Mailing ist ein Volumenkanal mit Vorlaufzeit. Realistischer Ablauf:

| Zeitraum | Was passiert |
|:---------|:-------------|
| Woche 1-2 | Setup und Warmup. Kein Versand, keine Ergebnisse |
| Woche 3 | Erste Mails, langsames Hochfahren. Erste Antworten |
| Woche 4-5 | Zielgeschwindigkeit, erste Termine, erste belastbare Zahlen |
| Ab Woche 6 | Optimierung auf Basis echter Daten |

Wer in Woche 2 Termine erwartet, bricht in Woche 3 ab. Deshalb wird die Vorlaufzeit vorher kommuniziert, nicht hinterher erklärt.

## Optional, aber hilfreich

- **Reputations-Überwachung:** die Postmaster-Werkzeuge der großen Anbieter zeigen Zustellrate, Beschwerdequote und Authentifizierungsstatus pro Domain - der schnellste Frühwarnindikator
- **Blacklist-Check** in größeren Abständen, damit eine Listung nicht erst an fallenden Antwortquoten auffällt
- **Inbox-Placement-Test** vor dem Hochfahren: Testmail an eigene Postfächer bei verschiedenen Anbietern und prüfen, wo sie landet

## Das Wichtigste

Langsam hochfahren, jede Woche 30 Minuten auf die Zahlen schauen, und jeden Tag eine Stunde telefonieren. Der Rest ist Handwerk, das in `outreach-copy` und `datenbeschaffung` steht.
