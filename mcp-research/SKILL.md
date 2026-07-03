---
name: mcp-research
description: Use when user says "mcp:research", "recherchiere leads", "lead research", "research leads", "leads recherchieren", or triggers /mcp:research.
---

# MCP Research — Lead-Research durch Claude-Subagents

Dieser Skill orchestriert das Lead-Research via MCP Business Tools. Claude-Subagents recherchieren jeden Lead (Website, oeffentliche Quellen) nach den Kampagnen-Vorgaben (aus `get_lead_data.researchGeneration`) und schreiben den Report via `write_lead_details` zurueck. Die ListM8-interne Research-Pipeline (OpenRouter/scrape_website) wird NICHT verwendet; entsprechend entstehen keine Screenshot-Artefakte.

> **Hinweis zur Parallelisierung:** Wenn dein Client parallele Subagents unterstuetzt (z.B. Claude Code), spawne pro Lead einen Subagent wie beschrieben. Andernfalls arbeite die Leads **sequentiell** mit exakt denselben Schritten ab — das Ergebnis ist identisch, nur langsamer.

## Workflow-Uebersicht

```
1. list_campaigns -> Kampagne identifizieren (oder campaign_id aus Argument)
   |
2. list_leads(campaign_id, limit={batch_size}, fit_level="qualified",
              research_status="pending", campaign_status="processing")
   -> {batch_size} qualifizierte, unrecherchierte Leads
   |
3. Fuer jeden Lead: Sub-Agent spawnen (parallel)
   -> get_lead_data() -> Research-Vorgaben lesen -> Website/Quellen analysieren
   -> write_lead_details(research=<Report>, bestEmail, decisionMaker, ..., status="researched")
   |
4. Batch-Report -> naechster Batch (Queue idempotent: recherchierte Leads
   fallen aus research_status="pending" heraus)
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp:research` | Zeigt Kampagnen via list_campaigns, User waehlt |
| `/mcp:research 80` | Startet direkt fuer Kampagne 80 |
| `recherchiere leads fuer kampagne 80` | Startet direkt fuer Kampagne 80 |

**Batch-Groesse abfragen** (wie /mcp:generate): Default 10, Optionen 50/100/200.

**Vorbedingung:** Leads sollten qualifiziert sein (`/mcp:qualify` zuerst). Wer bewusst unqualifizierte Leads recherchieren will: `fit_level=""` verwenden.

## Phase 1: Leads laden

```
list_leads(
  campaign_id = <ID>,
  limit = {batch_size},
  fit_level = "qualified",
  research_status = "pending",
  campaign_status = "processing"
)
```

Wenn `leads` leer: "Keine Leads mit ausstehendem Research." -> STOP.

## Phase 2: Sub-Agents spawnen (parallel)

Fuer JEDEN Lead einen Agent spawnen (general-purpose, `run_in_background: true`, alle in EINEM Message-Block, `name`: "res-{lead.company}" gekuerzt).

### Sub-Agent Prompt Template

```
Du recherchierst einen Lead fuer eine Cold-Mailing-Kampagne via MCP Tools.

KAMPAGNE: {campaign.name} (ID: {campaign.id})
LEAD: {lead.company} (ID: {lead.id})

## Schritte

1. Rufe get_lead_data(campaign_id={campaign.id}, lead_id={lead.id}) auf.
2. Lies lead.researchGeneration:
   - "config" = Research-Ziele/Prioritaeten der Kampagne (researchGoals, researchPriorities, additionalPrompt). Sie sind MASSGEBLICH dafuer, WONACH du suchst.
   - "agent.additionalPrompt" = zusaetzliche Anweisungen, falls vorhanden.
3. Recherchiere:
   - Website (lead.website) per WebFetch laden; relevante Unterseiten (Leistungen, Ueber uns, Team, Referenzen, Impressum, Kontakt) gezielt nachladen.
   - WebSearch fuer oeffentliche Signale (Bewertungen, Verzeichniseintraege), wenn die Website wenig hergibt.
   - Qualifizierungs-Kontext (lead.qualification) als Ausgangspunkt nutzen.
4. Extrahiere gemaess den Research-Zielen, typischerweise:
   - Konkrete, verifizierbare Aufhaenger (Spezialisierung, Bewertungen, Projekte, Besonderheiten) fuer die spaetere Personalisierung.
   - Entscheider (Name/Rolle, meist im Impressum/Ueber-uns) und beste Kontakt-E-Mail.
5. Schreibe das Ergebnis:
   write_lead_details(campaign_id={campaign.id}, lead_id={lead.id}, fields={
     "research": "<Markdown-Report: ## Unternehmen, ## Aufhaenger (mit Quellen-URLs), ## Kontakt, ## Besonderheiten>",
     "bestEmail": "<beste gefundene E-Mail oder die vorhandene Lead-E-Mail>",
     "decisionMaker": "<Name, Rolle — nur wenn oeffentlich belegt>",
     "contactRecommendation": "<1-2 Saetze: wen wie ansprechen>",
     "status": "researched"
   })
   Felder ohne belegte Erkenntnis WEGLASSEN (nicht mit Vermutungen fuellen).
   Wenn Website UND Suche nichts hergeben: minimalen Report schreiben (was geprueft wurde,
   was nicht erreichbar war) und trotzdem status="researched" setzen — der Lead soll die
   Queue verlassen; die Bewertung uebernimmt der Review-Schritt.

## Regeln

- NICHTS ERFINDEN: Jede Aussage im Report braucht eine Quelle (URL). "pattern_inferred"-E-Mails explizit als Vermutung kennzeichnen oder weglassen.
- Keine internen Metriken/Scores in den Report-Text.
- Deutsch, korrekte Umlaute (Ä/Ö/Ü/ß — niemals AE/OE/UE/ss).
- Antworte am Ende NUR mit: "OK lead={lead.id} aufhaenger=<kurz>" oder "FEHLER lead={lead.id}: <Grund>".
```

## Phase 3: Report & naechster Batch

Wie /mcp:generate: Batch-Report, dann erneut `list_leads` bis `remaining == 0`. Fehlgeschlagene Leads bleiben `research_status=pending`.

Abschluss-Report + Hinweis: "Naechster Schritt: /mcp:generate — AI-Variablen generieren".

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| leads[] leer | "Keine Leads mit ausstehendem Research" -> STOP |
| write_lead_details error | Fehler notieren, weiter mit naechstem Lead |
| Sub-Agent Timeout/Crash | Als Fehler zaehlen, Lead bleibt in der Queue |
| MCP-Verbindungsfehler | 1x Retry, dann STOP |

## Verwandt

- `/mcp:qualify` — Qualifizierung (vorherige Phase)
- `/mcp:generate` — AI-Variablen (naechste Phase), `/mcp:verify` — Review
