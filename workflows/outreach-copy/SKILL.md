---
name: outreach-copy
description: 'Use when user says "Cold-Mail schreiben", "Cold-Mail prüfen", "Copy prüfen", "Kampagnen-Copy", "Sequenz schreiben", "Betreffzeile", "Opener", "Intro-Prompt", "hallo-Prompt", "Marketing-Offer formulieren", "Offer schärfen", "Feinheiten-Satz", "Follow-ups schreiben", or wants to write, review or fix the copy of an outreach campaign. Verbindliche Cold-Mail-Copy-Regeln (Anatomie der Entry-Mail, Offer-Karten A-E, Feinheiten-Satz, 5er-Sequenz, Wortlimits, Intro- und Anrede-Regeln, Verbote, Selbstprüfung). outreach-campaign, outreach-generate und outreach-verify laden diesen Skill verbindlich.'
---

# Outreach Copy — die Cold-Mail-Regeln für Kampagnen

Dieser Skill ist die eine Copy-Doktrin für alles, was über den Outreach-MCP an Text entsteht:
Sequenz (Betreff und Body jedes Steps), die Prompts der AI-Variablen `hallo` und `intro` und
die pro Lead erzeugten Werte. Er gilt verbindlich für:

| Skill | Wann diesen Skill laden |
|---|---|
| `outreach-campaign` | bevor eine Zeile Sequenz oder Variablen-Prompt entsteht (`create_campaign`, `edit_campaign`) |
| `outreach-generate` | bevor `hallo`/`intro` für einen Lead geschrieben werden (`save_lead_variables`) |
| `outreach-verify` | beim Prüfen der Werte (`get_lead_variables`) vor `approve_lead_variables`/`reject_lead_variables` |

Ausführliche Lehre mit allen Beispielen: `references/copy-lehre.md`. Offer-Lehre:
`references/marketing-offer.md`. Ein vollständig ausformulierter Blueprint:
`references/beispiel-blueprint.md`. Bei einem Widerspruch zwischen diesen Dateien gilt diese
SKILL.md.

## Ziel und Grundsatz

Aus den Angaben des Nutzers entsteht eine Cold-Mail-Kampagne für die erste Aussendung: eine
Entry-Mail, die wie eine persönliche Nachricht wirkt, und vier Follow-ups mit je einer Aufgabe.
Ziel ist eine Antwort, kein Klick und kein Termin in Mail 1.

- Nur verwenden, was der Nutzer im Gespräch angegeben hat (Angebot, Zielgruppe, Absender, Belege,
  Kapazitäten) oder was die Recherche pro Lead liefert. Keine Zahlen, Namen, Referenzen oder
  Fristen erfinden. Wo Angaben fehlen, allgemeiner formulieren oder beim Nutzer nachfragen.
- Der Marketing-Offer bestimmt 80 % der Reply Rate. Ohne konkretes Deliverable keine Copy:
  erst das Offer schärfen (siehe unten), dann schreiben.

## Tonalität und Formatierung

- Du-Form als Standard: direkt, konkret, kein Beratersprech, keine Floskeln. Deutsch.
  Sie-Form nur, wenn der Nutzer sie ausdrücklich will (siehe Anrede).
- Knapp und menschlich: kurze Sätze, ein klarer CTA pro Mail. Die Mail klingt wie eine kurze
  Nachricht an einen Bekannten, nicht wie eine Agentur-Website.
- Keine M-Striche (—) und keine Gedankenstriche als Trenner, auch kein Bindestrich mit
  Leerzeichen („ - “). Bindestriche nur innerhalb von Wörtern (E-Mail, Smart-Home); Ausnahme ist
  die Signaturzeile „<Rolle> - <Firma>“.
- Korrekte deutsche Rechtschreibung mit echten Umlauten und ß: „für“, „Grüße“, „über“, nie
  „fuer“, „Gruesse“, „ueber“. Das gilt für JEDES Feld: Sequenz, Variablen-Prompts,
  Kampagnenkonfiguration, Beispielwerte.
- Plain Text: kein Bold, keine Bulletpoints, keine Emojis, kein HTML-Layout, keine Bilder, keine
  Anhänge.

## Anrede und Ansprache

Die Ansprache steht in `campaign.emailAgentConfig.salutation` und gilt für jede generierte
Variable einer Mail. Immer explizit setzen. Der feste Sequenztext (Überleitung, CTA, Follow-ups)
muss dieselben Pronomen tragen wie der gewählte Modus.

