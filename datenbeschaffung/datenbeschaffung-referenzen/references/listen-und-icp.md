# Listen und ICP — von der Zielgruppe zur versandfähigen Liste

> Ergänzung zu `icp.md`. Dort stehen Kontrollfrage, ICP-Satz, Anti-ICP, Filter-Dimensionen und
> Trichter-Prinzip; hier steht, was die Liste darüber hinaus versandfähig macht: Grundhaltung,
> Quellen außerhalb der Weg-Skills, Qualitäts-Check, Datenqualität vor dem Import, Sperrliste und
> Volumenplanung. Die Ausführung (Dedup, Verifizierung, 20er-Stichprobe, Import) liegt in
> `listen-qualitaet`.

## Grundhaltung

Die Liste entscheidet über die Obergrenze der Kampagne, die Copy nur über die Ausschöpfung. Wenn du an Anwälte schreibst und dein Produkt ist für Marketingagenturen, hilft keine Optimierung an Betreff, Offer und Opener. Falsche Liste = tote Kampagne.

Deshalb steht der ICP-Filter vor dem Scraping, nicht danach. Und 3.000 saubere Kontakte in der richtigen Branche schlagen 20.000 gescrapte Zeilen ohne Prüfung - jedes Mal.

Hier geht es nicht um „wer ist meine Zielgruppe" - das ist Positionierungsarbeit. Hier geht es um den Schritt danach: aus einer definierten Zielgruppe eine filterbare, verifizierte, qualifizierte Liste machen.

**Ziel:** 3.000+ qualifizierte Kontakte. **Dauer:** 2-5 Stunden selbst. Läuft parallel zum Warmup der Postfächer (`outreach-launch`), damit keine Zeit verloren geht.

## Quellen außerhalb der Weg-Skills

Google Maps (Apify), B2B über Google, Apollo, Store Leads, Plattform-Verkäufer und Outscraper sind
als Weg-Skills abgedeckt (Auswahl: Master, Phase 2). Daneben gibt es Quellen, die der Kunde selbst
bedient:

| Quelle | Am besten für | Kosten |
|:-------|:-------------|:-------|
| **LinkedIn Sales Navigator** | B2B Dienstleister, Agenturen | ab 80 EUR/Monat |
| **myip.ms** | Shopify Shops (kostenlos) | Kostenlos |
| **Fiverr Dienstleister** | Wenn Kunde keine Zeit hat | 50-200 EUR pro Liste |
| **Branchenverzeichnisse** | Spezifische Nischen | Variiert |

Preise sind Richtwerte aus der Vorlage ohne Prüfdatum; vor Nutzung beim Anbieter prüfen. Das
Ergebnis geht wie jeder Scrape ins CSV-Format (`csv-spalten.md`) und durch `listen-qualitaet`.

**Quellenwahl nach Zielgruppe:** Lokale Betriebe und Handwerk über Google Maps, B2B-Dienstleister über Sales Navigator, Onlineshops über Store Leads oder myip.ms, gemischte Zielgruppen über Apollo. Wer für eine lokale Zielgruppe Sales Navigator nutzt, findet die Hälfte der Betriebe nicht - viele Handwerker haben kein Profil.

Apollo ist als Quelle in Europa DSGVO-verifiziert - bei Rückfragen ist „die Daten stammen aus Apollo" eine belastbare Antwort.

## Listen-Qualitäts-Check

- [ ] **Spalten vorhanden:** E-Mail, Firma, Website, Vorname, Nachname (optional: Branche, MA-Größe, Region); Format nach `csv-spalten.md`
- [ ] **E-Mails verifiziert:** Verifier-Schritt in `listen-qualitaet` oder in Instantly (Bounce Rate unter 3 % halten)
- [ ] **Sperrliste abgeglichen:** Bestandskunden, bereits kontaktierte Leads, Wettbewerber entfernt
- [ ] **ICP-Check:** Stichprobe von 20 Leads manuell prüfen - sind das wirklich potenzielle Kunden? (Schwelle: `listen-qualitaet`, Schritt 4)
- [ ] **Nur geschäftliche Adressen:** keine privaten Postfächer in der Liste

Die Stichprobe ist der wichtigste Punkt. 20 Leads durchklicken kostet 10 Minuten und verhindert, dass 3.000 Mails an die falsche Zielgruppe gehen.

## Datenqualität vor dem Import

| Prüfung | Warum |
|:--------|:------|
| Firmennamen normalisieren (GmbH, e. K., Zusätze entfernen; `companyClean` aus `build_csv.py`) | Sonst steht „Müller Bau GmbH & Co. KG" mitten im Satz. Die Copy nutzt standardmäßig `{{lead.company}}`; wo der Rohname bleibt, hilft der optionale Kurzname `firma` (`outreach-copy`) |
| Vornamen prüfen | Leere, abgekürzte oder vertauschte Vornamen brechen die Anrede (`{{ai.hallo}}` nutzt den Vornamen als Quelle). Leer lassen statt raten |
| Dubletten entfernen | Zwei Mails an dieselbe Firma aus zwei Postfächern wirken wie Spam |
| Rollen-Adressen bewusst behandeln | info@ und kontakt@ bouncen selten, landen aber oft bei niemandem |
| Website-Feld füllen | Ohne Website kann die AI-Personalisierung nichts recherchieren |

Das Website-Feld ist die Grundlage für den individuellen Bezug. Leads ohne Website bekommen zwangsläufig den schwächsten Opener-Angle - deshalb entweder nachrecherchieren oder aussortieren.

## Die zentrale Sperrliste

Jede Kampagne prüft beim Import gegen eine zentrale Sperrliste. Was dort hineingehört:

- Bestandskunden und ehemalige Kunden
- Wettbewerber
- Bereits kontaktierte Leads aus früheren Kampagnen
- **Jeder, der um Abmeldung gebeten hat**

Der letzte Punkt gilt dauerhaft und über alle Kampagnen und Postfächer hinweg, nicht nur für die laufende Aussendung. Wer nach einer Abmeldung weiter angeschrieben wird, klickt auf Spam - und die Beschwerdequote ist der Wert, an dem die Zustellung aller Domains hängt. Ein Lead aus der Kampagne zu nehmen reicht dafür nicht, er muss in die zentrale Liste.

In ListM8 ist das der globale Kontaktstatus: Abmeldungen als `do_not_contact`, bereits Angeschriebene als `contacted` (setzen mit `mark_leads_contacted`, aus Instantly per Kontaktstatus-Sync). Der Abgleich vor dem Scrape und vor dem Import (`export_leads(format="index")`, `check_leads_exist`, siehe `outreach-uebergabe.md`) berücksichtigt ihn. Bestandskunden und Wettbewerber, die nie als Lead in ListM8 standen, gehören als Domains in die Query-Ausschlüsse bzw. den Anti-ICP.

## Volumen richtig planen

Bei 300 Mails pro Tag und einer Sequenz mit Entry Mail plus Follow-Ups braucht eine Kampagne dauerhaft Nachschub. Die Liste für die nächste Runde entsteht während der laufenden Kampagne, nicht erst wenn die aktuelle leer ist - sonst entsteht eine Lücke in der Pipeline.

## Das Wichtigste

Filtere aus der Perspektive deines Kunden, nicht deines Produkts. Verifiziere jede Adresse. Prüfe 20 Leads von Hand, bevor 3.000 rausgehen. Und führe eine Sperrliste, die nichts vergisst.
