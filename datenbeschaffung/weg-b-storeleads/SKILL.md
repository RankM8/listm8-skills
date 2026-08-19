---
name: weg-b-storeleads
description: Weg B des Datenbeschaffungs-Pakets, consulting-only path — StoreLeads filter strategy for e-commerce target lists (technology, revenue and traffic filters, CSV export). This skill advises and processes the user's export; it never scrapes. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg B (StoreLeads) — Beratung statt Scrape

StoreLeads ist eine fertige Datenbank für Onlineshops (Shopify, WooCommerce, Shopware, Magento und
weitere) mit über 13 Millionen aktiven Stores. Was sie liefert, bekommt kein Scrape zusammen:
installierte Apps, eingesetzte Technologien, geschätzter Umsatz und Traffic, Plattform-Wechsel-
Historie, Social-Profile, Kontaktdaten.

**Dieser Skill scrapt nicht.** Er berät zur Filterstrategie, der Nutzer exportiert selbst, und
danach übernimmt der Skill den Export und bringt ihn in das Listenformat. Es entstehen keine
Apify-Kosten.

## Schritt 0 — Die Geldfrage zuerst, vor jeder Filterarbeit

Der Export als CSV ist **nur im Pro-Plan zu 250 $/Monat** enthalten. Der günstigere Plan (75 $)
erlaubt ausschließlich die Nutzung der Oberfläche — er ist ein Nachschlagewerk, für Leadlisten
wertlos. Deshalb:

- **Empfehlen nur, wenn E-Commerce die dauerhafte Zielgruppe des Kunden ist.** Ein einmaliges
  E-Com-Projekt rechtfertigt die 250 $ nicht — dann `weg-b-ecom-google` nehmen.
- Zwei Sparvarianten aus dem Kurs: (a) Abo einen Monat laufen lassen, alles exportieren, kündigen
  und alle drei bis vier Monate wiederholen; (b) jemanden mit eigenem Zugang beauftragen, rund
  50 $ je Liste — günstiger, aber unflexibel, weil das Nachschärfen der Filter jedes Mal über
  Dritte läuft.
- Die Entscheidung ausdrücklich bestätigen lassen. Erst danach beginnt die Filterarbeit.

## Schritt 1 — Pflichtfilter (ohne die ist jede Liste unbrauchbar)

| Filter | Einstellung | Warum |
|---|---|---|
| Status | **aktiv** | Passwortgeschützte Shops sind im Aufbau und geben ohnehin keine Kontaktdaten her |
| Plattform | im Pro-Plan zwei wählbare (meist Shopify + WooCommerce; Custom Cart möglich) | Vor der Buchung festlegen — der Slot ist begrenzt |
| Land | eine Region je Durchlauf | wie in allen Wegen |
| Geschätzter Monatsumsatz | **mindestens 50.000 $** | sortiert Hobby-Shops aus |

Größenkorridor je nach Angebot: 50.000–200.000 $ trifft kleinere, gut erreichbare Shops;
100.000–5 Mio. $ die etablierten Marken mit längerem Entscheidungsweg. Für den Erstkontakt ist der
kleinere Korridor meist der bessere.

## Schritt 2 — ICP in die Datenbank-Dimensionen übersetzen

Nach `_shared/references/icp.md`, hier mit den Feldern, die es nur in dieser Datenbank gibt:

| ICP-Dimension | Filter in StoreLeads |
|---|---|
| Branche | Kategorie und Unterkategorie (hunderte, z. B. Sporting Goods, Health/Nutrition/Supplements) |
| Größe | geschätzter Monatsumsatz, Traffic, Mitarbeiterzahl, Produktanzahl |
| Region | Land, Stadt |
| Trigger | installierte Apps, eingesetzte Technologien, Plattform-Wechsel-Historie, Review-Zahlen |
| Anti-ICP | Kategorien und Technologien ausschließen; Filter lassen sich mit „und"/„oder" verknüpfen |

## Schritt 3 — Die vier Anknüpfungspunkte, die diesen Weg rechtfertigen

1. **Plattform-Migration** — über „Last Platform Change" Shops finden, die kürzlich gewechselt sind
   (etwa Magento → Shopify). Sie haben offene Baustellen und oft keinen Dienstleister mehr.
2. **Competitor-Takedown** — nach der installierten Konkurrenztechnologie filtern und die eigene
   Lösung dagegenstellen.
3. **Review-Callout** — Shops mit einer Mindestzahl an Bewertungen filtern und die wiederkehrende
   Schwachstelle (Lieferzeit, Retouren) als Aufhänger nutzen.
4. **Tech-Use-Callout** — auf eine fehlende Technologie zielen, etwa Shops ohne TikTok-Ads in einer
   Kategorie, in der alle anderen sie schalten.

Diese Signale sind hier zunächst **Filter**. Ob sie in der Mail auch genannt werden, entscheidet
die Copy und nicht die Datenbeschaffung — `icp.md` warnt aus gutem Grund davor, Trigger unreflektiert
im Text auszubreiten.

## Schritt 4 — Export

Im Export-Dialog die Felder auswählen, die die Liste wirklich braucht: Domain, Kategorie, Stadt,
Land, E-Mail, Telefon, Mitarbeiterzahl, geschätzter Monatsumsatz, Plattform, installierte Apps,
Social-Profile. Vorher ein Sample ziehen und ansehen.

Ehrlich einordnen: Die gelieferten Adressen sind überwiegend Service- und Info-Adressen des Shops.
**Persönliche Entscheider-Adressen sind nicht dabei** — die kommen erst aus Schritt 6.

## Schritt 5 — Roh-CSV bauen

Den Export in das eine Format aus `csv-spalten.md` überführen: Zeilen als JSON mit den generischen
Schlüsseln (`email`, `company`, `website`/`domain`, `phone`, `city`, `kategorie`) ablegen, dann

```
python3 _shared/scripts/build_csv.py --in storeleads.json \
  --quelle "storeleads <datum>" --land <de|at|ch> --out leads-<nische>-<region>-<datum>.csv
```

Zusatzspalten behalten: `plattform`, `umsatz_geschaetzt`, `apps`, `instagram_url`, `linkedin_url` —
sie sind der Personalisierungs-Stoff dieses Wegs.

## Schritt 6 — Anreicherung

Rollen-Adressen sind erlaubt (Trichter-Prinzip), aber der Hebel liegt beim Entscheider:
`impressum-enrichment` über die Shop-Domains (DACH) für Geschäftsführername, Adresse und
Registerdaten. Für die Spitze der Liste danach optional `enrichment-waterfall`.

## Schritt 7 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme.

## Bekannte Fallen

- **Filterarbeit vor der Plan-Entscheidung.** Ohne Pro-Plan gibt es keinen Export; die schönste
  Trefferliste bleibt dann in der Oberfläche stehen.
- **Status-Filter vergessen** → Shops im Aufbau ohne Kontaktdaten in der Liste.
- **Umsatzuntergrenze vergessen** → Hobby-Shops ohne Budget.
- **Umsatz und Traffic sind Schätzwerte.** Sie taugen zum Sortieren und Filtern, nicht als
  Tatsachenbehauptung in der Mail.
- **Zwei Plattform-Slots** im Pro-Plan: vor der Buchung festlegen, welche zwei es sein sollen.
