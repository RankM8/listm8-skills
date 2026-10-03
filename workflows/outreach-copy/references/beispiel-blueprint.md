# Beispiel-Blueprint — vollständig ausformulierte Kampagne

> Referenz zu `outreach-copy`. Ein fiktiver Absender (Jonas Weber, Weber Webdesign) mit
> erfundenen Belegen; Namen und Zahlen stehen hier nur, weil sie in diesem Beispiel die
> „Angaben des Nutzers“ sind. In einer echten Kampagne kommt jede Zahl, jeder Name und jede
> Kapazitätsangabe vom Nutzer.

Schema v1, wie `create_campaign(blueprint=…)` es erwartet (geprüft gegen den
Blueprint-Validator von ListM8: `schemaVersion` 1, `campaign.name` 3-255 Zeichen, Config-Blöcke
als Objekte, `salutation` ∈ `du`/`sie`/`team`, Variablennamen `^[a-zA-Z][a-zA-Z0-9_]*$` und
eindeutig, Prompt ≥ 10 Zeichen, je Step nicht leerer `subject`, `delayDays` ganze Zahl ≥ 0,
`delayUnit` `days` oder `hours`, max. 25 Variablen und 25 Steps).

## Die Entscheidungen in diesem Beispiel

| Punkt | Wahl | Warum |
|---|---|---|
| Offer-Karte | C: Konkretes Deliverable (Reziprozität) | kleine Zielgruppe, hohe Reply Rate nötig |
| Marketing-Offer | fertiger Entwurf der neuen Startseite inklusive Online-Terminbuchungs-Flow | Deliverable, kein Gespräch; vom Nutzer lieferbar |
| Feinheiten-Satz | „Ich bin gerade noch an den letzten Feinheiten dran, vor allem daran, die Behandlungsseiten gleich für Google und KI-Suchmaschinen mitzudenken.“ | Pflicht bei Karte C, genau ein On-Top-Detail |
| Ansprache | `salutation: "du"`: „Hallo Vorname,“, Fallback „Hallo zusammen,“, durchgehend du/dir/dein | Du-Form, eine Person (Inhaberin/Inhaber) |
| Sequenz | 5 Steps, `delayDays` 0/3/5/7/7 | Standard; Step 3 trägt den Social Proof, Step 4 einen echten Kapazitätsgrund |
| Wörter (fester Text ohne Signatur) | 49 / 23 / 63 / 38 / 43 | Step 1 mit Anrede und Bezug (bis 2 Sätze) etwa 75-85, unter 120 |

## Blueprint

