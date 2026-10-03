# ICP — vom Wunschkunden zum Filter

> Aus der Cold-Mailing-SOP (Listen und ICP). Die Liste entscheidet über die
> Obergrenze der Kampagne, die Copy nur über die Ausschöpfung. Falsche Liste = tote Kampagne.

## Die Kontrollfrage vor jedem Filter

**In welcher Branche ist mein KUNDE — nicht mein Produkt?**
Wer ein Cold-Mailing-Tool verkauft, filtert nicht auf „Software" (das sind Wettbewerber), sondern auf
Personalvermittler, IT-Dienstleister, Agenturen, Handwerksbetriebe. Wenn die Filter Firmen zurückgeben,
die dasselbe machen wie der Absender, wird falsch gefiltert.

## ICP-Satz + Anti-ICP (Pflicht vor jedem Scrape)

Der Master-Skill erhebt beides, bevor Geld ausgegeben wird:

- **ICP-Satz:** „[Rolle] in [Branche] mit [Größe] in [Region], erkennbar an [Trigger]."
  Beispiel: „Inhaber von SHK-Betrieben mit 1–50 Mitarbeitern in Köln und Umgebung, erkennbar an
  veralteter oder fehlender Website."
- **Anti-ICP:** Wer soll AUSDRÜCKLICH nicht in die Liste? (Wettbewerber, Ketten, Konzerne,
  Bestandskunden, bestimmte Teilbranchen.)

## Die Filter-Dimensionen

| Dimension | Was reingehört | Faustregel |
|---|---|---|
| Rolle | Entscheider mit Budget: Geschäftsführer, Inhaber, Vorstand, Leitung | Keine Sachbearbeiter, keine Fachrollen ohne Budget |
| Branche | Die Branche des KUNDEN, gestapelt mit konkreten Stichwörtern | Breite Branchenfilter allein streuen zu stark |
| Größe | 3–100 Mitarbeiter | Unter 3 fehlt Budget, über 500 gibt es feste Lieferanten |
| Region | Land, Bundesland, Stadt, Umkreis | Eine Region pro Durchlauf |
| Trigger | Offene Stellen, neue Führung, Standort-Eröffnung, Wachstum | **Filtern, nie in der Mail erwähnen** (Ausnahme: Recruiting-Offer) |
| Ausschlüsse | Wettbewerber, Bestandskunden, bereits Kontaktierte, Abmeldungen | Bestand-Abgleich vor dem Scrape mit `export_leads(format="index")` (`outreach-uebergabe.md`) |

### Trigger filtern, nicht erwähnen

Offene Stellen oder ein neuer Geschäftsführer sind starke Kaufsignale - sie zeigen Budget und
aktiven Handlungsdruck. Aber sie gehören in den Filter, nicht in den Mailtext. Wer schreibt „ich
habe gesehen, dass Sie gerade drei Stellen ausgeschrieben haben und vermutlich wachsen", klingt
beobachtet statt interessiert. Ausnahme: Bei ausdrücklichen Recruiting-Offers ist die
Stellenanzeige der natürliche Bezug.

Was die Liste über den ICP hinaus versandfähig macht (Quellen außerhalb der Weg-Skills,
Qualitäts-Check, Datenqualität vor dem Import, zentrale Sperrliste, Volumenplanung):
`listen-und-icp.md`.

## Trichter-Prinzip (wichtig für die Erwartung)

Die Liste muss NICHT perfekt sein. Jede Stufe filtert für die nächste: Der Scrape darf Beifang
enthalten, die Qualifizierung in der App arbeitet bewusst offen (im Zweifel qualifiziert, Research
klärt), erst Review und 20er-Sample sind streng. Investiert wird in gute Filter und gute Prompts —
nicht in stundenlanges Handpolieren der Rohliste. Einzige harte Grenze: `do_not_contact`-Leads
werden auf keiner Stufe angefasst.

## Wenn gar keine Zielgruppe klar ist

Die Grundregel: 10 idealtypische Wunschkunden aufschreiben und fragen: **„Wo treffe ich diese 10 am
wahrscheinlichsten?"** Die Antwort ist die Quelle (Maps? LinkedIn? Shops? Plattform?) — und damit
der Weg im Decision Tree.
