# Kosten — belegte Größenordnungen

> zuletzt geprüft: **2026-08-19** · GOLD-Tier · Quelle: echte Läufe (SHK Köln/Düsseldorf).
> Regel: Vor JEDEM kostenpflichtigen Lauf die erwarteten Kosten aus dieser Tabelle kalkulieren
> und dem Nutzer nennen. Jeder Lauf bekommt einen harten Deckel (`maxTotalChargeUsd`).

## Belegte Ist-Kosten

| Schritt | Kosten real | Beleg |
|---|---|---|
| 440 Maps-Places (Köln) inkl. Kontakt-Anreicherung + 2 Filter | ~1,60 $ (≈ 0,0036 $/Place) | Lauf 19.08.2026 |
| 50 Maps-Places (vortex, Düsseldorf) inkl. Kontakte | 0,084 $ (≈ 0,0017 $/Place) | Lauf 19.08.2026 |
| 1.000 SERP-Treffer (scraperlink) | 0,05 $ | Lauf 19.08.2026 |
| Impressum je erfolgreicher Domain (winningsolutions) | 0,0076 $ + 0,04 $ Startgebühr je Lauf | Lauf 19.08.2026 |
| Impressum je Domain (haketa, Fallback) | 0,0017 $ | Lauf 19.08.2026 |
| E-Mail-Verifizierung | 0,0006 $/Adresse | Metadaten 19.08.2026 |
| LinkedIn Short-Profil | 0,002 $ (bei voller Suchseite) | Lauf 19.08.2026 |

## Daumenregeln für die Vorab-Kalkulation

| Vorhaben | Größenordnung |
|---|---|
| Pilot (eine Stadt, ~50 Ergebnisse, Weg C) | **unter 0,25 $** |
| Eine Großstadt komplett, Weg C (300–500 Places, Kontakte, Filter) | **1–2 $** |
| 1.000 versandfertige Leads Weg C (Scrape + Impressum-Lücke + Verify) | **5–8 $** |
| SERP-Discovery für eine Nische DACH-weit (Wege A/B) | **unter 1 $** |
| 500 LinkedIn-Profile Full | **~1,60 $** |

## Was Kosten unnötig treibt (vermeiden)

1. **Bekannte Leads erneut anreichern** → Vorab-Abgleich fahren (`outreach-uebergabe.md`, dedup.py) —
   der Bestand wird VOR der Anreicherung abgezogen, nicht danach.
2. **Portale im Impressum-Lauf** → `domainBlacklist` aus `noise-domains.md` setzen; Portale werden
   sonst voll berechnet.
3. **Tröpfel-Läufe beim Impressum-Actor** → 0,04 $ Startgebühr je Lauf: Batches fahren.
4. **Filter stapeln ohne Not** (Maps) → jeder Filter kostet je Place extra; nur `withWebsite` +
   `skipClosedPlaces` sind fast immer ihr Geld wert.
5. **Freie LinkedIn-Queries** → ⅔ Noise = ⅔ verbranntes Geld; strukturierte Filter nutzen.
