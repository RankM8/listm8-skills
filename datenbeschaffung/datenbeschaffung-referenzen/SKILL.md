---
name: datenbeschaffung-referenzen
description: Dieses Referenzpaket wird von Datenbeschaffungs-Master und Weg-Skills gelesen. Enthält die ListM8-MCP-Referenz für Import und Bestand (import_leads, check_leads_exist, export_leads, Listen), den manuellen Ablauf mit eigenem Apify- oder Outscraper-Konto (Actors, Zugriff, Kosten), CSV-Format, ICP und Hilfsskripte. Kein direkter Einstieg.
---

# Datenbeschaffung: Referenz-Paket

Kein eigenständiger Skill, sondern die geteilte Wissensbasis der Datenbeschaffungs-Familie.
Wird zusammen mit den anderen Skills installiert; Master, Weg-Skills und `listen-qualitaet`
lesen von hier (`references/`). ListM8 scrapt nicht: Der Kunde scrapt mit eigenem Apify- oder
Outscraper-Konto außerhalb von ListM8, bereinigt die Ergebnisse und importiert sie als CSV über die
Oberfläche oder per MCP `import_leads`. Für die ListM8-Seite zuerst `references/listm8-mcp.md` lesen.

Preise in `kosten.md` und `apify-actors.md` sind Richtwerte mit Prüfdatum; vor jedem Lauf den aktuellen
Preis beim Anbieter prüfen und freigeben lassen.

| Datei | Inhalt |
|---|---|
| `references/listm8-mcp.md` | ListM8-MCP: Import- und Bestands-Tools mit Parametern, Job-Report und Fehlern |
| `references/setup.md` | Apify-Zugang des Kunden verbinden, Token-URL, Selbsttest |
| `references/zugriff.md` | Zugriffsschicht: Actor via MCP / REST / CLI, Kosten-Deckel-Regeln |
| `references/apify-actors.md` | Gepinnte Actors je Kategorie mit Beleg + Prüfdatum |
| `references/kosten.md` | Belegte Actor-Kosten + Daumenregeln + Kostenfallen |
| `references/staedte.md` | DACH-Städtelisten + Pilotstadt-Regeln |
| `references/noise-domains.md` | DIE Ausschlussliste (SERP-Filter, domainBlacklist, -site:) |
| `references/csv-spalten.md` | DAS CSV-Format (deckungsgleich mit dem App-Import) |
| `references/icp.md` | ICP-Satz, Anti-ICP, Filter-Dimensionen, Trichter-Prinzip |
| `references/listen-und-icp.md` | Von der Zielgruppe zur versandfähigen Liste: Quellen außerhalb der Weg-Skills, Qualitäts-Check, Datenqualität vor dem Import, Sperrliste, Volumenplanung |
| `references/erfahrungswerte.md` | Belegte Query-Trefferquoten (wächst mit jedem Lauf) |
| `references/outreach-uebergabe.md` | Übergabe in ListM8: Bestandsabgleich, Liste, Import, CSV-Weg |
| `scripts/build_queries.py` | Suchbegriffe × Städte + -site:-Ausschlüsse |
| `scripts/process_serp.py` | SERP-JSON → eindeutige Firmen-Domains (Noise gefiltert) |
| `scripts/build_csv.py` | Rohdaten → CSV-Format, Firmennamen-Normalisierung, Hinweise |
| `scripts/dedup.py` | Vorab-Abgleich gegen den Bestandsindex (do_not_contact hart) |
