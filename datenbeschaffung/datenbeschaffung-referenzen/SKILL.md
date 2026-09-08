---
name: datenbeschaffung-referenzen
description: Dieses Referenzpaket wird von Datenbeschaffungs-Master und Weg-Skills für ListM8-MCP-Signaturen, Formularfelder, Statuswerte, Zähler, Fehler und Kostenregeln gelesen. Enthält außerdem manuelle Actor- und CSV-Fallbacks für Nicht-Katalog-Quellen. Kein direkter Einstieg.
---

# Datenbeschaffung: Referenz-Paket

Kein eigenständiger Skill, sondern die geteilte Wissensbasis der Datenbeschaffungs-Familie.
Wird zusammen mit den anderen Skills installiert; Master, Weg-Skills und `listen-qualitaet`
lesen von hier (`references/`). Für Katalogquellen zuerst `references/listm8-mcp.md` lesen.
Die Skripte (`scripts/`) und direkten Actor-Anleitungen nur für manuelle Nicht-Katalog-Quellen
verwenden. Katalogläufe weder lokal nachbearbeiten noch nochmals importieren.

Die alten Preisreferenzen ersetzen keine aktuelle MCP-Schätzung. Die Katalog- und
Kontoinformationen aus `list_lead_sources` und `estimate_lead_source_run` sind maßgeblich.

| Datei | Inhalt |
|---|---|
| `references/listm8-mcp.md` | Standard: MCP-Tools, Parameter, Schätzung, Freigabe, Laufreport, Zähler und Fehler |
| `references/setup.md` | Fallback: direkten Apify-Zugang verbinden, Token-URL, Selbsttest |
| `references/zugriff.md` | Fallback-Zugriffsschicht: Actor via MCP / REST / CLI, Kosten-Deckel-Regeln |
| `references/apify-actors.md` | Fallback: gepinnte Actors je Kategorie mit Beleg + Prüfdatum |
| `references/kosten.md` | Fallback: belegte Actor-Kosten + Daumenregeln + Kostenfallen |
| `references/staedte.md` | DACH-Städtelisten + Pilotstadt-Regeln |
| `references/noise-domains.md` | DIE Ausschlussliste (SERP-Filter, domainBlacklist, -site:) |
| `references/csv-spalten.md` | DAS CSV-Format (deckungsgleich mit dem App-Import) |
| `references/icp.md` | ICP-Satz, Anti-ICP, Filter-Dimensionen, Trichter-Prinzip |
| `references/erfahrungswerte.md` | Belegte Query-Trefferquoten (wächst mit jedem Lauf) |
| `references/outreach-uebergabe.md` | Fallback: manueller Import in die App und CSV-Übergabe |
| `scripts/build_queries.py` | Suchbegriffe × Städte + -site:-Ausschlüsse |
| `scripts/process_serp.py` | SERP-JSON → eindeutige Firmen-Domains (Noise gefiltert) |
| `scripts/build_csv.py` | Rohdaten → CSV-Format, Firmennamen-Normalisierung, Hinweise |
| `scripts/dedup.py` | Vorab-Abgleich gegen den Bestandsindex (do_not_contact hart) |
