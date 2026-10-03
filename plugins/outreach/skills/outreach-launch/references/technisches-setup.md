# Technisches Setup — Domains, Zapmail, Warmup, Sendelimits

> Referenz zu `outreach-launch`. Alles hier passiert beim Kunden, außerhalb von ListM8: ListM8
> versendet nichts, legt keine Domains oder Postfächer an und wärmt nichts auf. Bei einem
> Widerspruch zu `outreach-copy` gilt `outreach-copy`, bei einem Widerspruch zur `SKILL.md` von
> `outreach-launch` gilt diese.

## Grundhaltung

Setup ist 60 % der Arbeit. Copy ist 30 %. Send-Strategie ist 10 %. Wer die Reihenfolge umdreht, scheitert.

90 % der Cold Mailer machen den gleichen Fehler: Sie senden, ohne Setup. Ergebnis: Mails landen im Spam, niemand antwortet, die Kampagne wird als „funktioniert nicht" abgeschrieben. Dabei hat sie nie stattgefunden - die Mails wurden nie gelesen.

Das Setup ist der Teil, den niemand sieht und der über alles entscheidet. Es kostet im empfohlenen Zuschnitt rund 100 EUR im Monat und zwei bis drei Stunden Arbeit - und ohne es ist jede Stunde Copy-Arbeit verschwendet.

**Zeitrahmen:** 2-3 Stunden Setup, dann mindestens 14 Tage Warmup. Alles andere (Listen, Kampagne und Personalisierung in ListM8) läuft parallel.

**Die Reihenfolge ist nicht beliebig:** Domains kaufen → Zapmail verbinden → Postfächer anlegen → nach Instantly exportieren → Warmup starten. Erst am Ende dieser Kette beginnen die 14 Tage. Wer Instantly zuerst kauft, hat zwei Wochen lang ein leeres Tool.

## Schritt 1: Domains kaufen

- [ ] **5 separate Domains** kaufen (NICHT die Hauptdomain!)
- [ ] Endungen: .com, .net, .info, .org (kein .ch/.at wenn nicht in dem Land aktiv)
- [ ] Name möglichst nah an der echten Firma (z. B. firmaname-consulting.com)
- [ ] KEINE 301-Weiterleitung auf die Hauptdomain (sonst verbrennt man die Hauptdomain mit)
- [ ] Anbieter muss **Nameserver-Änderungen** zulassen - das braucht Zapmail im nächsten Schritt
- [ ] Keine Upsells mitkaufen (Domainschutz, KI-Landingpage, Hosting). Es braucht nur die nackte Domain

**Wo kaufen:** Namecheap, GoDaddy, Checkdomain, Strato, Ionos, All-Inkl oder der bestehende Hoster - egal, solange die Nameserver frei sind. Nach dem Kauf dauert die Registrierung 30 bis 60 Minuten.

**Warum niemals die Hauptdomain:** Wenn die Cold-Mailing-Domain in eine Blacklist rutscht, ist bei einer Sekundärdomain eine Domain verbrannt. Bei der Hauptdomain kommen ab dann auch Rechnungen, Angebote und Kundenmails nicht mehr an. Das ist der teuerste vermeidbare Fehler im ganzen Kanal.

## Schritt 2: Zapmail einrichten und die Domains verbinden

- [ ] **Zapmail** (zapmail.ai) buchen - der Starter-Plan trägt 10 Postfächer
- [ ] Nameserver von Zapmail beim Domain-Anbieter eintragen
- [ ] Zapmails Domain-Check abwarten: er prüft jede Domain auf Blacklist-Einträge und bereits verknüpfte Workspaces

**Warum Zapmail und nicht von Hand:** Zapmail setzt SPF, DKIM und DMARC selbst, sobald die Domain verbunden ist. Der Teil, der früher pro Domain drei DNS-Einträge und einen Check bedeutete, fällt damit weg. Dazu der Preis: 10 Postfächer kosten im Starter-Plan rund 3,90 USD im Monat, einzeln gebucht wären es 6 bis 10 EUR pro Postfach. Bis 30 Postfächer skaliert der Growth-Plan.

Was Zapmail dabei setzt - und was man kennen sollte, wenn ein Kunde fragt, warum eine Mail trotzdem im Spam landet:

| Record | Aufgabe |
|:-------|:--------|
| **SPF** | Legt fest, welche Server überhaupt für die Domain senden dürfen |
| **DKIM** | Signiert jede Mail kryptografisch, damit der Empfänger die Echtheit prüfen kann |
| **DMARC** | Sagt dem Empfänger, was mit Mails passieren soll, die SPF oder DKIM nicht bestehen |

**DMARC nicht leer lassen:** Ein Record allein reicht nicht, er braucht eine Policy und eine Reporting-Adresse. Für den Start ist `p=none` mit einer `rua`-Adresse richtig - dann wird nichts abgewiesen, aber du bekommst Berichte darüber, wer in deinem Namen sendet und ob die Authentifizierung greift. Verschärfen (`p=quarantine`, später `p=reject`) erst, wenn die Berichte sauber sind. Prüf nach dem Verbinden einmal nach, dass Zapmail eine Policy gesetzt hat und der Record nicht leer steht.

