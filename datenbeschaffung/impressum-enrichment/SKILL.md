---
name: impressum-enrichment
description: Dieser Skill wird für Impressum-Anreicherung von Nicht-Katalog-Quellen mit fehlenden E-Mails oder Entscheiderdaten geladen. Bei ListM8-MCP-Katalogläufen ist DACH-Impressum bereits serverseitig enthalten; dort keinen zusätzlichen Actor starten. Kein direkter Einstieg.
---

# Impressum-Enrichment: der DACH-Lückenfüller

## In Katalogläufen bereits enthalten

Die ListM8-MCP-Quellen `google_maps_local` und `google_serp_companies` erledigen `imprint`
serverseitig nach dem Bestandsabgleich. Nur neue Kandidaten ohne E-Mail und mit Land DE, AT
oder CH werden angereichert. Für andere Länder wird der Schritt übersprungen. Danach folgen
E-Mail-Verifizierung und Import in die Ergebnisliste.

Keinen separaten Impressum-Actor und keinen CSV-Merge für diese Läufe starten. Stattdessen
`get_lead_source_run` bis terminal abfragen und `enrichedByImprint`, `discardedNoContact`,
Schrittfehler sowie `leadListId` lesen. Ein übersprungener Schritt ist keine Aufforderung zur
manuellen Nachbearbeitung. Signaturen und Statuswerte stehen in
`../datenbeschaffung-referenzen/references/listm8-mcp.md`.

## Fallback: manuelle Nicht-Katalog-Quellen

Den folgenden Ablauf nur für Domainlisten aus Quellen verwenden, die der aktuelle Katalog
nicht abdeckt. Vor kostenpflichtiger Anreicherung gegen den verfügbaren Bestand abgleichen,
Kontaktstatus respektieren, aktuelle Kosten und Deckel bestätigen lassen. Vor jedem Actor-Start
dessen aktuelles Input-Schema prüfen; die folgenden Beispiele ersetzen diese Prüfung nicht.

Holt aus deutschen Impressumsseiten: E-Mail (validiert), Entscheider mit Rollen (Geschäftsführer,
Inhaber), Telefon, Adresse (getrennt), HRB, USt-Id. Wird von Weg-Skills für die E-Mail-Lücke
gerufen: er ist KEIN eigener Weg.

Input: Liste von Domains/Websites (zum Beispiel die Domain-CSV eines manuellen
Shop- oder LinkedIn-Fallbacks). Keine bereits verarbeitete Liste aus einem Kataloglauf verwenden.

## Actor & Betriebsregeln (belegt 19.08.2026)

Primär + Fallbacks stehen in `../datenbeschaffung-referenzen/references/apify-actors.md` (Impressum-Kategorie).
Die Regeln sind NICHT optional:

1. **Nur Domain-Modus (`inputMode: "urls"`).** Der `searchTerms`-Modus bricht mit Städten als
   `locationName` (belegter Bug: `Invalid Field: 'location_name'`: nur „Germany" funktioniert)
   und scrapt ungefiltert Portale mit. Die Domain-Liste kommt aus dem Weg-Skill, nicht aus
   einer actor-internen Google-Suche.
2. **`domainBlacklist` IMMER setzen**: die Portal-Domains aus `../datenbeschaffung-referenzen/references/noise-domains.md`
   (kommagetrennt). Portale werden sonst voll berechnet: bares Geld.
3. **Batches fahren.** Jeder Lauf kostet die Actor-Startgebühr (`kosten.md`): nie tröpfeln, minimal ~50 Domains je Lauf.
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

Kosten vorher nennen: die Zahlen (je erfolgreicher Domain inkl. Validierung + Startgebühr)
kommen NUR aus `../datenbeschaffung-referenzen/references/kosten.md`, nie aus dem Gedächtnis.
Deckel setzen.

## Auswertung

- `email_status` UNDELIVERABLE → Zeile verwerfen (die Validierung ist hier schon bezahlt.
  `listen-qualitaet` verifiziert diese Leads NICHT erneut).
- `decision_makers`: erste Person mit Rolle Geschäftsführer/Inhaber wird `firstName`/`lastName`;
  weitere Entscheider als Zusatzspalte `entscheider` (Semikolon-getrennt) mitgeben: Research
  und Personalisierung nutzen sie.
- `register_number`/`vat_id` als Zusatzspalten mitführen (Custom-Attribute beim Import).
  sie beweisen später, dass es ein echter Betrieb ist.
- Merge zurück in die Roh-CSV über die Root-Domain (`build_csv.py`-Format bleibt erhalten;
  `quelle` um `+impressum` ergänzen).

## Wann NICHT anreichern

- Lead hat schon eine E-Mail aus dem Scrape → kein Impressum-Lauf (Geld sparen; Entscheider-Namen
  nur auf ausdrücklichen Wunsch nachziehen).
- Unternehmen außerhalb DACH: den `kontaktseiten-fallback` nehmen. Das Unternehmensland
  prüfen, nicht allein die Domainendung; auch eine .com-Domain kann zu einem DACH-Betrieb gehören.
- < 20 Domains → Startgebühr frisst den Nutzen; Lücke akzeptieren oder sammeln bis zum Batch.
