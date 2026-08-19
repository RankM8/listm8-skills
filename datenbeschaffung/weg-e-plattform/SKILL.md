---
name: weg-e-plattform
description: Weg E des Datenbeschaffungs-Pakets — sellers on Amazon, Etsy and eBay as leads (the merchant behind the listing, never the product). Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg E — Plattform-Verkäufer als Leads

Zielgruppe: Händler, die ihr Geschäft auf einem Marktplatz betreiben — Amazon-Seller,
Etsy-Manufakturen, gewerbliche eBay-Verkäufer. **Ergebnis dieses Wegs ist immer ein Verkäufer mit
Kontaktweg, nie eine Produktliste.** Eine Zeile ohne identifizierbaren Händler ist kein Lead.

Voraussetzungen vom Master: bestätigter ICP-Satz, Zugriffsweg steht (`_shared/references/zugriff.md`),
Vorab-Abgleich gelaufen (falls MCP verbunden).

**Belegstand:** Für diesen Weg gibt es keine Kurs-Lektion und keine belegten Ist-Kosten wie bei
Weg C. Grundlage ist die Actor-Recherche vom 19.08.2026 (Plattform-Verkäufer-Sektion in
`_shared/references/apify-actors.md`). Kosten daher aus dem Actor-Pricing kalkulieren, Deckel
setzen, die echten Zahlen im Piloten messen und in `kosten.md` nachtragen — keine Zahlen raten.

## Schritt 1 — Plattform wählen (eine je Lauf)

| Zielgruppe | Plattform | Was zu erwarten ist |
|---|---|---|
| Handelsmarken, Distributoren, Private-Label-Seller | Amazon | EU-Verkäufer sind über die Händlerangaben identifizierbar; DACH gut abgedeckt, Kontaktdaten teils ab Werk |
| Manufaktur, Handmade, Deko, Papeterie, kleine Marken | Etsy | Shops sind leicht zu finden, **Kontaktdaten nicht ab Werk** — zweistufig |
| Gewerbliche Händler mit Trader-Disclosure (EU/UK) | eBay | Bestes Kontaktschema auf dem Papier, kaum Marktevidenz → **Pilotkandidat** |

## Schritt 2 — Actor-Rollen (IDs ausschließlich aus `apify-actors.md`)

- **Amazon:** Primär ist eine Bulk-Abfrage über eine Verkäufer-Datenbank (Filter: Kategorie,
  Verkäuferland, Erfassungsdatum) mit Kontaktfeldern ab Werk. Das ist eine Datenbank, kein
  Live-Crawl je Lauf — deshalb das Erfassungsdatum als Frischefilter setzen. Fallback ist die
  Live-Discovery über Keyword, Kategorie oder Seller-URL; sie liest die deutschen Händlerangaben
  mit und ist für DACH der interessantere, aber jüngere Weg.
- **Etsy:** Zweistufig. Der Discovery-Actor findet Shops (Keyword, Standort, Verkäufe, Rating,
  Shopalter), liefert aber keine E-Mail. Erst qualifizieren, dann **nur die priorisierten
  Shop-URLs** in den Kontakt-Actor geben — nie die ganze Discovery-Menge anreichern.
- **eBay:** Der funktional beste Actor hat praktisch keine Nutzungshistorie. Er wird nur im
  Pilotmodus eingesetzt (Schritt 3), Fallbacks liefern Seller-URLs ohne Kontakte.

## Schritt 3 — Pilot (Pflicht; bei eBay doppelt)

Maximal ~50 Verkäufer, Deckel ≤ 0,50 $, Kosten vorher nennen. Ausgewertet wird:

- Anteil mit brauchbarem Kontaktweg (E-Mail oder eigene Shop-Website)
- Anteil im Zielland — Marktplätze mischen Länder gnadenlos
- Anteil echter Händler im Sinne des ICP (kein Wiederverkäufer-Rauschen, keine Dropshipper)
- Dubletten je Firma über mehrere Listings hinweg

**Ab ~70 % ICP-Fit skalieren**, darunter Kategorien/Keywords schärfen und den Piloten wiederholen.

**eBay-Sonderregel:** Vor dem ersten Kunden-Einsatz ein eigener Testlauf mit ~20 deutschen
gewerblichen Verkäufern. Geprüft werden: Sind die E-Mails verifiziert? Wird je Firma dedupliziert?
Kommen USt-Id/Handelsregister mit? Stimmt das Verkäuferland? Treffen die Keywords wirklich Händler?
Fällt der Actor durch, liefert der Fallback nur Seller-/Shop-URLs — die Kontakte holt dann
`impressum-enrichment` (DACH-Shops mit eigener Website) bzw. `kontaktseiten-fallback`. Das Ergebnis
des Pilotlaufs mit Datum in `apify-actors.md` nachtragen.

## Schritt 4 — Skalierung

Eine Plattform, ein Land, Kategorie für Kategorie. Bei Datenbank-Actors zusätzlich das
Erfassungsdatum eingrenzen, sonst wandern Karteileichen in die Liste. Deckel: kalkulierte Kosten
+ 50 %.

## Schritt 5 — Roh-CSV bauen

```
python3 _shared/scripts/build_csv.py --in seller.json \
  --quelle "apify:<actor-id> <datum>" --land <de|at|ch> --out leads-<nische>-<plattform>-<datum>.csv
```

Zusatzspalten mitführen, sie tragen später die Personalisierung: `plattform`, `seller_url`,
`vat_id`, `bewertung`, `verkaeufe`. `kategorie` bekommt die Plattform-Kategorie.
Deduplizierung: `build_csv.py` dedupliziert auf E-Mail; liefert der Actor eine Seller-ID oder einen
Firmennamen, zusätzlich darauf prüfen — derselbe Händler taucht über mehrere Listings auf.

## Schritt 6 — Die Kontakt-Lücke

Etsy und die eBay-Fallbacks liefern oft nur Shop-URLs. Dann `impressum-enrichment` (deutsche Shops
mit eigener Website) oder `kontaktseiten-fallback` (internationale Domains) über die **eigenen
Domains der Händler** laufen lassen. Die Marktplatz-Domains selbst (amazon.de, etsy.com, ebay.de)
werden **nie** angereichert — sie gehören in die `domainBlacklist` aus `noise-domains.md`, sonst
werden sie voll berechnet.

## Schritt 7 — Übergabe

An `listen-qualitaet` — immer, ohne Ausnahme.

## Bekannte Fallen

- **Produkte statt Verkäufer** in der Ausgabe: Keyword-Discovery liefert oft Listings. Vor dem
  CSV-Bau auf Verkäuferebene zusammenfassen.
- **Plattform-Support-Adressen** und generische Marktplatz-Kontakte sind keine Leads, auch wenn der
  Actor sie ausgibt.
- **Ein-Entwickler-Actors ohne Rating** dominieren diese Kategorie — nie ohne benannten Fallback
  starten, nie ohne Pilot beim Kunden einsetzen.
- **Datenbank statt Live-Daten:** Der Amazon-Primärweg kann Datensätze zeigen, die den Shop längst
  nicht mehr abbilden. Erfassungsdatum begrenzen und im Sample gegenprüfen.