Ohne diese drei Einträge geht ein großer Teil der Mails direkt in den Spam - unabhängig von Copy, Offer oder Zielgruppe.

## Schritt 3: Postfächer anlegen

- [ ] Pro Domain **2 Postfächer** = **10 Inboxen total**, direkt in Zapmail
- [ ] **Microsoft 365** als Provider - im DACH-Mittelstand läuft Outlook, und der Versand von Server zu Server kommt dort besser an
- [ ] Seriöse Namensformate: `vorname@` oder `p.nachname@`, keine Fantasienamen
- [ ] **24-Stunden-Regel:** Alle Postfächer einer Domain müssen innerhalb eines Tages nach dem ersten angelegt sein - danach sperrt Zapmail die Domain
- [ ] Zapmail kann die Namenskombinationen für alle verbundenen Domains auf einen Schlag erzeugen

Die Aufteilung auf viele Inboxen ist kein Komfort, sondern die Grundlage des Volumens: Kein einzelnes Postfach darf viel senden, aber zehn Postfächer zusammen schaffen die Zielmenge, ohne dass eines auffällt.

Die Freischaltung der Postfächer dauert rund zwei Stunden.

## Schritt 4: Nach Instantly exportieren und Warmup starten

- [ ] **Instantly** buchen (empfohlen: Hypergrowth mit 25.000 Kontakten und 100.000 Mails im Monat)
- [ ] Postfächer über Zapmails Export-Funktion mit den Instantly-Zugangsdaten übertragen - dauert etwa 30 Minuten
- [ ] Warmup für ALLE Accounts aktivieren: in Instantly oben links alle Postfächer auswählen, Warm-up starten
- [ ] **Nachsehen, dass er wirklich läuft:** Die Flamme am Postfach muss von Grau auf Grün springen. Steht sie grau, wärmt nichts - und das fällt sonst erst auf, wenn die erste Kampagne im Spam landet. Das ist der eine Handgriff, der nach dem Verbinden der Postfächer gerne vergessen wird
- [ ] **Mindestens 14 Tage warten** bevor die erste Kampagne startet
- [ ] Freigabe zusätzlich am Warmup-Score festmachen, nicht nur am Kalender
- [ ] Während dem Warmup: Listen bauen (`datenbeschaffung`) und die Kampagne in ListM8 vorbereiten (`outreach-campaign`, danach `outreach-pipeline`)

Warmup heißt: Die Postfächer schreiben sich gegenseitig, öffnen Mails und antworten. Für den Provider sieht das aus wie ein normal genutztes Postfach mit echter Interaktion. Ein Postfach, das an Tag 1 plötzlich 30 Mails an Fremde schickt, sieht aus wie ein gekapertes Konto.

14 Tage sind der Mindestwert. Bei frisch registrierten Domains ohne jede Historie darf es länger dauern - entscheidend ist der Warmup-Score, nicht das Datum.

**Kein echter Versand vor Ablauf des Warmups.** Auch nicht „nur 20 Mails zum Testen".

## Schritt 5: Versand-Einstellungen

- [ ] Sendelimit auf **30 Mails pro Inbox pro Tag** setzen
- [ ] Sendefenster: Mo-Fr, 08:00-16:00, Europe/Berlin (also die Zeitzone der Empfänger im DACH-Raum). Wochenenden aus
- [ ] **Open- und Link-Tracking aktivieren** - die KPI-Steuerung und das Nachtelefonieren nach Öffnern hängen daran
- [ ] Bei Link-Tracking: eine **eigene** Tracking-Domain verwenden, keine geteilte. Eine Tracking-Domain, über die viele fremde Absender laufen, überträgt deren Reputation auf deine Links
- [ ] **List-Unsubscribe-Header** im Versandtool aktivieren. Das ist der technische Abmeldeweg, den Mail-Anbieter im Client als Ein-Klick-Abmeldung anzeigen - eine Textzeile im Body allein erfüllt das nicht. Kostet eine Einstellung und senkt die Beschwerdequote messbar

