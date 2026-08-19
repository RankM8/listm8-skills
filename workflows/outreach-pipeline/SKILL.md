---
name: outreach-pipeline
description: Use when user says "outreach:pipeline", "mcp:pipeline", "kompletter mcp durchlauf", "leads komplett verarbeiten", "qualify research generate", "alles in einem lauf mcp", "full pipeline", or triggers /mcp:pipeline.
---

# MCP Pipeline — Qualifizierung → Research → Variablen in einem Lauf

Dieser Skill orchestriert die komplette Lead-Verarbeitung einer Kampagne als **einen Lauf** ueber die Phasen-Skills — die Claude-Subagent-Variante von "Qualifying + Research + Emails in einem Lauf" :

```
Phase 1: /mcp:qualify   — list_leads(qualification_status="pending") -> Subagents -> write_lead_details
Phase 2: /mcp:research  — list_leads(research_status="pending", fit_level="qualified") -> Subagents
Phase 3: /mcp:generate  — list_leads(campaign_status="processing") -> Subagents -> save_lead_variables
(danach manuell: /mcp:verify — Review & Approve)
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp:pipeline 80` | Voller Lauf fuer Kampagne 80 (alle 3 Phasen) |
| `/mcp:pipeline 80 --bis research` | Nur Phase 1+2 |
| `/mcp:pipeline` | Kampagne via list_campaigns waehlen |

**Vorab abfragen:** Batch-Groesse (Default 10) und welche Phasen (Default: alle 3). KI-Variablen (Phase 3) ist optional zuschaltbar/abschaltbar — Review/Approve gehoert bewusst NICHT in die Pipeline (Vier-Augen-Prinzip via /mcp:verify).

## Ablaufregeln

1. **Phasen strikt sequentiell**: Phase 2 startet erst, wenn Phase 1 fuer die Kampagne komplett durch ist (Research nutzt den Qualifizierungs-Kontext); Phase 3 erst nach Phase 2. Innerhalb einer Phase laufen die Subagent-Batches parallel.
2. **Jede Phase folgt exakt ihrem Skill** (`outreach-qualify`, `outreach-research`, `outreach-generate`) — Prompts, Regeln und Fehlerbehandlung von dort uebernehmen, keine abweichende Logik.
3. **Idempotenz nutzen**: Jede Phase zieht ihre Queue ueber die list_leads-Filter; bereits verarbeitete Leads tauchen nicht mehr auf. Ein abgebrochener Lauf kann jederzeit mit demselben Kommando fortgesetzt werden.
4. **Fehler blockieren nicht**: Fehlgeschlagene Leads einer Phase bleiben in deren Queue und werden im Report ausgewiesen; die Pipeline laeuft mit den erfolgreichen weiter. Nur wenn ein KOMPLETTER Batch fehlschlaegt: stoppen und User fragen.
5. **not_qualified-Leads** verlassen die Pipeline nach Phase 1 automatisch (Research filtert fit_level="qualified").

## Phasen-Uebergaenge & Reports

Nach jeder Phase einen Zwischen-Report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase {n}/{3} ({name}) abgeschlossen — Kampagne {campaign.name}
Verarbeitet: X | Erfolg: Y | Fehler: Z | Nicht qualifiziert: Q (nur Phase 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Abschluss-Report nach der letzten Phase: Gesamtzahlen pro Phase + "Naechster Schritt: /mcp:verify — Variablen pruefen und freigeben."

## Verwandt

- Phasen-Skills: `/mcp:qualify`, `/mcp:research`, `/mcp:generate` · Review: `/mcp:verify`
- Vorbereitung: `/mcp:campaign`, `/mcp:import`
