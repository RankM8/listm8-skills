# Erfahrungswerte — belegte Trefferquoten und Query-Effekte

> Alles hier ist gemessen, nicht geschätzt. Neue Läufe ergänzen Zeilen mit Datum; Werte ohne
> Quelle gehören nicht in diese Datei. Die Wege verweisen hierher, statt Zahlen zu wiederholen.
>
> Lesart „Trefferquote": Anteil der SERP-Domains, die nach dem Filtern (`process_serp.py`)
> wirklich zum ICP passen. Die Pilot-Schwelle des Pakets (~70 %) gilt gegen genau diese Zahl.

## Query-Varianten mit belegter Trefferquote

| Nische | Query-Muster | Trefferquote | Quelle |
|---|---|---|---|
| Ernährungs-/Health-Coaching | `Ernährungscoach <Stadt>` | ~42 % | Kurs-Testläufe, übernommen 19.08.2026 |
| Ernährungs-/Health-Coaching | `Ernährungsberatung <Stadt>` | ~36 % — zieht massiv Arztpraxen und Kliniken | Kurs-Testläufe, übernommen 19.08.2026 |
| Ernährungs-/Health-Coaching | `Health Coach <Stadt>` | ~30 % — Corporate Health und Ausbildungsanbieter | Kurs-Testläufe, übernommen 19.08.2026 |
| Ernährungs-/Health-Coaching | Nische gesamt nach Filterung | 60–70 % ist hier ein gutes Ergebnis, unter 50 % nachschärfen | Kurs-Testläufe, übernommen 19.08.2026 |
| Spirituelles Coaching | `Spiritueller Coach <Stadt>` | bester Anteil einzelner Coaches der drei Varianten | Kurs-Testläufe, übernommen 19.08.2026 |
| Spirituelles Coaching | `Spirituelles Coaching <Stadt>` | schwächer — zieht Coaching-Ausbildungen | Kurs-Testläufe, übernommen 19.08.2026 |
| Spirituelles Coaching | `Bewusstseinscoach <Stadt>` | eigenes Publikum, mehr Netzwerk-Noise | Kurs-Testläufe, übernommen 19.08.2026 |
| Spirituelles Coaching | Nische gesamt nach Filterung | ~60–70 % | Kurs-Testläufe, übernommen 19.08.2026 |
| Vertriebscoaching | `Vertriebscoach` / `Vertriebstrainer <Stadt>` schlägt `Vertriebscoaching` / `Sales Coaching` deutlich | letztere liefern AVGS-, Karriere- und Sprechcoaching statt Vertrieb | Kurs-Testläufe, übernommen 19.08.2026 |
| SERP allgemein | 60 Treffer (scraperlink) | 40 eindeutige Firmen-Domains, keine Dubletten | Lauf 19.08.2026 |
| Google Maps | SHK Köln, `scrapeContacts` | 440 Places, 77 % mit E-Mail direkt aus dem Scrape | Lauf 19.08.2026 |

## Query-Formulierung — was messbar wirkt

1. **„Coach" statt „Trainer".** „Coach" zieht Premium-Positionierung, „Trainer" günstige
   Freelancer und Kursanbieter.
2. **Zusammengesetzte Begriffe zusammenschreiben.** `Führungskräftecoaching` schlägt
   `Führungskräfte Coaching`: die Zwei-Wort-Variante liest Google als informationelle Suche und
   liefert Lexikon- und Ratgeberartikel statt Anbieter-Websites.
3. **Beide Schreibweisen abdecken, wo sie üblich sind** (`Marketingagentur` und
   `Marketing Agentur`, `SEO Agentur` und `SEO-Agentur`) — die Ergebnismengen überlappen nur zum Teil.
4. **Englische Begriffe im B2B mitnehmen** (`Executive Coach`, `Leadership Coach`) — viele
   B2B-Anbieter positionieren sich international. Rein englische Queries allein liefern im
   DACH-Raum aber oft leere oder internationale Treffer, deutsche Variante also immer dazu.
5. **Zu generische Queries kosten Trefferquote, nicht Geld** — der Filter wirft sie weg, aber die
   Liste wird kürzer als geplant. Spezifischer formulieren statt mehr Seiten scrapen.

## `-site:`-Ausschlüsse in der Query

**Maximal 8–10 Ausschlüsse pro Query-Zeile.** Belegt: längere Queries (25+ Ausschlüsse) bringen
den SERP-Actor dazu, leere Ergebnisse zurückzugeben. `build_queries.py --exclude` ist deshalb
auf wenige Domains voreingestellt.

Die Ausschlüsse in der Query decken nur die schlimmsten Treiber ab; die vollständige Filterung
macht `process_serp.py` gegen `noise-domains.md`. Bewährter Kern für Google-Wege:

```
-site:indeed.com -site:stepstone.de -site:kleinanzeigen.de -site:facebook.com
-site:instagram.com -site:linkedin.com -site:youtube.com -site:xing.com
```

Nischen-Ergänzung statt Verlängerung: den nischenspezifisch stärksten Treiber gegen einen der
Kern-Ausschlüsse tauschen (B2C-Coaching: `superprof.de` und `yelp.com`; B2B: `kununu.com` und
`glassdoor.com`; E-Commerce: `amazon.de`, `otto.de`, `zalando.de`, `idealo.de`).

## Seitenzahl je Query (Erfahrungswerte)

| Zielgruppe | Seiten | Warum |
|---|---|---|
| B2B-Dienstleister (Weg A) | 5 | schwächeres SEO als Coaches, ab Seite 6 kaum noch Neues |
| E-Commerce (Weg B) | 4 | die Shops mit eigener Marke stehen auf Seite 1–3 |
| Coaches (Weg D) | 7 | Seite 4–7 fängt Coaches mit schwachem SEO — genau die mit Bedarf |