Wird die Instantly-Kampagne aus ListM8 heraus angelegt (Reiter „Instantly" der Kampagne), setzt ListM8 einen Standard-Zeitplan (Mo-Fr 09:00-17:00, Zeitzone Europe/Belgrade, also mitteleuropäische Zeit). Sendefenster und Limits danach in Instantly auf die Werte oben stellen.

Bei 10 Inboxen und 30 Mails ergibt das eine theoretische Obergrenze von 300 Mails pro Tag. Diese Grenze wird nicht ab Tag 1 gefahren, sondern schrittweise erreicht - dazu mehr in `launch-und-optimierung.md`.

Wer die Limits pro Inbox erhöht, statt Inboxen hinzuzufügen, verbrennt Domains. Mehr Volumen heißt immer: mehr Postfächer, nie mehr Mails pro Postfach.

## E-Mail-Verifizierung

Eine hohe Bounce Rate zerstört die Reputation schneller als schlechte Copy. Deshalb gehört Verifizierung zum Setup, nicht zur Optimierung:

- [ ] Alle Adressen vor dem Import verifizieren: im Datenbeschaffungs-Paket ist das Schritt 3 von `listen-qualitaet` (Verifier im eigenen Konto beim Anbieter), sonst in Instantly
- [ ] Zielwert: Bounce Rate unter 3 %, besser unter 1 %
- [ ] Adressen ohne klares Ergebnis („unknown", „risky") aussortieren, nicht mitsenden
- [ ] Rollen-Adressen wie info@, kontakt@, office@ nur bewusst nutzen - sie bouncen selten, landen aber oft bei niemandem

Der Zielwert liegt unter 3 %. Die Notbremse - Versand anhalten und Liste bereinigen - liegt bei 5 %.

## Tools: Versand, Research, Personalisierung

| Zweck | Tool |
|:------|:-----|
| Lead-Qualifizierung, Research und AI-Personalisierung | **ListM8** |
| Versand und Warmup | Instantly |
| Domains, DNS und Postfächer | **Zapmail** (legt Microsoft-365-Postfächer an und setzt SPF, DKIM, DMARC) |
| CRM | z. B. Close |

Instantly ist das Versandtool. ListM8 ist das Qualifizierungs-, Research- und Generierungstool und versendet nichts. Diese Trennung ist wichtig, wenn Kunden fragen, ob sie „das eine oder das andere" brauchen: Sie brauchen beides.

Was ListM8 bis zur Übergabe leistet (Qualifizierung, Research, Variablen, Review, CSV-Export oder Push nach Instantly), steht in der `SKILL.md` von `outreach-launch` unter „Wer macht was".

## Kosten-Übersicht

Richtwerte aus der Vorlage ohne Prüfdatum. Vor dem Kauf den aktuellen Preis beim Anbieter prüfen.

| Posten | Kosten |
|:-------|:-------|
| 5 Domains | ca. 50-80 EUR/Jahr |
| Zapmail (Starter, 10 Postfächer) | ca. 3,90 USD/Monat |
| Instantly (Hypergrowth, empfohlen: 25.000 Kontakte, 100.000+ Mails/Monat) | ca. 97 USD/Monat, jährlich ca. 78 USD/Monat |
| **Gesamt** | **ca. 100 EUR/Monat im empfohlenen Hypergrowth-Zuschnitt** — mit dem kleineren Growth-Plan (47 USD, 1.000 Kontakte) als Einstieg gut 50 EUR |

Dazu kommen je nach Vorgehen die Kosten für Leads (beim Datenanbieter) und für die Verarbeitung in ListM8. Wer das Setup sparen will, spart am einzigen Teil, der nicht verhandelbar ist.

## Checkliste: Setup fertig?

- [ ] 5 Domains gekauft, keine davon die Hauptdomain
- [ ] Keine Weiterleitung von den Sekundärdomains auf die Hauptdomain
- [ ] Domains in Zapmail verbunden, Domain-Check ohne Befund
- [ ] 10 Microsoft-365-Postfächer angelegt (2 pro Domain, je Domain innerhalb von 24 Stunden)
- [ ] SPF, DKIM, DMARC stehen, DMARC mit `p=none` und Reporting-Adresse
- [ ] Alle 10 Postfächer nach Instantly exportiert
- [ ] Warmup für alle 10 aktiv (Flamme grün), mindestens 14 Tage, Score in Ordnung
- [ ] Sendelimit auf 30 Mails pro Inbox pro Tag, Sendefenster Mo-Fr 08:00-16:00
- [ ] Open- und Link-Tracking aktiv, eigene Tracking-Domain
- [ ] List-Unsubscribe-Header aktiviert
- [ ] Signatur genau einmal: Nach `outreach-copy` steht sie als schlanker Klartext in der Sequenz. Eine Postfach-Signatur in Instantly nur, wenn die Sequenz keine eigene trägt, sonst steht sie doppelt
- [ ] Leadliste verifiziert, Bounce-Prognose unter 3 %

Erst wenn jeder Punkt steht, geht die erste Kampagne live.

## Optional, aber hilfreich

Diese Schritte gehören nicht zum Pflichtprogramm, ersparen aber Ärger:

- **Inbox-Placement-Test** nach dem Warmup und vor dem Hochfahren: eine Testmail an eigene Postfächer bei verschiedenen Anbietern senden und prüfen, wo sie landet
- **Reputations-Überwachung**: die Postmaster-Werkzeuge der großen Anbieter zeigen Zustellrate, Beschwerdequote und Authentifizierungsstatus pro Domain
- **Blacklist-Check** in größeren Abständen, damit eine Listung nicht erst an fallenden Antwortquoten auffällt
- **Wenn eine Domain gelistet ist**: aus der Rotation nehmen, Ursache prüfen (meist Bounces oder Beschwerden), und erst nach Klärung ein Delisting beantragen. Weitersenden verschlimmert es

## Das Wichtigste

Fünf Domains, zehn Postfächer, drei DNS-Einträge, 14 Tage Geduld. Wer diese vier Dinge macht, hat den Kanal. Wer eines davon überspringt, schreibt Mails, die niemand liest - und sucht den Fehler dann in der Copy.
