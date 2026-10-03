# Cold-Mail-Copy — Opener, Entry Mail, Follow-Ups, Qualitätsprüfung

> Ausführliche Lehre zu `outreach-copy`. Bei einem Widerspruch gilt die `SKILL.md` des Skills.
>
> **Lesehilfe für die Beispiele:** Die Beispiel-Mails sind aufgelöst dargestellt, wie sie beim
> Empfänger ankommen. In der Sequenz steht die Anrede-Zeile als `{{ai.hallo}}` und der
> individuelle Bezug der Entry Mail als `{{ai.intro}}`; der Rest ist fester Text. Die Beispiele
> sprechen die Person mit „du“ und den Betrieb mit „ihr/euch“ an. In ListM8 legt
> `emailAgentConfig.salutation` die Pronomen für die ganze Mail fest (`du`: nur du/dir/dein;
> `team`: ihr/euch/eure; `sie`: Sie/Ihnen/Ihre). Den festen Text beim Übernehmen auf den
> gewählten Modus umschreiben.

## Grundhaltung

Eine Cold Mail ist keine kurze Version deiner Website. Sie ist eine Nachricht an einen Menschen, der dich nicht kennt und dessen Tag voll ist. Deshalb gilt: drei Bausteine, ein CTA, und kein Satz über die eigene Firma.

Der häufigste Reflex ist, sich erst vorzustellen. Genau der killt die Mail. Wer sich vorstellt, bevor er einen Grund geliefert hat, weiterzulesen, hat die Mail an die Stelle geschrieben, wo der Empfänger sie löscht.

Und eine Mail reicht nicht. Der größte Teil der Antworten kommt nicht auf die Entry Mail, sondern auf die Nachfass-Mails. Wer nach Mail 1 aufgibt, hat die ganze Arbeit gemacht und die Ernte verschenkt.

## Die Sequenz auf einen Blick

| Mail | Step | Typ | Wörter | `delayDays` | Tag |
|:-----|:-----|:----|:-------|:------------|:----|
| **Entry Mail** | 1 | Komplette Botschaft | max. 120, Ziel 50-90 | 0 | 0 |
| **FUP1** | 2 | Reiner Reminder | max. 50 | 3 | 3 |
| **FUP2** | 3 | Kleiner Mehrwert (Case Study) | max. 80 | 5 | 8 |
| **FUP3** | 4 | Dringlichkeit | max. 60 | 7 | 15 |
| **FUP4** | 5 | Break-Up | max. 60 | 7 | 22 |

Der Standard sind vier Follow-Ups — zusammen mit der Entry Mail fünf Steps. Nur auf ausdrücklichen Wunsch, etwa bei sehr großen Zielgruppen, kann FUP4 entfallen - dort ist neues Sendevolumen wertvoller als der letzte Nachfass.

**Alle Zahlen sind Obergrenzen, keine Zielvorgaben.** Die abgenommenen Kampagnen liegen bei der Entry Mail zwischen 55 und 86 Wörtern, die Follow-Up-Bausteine teils deutlich darunter - die kürzeste empfohlene Reminder-Variante hat 14 Wörter. Wer dieselbe Botschaft in weniger Wörtern unterbringt, hat es besser gemacht, nicht schlechter.

Wenn drüber: kürzen. Nicht diskutieren. Aufgefüllt wird nie.

---

# TEIL 1: Der individuelle Bezug (Opener)

Der individuelle Bezug ist der eine Satz, der entscheidet, ob die Mail als persönliche Nachricht oder als Massenmail gelesen wird. AI-Personalisierung verdoppelt bis verdreifacht die Reply Rate. Ohne sie ist die Mail eine Massenmail - egal wie gut das Offer ist.

Aber der Opener ist kein Kompliment-Generator, sondern ein Beweis. Er beweist, dass jemand hingeschaut hat. Deshalb entscheidet nicht die Formulierung, sondern das Detail - und wo es kein Detail gibt, ist eine ehrliche Standardzeile besser als eine erfundene Beobachtung.

**Vorher (ohne AI-Personalisierung):**

„Hallo Max, wir bieten kostenloses Google Ads Setup an..."

**Nachher (mit AI-Personalisierung):**

„Hallo Max, ich war gerade auf eurem Shop und mir sind eure 347 Kundenbewertungen aufgefallen. Einer hat sogar geschrieben, dass eure Lieferung schneller war als bei Amazon..."

## Angle-Hierarchie (immer in dieser Reihenfolge versuchen)

### Angle 1: Kundenbewertungen (bester Angle)

**Wann:** Google Reviews, Trusted Shops, Shop-Bewertungen vorhanden.
**Warum der beste:** Bewertungen sind spezifisch, emotional und beweisen, dass man wirklich recherchiert hat. Plus: Lob funktioniert immer.

| Vorlage | Echtes Beispiel |
|:--------|:---------------|
| „ich hab mir eure Bewertungen angeschaut und einer eurer Kunden schreibt [PARAPHRASE]. [Was das über den Betrieb sagt, konkret]." | „ich hab mir eure Bewertungen angeschaut und einer eurer Kunden schreibt, dass eure Lieferung schneller war als bei Amazon. Das hat mich neugierig gemacht." |
| „bei [Zahl] Bewertungen und [Sternezahl] Sternen fällt man auf, besonders [konkretes Detail]." | „bei 347 Bewertungen und 4,8 Sternen fällt man auf, besonders dass mehrere Kunden eure Beratung als ehrlich beschreiben." |

### Angle 2: Website-Beobachtung

**Wann:** Keine Reviews vorhanden, aber die Website hat etwas Interessantes.

| Vorlage | Echtes Beispiel |
|:--------|:---------------|
| „ich war gerade auf eurer Website und [konkrete Beobachtung]" | „ich war gerade auf eurer Website: Ihr reinigt nur Industrieanlagen und nennt dafür sogar die Zertifikate eurer Teams." |
| „mir ist aufgefallen, dass ihr [konkretes Feature]" | „mir ist aufgefallen, dass ihr neben dem klassischen Handwerk auch Smart-Home-Integration anbietet und das gleich bei der Elektroplanung mitdenkt." |

### Angle 3: Stellenanzeige/Wachstum

**Wann:** Bei Recruiting-Offers oder wenn man auf offene Stellen oder Wachstum Bezug nehmen kann.

| Vorlage | Echtes Beispiel |
|:--------|:---------------|
| „ich hab gesehen, dass ihr gerade [Position] sucht" | „ich war kurz auf eurer Website und habe gesehen, dass ihr offene Stellen im Bereich Einkauf habt." |

### Angle 4: Branchen-/Regional-Bezug (Fallback)

