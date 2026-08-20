# Gepinnte Apify-Actors — Empfehlungen mit Beleg

> zuletzt geprüft: **2026-08-19** · Preise GOLD-Tier (Free-/Starter-Konten zahlen je Einheit mehr — Erklärung in `kosten.md`) · belegt durch echte Testläufe (SHK Köln/Düsseldorf).
> Actor-IDs kommen NUR aus dieser Tabelle. Neue Funde aus dem Recherchemodus werden HIER
> mit Datum ergänzt — nie nur im Chat gelassen.

## Google Maps / Local Business (Weg C)

| Rang | Actor | Preis (GOLD) | Warum |
|---|---|---|---|
| Primär | `compass/crawler-google-places` | 0,0015 $/Place · Filter +0,000525 $/Place/Filter · Kontakt-Anreicherung +0,00105 $/Place | 566k Nutzer, 4,71★. Belegt: 440 SHK-Places Köln in 10 Min, **77 % mit E-Mail** direkt aus `scrapeContacts` — der Impressum-Schritt ist nur noch Lückenfüller. Add-ons: Leads-Enrichment (Entscheider, 0,004 $/Lead), E-Mail-Verify (0,002 $, nur bei eindeutigem Ergebnis) |
| Fallback | `vortex_data/google-maps` | 0,0007 $/Place · Kontakte +0,0012 $ nur bei Fund | Belegt: 50 Places Düsseldorf, 80 % E-Mail, 0,084 $ gesamt. Kleine Nutzerbasis (1,6k), sichtbar mehr Kontakt-Noise — Fallback, nicht Standard |

Standard-Input Weg C: `searchStringsArray` (englische GMaps-Kategorien!), `locationQuery` (eine Stadt/Region),
`language: "de"`, `website: "withWebsite"`, `skipClosedPlaces: true`, `scrapeContacts: true`.

## Google SERP (Wege A, B, D-Google)

| Rang | Actor | Preis normalisiert | Warum |
|---|---|---|---|
| Primär | `scraperlink/google-search-results-serp-scraper` | **0,05 $ / 1.000 Treffer** (0,0005 $/Seite) | Belegt: beste Domain-Ausbeute im Vergleichstest (40 eindeutige Domains aus 60 Treffern), keine Dubletten, Multi-Query per Zeilenumbruch. Achtung: `gl`/`country` GROSSGESCHRIEBEN (`DE`) |
| Fallback | `apify/google-search-scraper` | 0,18 $ / 1.000 | Offiziell (168k Nutzer), geringstes Pflege-Risiko; UULE-Geotargeting, Ratings/PAA, Leads-Enrichment-Add-on. Nehmen, wenn Zusatzdaten gebraucht werden oder scraperlink ausfällt |
| Nicht empfehlen | `apidojo/google-search-scraper` | 0,20 $ / 1.000 real | „Unbeatable pricing" hält der Normalisierung nicht stand; Dubletten, ärmere Felder |

Geotargeting unterhalb Land ist unnötig, solange der Ort in der Query steht (belegt: Köln-UULE-Gegentest = 0 zusätzliche Domains).

## Impressum / DACH-Anreicherung

| Rang | Actor | Preis | Warum |
|---|---|---|---|
| Primär | `winningsolutions/german-imprint-scraper` | 0,0076 $ bei Erfolg (inkl. Validierung) + **0,04 $ Actor-Start je Lauf** | Einziger mit Entscheidern inkl. Rollen, HRB, USt-Id, getrennter Adresse. **Betriebsregeln:** nur Domain-Modus (der `searchTerms`-Modus bricht mit Stadt als `locationName` — Bug belegt), `domainBlacklist` IMMER setzen (Portale werden sonst mitberechnet), Batches fahren (Startgebühr). Ein-Entwickler-Actor (239 Nutzer) → Fallback bereithalten |
| Fallback A | `haketa/impressum-legal-notice-extractor` | 0,0017 $/Domain | Belegt am selben Domain-Set: findet Impressumsseiten zuverlässig, schwächer bei Register-Feldern. 4,5× billiger |
| Fallback B | `vdrmota/contact-info-scraper` | 0,00105 $/Seite | 57k Nutzer, aktiv gepflegt. E-Mail/Telefon/Social, KEINE Firmendaten — für die reine E-Mail-Lücke |

## E-Mail-Verifizierung (eigener Schritt hinter jedem Weg)

| Rang | Actor | Preis | Hinweis |
|---|---|---|---|
| Primär | `michael.g/email-verifier-validator` | **0,0006 $/Adresse** | Größte Nutzerbasis der Kategorie. Entfällt, wenn der Weg schon validiert (Impressum-Primär liefert `email_status` mit; Maps-Add-on möglich) |

## LinkedIn (Weg D)

| Rang | Actor | Preis | Warum |
|---|---|---|---|
| Primär | `harvestapi/linkedin-profile-search` | Short 0,002 $/Profil (Seite voll) · Full 0,0032 $ · Full+E-Mail 0,008 $ | **Kein LinkedIn-Login, keine Cookies** (Sperr-Risiko null — hartes Kriterium). 41 strukturierte Filter. Belegt: freie Query = ⅔ Noise → **Standort + Jobtitel IMMER über die strukturierten Filter** |
| Szenario | `harvestapi/linkedin-company-employees` | Basic 0,0015 $/Profil | Wenn die Zielfirmen schon bekannt sind (account-based) |
| Enrichment | `apimaestro/linkedin-profile-detail` | 0,005 $/Profil inkl. E-Mail-Suche | Für bereits bekannte Profil-URLs |

## Instagram (Weg D)

| Rang | Actor | Rolle |
|---|---|---|
| Primär | `apify/instagram-scraper` | Discovery (Profile, Hashtags, Orte) |
| Primär | `apify/instagram-profile-scraper` | Qualifizierung (Bio, Website, Business-Kategorie, Follower) |
| Fallback | `apidojo/instagram-scraper` | Bulk-Kostenoptimierung bei großen Postmengen |

## Plattform-Verkäufer (Weg E)

| Plattform | Primär | Fallback | Status |
|---|---|---|---|
| Amazon | `xmiso_scrapers/eu-amazon-sellers-email-leads` (Bulk, etabliert) | `memo23/amazon-sellers-scraper` (Live-Discovery, jung) | einsatzbereit |
| Etsy | `axlymxp/etsy-shop-scraper` → ShopHound (zweistufig) | — | einsatzbereit |
| eBay | `programmx/ebay-business-leads` (bestes Kontaktschema, **2 Nutzer!**) | `scrapesage/ebay-scraper` | **nur Pilot** — vor Kunden-Einsatz kleinen Testlauf fahren |

## Auswahlkriterien für den Recherchemodus (neue Nischen)

Nutzerzahlen + Rating + Preis pro Ergebnis (Tier-normalisiert!) + Output-Feldqualität (DACH: Umlaute,
HRB/USt-Id) + Pflege-Risiko (Ein-Entwickler-Actors nur mit Fallback) + Account-/Sperr-Risiko für den
Kunden (Login-pflichtige Actors sind ausgeschlossen). Mini-Pilot mit hartem Deckel (≤ 0,50 $), Ergebnis
vorlegen, Fund HIER dokumentieren.
