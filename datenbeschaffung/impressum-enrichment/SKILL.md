---
name: impressum-enrichment
description: Anreicherungs-Baustein des Datenbeschaffungs-Pakets — extracts German Impressum data (email, decision makers with roles, HRB, VAT id, address) for a list of domains. Invoked by weg-* skills for leads missing emails or when decision-maker names are wanted; never triggered directly.
---

# Impressum-Enrichment — der DACH-Lückenfüller

Holt aus deutschen Impressumsseiten: E-Mail (validiert), Entscheider mit Rollen (Geschäftsführer,
Inhaber), Telefon, Adresse (getrennt), HRB, USt-Id. Wird von Weg-Skills für die E-Mail-Lücke
gerufen — er ist KEIN eigener Weg.

Input: Liste von Domains/Websites (z. B. die `keine-email`-Teilmenge aus Weg C, oder die
Domain-CSV aus `process_serp.py`).

## Actor & Betriebsregeln (belegt 19.08.2026)

Primär + Fallbacks stehen in `../datenbeschaffung-referenzen/references/apify-actors.md` (Impressum-Kategorie).
Die Regeln sind NICHT optional:

1. **Nur Domain-Modus (`inputMode: "urls"`).** Der `searchTerms`-Modus bricht mit Städten als
   `locationName` (belegter Bug: `Invalid Field: 'location_name'` — nur „Germany" funktioniert)
   und scrapt ungefiltert Portale mit. Die Domain-Liste kommt aus dem Weg-Skill, nicht aus
   einer actor-internen Google-Suche.
2. **`domainBlacklist` IMMER setzen** — die Portal-Domains aus `../datenbeschaffung-referenzen/references/noise-domains.md`
   (kommagetrennt). Portale werden sonst voll berechnet: bares Geld.
3. **Batches fahren.** Jeder Lauf kostet die Actor-Startgebühr (`kosten.md`) — nie tröpfeln, minimal ~50 Domains je Lauf.
4. **Ein-Entwickler-Risiko:** Schlägt der Primär-Actor fehl oder liefert leer, auf Fallback A
   ausweichen (nur schwächere Register-Felder), für die reine E-Mail-Lücke reicht Fallback B.

## Standard-Input (Primär-Actor)

```json
{
  "inputMode": "urls",
  "targetUrls": [{"url": "https://<domain-1>/"}, {"url": "https://<domain-2>/"}],
  "languageCode": "de",
  "validateEmail": true
}
```

Kosten vorher nennen — die Zahlen (je erfolgreicher Domain inkl. Validierung + Startgebühr)
kommen NUR aus `../datenbeschaffung-referenzen/references/kosten.md`, nie aus dem Gedächtnis.
Deckel setzen.

## Auswertung

- `email_status` UNDELIVERABLE → Zeile verwerfen (die Validierung ist hier schon bezahlt —
  `listen-qualitaet` verifiziert diese Leads NICHT erneut).
- `decision_makers`: erste Person mit Rolle Geschäftsführer/Inhaber wird `firstName`/`lastName`;
  weitere Entscheider als Zusatzspalte `entscheider` (Semikolon-getrennt) mitgeben — Research
  und Personalisierung nutzen sie.
- `register_number`/`vat_id` als Zusatzspalten mitführen (Custom-Attribute beim Import) —
  sie beweisen später, dass es ein echter Betrieb ist.
- Merge zurück in die Roh-CSV über die Root-Domain (`build_csv.py`-Format bleibt erhalten;
  `quelle` um `+impressum` ergänzen).

## Wann NICHT anreichern

- Lead hat schon eine E-Mail aus dem Scrape → kein Impressum-Lauf (Geld sparen; Entscheider-Namen
  nur auf ausdrücklichen Wunsch nachziehen).
- Nicht-DACH-Domains → der Actor ist auf deutsche Impressumspflicht gebaut; für .com/.co.uk den
  `kontaktseiten-fallback` nehmen.
- < 20 Domains → Startgebühr frisst den Nutzen; Lücke akzeptieren oder sammeln bis zum Batch.
