---
name: outreach
description: Einstieg für alles rund um Outreach-Kampagnen. Verwenden bei „outreach“, „was kann ich hier machen“, „wo fange ich an“, „Kampagne starten“, „Hilfe zu Outreach“ oder wenn unklar ist, welcher Outreach-Skill passt. Fragt kurz nach dem Ziel und leitet an den passenden Skill weiter.
---

# Outreach – Einstieg

Dieser Skill macht selbst nichts außer weiterleiten. Frage den Nutzer, was er erreichen will,
und lade dann genau den passenden Skill.

## Erst prüfen

- **Noch nicht eingerichtet?** (kein Outreach-MCP verbunden, erstes Mal, alte Skill-Kopien)
  → `outreach-setup`.
- **Verbunden?** Ein Aufruf von `list_campaigns` (nur lesend) zeigt, ob die Verbindung steht.

## Wohin

| Der Nutzer will … | Skill |
|---|---|
| eine Kampagne anlegen oder ändern | `outreach-campaign` |
| Cold-Mail-Copy schreiben oder prüfen, ein Marketing-Offer formulieren | `outreach-copy` |
| Leads importieren (CSV, Liste) | `outreach-import` |
| Listen ansehen, anlegen, in eine Kampagne übernehmen | `outreach-lists` |
| Leads qualifizieren | `outreach-qualify` |
| Leads recherchieren | `outreach-research` |
| Mail-Variablen generieren | `outreach-generate` |
| generierte Mails prüfen und freigeben | `outreach-verify` |
| alles in einem serverseitigen Lauf (qualifizieren → recherchieren → generieren) | `outreach-pipeline` |
| Versand vorbereiten: Domains, Postfächer, Warm-up, Instantly, Auswertung | `outreach-launch` |
| neue Leads beschaffen (Apify, Outscraper) | `datenbeschaffung` – gehört zum Plugin **datenbeschaffung**; ist es nicht installiert, auf `outreach-setup` verweisen |
| Plugin aktualisieren | `outreach-update` |

## Regeln

- Nichts Kostenpflichtiges starten, ohne dass der Nutzer genau diesen Umfang freigibt.
- Kennt der Nutzer sein Ziel nicht, zuerst eine Frage: „Willst du eine neue Kampagne aufsetzen,
  Leads verarbeiten oder neue Leads beschaffen?“
