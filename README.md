# ListM8 Skills

Workflow-Skills fuer [ListM8](https://app.listm8.com) — KI-gestuetzte Cold-Mailing-Kampagnen ueber das Model Context Protocol (MCP). Die Skills fahren den kompletten Akquise-Flow ueber die 20 MCP-Tools des ListM8-Servers: Kampagne erstellen, Leads importieren, den serverseitigen Lead-Lauf starten (Qualifizierung, Research und AI-Variablen in einem Lauf) und die Ergebnisse reviewen — plus Manuell-Skills fuer Clients, die selbst denken sollen.

## Setup (2 Befehle)

```bash
# 1. ListM8-MCP verbinden (OAuth-Autorisierung oeffnet sich im Browser)
claude mcp add --transport http listm8 https://app.listm8.com/_mcp/v1

# 2. Skills installieren
npx skills add RankM8/listm8-skills
```

Fertig — die Skills nutzen die MCP-Verbindung, es ist kein weiteres Login und keine CLI noetig. Ein ListM8-Konto wird vorausgesetzt.

## Die Skills

| Skill | Aufruf | Was er tut |
|-------|--------|------------|
| `mcp-campaign` | `/mcp-campaign` | Vollstaendige Kampagne aus einem Briefing erstellen/bearbeiten (CampaignBlueprint) |
| `mcp-import` | `/mcp-import` | Lead-Listen (CSV/OutScraper/Inline) importieren |
| `mcp-pipeline` | `/mcp-pipeline` | **Standard:** serverseitigen Lead-Lauf starten und ueberwachen (`start_lead_run` — Qualifizieren, Recherchieren, Generieren in einem Lauf) |
| `mcp-qualify` | `/mcp-qualify` | Manuell-Modus: Leads gegen die Kampagnen-Kriterien qualifizieren (Client denkt selbst) |
| `mcp-research` | `/mcp-research` | Manuell-Modus: qualifizierte Leads recherchieren (Aufhaenger, Entscheider, Kontakt) |
| `mcp-generate` | `/mcp-generate` | Manuell-Modus: AI-Variablen fuer die E-Mail-Personalisierung generieren |
| `mcp-verify` | `/mcp-verify` | Generierte Variablen reviewen und freigeben/ablehnen |

Typischer Ablauf: `/mcp-campaign` → `/mcp-import` → `/mcp-pipeline` → `/mcp-verify` → CSV-Export in ListM8.

## Clients ohne Skill-Support

ChatGPT & Co. bekommen dieselben Workflows direkt vom Server: Der ListM8-MCP exponiert 7 **MCP-Prompts** (`campaign_blueprint_guide`, `run_leads` fuer den serverseitigen Lauf, `qualify_leads`, `research_leads`, `generate_variables`, `verify_variables`, `run_full_pipeline` als Manuell-Modus) — nach dem Verbinden des Connectors als Vorlagen abrufbar, ohne Installation.

## Hinweise

- Die Skills sind client-agnostisch. Der Standard-Weg (`mcp-pipeline`) laeuft serverseitig ueber die Kampagnen-Agents (abgerechnet ueber den OpenRouter-Account des Kontos); die Manuell-Skills nutzen das Modell deines Clients — mit parallelen Subagents (Claude Code) laufen Batches parallel, sonst sequentiell.
- Setup-Anleitungen fuer alle Plattformen (Claude, Claude Code, ChatGPT, Cursor, Codex): in der App unter **`/mcp`**.