**Wann:** Website gibt wenig her, keine Reviews, keine Stellenanzeigen. Schwächster Angle, aber besser als nichts.

| Vorlage |
|:--------|
| „als [Branche]-Unternehmen in [Region] seid ihr genau die Art Firma, die wir suchen" |

### Angle 5: Storytelling / Bier-Masche (Sonderfall)

**Wann:** NUR bei regionaler Zielgruppe + Dialekt-Tonalität. Nicht als Standard-Angle verwenden. Funktioniert nur, wenn der Absender selbst aus der Region kommt und Dialekt authentisch rüberkommt. Die Dialekt-Anrede schreibt dann der `hallo`-Prompt, nicht ein Platzhalter.

| Echtes Beispiel |
|:----------------|
| „Servus Max, i hab mi' vor kurzem mit einem Unternehmer aus unserer Region über Marketing unterhalten. Er hat mir erzählt, dass es immer schwieriger wird, online aufzufallen. I dad mi' interessieren, wie läuft die Neukundengewinnung bei euch?" |

## Der Opener ist immer ein Lob

Das Intro ist ein LOB bzw. ein konkreter, positiver Bezug auf den Lead. Es ist KEINE Kritik und KEIN Verbesserungsvorschlag.

**MUSS:**

- Ausschließlich positiv: echtes Lob oder anerkennende Beobachtung, getragen vom konkreten Detail. Austauschbare Bewertungsfloskeln („das spricht für sich", „das sieht man selten", „finde ich stark", „finde ich spannend") sind verboten (ListM8-Regel)
- Konkreter, verifizierbarer Bezug, den man nur kennt, wenn man wirklich auf Website/Shop/Bewertungen war
- Maximal 2 Sätze
- Beginnt mit Kleinbuchstaben (folgt direkt auf „Hallo …,"); nur der erste Buchstabe ist klein, jeder weitere Satz beginnt groß
- Über den EMPFÄNGER schreiben, nie über den Absender
- Locker und authentisch, Ton wie eine kurze Nachricht an einen Bekannten
- Muss nahtlos in die feste Überleitung übergehen, ohne ein Problem zu benennen

**NIEMALS:**

- Kritik, Defizit, Mangel, „Lücke", „Hürde", „Problem", „leider", „schade"
- Konjunktiv-Wunsch: „wäre (doch) schön/besser/sinnvoll, wenn ..."
- „noch nicht", „fehlt", „begrenzt", „veraltet", „ausbaufähig", „verschenkt Potenzial", auditartige Formulierungen
- Bevormundende Verbesserungsvorschläge oder Ratschläge
- Selbstvorstellung oder Pitch („Wir sind ...", „Mein Name ist ...", „Wir helfen ...")
- Floskeln („Ich bin auf Ihre Webseite gestoßen", „Tolle Webseite")
- Erfundene Fakten, Personen, Rollen oder Zahlen
- Sichtbare Platzhalter wie [Branche] oder [Name] oder M-Striche (—)

Warum kein Kritik-Opener: Wer mit einem Mangel einsteigt, macht den Empfänger klein und muss ihn danach überzeugen. Wer mit Lob einsteigt, hat ihn auf seiner Seite und muss nur noch das Offer nennen.

## Prompt-Vorlage: Standard-Opener (funktioniert für 80 % der Fälle)

Diese Vorlage geht als Prompt der AI-Variable `intro` in die Kampagne (`aiVariables`). Die Lead-Daten (Firma, Website, Stadt, Recherche, Custom-Attribute) bekommt das Modell beim Generieren automatisch dazu; sie müssen nicht als Platzhalter im Prompt stehen. Die Klammern füllst du beim Anlegen aus den Angaben des Nutzers.

```
Du schreibst einen individuellen Eröffnungssatz für eine Cold-E-Mail.
Der Absender ist [FIRMENNAME], [KURZBESCHREIBUNG DER DIENSTLEISTUNG].
Dein Text steht direkt unter der Anrede "Hallo ...," und wird mit einem
festen Satz fortgesetzt, der mit "[FESTER FOLGESATZ, z. B. Deswegen war
ich so frei ...]" beginnt.

Aufgabe:
Schreibe 1-2 Sätze die zeigen: "Ich habe mir euer Unternehmen angeschaut."
Der Opener muss natürlich in das Marketing Offer überleiten.

Angle-Hierarchie (in dieser Reihenfolge probieren):

Angle 1 - Kundenbewertungen (BESTER ANGLE):
Wenn Bewertungen vorhanden (Google Reviews, Trusted Shops, Shop-Bewertungen),
nutze eine konkrete Bewertung als Einstieg.
Beispiel: "ich hab mir eure Bewertungen angeschaut und einer eurer Kunden
schreibt [PARAPHRASE]. [Was das konkret über den Betrieb sagt]."

Angle 2 - Website-Beobachtung:
Wenn keine Reviews, nutze eine konkrete Beobachtung (Feature, Spezialisierung).
Beispiel: "ich war gerade auf eurer Website und fand eure Spezialisierung
auf [KONKRETES] richtig spannend."

Angle 3 - Stellenanzeige/Wachstum:
Wenn offene Stellen, ein neuer Standort oder ein wachsendes Team belegt sind,
nutze das.
Beispiel: "ich hab gesehen, dass ihr gerade [POSITION] sucht."

Angle 4 - Branchen-/Regional-Bezug:
Wenn Website wenig hergibt, nutze Branche oder Region.
Beispiel: "ich sehe, dass ihr in [REGION] im Bereich [BRANCHE] unterwegs seid."

REGELN:
- Deutsch mit korrekten Umlauten (ä, ö, ü, ß)
- KEINE M-Striche und keine Gedankenstriche als Trenner, auch kein
  Bindestrich mit Leerzeichen; Bindestriche nur innerhalb von Wörtern
- Max. 2 Sätze
- Locker und authentisch, NICHT werblich
- Beginne mit Kleinbuchstabe (wird nach "Hallo ...," eingefügt); nur der
  erste Buchstabe ist klein, jeder weitere Satz beginnt groß
- Beziehe dich auf etwas Konkretes, das man nur sehen kann wenn man
  wirklich auf der Website war
- Ausschließlich positiv: kein Mangel, keine Kritik, kein Verbesserungsvorschlag
- Verboten: "Lücke", "Hürde", "Problem", "leider", "schade", "noch nicht",
  "fehlt", "begrenzt", "veraltet", "ausbaufähig", "verschenkt Potenzial",
  Konjunktiv-Wünsche ("wäre schön, wenn ..."), Ratschläge, Selbstvorstellung
  ("Wir sind", "Mein Name ist", "Wir helfen"), Floskeln ("Ich bin auf eure
  Webseite gestoßen", "Tolle Webseite"), sichtbare Platzhalter in Klammern
- Keine Frage, kein Link, keine erfundene Zahl, kein erfundener Name
- Wenn du KEIN belastbares Detail findest: gib den Fallback-Satz zurück,
  erfinde nichts und schreibe keine Floskel

FALLBACK (wenn keine konkrete Beobachtung möglich):
"als [BRANCHE]-Unternehmen in [REGION] seid ihr genau die Art Firma,
die wir suchen"
```

Die Pronomen der Vorlage (euch/eure/ihr) an die `salutation` der Kampagne anpassen. Ein vollständig ausformulierter `intro`-Prompt steht in `beispiel-blueprint.md`.

## Ein schwacher Opener ist schlechter als der Fallback

Der wichtigste Punkt beim Prüfen: Ein generischer Opener („eure Website macht einen professionellen Eindruck") schadet mehr als ein ehrlicher Branchen-Fallback. Er verbrennt die einzige Stelle, an der die Mail persönlich wirken könnte, und der Empfänger merkt sofort, dass da eine Maschine geraten hat.

Deshalb gilt: **Lieber Fallback als Floskel.** Der Prompt muss das ausdrücklich erlauben, sonst erfindet das Modell etwas.

## Prüftabelle für die Stichprobe

Vor dem Export immer mindestens 10 Leads im Review (`outreach-verify`, `get_lead_variables`) von Hand lesen. Verwerfen (`reject_lead_variables`) und neu generieren, wenn einer dieser Punkte zutrifft:

| Prüfung | Verwerfen wenn |
|:--------|:---------------|
| Länge | Mehr als 2 Sätze |
| Groß-/Kleinschreibung | Beginnt mit Großbuchstaben (passt dann nicht hinter die Anrede) |
| Tonalität | Enthält Kritik, Mangel, Konjunktiv-Wunsch oder einen Ratschlag |
| Konkretheit | Würde genauso auf 100 andere Firmen passen |
| Wahrheit | Enthält Zahl, Name oder Fakt, der nicht aus dem Research kommt |
| Form | Enthält Fragezeichen, Ausrufezeichen, Link oder M-Strich |
| Platzhalter | Enthält sichtbares [Klammer-Feld] oder ein nicht aufgelöstes Merge-Tag |
| Übergang | Der feste Folgesatz („Genau deshalb ...", „Deswegen war ich so frei ...") schließt sich nicht flüssig an |
| Absender | Schreibt über uns statt über den Empfänger |

Wenn mehr als 2 von 10 Openern durchfallen, ist der Prompt das Problem, nicht der Lead. Dann Prompt nachschärfen (`export_campaign_blueprint` → `edit_campaign`, mit Zustimmung des Nutzers, weil das die erzeugten Werte löscht) und neu generieren.

## Wo der Opener steht - und wo nicht

Der personalisierte Opener steht ausschließlich in der Entry Mail. Follow-Ups nutzen nur die Anrede plus festen Text. Ein zweiter personalisierter Bezug in Mail 3 wirkt wie ein Skript, das sich wiederholt.

Damit der Opener überhaupt entstehen kann, braucht jeder Lead ein gefülltes Website-Feld - ohne Website hat die Recherche keine Grundlage und es bleibt zwangsläufig beim schwächsten Angle.

---

# TEIL 2: Die Entry Mail

## Die Goldene Formel

Jede Cold Mail besteht aus genau 3 Teilen nach der Ansprache. Kein Pitch, kein Proof, keine Firmenvorstellung.

```
ANSPRACHE  →  INDIVIDUELLER BEZUG  →  ÜBERLEITUNG + OFFER  →  CTA
(2-3 Wörter)   (1-2 Sätze)           (1-2 Sätze)             (1 Satz)
{{ai.hallo}}   {{ai.intro}}          fester Text             fester Text
```

Bei Karte A und C kommt zwischen Offer und CTA der Feinheiten-Satz (siehe unten).

| Baustein | Was er macht | Beispiel |
|:---------|:-------------|:---------|
| **Ansprache** | Tür aufmachen | „Hallo Max," |
| **Individueller Bezug** | Zeigen: ich hab mich mit euch beschäftigt | „ich war gerade auf eurem Shop und mir sind eure 347 Bewertungen aufgefallen. Einer hat sogar geschrieben, eure Lieferung sei schneller als bei Amazon." |
| **Überleitung + Offer** | Nahtloser Brücken-Satz zum Angebot. KEIN Pitch. | „Deswegen war ich so frei und habe ein kurzes Video mit drei konkreten Hebeln für euch aufgenommen." |
| **CTA** | EINE Handlung. Nicht zwei | „Wäre es in Ordnung, wenn ich es dir morgen zusende?" |

**Die Mail soll klingen wie eine WhatsApp von einem Freund, nicht wie eine Agentur-Website.**

## Was RAUS ist

**Proof-Block:** „Nach über 200 Kampagnen...", „Wir sind seit 10 Jahren...", „Als Google Premium Partner..." - das alles hat KEINEN Platz in der Entry Mail. Es schreckt Leute ab und wirkt wie ein Pitch.

**Wo Proof hingehört:**

- **FUP2** (Step 3, Mehrwert-Mail) - dort gehören Case Studies und Social Proof hin
- **Signatur** - kurz und dezent (siehe Signatur-Regeln unten)

**VERBOTEN im Body:**

- „Wir helfen [Zielgruppe] dabei, [Dienstleistung]..." - PITCH
- „Das machen wir seit X Jahren..." - PITCH
- „Als [Zertifizierung/Partner]..." - PITCH
- Jeder Satz der die eigene Firma beschreibt - PITCH

Authority (Jahre, Kunden, Zertifizierungen) gehört in die **Signatur**, nicht in den Body.

## Die universelle Überleitung

Der wichtigste Baustein. Die Überleitung ist der statische Satz NACH dem individuellen Bezug. Er verbindet den Bezug nahtlos mit dem Offer - ohne Pitch. Er ist für alle Leads gleich, deshalb muss er zu JEDEM möglichen Bezug passen.

**Anforderungen:**

- Muss sich an JEDEN möglichen individuellen Bezug anschließen
- Muss direkt zum Offer überleiten
- Benennt KEIN lead-spezifisches Problem
- KEIN „Wir sind...", „Wir machen...", „Seit X Jahren..."
- 1-2 Sätze, nicht mehr

### Überleitungs-Bausteine nach Offer-Typ

| Offer-Typ | Überleitung |
|:----------|:------------|
| **A: Kostenlose Teildienstleistung** | „Genau deshalb bieten wir aktuell für [Anzahl] Unternehmen in [Region] ein kostenloses [Deliverable] an." |
| **B: Tester/Pilotprojekt** | „Genau solche Unternehmen suchen wir gerade. Wir starten [Projekt] mit [Anzahl] Betrieben in [Region]." |
| **C: Konkretes Deliverable (Reziprozität)** | „Deswegen war ich so frei und habe [Deliverable] für euch erstellt." |
| **D: Förder-Hook** | „Wusstest du, dass der Staat aktuell bis zu [Prozent] der [Kosten] übernimmt?" |
| **E: Partner gesucht** | „Genau solche [Branche] suchen wir als Partner. Wir haben regelmäßig [Anfragen] die zu euch passen würden." |

Bei Karte A und C steht das Deliverable als bereits erledigte bzw. laufende Arbeit da, nie als Absicht („würde gerne erstellen").

### Warum das funktioniert

„Genau deshalb...", „Deswegen war ich so frei...", „Genau solche Unternehmen..." - diese Formulierungen schließen sich an JEDEN individuellen Bezug an, egal ob der über Bewertungen, die Website oder die Branche spricht. Sie leiten direkt zum Offer über, ohne einen Pitch-Block dazwischen.

## Value Stacking: der Feinheiten-Satz

Bei den Offer-Typen Teildienstleistung (A) und Reziprozität (C) folgt nach dem Marketing-Offer ein zweiter Satz, der den Wert stapelt, ohne ein zweites Offer zu werden: Die Arbeit ist schon (fast) erledigt, und es kommt noch etwas on top. Bei B ist er optional, bei D und E entfällt er.

Wortlaut: „Ich bin gerade noch an den letzten Feinheiten dran, vor allem […]."

„Deswegen war ich so frei und habe euch einen kompletten Webseitenentwurf inklusive Buchungssystem erstellt. Ich bin gerade noch an den letzten Feinheiten dran, vor allem der Optimierung für Google und KI-Suchmaschinen. Wäre es in Ordnung, wenn ich euch das morgen zusende?"

Die Regeln:

- **Erledigte Arbeit statt Absicht:** „war so frei und habe ... erstellt", nicht „würde gerne erstellen". Reziprozität wirkt erst, wenn das Geschenk schon existiert.
- **Genau EIN On-Top-Detail** („vor allem ..."), aus den Angaben des Nutzers, und es muss wirklich lieferbar sein. Nichts erfinden.
- **Kein zweiter CTA, kein zweites Offer.** Der Satz beschreibt dasselbe Deliverable, nur eine Schicht tiefer.
- **„unverbindlich" bleibt tabu** (Spam-Wort). Die Unverbindlichkeit steckt im Frage-CTA („Wäre es in Ordnung, wenn ...?"), nicht in einem Wort.

## Der CTA

Genau EIN CTA pro Mail. Nie zwei Optionen.

| Gut | Warum |
|:----|:------|
| „Antworte mir einfach kurz." | Niedrigste Hürde, die es gibt |
| „Darf ich es dir zusenden?" | Ja/Nein-Frage, eine Sekunde Aufwand |
| „Wäre es in Ordnung, wenn ich es dir morgen zusende?" | Reziprozität plus Ja/Nein |
| „Wäre das grundsätzlich interessant?" | Verpflichtet zu nichts |

Kein „Lass uns mal sprechen" ohne vorbereiteten Mehrwert. Kein Terminvorschlag in Mail 1. Kein Link in Mail 1 - der CTA ist die Antwort, nicht der Klick.

## Betreffzeilen

Die Betreffzeile entscheidet, ob die Mail geöffnet wird. 2-5 Wörter, keine Werbung. Personalisiert wird über `{{lead.company}}`, nie über `{{firstName}}` (gibt es nicht) oder ein Custom-Attribut, das leer sein kann.

### Was funktioniert

| Stil | Beispiele | Warum |
|:-----|:---------|:------|
| **Persönlich** | „Meeting {{lead.company}} & Julia" | Klingt nach echtem Termin |
| **Persönlich** | „Gespräch {{lead.company}} & Arne" | Impliziert bestehende Beziehung |
| **Neugier** | „Zugang freigeschaltet" | Was für ein Zugang? Muss ich aufmachen |
| **Neugier** | „kurze Frage" | Niedrige Hürde, macht neugierig |
| **Direkt** | „Anfrage für {{lead.company}}" | Business-like, ernst |
| **Förderung** | „Deine Förderung" | Geld = Aufmerksamkeit (nur Karte D) |
| **Partner** | „Partnerschaft {{lead.company}}?" | Augenhöhe (nur Karte E) |

### Was nicht funktioniert

| Beispiel | Problem |
|:---------|:--------|
| „Kostenlose Beratung für {{lead.company}}" | Zu lang, klingt nach Spam |
| „Exklusives Angebot - jetzt zugreifen!" | Spam-Trigger |
| „Re: Ihre Anfrage" | Fake-Reply, zerstört Vertrauen |

Zusätzlich: keine Großschreibung ganzer Wörter, keine Ausrufezeichen, keine Zahlen mit Prozentzeichen. Und niemals ein Spam-Wort im Betreff, auch wenn es im Body vorkommt - die vollständige Wortliste steht in Teil 4.

### Betreffzeilen für Follow-Ups

| FUP | Beispiele |
|:----|:---------|
| FUP1 | „Mail untergegangen?" |
| FUP2 | „kurzes Update" |
| FUP3 | „letzte Möglichkeit" |
| FUP4 | „alles Gute" |

## Signatur-Regeln

Die Signatur darf NICHT wie eine Vertriebler-Signatur aussehen. Minimalistisch - Name, Titel, Firma. Fertig. Sie steht als Klartext aus den Angaben des Nutzers im festen Text, nie als `{{sender.*}}`-Variable. Ohne bekannten Absendernamen nur die Grußformel.

**So:**

```
Viele Grüße
Angela Selbert
Geschäftsführerin - njoy online marketing GmbH
```

**Auch ok (wenn wirklich beeindruckend):**

```
Viele Grüße
Michael Rohrböck
Geschäftsführer - Tiles Media GmbH
M.Sc. Informatik, TU Wien
```

**NICHT so:**

```
Viele Grüße
Angela Selbert
Geschäftsführerin - njoy online marketing GmbH
Google Premium Partner | 2.200+ Seminarteilnehmer
Ausgezeichnet als Top SEO Agentur 2025
www.njoy-online-marketing.de | Tel: 0221 298 012 63
Folge uns auf LinkedIn | Twitter | Instagram
```

**Warum:** Eine aufgeblähte Signatur macht den gleichen Fehler wie ein Pitch-Block im Body - sie schreit „Ich will dir was verkaufen". Je mehr Zeilen, desto mehr wirkt es wie eine Agentur-Mail statt wie eine persönliche Nachricht.

## Vollständige Beispiele

**Karte A, kostenlose Teildienstleistung (68 Wörter):**

```
Betreff: Meeting {{lead.company}} & Julia

Hallo Max,

ich war gerade auf eurer Website und eure Spezialisierung auf
Industrie-Reinigung finde ich spannend, vor allem dass ihr auch
Smart-Home-Integration anbietet.

Genau deshalb bereiten wir aktuell für zwei Unternehmen in der Region
München ein kostenloses Google Ads Setup vor. Ich bin gerade noch an
den letzten Feinheiten dran, vor allem an den Suchbegriffen für euer
Gewerk. Wenn das für euch spannend klingt, antworte mir einfach kurz.

Viele Grüße
Julia Weinmann
Co-Founder - Weinmann Media
```

**Karte C, Reziprozität (77 Wörter):**

```
Betreff: kurze Frage

Hallo Max,

ich war gerade auf eurem Shop und mir sind eure 347 Kundenbewertungen
aufgefallen. Einer hat sogar geschrieben, dass eure Lieferung schneller
war als bei Amazon, das hat mich neugierig gemacht.

Deswegen war ich so frei und habe ein kurzes Video mit drei konkreten
Hebeln für euren Shop aufgenommen. Ich bin gerade noch an den letzten
Feinheiten dran, vor allem an den Beispielen aus eurem Sortiment. Wäre
es in Ordnung, wenn ich es dir morgen zusende?

Viele Grüße
Angela Selbert
Geschäftsführerin - njoy online marketing GmbH
```

**Karte E, Partner gesucht (58 Wörter):**

```
Betreff: Partnerschaft {{lead.company}}?

Hallo Max,

ihr baut nachhaltig in Holz und macht auch Sanierungen im Bestand,
also genau die Aufträge, bei denen viele Betriebe abwinken.

Genau solche Handwerksbetriebe suchen wir als Partner. Wir haben
regelmäßig Anfragen von Bauherren in der Region, die genau solche
Projekte umsetzen wollen und einen zuverlässigen Betrieb suchen.
Wäre das grundsätzlich interessant? Antworte mir einfach kurz.

Viele Grüße
Max Huber
Geschäftsführer - Huber Architekten
```

Alle drei liegen zwischen 58 und 77 Wörtern - mitten im Korridor, in dem die abgenommenen Kampagnen arbeiten (55 bis 86). Gezählt ist der Body ohne Betreff und Signatur, Anrede und Bezug eingerechnet.

---

# TEIL 3: Die Follow-Ups

Follow-Ups sind keine Wiederholungen. Jede hat eine eigene Aufgabe, ein eigenes Wortlimit und maximal EINEN neuen Aspekt. Die Sequenz ist kein Trichter aus immer dringlicheren Aufforderungen, sondern eine Reihe kurzer, menschlicher Nachrichten - jede mit genau einem neuen Gedanken.

**Die Wortzahlen sind Obergrenzen.** Kürzer ist bei Follow-Ups fast immer besser: Die Ultra-kurz-Variante von FUP1 hat 14 Wörter und funktioniert genau deshalb - sie sieht aus wie eine echte Nachricht zwischen zwei Terminen, nicht wie ein Textbaustein.

**Kein Doppelpunkt-Opener.** Ein Einstieg wie „kurz nachgehakt:", „kurzes Update:" oder „zur Erinnerung:" direkt nach der Anrede wirkt sofort wie Werbung. Jedes Follow-Up beginnt mit einem ganzen, weichen Satz in der Ansprache der Kampagne - so, wie man einem Bekannten schreibt.

In der Sequenz beginnt jedes Follow-Up mit `{{ai.hallo}}`; die Texte unten stehen aufgelöst mit „Hallo Max,". Kein `{{ai.intro}}` in Follow-Ups.

## FUP1: Reminder (Step 2, 30-50 Wörter, `delayDays` 3)

**Aufgabe:** Nur nachhaken. Kein neuer Pitch, kein Offer wiederholen.

| Variante | Text |
|:---------|:-----|
| **Locker** | „Hallo Max, wollte nur kurz nachhaken. Hast du meine Mail von letzter Woche gesehen? Vielleicht ist sie im Trubel untergegangen. Gib mir hier gerne kurz Bescheid." |
| **Ultra-kurz** | „Hallo Max, ist meine Mail von letzter Woche angekommen? Gib mir gerne kurz Bescheid." |
| **Weich** | „Hallo Max, du hast sicher viel um die Ohren. Ich wollte nur sichergehen, dass meine Mail von letzter Woche angekommen ist. Gib mir gerne kurz Bescheid." |

Das ist alles. FUP1 ist die kürzeste Mail der Sequenz und darf sich anfühlen wie eine Nachricht, die in 10 Sekunden getippt wurde. „Letzte Woche" nur schreiben, wenn der Abstand das hergibt; bei 3 Tagen „neulich" oder „vor ein paar Tagen".

## FUP2: Mehrwert + Social Proof (Step 3, 50-80 Wörter, `delayDays` 5)

**Aufgabe:** EIN neuer Aspekt. **HIER gehört der Social Proof hin - nicht in die Entry Mail.**

Das ist der Slot, den die meisten verschenken. In der Entry Mail wirkt Proof wie ein Pitch. Hier, nach zwei Kontakten ohne Verkaufsdruck, wirkt er wie ein Beleg.

| Variante | Text |
|:---------|:-----|
| **Case Study** | „Hallo Max, letzte Woche hatte ich einen Händler im Gespräch, der zwei Jahre lang gekämpft hat, seinen Amazon-Account wieder freizuschalten. Am Ende hat ihn eine falsche Handynummer endgültig rausgeworfen. Alles weg. Genau solche Geschichten zeigen, warum ein starker eigener Shop so wichtig ist. Falls das Thema für euch relevant ist, melde dich gerne." |
| **Konkretes Ergebnis** | „Hallo Max, wir haben gerade ein Pilotprojekt im [Branche]-Bereich abgeschlossen. Der Betrieb spart jetzt über 15 Stunden pro Woche, weil die komplette Auftragsabwicklung automatisiert läuft. Vorher war das ein Vollzeitjob, jetzt klickt der Inhaber morgens einmal drauf und der Rest läuft. Falls das auch für euch spannend klingt, melde dich gerne." |
| **Relevanter Fakt** | „Hallo Max, bei Unternehmen mit bis zu 49 Mitarbeitern liegt die Förderquote aktuell bei bis zu 100 % der Weiterbildungskosten plus Lohnkostenzuschuss. Das heißt konkret: Dein Team lernt neue Skills und der Staat zahlt den größten Teil. Falls das auch für euch relevant ist, melde dich gerne. Ich kann dir in zwei Minuten sagen, was für euch drin wäre." |

**Regel für die Case Study:** eine Geschichte, eine Zahl, ein Ergebnis. Keine Aufzählung von Kunden, keine Logo-Parade. Nur Belege, die der Nutzer angegeben hat.

**Regel für Zahlen:** immer als Spanne („bis zu"), nie als Zusage. Förderquoten und Ergebnisse hängen von Größe, Branche und Programm ab - eine pauschale Behauptung stimmt für einen Teil der Empfänger nicht und macht die ganze Mail unglaubwürdig.

## FUP3: Dringlichkeit (Step 4, 40-60 Wörter, `delayDays` 7)

**Aufgabe:** Zeitdruck erzeugen. Aber echt, nicht künstlich.

| Variante | Text |
|:---------|:-----|
| **Kapazität** | „Hallo Max, wir haben aktuell nur noch einen freien Platz für unser Pilotprojekt in [Region]. Wollte kurz abklären, ob das Thema für euch relevant ist, bevor der Platz weg ist. Gib mir einfach kurz Bescheid." |
| **Zeitfenster** | „Hallo Max, die Fördertöpfe werden jährlich neu vergeben und sind ab Q3 erfahrungsgemäß knapper. Falls ihr dieses Jahr noch profitieren wollt, solltet ihr zeitnah starten." |

Wenn die Dringlichkeit erfunden ist, merkt der Empfänger das - und dann ist auch die Entry Mail rückwirkend unglaubwürdig. Nur echte Kapazitäts- oder Zeitgrenzen nennen, die der Nutzer angegeben hat.

## FUP4: Break-Up (Step 5, 40-60 Wörter, `delayDays` 7)

**Aufgabe:** Tür offen lassen, ohne Druck. Menschlich bleiben.

| Variante | Text |
|:---------|:-----|
| **Verständnisvoll** | „Hallo Max, da ich bisher nichts gehört habe, gehe ich davon aus, dass es gerade nicht passt. Das ist absolut in Ordnung. Falls sich das irgendwann ändert, melde dich einfach. Alles Gute!" |

Kein Vorwurf, keine letzte Chance, keine Schuldzuweisung. Der Break-Up bringt erfahrungsgemäß mehr Antworten als FUP3 - genau weil er nichts will.

## Der CTA wird von Mail zu Mail weicher

| Mail | CTA-Charakter | Beispiel |
|:-----|:--------------|:---------|
| Entry | Erlaubnis erbitten | „Darf ich es dir zusenden?" |
| FUP1 | Nur anstoßen | „Ist meine Mail angekommen?" |
| FUP2 | Offen anbieten | „Falls das für euch relevant ist, melde dich gerne." |
| FUP3 | Kurz abklären | „Gib mir einfach kurz Bescheid." |
| FUP4 | Tür offen lassen | „Falls sich das ändert, melde dich einfach." |

Je später die Mail, desto niedriger die Hürde. Wer in FUP3 plötzlich einen Termin verlangt, dreht die Logik um.

## Der Fehler, der jede Sequenz killt

Das Offer steht NUR in der Entry Mail. Follow-Ups wiederholen es NICHT.

```
SCHLECHT (FUP1):
"Hallo Max, ich hatte dir letzte Woche geschrieben wegen unserem
kostenlosen Google Ads Setup wo wir dir 3 Kampagnen einrichten..."

GUT (FUP1):
"Hallo Max, wollte nur kurz nachhaken. Hast du meine Mail
von letzter Woche gesehen?"
```

Warum: Wer das Offer wiederholt, sagt dem Empfänger „du hast meine Mail nicht verstanden". Wer nur nachhakt, sagt „ich weiß, dass dein Tag voll ist". Das Zweite bekommt Antworten.

Weitere Regeln:

- Kein personalisierter Opener in den Follow-Ups. Der individuelle Bezug ist in Mail 1 passiert und wirkt in Mail 3 wie ein Skript.
- Jeder FUP hat max. EINEN neuen Aspekt. Nicht zwei, nicht drei.
- Follow-Ups laufen im selben Thread wie die Entry Mail, damit der Kontext sichtbar bleibt.

## Wenn Antworten kommen, aber keine Termine

Dann ist nicht die Sequenz das Problem. Dann wurde nicht nachtelefoniert - der Schritt, den Kunden am häufigsten überspringen und der die Terminquote am stärksten verändert.

---

# TEIL 4: Qualität, Verbote und Freigabe

Die meisten Cold Mails scheitern nicht an einem fehlenden Trick, sondern an einem zu viel: ein Satz über die eigene Firma, ein zweiter CTA, ein Link, zwanzig Wörter mehr. Prüfen heißt hier fast immer streichen.

Und: Prüfen ist kein Geschmacksurteil. Fast alles, was eine Mail killt, ist messbar - Wortzahl, Anzahl der CTAs, verbotene Formulierungen, Sonderzeichen. Wer nach Gefühl freigibt, gibt irgendwann alles frei.

## Die 12 Gebote

1. **Immer über den EMPFÄNGER schreiben, nie über den Absender.** „Du bekommst..." statt „Wir bieten..."
2. **KEIN Firmen-Pitch im Body.** Keine Selbstvorstellung, kein „Wir machen X seit Y Jahren". Die Mail soll klingen wie eine WhatsApp, nicht wie eine Agentur-Website
3. **Nahtlose Überleitung nach dem Opener.** Der nächste Satz MUSS an den Empfänger anschließen, KEIN Wechsel zum Absender
4. **Offer steht NUR in der Entry Mail.** Follow-Ups wiederholen es NICHT
5. **EIN CTA pro Mail.** Nie zwei Optionen
6. **Kein Bold im Fließtext.** Soll aussehen wie eine echte Mail
7. **Keine Bulletpoints** in der Mail selbst
8. **Keine Emojis**
9. **Keine Gedankenstriche als Trenner** - kein M-Strich (—) und auch kein Bindestrich mit Leerzeichen ( - ). Bindestriche nur innerhalb von Wörtern (E-Mail, Smart-Home); Ausnahme ist die Signaturzeile „Rolle - Firma"
10. **Wortlimits sind hart.** Wenn drüber: kürzen
11. **Betreffzeile ultra kurz** (2-5 Wörter, ohne Spam-Wort, persönlich über `{{lead.company}}` oder Neugier)
12. **Jeder FUP hat max. EINEN neuen Aspekt.** Nicht zwei, nicht drei

## Anti-Patterns: Was sofort killt

### Anti-Pattern 1: Der Pitch-Block nach dem Bezug

```
SCHLECHT:
"ich war gerade auf eurer Website und eure Spezialisierung
finde ich spannend.

Wir helfen E-Commerce Unternehmen dabei, ihre Umsätze
unabhängiger von Amazon aufzubauen - vor allem über Google
Shopping. Das machen wir seit über 10 Jahren als Google
Premium Partner für Shops in ganz DACH.

Bei eurem Shop sehe ich da echtes Potenzial..."

WARUM SCHLECHT:
- Der zweite Absatz ist ein kompletter Firmen-Pitch
- "Wir helfen X dabei Y" = Agentur-Website
- "Seit 10 Jahren" + "Premium Partner" = niemand hat gefragt
- Der Leser schaltet ab bevor er zum Offer kommt
```

**So geht's besser:**

„ich war gerade auf eurer Website und eure Spezialisierung finde ich spannend. Deswegen war ich so frei und habe ein kurzes Video mit drei konkreten Hebeln zu eurem Online-Auftritt aufgenommen. Ich bin gerade noch an den letzten Feinheiten dran, vor allem an den Beispielen für eure Startseite. Wäre es in Ordnung, wenn ich es dir morgen zusende?"

Kein Pitch. Vom Bezug direkt zum Offer. Fertig.

### Anti-Pattern 2: Die Über-uns-Mail

```
SCHLECHT:
"Guten Tag, wir sind ein führender Anbieter im Bereich
Marketing und möchten Ihnen unsere Dienste vorstellen..."

WARUM SCHLECHT:
Schreibt über sich selbst, kein Bezug, kein Offer.
```

### Anti-Pattern 3: „Analyse" als Offer

„Analyse ist der kleine Freund von Sales Call und jeder checkt, dass das ein Verkaufs-Call ist."

Nie: „Kostenlose Website-Analyse", „Unverbindliches Audit", „Potenzial-Check", „Erstgespräch", „Beratung", „Strategiegespräch"

Stattdessen ein konkretes Deliverable: „Kostenloses Google Ads Setup", „Ein kurzes Video mit 3 Hebeln"

### Anti-Pattern 4: Offer in Follow-Ups wiederholen

Der Reminder darf nur nachhaken, nicht das Angebot erklären. Wer es wiederholt, sagt dem Empfänger „du hast meine Mail nicht verstanden". Die Vorher-Nachher-Beispiele stehen in Teil 3.

### Anti-Pattern 5: Zwei CTAs

```
SCHLECHT:
"Antworte mir kurz oder buche dir hier einen Termin: [Link]"

GUT:
"Antworte mir einfach kurz."
```

### Anti-Pattern 6: KI-Sprache

| KI-Signal | Besser |
|:----------|:-------|
| „In der heutigen schnelllebigen Geschäftswelt..." | Weglassen |
| M-Striche überall | Satz teilen oder Komma; Bindestriche nur innerhalb von Wörtern |
| „Lass mich wissen, wenn du Interesse hast" | „Antworte mir kurz" |
| Perfekte Grammatik in lockerem Kontext | Schreib wie du sprichst |
| „Gerne möchte ich Ihnen aufzeigen..." | „Ich zeig dir kurz..." |

Weitere Formulierungen, die eine Mail sofort nach Maschine klingen lassen:

| Verdächtig | Besser |
|:-----------|:-------|
| „Ich hoffe, diese Nachricht erreicht Sie gut" | Weglassen, direkt zum Bezug |
| „Ich wollte mich einmal bei Ihnen melden" | Weglassen |
| „Darüber hinaus", „Nicht zuletzt", „Zusammenfassend" | In einer 100-Wort-Mail hat nichts davon Platz |
| „Es ist wichtig zu verstehen, dass..." | Den Punkt einfach sagen |
| „Wir sind bestrebt", „Synergien", „ganzheitlich", „nachhaltig skalieren" | Konkret sagen, was passiert |
| „Ich freue mich auf Ihre Rückmeldung" | „Antworte mir einfach kurz" |
| Drei Adjektive in einer Reihe | Eines reicht, meistens keines |

## Formale Anforderungen

Diese Punkte haben nichts mit Geschmack zu tun - sie entscheiden, ob die Mail im Postfach oder im Spam landet.

| Regel | Warum |
|:------|:------|
| **Plain Text, kein HTML-Layout** | Aufwendig gestaltete Mails sehen für Spam-Filter aus wie Newsletter |
| **Kein Link in der Entry Mail** | Der CTA ist die Antwort, nicht der Klick. Ein Link im Erstkontakt ist zusätzlich ein Automations-Signal |
| **Max. 1 Link ab FUP2 (Step 3)** | Und nur zu Kalender oder Website |
| **Keine Anhänge** | Sofort verdächtig. Erst nach Reply senden |
| **Keine Bilder, keine Logos im Body** | Gleicher Effekt wie HTML-Layout |
| **Keine Großschreibung ganzer Wörter** | Klassisches Spam-Merkmal, besonders im Betreff |
| **Abmeldehinweis am Ende** | Eine schlichte Zeile, kein bunter Button. Wer keinen Abmeldeweg findet, klickt stattdessen auf Spam - und die Beschwerdequote ist der Wert, an dem die Zustellung hängt |

Open- und Link-Tracking sind Standard und ausdrücklich erlaubt - die KPI-Steuerung und das Nachtelefonieren nach Öffnern hängen daran. Eingerichtet wird beides im Versandtool, nicht in der Kampagne.

## Spam-Trigger im Deutschen

Diese Wörter erhöhen die Spam-Wahrscheinlichkeit messbar. Im **Betreff sind sie komplett verboten**, im Body werden sie vermieden:

„gratis", „100 %", „garantiert", „Garantie", „jetzt zugreifen", „jetzt handeln", „begrenztes Angebot", „nur heute", „exklusives Angebot", „hier klicken", „Rabatt", „Sonderpreis", „Gewinner", „Sie haben gewonnen", „dringend", „risikofrei", „ohne Risiko", „Geld verdienen", „unverbindlich"

## Wenn die abgenommene Copy und das Zustellrisiko kollidieren

Der Copywriting-Baukasten ist an echten Kampagnen erprobt und gilt. An drei Stellen empfiehlt er trotzdem etwas, das aus Zustellsicht ein Risiko trägt. Hier stehen die Entscheidungen dazu - die Copy-Regeln oben bleiben unangetastet.

### „kostenlos" im Offer

Der Baukasten baut mehrere Offer-Typen darauf auf („Kostenloses Google Ads Setup"), und das bleibt so - ein konkretes Deliverable trägt das Wort.

- **Im Betreff: nie.** Auch nicht als „kostenfrei" oder „gratis"
- **Im Body: höchstens einmal**, und nur direkt am konkreten Deliverable, nie als Eigenschaft der Zusammenarbeit („ein kostenloses Erstgespräch")
- **Nie in Kombination** mit einem zweiten Trigger („jetzt kostenlos zugreifen")

Ein vages Angebot wird von dem Wort nur verdächtig, ein konkretes nicht.

### „100 %" im Förder-Follow-Up

Das Förder-Beispiel im Follow-Up nennt „100 % der Weiterbildungskosten". Zwei Anpassungen beim Einsatz:

- **Als Spanne formulieren:** „bis zu 100 %" statt „100 %". Förderquoten hängen von Größe, Branche und Programm ab - eine pauschale Zusage stimmt für einen Teil der Empfänger nicht
- Die Zahl darf im Body stehen, weil sie hier eine Sachinformation ist und kein Werbeversprechen. Im **Betreff** hat sie nichts zu suchen

### „Zugang freigeschaltet"

Steht in der Betreffzeilen-Bibliothek und funktioniert - sie macht neugierig. Aber sie verspricht einen Zugang, den es beim Öffnen nicht gibt, und enttäuschte Neugier ist der kürzeste Weg zu einer Spam-Beschwerde.

- **Nur verwenden, wenn es den Zugang wirklich gibt** - etwa den Platz im Pilotprojekt aus Offer-Karte B
- Sonst eine der anderen Neugier-Betreffzeilen wählen („kurze Frage")

## Die Zahl, an der die Zustellung hängt

Neben Bounce und Reply gibt es einen dritten Wert, der über die Zustellbarkeit entscheidet: die **Spam-Beschwerdequote**. Sie muss unter **0,3 %** bleiben - das ist der Schwellenwert der großen Anbieter, kein Erfahrungswert.

Was die Quote treibt, ist fast immer Copy: irreführende Betreffzeilen, ein Offer, das die Mail nicht hält, kein erkennbarer Abmeldeweg, oder eine Zielgruppe, für die die Mail keinen Sinn ergibt. Deshalb ist sie hier und nicht nur in der Kampagnensteuerung ein Thema.

## Proof-Reading-Checkliste

Vor dem Anlegen bzw. vor dem Export jede Mail mit dieser Liste prüfen.

**Struktur:**

- [ ] Folgt der Goldenen Formel (Bezug - Überleitung + Offer - [Feinheiten-Satz bei A/C] - CTA)?
- [ ] Wortlimit eingehalten?
- [ ] Nur EIN CTA?
- [ ] KEIN Pitch-Block? (keine Firmenvorstellung, kein „Wir sind seit X Jahren...")
- [ ] Kein Bold, keine Bullets, keine Emojis?

**Inhalt:**

- [ ] Schreibe ich über den EMPFÄNGER oder über uns?
- [ ] Ist der individuelle Bezug wirklich individuell?
- [ ] Ist das Offer konkret genug? (Würde ICH antworten?)
- [ ] Kommt Social Proof erst im FUP2 (Step 3), NICHT in der Entry Mail?
- [ ] Klingt die Signatur schlank und nicht wie ein Pitch?

**Follow-Ups:**

- [ ] Wird das Offer in den FUPs NICHT wiederholt?
- [ ] Hat jeder FUP max. EINEN neuen Aspekt?
- [ ] Ist der Social Proof/Case Study im FUP2 (nicht vorher)?

**Formatierung:**

- [ ] Keine M-Striche und keine Gedankenstriche als Trenner?
- [ ] Betreffzeile 2-5 Wörter, ohne Spam-Wort, ohne `{{firstName}}`/`{{companyName}}`?
- [ ] Anrede über `{{ai.hallo}}`, Pronomen passend zur `salutation`?
- [ ] Klingt die Mail wie von einem Menschen, nicht wie ChatGPT?

**Zustellung:**

- [ ] Kein Link in der Entry Mail?
- [ ] Kein Spam-Wort im Betreff?
- [ ] „kostenlos" höchstens einmal im Body, nie im Betreff?
- [ ] Keine sichtbaren Platzhalter oder nicht aufgelösten Variablen?
- [ ] Abmeldehinweis vorhanden?

## Der Prüfdurchlauf in acht Schritten

Wenn du eine fertige Mail prüfst (oder eine gerade geschriebene selbst kontrollierst), geh in dieser Reihenfolge vor. Jeder Schritt hat genau eine Frage:

1. **Als Empfänger lesen.** Würdest du antworten? Wenn nein: warum nicht? Das ist der einzige Test, der zählt.
2. **Absender-Check.** Jeden Satz durchgehen: geht er über den Empfänger oder über uns? Jeder Satz über uns fliegt raus, außer der Signatur.
3. **Pitch-Scan.** Suche nach „wir helfen", „wir sind", „wir machen", „seit ... Jahren", „als ... Partner". Jeder Treffer ist ein Anti-Pattern 1.
4. **CTA zählen.** Mehr als eine Handlungsaufforderung? Streichen bis eine übrig ist.
5. **Wörter zählen.** Über dem Limit? Kürzen, nicht umformulieren.
6. **Zeichen-Scan.** Gedankenstriche (— oder Bindestrich mit Leerzeichen als Trenner), Emojis, Bold, Bullets, Links - Zeichen für Zeichen durchgehen, nicht überfliegen. Gedankenstriche sind das häufigste KI-Signal und rutschen am leichtesten durch.
7. **Spam-Scan.** Betreff und Body gegen die Trigger-Liste prüfen, „kostenlos" und „100 %" gegen die Regeln oben.
8. **Konkretheits-Check.** Würde diese Mail genauso an 100 andere Firmen passen? Dann ist der Opener zu schwach.

Bei jedem Fehler: korrigieren und den Durchlauf **von vorne** starten. Korrekturen erzeugen neue Fehler - besonders beim Kürzen.

## Das Wichtigste

Ohne Detail kein Beweis - eine echte Bewertung, ein echtes Feature, eine echte Stellenanzeige ist der Unterschied zwischen einer Mail, die persönlich wirkt, und einer, die es nur behauptet.

Schreib über den Empfänger, nie über den Absender. Vier kurze Mails mit je einem Gedanken schlagen zwei lange mit je fünf. Und beim Prüfen gilt: zwei Drittel sind Streichungen, ein Drittel ist Zeichen zählen. Nur der erste Schritt - „würde ich antworten?" - ist Ermessen, und der entscheidet am Ende trotzdem alles.
