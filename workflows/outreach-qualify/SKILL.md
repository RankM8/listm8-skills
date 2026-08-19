---
name: outreach-qualify
description: Use when user says "outreach:qualify", "mcp:qualify", "qualifiziere leads", "lead qualifizierung", "qualify leads", "leads bewerten", or triggers /mcp:qualify.
---

# MCP Qualify — Lead-Qualifizierung durch Claude-Subagents

Dieser Skill orchestriert die Lead-Qualifizierung via MCP Business Tools. Claude-Subagents bewerten jeden Lead gegen die Kampagnen-Kriterien (aus `get_lead_data.qualificationGeneration`) und schreiben das Ergebnis via `write_lead_details` zurueck. Die ListM8-interne Qualification-Pipeline (OpenRouter) wird NICHT verwendet.

> **Hinweis zur Parallelisierung:** Wenn dein Client parallele Subagents unterstuetzt (z.B. Claude Code), spawne pro Lead einen Subagent wie beschrieben. Andernfalls arbeite die Leads **sequentiell** mit exakt denselben Schritten ab — das Ergebnis ist identisch, nur langsamer.

## Workflow-Uebersicht

```
1. list_campaigns -> Kampagne identifizieren (oder campaign_id aus Argument)
   |
2. list_leads(campaign_id, limit={batch_size}, fit_level="", research_status="",
              campaign_status="processing", qualification_status="pending")
   -> {batch_size} unqualifizierte Leads
   |
3. Fuer jeden Lead: Sub-Agent spawnen (parallel)
   -> get_lead_data() -> Kriterien lesen -> Website analysieren -> bewerten
   -> write_lead_details(qualificationStatus=completed, fitLevel, score, ...)
   |
4. Batch-Report -> naechster Batch (Queue ist idempotent: qualifizierte Leads
   fallen aus qualification_status="pending" heraus)
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp:qualify` | Zeigt Kampagnen via list_campaigns, User waehlt |
| `/mcp:qualify 80` | Startet direkt fuer Kampagne 80 |
| `qualifiziere leads fuer kampagne 80` | Startet direkt fuer Kampagne 80 |

**Batch-Groesse abfragen** (wie /mcp:generate): Default 10, Optionen 50/100/200.

## Phase 0: Vorpruefung — kein paralleler Server-Lauf

`list_lead_runs(campaign_id, active_only=true)` aufrufen. Ist ein serverseitiger Lauf aktiv, der Qualifizierung ODER Research abdeckt, lehnt `write_lead_details` jeden Schreibvorgang mit `lead_run_active` ab (Rennschutz — das Tool prueft beide Stufen gemeinsam). Dann: auf den Terminal-Status warten (`get_lead_run_status`) oder den Lauf nach Ruecksprache mit `cancel_lead_run` stoppen — NICHT parallel losarbeiten.

## Phase 1: Leads laden

```
list_leads(
  campaign_id = <ID>,
  limit = {batch_size},
  fit_level = "",
  research_status = "",
  campaign_status = "processing",
  qualification_status = "pending"
)
```

Wenn `leads` leer: "Keine unqualifizierten Leads." -> STOP.

## Phase 2: Sub-Agents spawnen (parallel)

Fuer JEDEN Lead einen Agent spawnen (general-purpose, `run_in_background: true`, alle in EINEM Message-Block, `name`: "qual-{lead.company}" gekuerzt).

### Sub-Agent Prompt Template

```
Du qualifizierst einen Lead fuer eine Cold-Mailing-Kampagne via MCP Tools.

KAMPAGNE: {campaign.name} (ID: {campaign.id})
LEAD: {lead.company} (ID: {lead.id})

## Schritte

1. Rufe get_lead_data(campaign_id={campaign.id}, lead_id={lead.id}) auf.
2. Lies lead.qualificationGeneration:
   - "settings" = die Kampagnen-Kriterien (Zielkunde, Fit-Kriterien, Disqualifier). Sie sind MASSGEBLICH.
   - "agent.additionalPrompt" = zusaetzliche Anweisungen, falls vorhanden.
   - "writeBack" = erlaubte Werte fuer fitLevel/status und der Score-Bereich.
3. Analysiere den Lead:
   - Website (lead.website) per WebFetch laden; wichtige Unterseiten (Leistungen, Ueber uns, Impressum) bei Bedarf zusaetzlich.
   - Custom Attributes (Google-Rating, Kategorie etc.) einbeziehen.
   - Website nicht erreichbar ist KEIN automatischer Disqualifier — bewerte streng nach den Kampagnen-Kriterien (eine fehlende/schwache Website kann je nach Angebot sogar FUER den Lead sprechen).
4. Bewerte gegen die Kriterien:
   - Trifft ein Disqualifier zu -> fitLevel "not_qualified".
   - Sonst fitLevel nach Staerke des Fits: "mid_qualified" | "qualified" | "highly_qualified".
   - score 0-100 konsistent zum fitLevel (not_qualified: 0-39, mid: 40-59, qualified: 60-79, highly: 80-100).
5. Schreibe das Ergebnis:
   write_lead_details(campaign_id={campaign.id}, lead_id={lead.id}, fields={
     "qualificationStatus": "completed",
     "qualificationFitLevel": "<fitLevel>",
     "score": <int>,
     "qualificationCategory": "<kurze Branchen-/Fit-Kategorie>",
     "qualificationSummary": "<2-4 Saetze: warum dieses fitLevel, welche Kriterien erfuellt/verletzt>",
     "qualificationSnapshotJson": { "criteria_matched": [...], "disqualifiers_hit": [...], "evidence": [{"claim": "...", "source": "<URL>"}] }
   })

## Regeln

- NICHTS ERFINDEN: Jede Behauptung in summary/snapshot braucht eine beobachtete Quelle (Website-Inhalt, Attribut). Unbelegtes weglassen.
- Die Kampagnen-Kriterien schlagen jede eigene Heuristik.
- Deutsch, korrekte Umlaute (Ä/Ö/Ü/ß — niemals AE/OE/UE/ss).
- Antworte am Ende NUR mit: "OK lead={lead.id} fitLevel=<...> score=<...>" oder "FEHLER lead={lead.id}: <Grund>".
```

## Phase 3: Report & naechster Batch

Wie /mcp:generate: Batch-Report (Erfolg/Fehler/Verbleibend), dann erneut `list_leads` bis `remaining == 0`. Fehlgeschlagene Leads bleiben `qualification_status=pending` und tauchen im naechsten Lauf wieder auf — kein automatischer Einzel-Retry.

Abschluss-Report + Hinweis: "Naechster Schritt: /mcp:research — qualifizierte Leads recherchieren".

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| leads[] leer | "Keine unqualifizierten Leads" -> STOP |
| write_lead_details error | Fehler notieren, weiter mit naechstem Lead |
| `lead_run_active` | Parallel laeuft ein Server-Lauf — Batch pausieren, `get_lead_run_status` bis Terminal-Status, dann fortsetzen (Queue ist idempotent) |
| Sub-Agent Timeout/Crash | Als Fehler zaehlen, Lead bleibt in der Queue |
| MCP-Verbindungsfehler | 1x Retry, dann STOP |

## Verwandt

- `/mcp:research` — Research fuer qualifizierte Leads (naechste Phase)
- `/mcp:generate` — AI-Variablen (nach Research)