```json
{
  "schemaVersion": 1,
  "campaign": {
    "name": "Praxis-Relaunch: Startseiten-Entwurf für ästhetische Praxen",
    "intelligence": {
      "version": 1,
      "campaign_brief": {
        "business": {
          "value": "Weber Webdesign, Ein-Mann-Studio von Jonas Weber, baut Websites für ästhetische Praxen: Praxis-Relaunch in sechs Wochen nach einem eigenen Conversion-Framework mit Vorher-Nachher-Strecken, Behandlerprofilen, Social Proof und Online-Terminbuchung als einzigem Call-to-Action. Verkauft wird kein Webdesign, sondern planbare Beratungstermine über die Website.",
          "source": "answer",
          "status": "confirmed"
        },
        "target_audience": {
          "value": "Inhabergeführte ästhetische Praxen im DACH-Raum: Zahnärzte mit Ästhetik-Fokus, Beauty- und Ästhetik-Studios, dermatologische Privatpraxen mit 5 bis 25 Mitarbeitenden und einer Website, die älter als vier Jahre ist. Termine laufen fast nur übers Telefon, die Rezeption verliert Anfragen in der Sprechstunde. Klinikketten und Franchise-Gruppen sind ausgeschlossen.",
          "source": "answer",
          "status": "confirmed"
        },
        "usp": {
          "value": [
            "Fünf Jahre Healthcare-Agenturerfahrung und über 40 Projekte, darunter Zahnarztpraxen und Beauty-Studios",
            "Conversion-Framework statt Template: Vertrauensbeweise nach vorn, Online-Terminbuchung als einziger Call-to-Action",
            "Sicherheit bei DSGVO und Heilmittelwerbegesetz, DSGVO-sicheres Hosting",
            "Harte Zahlen als Beleg: verdreifachte Online-Terminanfragen bei Praxis Dr. Sommer in vier Monaten, 60 Prozent höhere Buchungsquote beim Beauty-Studio Glow",
            "Nachbesserungs-Versprechen: messbar mehr Beratungsanfragen innerhalb von 90 Tagen nach Go-Live, sonst kostenlose Nacharbeit"
          ],
          "source": "answer",
          "status": "confirmed"
        },
        "tone": {
          "value": "direct_personal",
          "source": "answer",
          "status": "confirmed"
        }
      },
      "offer_contract": {
        "title": {
          "value": "Fertiger Entwurf der neuen Startseite inklusive Online-Terminbuchungs-Flow",
          "source": "answer",
          "status": "confirmed"
        },
        "cta": {
          "value": "Wäre es in Ordnung, wenn ich dir das morgen zusende?",
          "source": "answer",
          "status": "confirmed"
        }
      }
    },
    "qualificationSettings": {
      "target_customer_profile": "Inhabergeführte ästhetische Praxis im DACH-Raum: Zahnarztpraxis mit Ästhetik-Fokus, Beauty- oder Ästhetik-Studio, dermatologische Privatpraxis. 5 bis 25 Mitarbeitende, ein oder zwei Standorte, Inhaber entscheidet selbst.",
      "offer_summary": "Praxis-Relaunch in sechs Wochen nach einem Conversion-Framework mit Online-Terminbuchung als einzigem Call-to-Action. Türöffner ist ein fertiger Entwurf der neuen Startseite inklusive Online-Terminbuchungs-Flow.",
      "fit_criteria": "Passt, wenn die Website sichtbar älter als vier Jahre ist, keine Online-Terminbuchung eingebunden ist und Termine über Telefon oder ein einfaches Kontaktformular laufen. Nachfrage ist da, sichtbar an Google-Bewertungen ab etwa 20 Rezensionen oder einem aktiven Instagram-Profil. Selbstzahler- oder Ästhetikleistungen werden angeboten.",
      "disqualifiers": "Klinikketten, Krankenhäuser, MVZ in Konzern- oder Investorenträgerschaft, Franchise-Gruppen und Praxisverbünde mit zentralem Marketing. Reine Kassenpraxen ohne Selbstzahlerleistungen. Praxen mit erkennbar neuer Website oder eingebundenem Buchungstool wie Doctolib mit sonst modernem Auftritt. Praxen, die eine Agentur als laufenden Betreuer im Impressum nennen. Einzelbehandler ohne Personal und Praxen mit über 25 Mitarbeitenden. Wettbewerber: Webdesign-Agenturen, Freelancer, Marketingagenturen, Praxis-Software-Anbieter. Firmen außerhalb Deutschland, Österreich, Schweiz.",
      "additional_prompt": "Ziel ist ein Beleg, dass die Praxis inhabergeführt ist und die Website älter als vier Jahre wirkt."
    },
    "researchAgentConfig": {
      "additionalPrompt": "Finde pro Praxis genau ein konkretes, positives und verifizierbares Detail, das ein Lob im Mail-Opener trägt. Prüfe in dieser Reihenfolge: 1) Google-Bewertungen (Anzahl, Schnitt, wiederkehrendes Lob in den Rezensionen, zum Beispiel Umgang mit Angstpatienten, Beratungsqualität, Freundlichkeit am Empfang), 2) Website: beworbene Spezialisierung, Behandlungsschwerpunkt, besonders sauber erklärte Behandlung, Team- oder Praxisbesonderheit, 3) Stellenanzeigen oder Hinweise auf Wachstum, neuen Behandler, neuen Standort, 4) Branche und Region als Fallback. Erfasse zusätzlich: Vorname der Inhaberin oder des Inhabers, ob eine Online-Terminbuchung eingebunden ist, wie alt die Website wirkt, Stadt. Notiere nur, was du wirklich auf der Website, bei Google Maps oder in Verzeichnissen siehst. Keine Vermutungen, keine erfundenen Zahlen.",
      "researchDepth": "quick",
      "researchPriorities": "Bewertungen > Website-Feature/Spezialisierung > Stellenanzeige/Wachstum > Branche/Region"
    },
    "emailAgentConfig": {
      "emailLanguage": "Deutsch (DACH)",
      "emailTone": "Direkt, knapp und menschlich in Du-Form, wie eine kurz getippte Nachricht von einem Selbstständigen an einen Praxisinhaber: kurze Sätze, kein Beratersprech, kein Werbeton, echtes Lob statt Kritik, ein klarer CTA.",
      "salutation": "du"
    }
  },
  "aiVariables": [
    {
      "name": "hallo",
      "prompt": "Erzeuge ausschließlich die Begrüßungszeile einer Cold-Mail an eine inhabergeführte ästhetische Praxis (Zahnarztpraxis mit Ästhetik-Fokus, Beauty-Studio, dermatologische Privatpraxis) im DACH-Raum. Absender ist Jonas Weber, Webdesigner für Praxis-Websites. Die Kampagne spricht die Person in Du-Form an.\n\nAufgabe: Gib genau eine Zeile aus, nichts weiter. Kein zweiter Satz, keine Einleitung, keine Erklärung.\n\nRegeln:\n- Wenn aus dem Research (Inhaberin, Inhaber oder Entscheider) oder aus einem Custom-Attribut mit dem Vornamen ein Vorname klar hervorgeht, schreibe \"Hallo <Vorname>,\".\n- Wenn kein Vorname belegt ist, schreibe \"Hallo zusammen,\".\n- Niemals \"Hallo Herr <Nachname>,\" oder \"Hallo Frau <Nachname>,\", keine Titel wie \"Dr.\": Die Mail ist in Du-Form geschrieben.\n- Die Zeile endet immer mit einem Komma.\n- Keine erfundenen Namen, keine Rollen erfinden, keine Platzhalter in eckigen oder geschweiften Klammern, keine Gedankenstriche, keine Emojis.\n- Deutsche Rechtschreibung mit echten Umlauten und ß.",
      "sortOrder": 1
    },
    {
      "name": "intro",
      "prompt": "Du schreibst den Opener einer Cold-Mail. Absender ist Jonas Weber, selbstständiger Webdesigner, der Websites für inhabergeführte ästhetische Praxen baut (Zahnärzte mit Ästhetik-Fokus, Beauty-Studios, dermatologische Privatpraxen im DACH-Raum). Angeboten wird im weiteren Verlauf der Mail ein fertig vorbereiteter Entwurf einer neuen Startseite inklusive Online-Terminbuchung. Dein Text steht direkt unter der Anrede \"Hallo ...,\" und wird danach mit einem festen Satz fortgesetzt, der mit \"Deswegen war ich so frei ...\" beginnt.\n\nZiel: ein echtes, konkretes Lob oder eine anerkennende Beobachtung über diese Praxis, das nur jemand schreiben kann, der wirklich auf Website, Google-Profil oder Bewertungen war. Der Empfänger soll merken: hier hat sich jemand Mühe gemacht.\n\nAufgabe: Schreibe maximal 2 kurze Sätze. Beginne mit einem Kleinbuchstaben, weil dein Text direkt auf die Anrede mit Komma folgt; nur der erste Buchstabe ist klein, ein zweiter Satz beginnt groß. Schreibe ausschließlich über den Empfänger, nie über den Absender. Ton: locker, authentisch, Du-Form im Singular (du, dein, dir, nie ihr, euch, Sie), wie eine kurze Nachricht an einen Bekannten. Der letzte Satz muss so enden, dass ein Satz mit \"Deswegen war ich so frei ...\" nahtlos anschließt, ohne dass du ein Problem, eine Lücke oder einen Bedarf benannt hast.\n\nAngle-Reihenfolge, nimm den ersten Punkt, für den es einen belastbaren Fund gibt:\n1. Google-Bewertungen: Anzahl und Schnitt oder ein wiederkehrendes Lob aus den Rezensionen (zum Beispiel Umgang mit Angstpatienten, ruhige Beratung, Freundlichkeit am Empfang).\n2. Website-Feature oder Spezialisierung: ein Behandlungsschwerpunkt, eine besonders klar erklärte Leistung, eine Praxis-Besonderheit.\n3. Stellenanzeige oder Wachstum: neuer Behandler, zweiter Standort, Team wächst.\n4. Branche und Region als letzter Angle.\n\nStreng verboten:\n- Jede Form von Kritik, Defizit oder Verbesserungsvorschlag. Keine Wörter wie Problem, Lücke, Hürde, fehlt, veraltet, ausbaufähig, begrenzt, noch nicht, leider, schade, verschenkt Potenzial.\n- Konjunktiv-Wünsche wie \"wäre schön, wenn ...\" oder \"wäre sinnvoll, wenn ...\".\n- Auditartige Formulierungen, Ratschläge, Bevormundung.\n- Selbstvorstellung oder Pitch: kein \"Wir sind\", \"Mein Name ist\", \"Wir helfen\", \"Ich bin auf deine Webseite gestoßen\".\n- Floskeln wie \"tolle Webseite\", \"ich war beeindruckt von deinem Auftritt\".\n- Erfundene Fakten, Namen, Rollen oder Zahlen. Nenne Bewertungszahlen nur, wenn sie im Research belegt sind.\n- Sichtbare Platzhalter in Klammern, M-Striche, Gedankenstriche als Trenner, Emojis, Bold, Aufzählungen.\n- Mehr als 2 Sätze.\n\nFallback: Wenn kein belastbares Detail gefunden wurde, schreibe genau diesen Satz: \"eine inhabergeführte Praxis über Jahre so zu führen, dass die Patienten von selbst wiederkommen, sehe ich mit Respekt.\" Nutze diesen Fallback lieber, als eine Beobachtung zu erfinden oder eine generische Floskel zu schreiben.\n\nDeutsche Rechtschreibung mit echten Umlauten und ß.",
      "sortOrder": 2
    }
  ],
  "sequence": {
    "steps": [
      {
        "stepNumber": 1,
        "subject": "Anfrage für {{lead.company}}",
        "body": "{{ai.hallo}}\n\n{{ai.intro}}\n\nDeswegen war ich so frei und habe dir einen kompletten Entwurf für eine neue Startseite erstellt, inklusive eingebautem Online-Terminbuchungs-Flow.\n\nIch bin gerade noch an den letzten Feinheiten dran, vor allem daran, die Behandlungsseiten gleich für Google und KI-Suchmaschinen mitzudenken.\n\nWäre es in Ordnung, wenn ich dir das morgen zusende?\n\nViele Grüße\nJonas Weber\nInhaber - Weber Webdesign",
        "delayDays": 0,
        "delayUnit": "days"
      },
      {
        "stepNumber": 2,
        "subject": "Mail untergegangen?",
        "body": "{{ai.hallo}}\n\ndu hast sicher viel um die Ohren, ich wollte nur sichergehen, dass meine Mail bei dir angekommen ist.\n\nEin kurzes Ja reicht mir.\n\nViele Grüße\nJonas Weber\nInhaber - Weber Webdesign",
        "delayDays": 3,
        "delayUnit": "days"
      },
      {
        "stepNumber": 3,
        "subject": "kurzes Update",
        "body": "{{ai.hallo}}\n\nvielleicht macht es das greifbarer. Bei der Praxis Dr. Sommer in Stuttgart haben sich die Online-Terminanfragen nach dem Relaunch in vier Monaten verdreifacht. Der größte Hebel war, dass Terminwünsche nicht mehr nur mitten in der Sprechstunde am Telefon landen. Beim Beauty-Studio Glow in München stieg die Buchungsquote der Behandlungsseiten um 60 Prozent.\n\nWenn du magst, schicke ich dir die Case Study als PDF.\n\nViele Grüße\nJonas Weber\nInhaber - Weber Webdesign",
        "delayDays": 5,
        "delayUnit": "days"
      },
      {
        "stepNumber": 4,
        "subject": "kurze Frage",
        "body": "{{ai.hallo}}\n\nich nehme pro Monat zwei Praxis-Projekte an, mehr geht als Einzelkämpfer nicht. Für den nächsten Startplatz sortiere ich gerade und will dich nicht ins Leere anschreiben.\n\nPasst das Thema Website bei dir dieses Jahr noch, ja oder nein?\n\nViele Grüße\nJonas Weber\nInhaber - Weber Webdesign",
        "delayDays": 7,
        "delayUnit": "days"
      },
      {
        "stepNumber": 5,
        "subject": "alles Gute",
        "body": "{{ai.hallo}}\n\nich höre hier auf, dir zu schreiben, damit ich nicht nerve. Der Entwurf bleibt bei mir liegen, falls das Thema bei dir irgendwann wieder oben auf der Liste steht.\n\nMelde dich einfach, dann greife ich es wieder auf. Alles Gute für die Praxis.\n\nViele Grüße\nJonas Weber\nInhaber - Weber Webdesign",
        "delayDays": 7,
        "delayUnit": "days"
      }
    ]
  }
}
```