| `salutation` | Pronomen im ganzen Text | `hallo` | Fallback |
|---|---|---|---|
| `du` (Du-Form, eine Person) | du/dich/dir/dein, nie ihr/euch | „Hallo Vorname,“ | „Hallo zusammen,“ |
| `team` (Du-Form, Betrieb) | ihr/euch/eure | „Hallo <Firma> Team,“ | „Hallo zusammen,“ |
| `sie` (nur auf ausdrücklichen Wunsch) | Sie/Ihnen/Ihre | „Hallo Frau Nachname,“ / „Hallo Herr Nachname,“ | „Guten Tag,“ |

- NIE „Hallo Herr/Frau Nachname,“ zusammen mit Du-Text, nie „Hey …“, nie Sie und du gemischt.
- Die Anrede kommt immer aus `{{ai.hallo}}`. Kein `{{firstName}}`, kein `{{companyName}}`, kein
  `{{custom.vorname}}` direkt in Betreff oder Body: Es gibt kein Vornamen-Feld, und ein leeres
  Attribut ergibt „Hallo ,“. Liegt der Vorname als Custom-Attribut aus dem Import vor (Schlüssel
  zeigt `get_lead_data` unter `customAttributes`), nennt der `hallo`-Prompt ihn als Quelle.
- Titel („Dr.“) nur in der Sie-Form und nur, wenn er belegt ist.

## Schritt 1: Offer-Typ wählen

Der Marketing-Offer ist nicht die Dienstleistung des Nutzers, sondern der Türöffner: das
konkrete, greifbare Ding, das den Erstkontakt trägt. Wähle GENAU EINE Karte und begründe die
Wahl dem Nutzer in einem Satz.

| Karte | Wann | Überleitung (statisch, für alle Leads gleich) |
|---|---|---|
| A: Kostenlose Teildienstleistung | Standard, funktioniert in 80 % der Fälle. Im Zweifel diese. | „Genau deshalb bieten wir aktuell für [Anzahl] Unternehmen in [Region] ein kostenloses [Deliverable] an.“ |
| B: Tester/Pilotprojekt | Neues Produkt, wenig Referenzen, Exklusivität als Narrativ | „Genau solche Unternehmen suchen wir gerade. Wir starten [Projekt] mit [Anzahl] Betrieben in [Region].“ |
| C: Konkretes Deliverable (Reziprozität) | Kleine Zielgruppe, hohe Reply Rate nötig. Höchste Reply Rate, mehr Aufwand pro Lead. | „Deswegen war ich so frei und habe [Deliverable] für euch erstellt.“ |
| D: Förder-Hook | Nutzer hat förderfähige Produkte | „Wusstest du, dass der Staat aktuell bis zu [Prozent] der [Kosten] übernimmt?“ |
| E: Partner gesucht | Nischen-Anbieter, Kooperation auf Augenhöhe | „Genau solche [Branche] suchen wir als Partner. Wir haben regelmäßig [Anfragen] die zu euch passen würden.“ |

Die Klammern füllst du beim Schreiben der Sequenz aus den Angaben des Nutzers; im fertigen Text
steht keine Klammer mehr. Pronomen (euch/dir/Ihnen) an die `salutation` anpassen.

Das Offer muss ALLE drei Punkte erfüllen, sonst umformulieren:

- **No-Brainer:** Würde ich selbst auf diese Mail antworten?
- **Kein Commitment:** Der Empfänger muss NICHTS tun außer antworten. Kein Call buchen, kein
  Formular, kein Download.
- **Konkret:** „Kostenloses Google Ads Setup“ statt „Kostenlose Beratung“.

Werttest: Das Offer spart erkennbar Zeit, spart Geld oder bringt Geld.

VERBOTEN als Offer (Sales Calls in Verkleidung): „Analyse“, „Audit“, „Potenzial-Check“,
„Erstgespräch“, „Beratung“, „Strategiegespräch“. Immer ein Deliverable statt eines Gesprächs.
Bei Karte D Quoten immer als Spanne („bis zu 100 %“), nie als Zusage.

## Der Marketing-Offer (Türöffner)

