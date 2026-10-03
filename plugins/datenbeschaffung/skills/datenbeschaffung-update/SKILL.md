---
name: datenbeschaffung-update
description: Aktualisiert das Plugin datenbeschaffung. Verwenden bei „Datenbeschaffung aktualisieren“, „datenbeschaffung updaten“, „neue Version der Datenbeschaffung“ oder wenn ein Datenbeschaffungs-Skill auf veraltete Actors, Preise oder Tools verweist.
---

# Datenbeschaffung aktualisieren

Nenne dem Nutzer den Befehl für seine Umgebung und führe ihn aus, wo du das kannst.

| Umgebung | Aktualisieren |
|---|---|
| Claude Code | `claude plugin marketplace update outreach-plugins`, danach `claude plugin update datenbeschaffung@outreach-plugins`, dann `/reload-plugins` |
| Claude App / claude.ai / Cowork | Customize → Plugins → Marketplace `outreach-plugins` → „Check for updates“ bzw. „Sync automatically“ |
| Codex | `codex plugin marketplace upgrade outreach-plugins`, danach neue Session |
| ChatGPT Desktop | App neu starten |
| Cursor & andere (Skills ohne Plugin) | `npx skills add RankM8/outreach-plugins` |

Dauerhaft in Claude Code: `/plugin` → Marketplaces → `outreach-plugins` → Auto-Update einschalten.
Ist auch das Plugin `outreach` installiert, aktualisiert derselbe Marketplace-Befehl beide.

## Was sich geändert hat

Die Änderungen stehen in `CHANGELOG.md` im Repo `RankM8/outreach-plugins`. Nenne dem Nutzer die
Punkte seit seiner installierten Version, wenn er danach fragt.

## Wenn danach noch alte Skills auftauchen

Doppelte oder veraltete Skills stammen meist aus früheren `npx skills add`-Kopien →
`datenbeschaffung-setup`, Schritt 5 (Aufräumen).