## Varianten der Ansprache

Wer statt der Person den Betrieb anspricht oder siezt, ändert drei Stellen gemeinsam:
`emailAgentConfig.salutation`, die Format-Regeln im `hallo`-Prompt und die Pronomen im festen
Sequenztext (inklusive `offer_contract.cta` und der Pronomen-Vorgabe im `intro`-Prompt).

| `salutation` | `hallo`-Regel im Prompt | fester Text, Beispiel Step 1 |
|---|---|---|
| `team` | „Hallo <Firmenname> Team,“ mit dem echten Praxisnamen; Fallback „Hallo zusammen,“ | „Deswegen war ich so frei und habe euch einen kompletten Entwurf … erstellt …“ / „Wäre es in Ordnung, wenn ich euch das morgen zusende?“ |
| `sie` | „Hallo Frau <Nachname>,“ / „Hallo Herr <Nachname>,“, Titel nur wenn belegt; Fallback „Guten Tag,“ | „Deswegen war ich so frei und habe Ihnen einen kompletten Entwurf … erstellt …“ / „Wäre es in Ordnung, wenn ich Ihnen das morgen zusende?“ |

Nie „Hallo Herr/Frau …“ zusammen mit Du-Text.

## Optional: Kurzname `firma`

Führt die Kampagne nach `outreach-campaign` den Kurznamen als AI-Variable `firma`, kommt sie
als dritte Variable dazu (Reihenfolge `hallo`, `firma`, `intro`, `sortOrder` 1-3), und der
Betreff von Step 1 lautet „Anfrage für {{ai.firma}}“ statt „Anfrage für {{lead.company}}“. Am
Copy-Regelwerk ändert das nichts.