Das konkrete, vorbereitete Asset, das sich mit AI-Unterstützung realistisch vorbereiten lässt
(z. B. „ein kompletter Webseitenentwurf inklusive Buchungssystem“, „eine fertige
Werbekampagnen-Struktur“, „eine Lead-Liste inklusive Outreach-Sequenz“, „ein
30-Tage-Content-Plan“). Quellen in dieser Reihenfolge:

1. Das Marketing-Offer, das der Nutzer im Gespräch selbst benennt: 1:1 übernehmen, nur
   sprachlich glätten.
2. Sonst aus dem Angebot des Nutzers abgeleitet (seine Leistungen und Kanäle aus dem Gespräch).
3. Sonst einen Vorschlag nach Karte A machen und vom Nutzer bestätigen lassen.

Regeln:

- In Mail 1 steht GENAU EIN Marketing-Offer mit GENAU EINEM CTA, der die Antwort auslöst.
- Bei Karte A und C als bereits erledigte Arbeit formulieren („war so frei und habe … erstellt“),
  nicht als Absicht. Reziprozität wirkt erst, wenn das Geschenk schon existiert.
- Kein „Lass uns mal sprechen“ ohne vorbereiteten Mehrwert.
- Die Überleitung verbindet das Lob mit dem Offer („Genau deshalb …“, „Deswegen war ich so
  frei …“).
- Das Offer steht NUR in Mail 1. Follow-ups wiederholen es nicht.

## Anatomie der Entry-Mail

```
{{ai.hallo}}                     1. Anrede
{{ai.intro}}                     2. Lob / positiver Bezug (Intro-Regeln)
Feste Überleitung + Offer        3. statisch, benennt KEIN lead-spezifisches Problem;
                                    bei A und C als erledigte Arbeit
Feinheiten-Satz                  4. Pflicht bei A und C, optional bei B, entfällt bei D und E
EIN Frage-CTA                    5. niedrige Hürde
Signatur im Klartext             6. Grußformel, Name, „Rolle - Firma“
```

**Feinheiten-Satz (Value Stacking), wörtlich:** „Ich bin gerade noch an den letzten Feinheiten
dran, vor allem […].“ In die Klammer kommt genau EIN konkretes On-Top-Detail aus den Angaben des
Nutzers, das wirklich lieferbar ist. Nichts erfinden. Er ist KEIN zweites Offer und KEIN zweiter
CTA. Nicht „Feinschliff“, nicht umformulieren.

**CTA:** Genau einer, nie zwei Optionen. Beispiele: „Wäre es in Ordnung, wenn ich dir das morgen
zusende?“, „Darf ich es dir zusenden?“, „Antworte mir einfach kurz.“, „Wäre das grundsätzlich
interessant?“. Kein Terminvorschlag und kein Link in Mail 1.

**Kein Pitch, keine Selbstvorstellung im Body.** Authority und Proof gehören in die Signatur bzw.
in Step 3. Über den Empfänger schreiben, nie über den Absender („Du bekommst …“, nicht „Wir
bieten …“).

Muster für Karte C, direkt nach dem Lob-Intro (Team-Form):
„Deswegen war ich so frei und habe euch einen kompletten Webseitenentwurf inklusive
Buchungssystem erstellt. Ich bin gerade noch an den letzten Feinheiten dran, vor allem der
Optimierung für Google und KI-Suchmaschinen. Wäre es in Ordnung, wenn ich euch das morgen
zusende?“

**Signatur:** Name, Rolle und Firma des ABSENDERS als Klartext aus den Angaben des Nutzers, z. B.
„Viele Grüße\nAngela Selbert\nGeschäftsführerin - njoy online marketing GmbH“. Nie
`{{sender.firstName}}`, `{{sender.company}}` o. Ä. (gibt es nicht). Ohne bekannten Absendernamen
nur „Viele Grüße“. Schlank: keine Auszeichnungen, Links, Telefonnummern oder Social-Leisten.

## Intro-Regeln (`{{ai.intro}}`)

Das Intro ist ein LOB bzw. ein konkreter, positiver Bezug auf den Lead. Es ist KEINE Kritik und
KEIN Verbesserungsvorschlag.

MUSS:

- Ausschließlich positiv: echtes Lob oder anerkennende Beobachtung, getragen vom konkreten Detail
  selbst. Verboten sind austauschbare Bewertungsfloskeln wie „das spricht für sich“, „das sieht man
  selten“, „finde ich stark“, „finde ich spannend“ – sie machen alle Opener gleich (ListM8-Regel,
  gilt zusätzlich zu den Akquise-Regeln).
