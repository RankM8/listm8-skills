---
name: datenbeschaffung-referenzen
description: Reference pack for the datenbeschaffung skill family (shared references and scripts - actors, costs, cities, noise domains, CSV format, ICP, handover, plus the Python helpers). Not invoked directly; the master and weg-* skills read from this package via ../datenbeschaffung-referenzen/.
---

# Datenbeschaffung — Referenz-Paket

Kein eigenständiger Skill, sondern die geteilte Wissensbasis der Datenbeschaffungs-Familie.
Wird zusammen mit den anderen Skills installiert; Master, Weg-Skills und `listen-qualitaet`
lesen von hier (`references/`) und rufen die Skripte (`scripts/`).

| Datei | Inhalt |
|---|---|
| `references/setup.md` | Apify verbinden, Token-URL, Selbsttest |
| `references/zugriff.md` | Zugriffsschicht: Actor via MCP / REST / CLI, Kosten-Deckel-Regeln |
| `references/apify-actors.md` | Gepinnte Actors je Kategorie mit Beleg + Prüfdatum |
| `references/kosten.md` | Belegte Kosten + Daumenregeln + Kostenfallen |
| `references/staedte.md` | DACH-Städtelisten + Pilotstadt-Regeln |
| `references/noise-domains.md` | DIE Ausschlussliste (SERP-Filter, domainBlacklist, -site:) |
| `references/csv-spalten.md` | DAS CSV-Format (deckungsgleich mit dem App-Import) |
| `references/icp.md` | ICP-Satz, Anti-ICP, Filter-Dimensionen, Trichter-Prinzip |
| `references/erfahrungswerte.md` | Belegte Query-Trefferquoten (wächst mit jedem Lauf) |
| `references/outreach-uebergabe.md` | Der Übergabe-Ablauf in die App (MCP) + CSV-Fallback |
| `scripts/build_queries.py` | Suchbegriffe × Städte + -site:-Ausschlüsse |
| `scripts/process_serp.py` | SERP-JSON → eindeutige Firmen-Domains (Noise gefiltert) |
| `scripts/build_csv.py` | Rohdaten → CSV-Format, Firmennamen-Normalisierung, Hinweise |
| `scripts/dedup.py` | Vorab-Abgleich gegen den Bestandsindex (do_not_contact hart) |
