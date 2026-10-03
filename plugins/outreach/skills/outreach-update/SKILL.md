---
name: outreach-update
description: Aktualisiert die Outreach-Plugins (outreach, datenbeschaffung). Verwenden bei „outreach aktualisieren“, „Plugin updaten“, „gibt es eine neue Version“, „Skills sind veraltet“ oder wenn ein Skill ein Tool aufruft, das es nicht gibt.
---

# Outreach-Plugins aktualisieren

Nenne dem Nutzer den Befehl für seine Umgebung und führe ihn aus, wo du das kannst.

| Umgebung | Aktualisieren |
|---|---|
| Claude Code | `claude plugin marketplace update outreach-plugins`, danach `claude plugin update outreach@outreach-plugins` (und ggf. `datenbeschaffung@outreach-plugins`), dann `/reload-plugins` |
| Claude App / claude.ai / Cowork | Customize → Plugins → Marketplace `outreach-plugins` → „Check for updates“ bzw. „Sync automatically“ |
| Codex | `codex plugin marketplace upgrade outreach-plugins`, danach neue Session |
| ChatGPT Desktop | App neu starten |
| Cursor & andere (Skills ohne Plugin) | `npx skills add RankM8/outreach-plugins` |

Dauerhaft in Claude Code: `/plugin` → Marketplaces → `outreach-plugins` → Auto-Update einschalten.

## Was sich geändert hat

Die Änderungen stehen in `CHANGELOG.md` im Repo `RankM8/outreach-plugins`. Nenne dem Nutzer
die Punkte seit seiner installierten Version, wenn er danach fragt.

## Wenn danach noch alte Skills auftauchen

Doppelte oder veraltete Skills stammen meist aus früheren `npx skills add`-Kopien → `outreach-setup`,
Schritt 3 (Aufräumen).