- Konkreter, verifizierbarer Bezug, den man nur kennt, wenn man wirklich auf
  Website/Shop/Bewertungen war. Angle-Reihenfolge: 1) Kundenbewertungen 2) Website-Feature/
  Spezialisierung 3) Stellenanzeige/Wachstum 4) Branche/Region (Fallback).
- Maximal 2 Sätze.
- Beginnt mit Kleinbuchstaben (folgt direkt auf „Hallo …,“). Nur der erste Buchstabe ist klein,
  jeder weitere Satz beginnt groß.
- Über den EMPFÄNGER schreiben, nie über den Absender.
- Locker und authentisch, Ton wie eine kurze Nachricht an einen Bekannten.
- Geht nahtlos in den festen Folgesatz über, ohne ein Problem zu benennen.

NIEMALS:

- Kritik, Defizit, Mangel, „Lücke“, „Hürde“, „Problem“, „leider“, „schade“.
- Konjunktiv-Wunsch: „wäre (doch) schön/besser/sinnvoll, wenn …“.
- „noch nicht“, „fehlt“, „begrenzt“, „veraltet“, „ausbaufähig“, „verschenkt Potenzial“,
  auditartige Formulierungen.
- Bevormundende Verbesserungsvorschläge oder Ratschläge.
- Selbstvorstellung/Pitch („Wir sind …“, „Mein Name ist …“, „Wir helfen …“).
- Floskeln („Ich bin auf Ihre Webseite gestoßen“, „Tolle Webseite“).
- Erfundene Fakten, Personen, Rollen oder Zahlen.
- Sichtbare Platzhalter ([Branche], [Name]) oder M-Striche (—).

Lieber Fallback als Floskel: Ein generischer Opener („eure Website macht einen professionellen
Eindruck“) ist schlechter als der ehrliche Fallback-Satz.

Hinweis: Der ListM8-Server legt beim Generieren zusätzlich eigene Intro-Regeln in den Prompt
(u. a. Empfänger direkt ansprechen statt „Die Praxis hat …“, keine Zahlen aus Selbstangaben der
Website, den Befund selbst als Lob tragen statt mit einer Bewertungsfloskel abzuschließen). Sie
verschärfen die Regeln oben und gelten mit.

## Prompts der AI-Variablen `hallo` und `intro`

Pflicht sind genau diese zwei Variablen (`sortOrder` 1 und 2). Weitere sind optional (z. B.
`proof`, `research_hook`, oder `firma` als Kurzname, wie `outreach-campaign` ihn vorsieht).
Namen: nur `a-zA-Z0-9_`, mit Buchstaben beginnend, eindeutig. Jede Variable wird pro Lead EINMAL
erzeugt: `{{ai.intro}}` steht deshalb NUR in Step 1; Follow-ups nutzen `{{ai.hallo}}` plus festen
Text.

Jeder Prompt ist eigenständig (Server-Minimum 10 Zeichen, besser ausführlich): Bei der
Generierung sieht das Modell NUR diesen Prompt, die Lead-Daten, die Recherche und den
Kampagnenkontext, nicht diesen Skill. Er enthält Kontext (wer schreibt, was angeboten wird, für
wen), Ziel, Aufgabe, verbotene Formulierungen und Tonfall.

Der `hallo`-Prompt MUSS enthalten:

- dass NUR die Begrüßungszeile ausgegeben wird, kein weiterer Satz, endet mit Komma;
- das Format passend zur `salutation` (Tabelle oben) samt Fallback „Hallo zusammen,“ bzw.
  „Guten Tag,“;
- die Namensquelle (Entscheider/Inhaber aus der Recherche, ggf. Custom-Attribut mit dem
  Vornamen) und das Verbot, Namen, Titel oder Rollen zu erfinden;
- das Verbot von Platzhaltern in Klammern, Gedankenstrichen und Emojis; echte Umlaute.

Der `intro`-Prompt MUSS enthalten:

- Kontext: Absender, Angebot und den festen Folgesatz, an den das Intro anschließt (z. B.
  „Deswegen war ich so frei …“);
- die Angle-Reihenfolge (Bewertungen > Website-Feature > Stellenanzeige > Branche/Region);
- die Verbotsliste aus den Intro-Regeln;
- Form: max. 2 Sätze, erster Buchstabe klein, weitere Sätze groß, über den Empfänger,
  Pronomen gemäß `salutation`;
- einen ausformulierten FALLBACK-Satz für den Fall, dass kein belastbares Detail gefunden wird,
  plus die Anweisung, diesen Fallback zu nutzen statt eine Floskel zu erfinden.

Ein vollständig ausformuliertes Paar steht in `references/beispiel-blueprint.md`.

## Platzhalter in ListM8

Aufgelöst werden nur diese Platzhalter (abschließende Liste für Betreff und Body):

- `{{ai.hallo}}`, `{{ai.intro}}`, `{{ai.<name>}}` (die Variablen der Kampagne)
- `{{lead.company}}`, `{{lead.website}}`, `{{lead.city}}` (der Server löst zusätzlich
  `lead.email` und `lead.phoneNumber` auf; in Copy nicht verwenden)
- `{{custom.<schlüssel>}}` (Custom-Attribute aus dem Import; leer, wenn der Lead keinen Wert hat)

Alles andere (`{{firstName}}`, `{{companyName}}`, `{{sender.*}}`, If-Blöcke, Default-Syntax)
landet als Rohtext beim Empfänger. Ein nicht erzeugter AI-Wert erscheint als „[NOT GENERATED]“.
Firmenname des Empfängers: `{{lead.company}}` (bzw. `{{ai.firma}}`, wenn die Kampagne den
Kurznamen führt), nie `{{companyName}}`.

## Sequenz

Genau 5 Steps mit festen Rollen. `delayDays` ist die Wartezeit VOR dem Step (kumuliert Tag 0, 3,
8, 15, 22), eine ganze Zahl; `delayUnit` immer `"days"`. `subject` ist Pflicht, nicht leer.

| Step | Rolle | `delayDays` | Wörter max. | Inhalt |
|---|---|---|---|---|
| 1 | Entry Mail | 0 | 120 (Ziel 50-90) | `{{ai.hallo}}` + `{{ai.intro}}` + feste Überleitung mit Offer + Feinheiten-Satz (A/C) + EIN CTA + Signatur |
| 2 | Reminder | 3 | 50 | `{{ai.hallo}}` + nur nachhaken, weich wie eine schnell getippte Nachricht („du hast sicher viel um die Ohren, ich wollte nur sichergehen, dass meine Mail angekommen ist“). Kein Doppelpunkt-Opener, kein Offer, kein neuer Aspekt, kein `{{ai.intro}}` |
| 3 | Mehrwert + Social Proof | 5 | 80 | `{{ai.hallo}}` + EIN Beleg: eine Case Story, eine Zahl, ein Ergebnis. HIER steht der Social Proof. Kein Offer |
| 4 | Dringlichkeit | 7 | 60 | `{{ai.hallo}}` + echter Zeit- oder Kapazitätsgrund aus den Angaben des Nutzers. Nichts Erfundenes. Kein Offer |
| 5 | Break-Up | 7 | 60 | `{{ai.hallo}}` + Tür offen lassen, ohne Druck und ohne Vorwurf. Kein Offer |

- Gezählt wird der Body ohne Betreff und ohne Signatur, den Bezug aus `{{ai.intro}}` (bis zu
  2 Sätze) eingerechnet. Die Limits sind Obergrenzen: kürzer ist erlaubt und meist besser.
  Bewährte Entry-Mails liegen bei 55 bis 86 Wörtern. Nie auffüllen.
- Der CTA wird von Step zu Step weicher: Erlaubnis erbitten → nur anstoßen → offen anbieten →
  kurz abklären → Tür offen lassen.
- Jedes Follow-up hat max. EINEN neuen Aspekt und beginnt mit einem ganzen, weichen Satz in der
  gewählten Ansprache. Follow-ups laufen im selben Thread.
- Nur wenn der Nutzer ausdrücklich eine kürzere Sequenz will, entfällt Step 5. Nie einen der
  Steps 1 bis 4.
- Fehlt dem Nutzer ein echter Beleg für Step 3 oder ein echter Grund für Step 4: nachfragen,
  nicht erfinden.

## Betreffzeilen

2-5 Wörter, keine Werbung, kein Spam-Wort, keine Großschreibung ganzer Wörter, kein
Ausrufezeichen, kein Prozentzeichen.

Bewährte Muster (an den Offer-Typ anpassen):

- „Meeting {{lead.company}} & <Absender-Vorname>“ (persönlich, wirkt wie ein Termin)
- „kurze Frage“ (Neugier, niedrige Hürde)
- „Anfrage für {{lead.company}}“ (direkt, business-like)
- „Deine Förderung“ (nur bei Karte D)
- „Partnerschaft {{lead.company}}?“ (nur bei Karte E)

Follow-up-Betreffs: „Mail untergegangen?“, „kurzes Update“, „letzte Möglichkeit“, „alles Gute“.

NICHT: „Kostenlose Beratung für …“ (zu lang, Spam), „Exklusives Angebot - jetzt zugreifen!“
(Spam-Trigger), „Re: Ihre Anfrage“ (Fake-Reply).

## Harte Verbote (jede Verletzung ist ein Fehler)

Im Body jeder Mail:

- Kein Pitch: „Wir helfen [Zielgruppe] dabei …“, „Das machen wir seit X Jahren …“, „Als
  [Zertifizierung/Partner] …“, kein Satz, der die eigene Firma beschreibt.
- Kein zweiter CTA („Antworte mir oder buche hier …“).
- Kein Link in Mail 1. Ab Mail 3 maximal einer (nur Kalender oder Website).
- Kein Bold, keine Bulletpoints, keine Emojis, kein HTML-Layout.
- Keine M-Striche (—) und keine Gedankenstriche als Trenner (siehe Tonalität).
- Kein Doppelpunkt-Opener direkt nach der Anrede in Follow-ups („kurz nachgehakt:“, „kurzes
  Update:“, „zur Erinnerung:“).
- Keine sichtbaren Platzhalter ([Branche], [Name], `{{firstName}}`).
- Social Proof und Case Studies NUR in Step 3, nie in Step 1.

**Spam-Wörter** — im Betreff komplett verboten, im Body vermeiden: „gratis“, „100 %“,
„garantiert“, „Garantie“, „jetzt zugreifen“, „jetzt handeln“, „begrenztes Angebot“, „nur heute“,
„exklusives Angebot“, „hier klicken“, „Rabatt“, „Sonderpreis“, „Gewinner“, „Sie haben gewonnen“,
„dringend“, „risikofrei“, „ohne Risiko“, „Geld verdienen“.
„unverbindlich“ ist kein Spam-Wort (abweichend von akquise-ai) – trotzdem trägt die Frage-Form
des CTA die Unverbindlichkeit, das Wort ist also selten nötig.

**Verbotene Offer-Begriffe:** „kostenlose Analyse“, „kostenlose Beratung“, „kostenloses
Erstgespräch“, „unverbindliches Audit“, „Potenzial-Check“, „Strategiegespräch“ (und allgemein
„Analyse“, „Audit“, „Beratung“, „Erstgespräch“ als Offer).

**Sonderfall „kostenlos“:** im Betreff nie (auch nicht „kostenfrei“ oder „gratis“), im Body
höchstens einmal und nur direkt am konkreten Deliverable („ein kostenloses Google Ads Setup“),
nie als Eigenschaft der Zusammenarbeit („ein kostenloses Erstgespräch“), nie zusammen mit einem
zweiten Trigger.

## Selbstprüfung (vor dem Speichern, verbindlich)

Geh jede Mail einmal durch und korrigiere, bevor du `create_campaign`/`edit_campaign` aufrufst
oder Werte speicherst. Nach jeder Korrektur von vorne beginnen: Kürzungen erzeugen neue Fehler.

1. Wörter zählen: jeder Step im Limit? Wenn drüber: kürzen, nicht umformulieren.
2. Pitch-Scan: kommt „wir helfen“, „wir sind“, „wir machen“, „seit … Jahren“, „als … Partner“
   vor? Jeder Treffer fliegt raus.
3. CTA zählen: genau einer pro Mail?
4. Steht das Offer nur in Step 1?
5. Steht `{{ai.intro}}` nur in Step 1?
6. Steht der Social Proof in Step 3 und nicht früher?
7. Zeichen-Scan: M-Striche, Emojis, Bold, Bulletpoints, Links in Step 1?
8. Spam-Scan: Betreff und Body gegen die Wortliste. „kostenlos“ höchstens einmal im Body?
9. Platzhalter-Scan: kein [Klammer-Feld]? Jede `{{…}}`-Variable gegen die abschließende Liste
   prüfen. Signatur als Klartext, keine `{{sender.*}}`-Variablen?
10. Betreffzeilen: 2-5 Wörter, kein Spam-Wort, keine Großschreibung?
11. Enthält der `intro`-Prompt die Angle-Reihenfolge, die Verbote UND einen Fallback-Satz?
12. Passen `salutation`, `hallo`-Prompt und die Pronomen des festen Texts zusammen (kein
    „Hallo Herr/Frau …“ mit Du-Text, kein du/euch-Mix)?
13. Zeigst du dem Nutzer Beispielwerte für `hallo`/`intro`: fertiger Klartext ohne
    `{{…}}`-Platzhalter, Namen und Firmen erkennbar fiktiv, Angle-Reihenfolge und Verbote
    eingehalten?
14. Umlaut-Scan über ALLES (Sequenz, Prompts, Konfiguration): steht irgendwo „ae“, „oe“, „ue“
    oder „ss“ als Ersatz für ä, ö, ü, ß („fuer“, „Gruesse“, „groesser“, „heisst“)? Ersetzen.

## Prüfliste nach Code-Regeln

Diese Regeln lassen sich mechanisch prüfen. ListM8 prüft sie beim Anlegen nicht, also prüfst du
sie: vor dem Anlegen der Sequenz und beim Review der Werte abhaken. „Hart“ = Fehler, „weich“ =
Hinweis, der begründet werden muss.

| Regel | Prüfung | Stufe |
|---|---|---|
| Wortlimit | Step 1-5 max. 120/50/80/60/60 Wörter (Platzhalter zählen nicht mit, den Intro-Umfang einrechnen) | hart |
| Zielkorridor | Entry-Mail unter 50 Wörtern: trägt der Bezug? | weich |
| Kein Gedankenstrich | kein „—“ und kein „–“ im Text | hart |
| Kein Pitch | kein „wir helfen“, „wir sind ein/eine/der/die/seit“, „wir bieten“, „seit (über) N Jahren“, „als zertifizierter/offizieller/Google/Meta … Partner“, „mein Name ist“, „unser Unternehmen“ | hart |
| Kein Platzhalter | kein sichtbares `[Feld]` | hart |
| Bekannte Variablen | nur `{{ai.*}}`, `{{lead.company}}`, `{{lead.website}}`, `{{lead.city}}`, `{{custom.*}}` | hart |
| Kein Emoji | keine Emojis/Symbole | hart |
| Keine Formatierung | kein `**fett**`, keine Zeile, die mit „-“, „*“ oder „•“ beginnt | weich |
| „kostenlos“ | höchstens einmal pro Mail | weich |
| Betreff ohne Spam | kein Spam-Wort, kein „kostenlos“, „kostenlose“, „kostenloses“, „kostenfrei“ | hart |
| Betreff-Länge | max. 5 Wörter | weich |
| Betreff ohne Schreien | kein Wort mit 4+ Großbuchstaben, kein „!“ | weich |
| Ein CTA | kein „oder/alternativ … buchen/klicken/vereinbaren/reservieren/anrufen/Termin sichern“ neben der Antwort-Bitte | hart |
| Kein Link in Mail 1 | kein „http(s)://“, „www.“, „calendly.com“, „hier buchen“ in Step 1 | hart |
| Offer ist kein Gespräch | Step 1 enthält keinen verbotenen Offer-Begriff (außer verneint: „statt …“, „kein …“) | hart |
| Intro nur in Step 1 | `{{ai.intro}}` in keinem Step ab 2 | hart |
| Anrede überall | jeder Step enthält `{{ai.hallo}}` | weich |
| Umlaute | keine Transliteration (fuer, ueber, gruess, koennen, moechte, groess, persoenlich, moeglich, waere, haette …) in Sequenz, Prompts und Konfiguration | hart |

## Verwandt

- `references/copy-lehre.md` — Goldene Formel, Angle-Hierarchie, Überleitungsbausteine,
  Feinheiten-Satz, Beispiele A/C/E, Follow-ups mit Varianten, 12 Gebote, Anti-Patterns,
  Zustellregeln, Prüfdurchlauf.
- `references/marketing-offer.md` — Karten A-E im Detail, Werttest, Offer-Killer,
  Reziprozität, was kein Offer ist.
- `references/beispiel-blueprint.md` — vollständiger Blueprint (Karte C, Du-Form, 5 Steps,
  `hallo`- und `intro`-Prompt) zum Anlegen mit `create_campaign`.
