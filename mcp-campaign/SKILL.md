---
name: mcp-campaign
description: Use when user says "mcp:campaign", "erstelle kampagne via mcp", "kampagne per mcp anlegen", "campaign blueprint erstellen", "bearbeite kampagne via mcp", or triggers /mcp:campaign.
---

# MCP Campaign — Kampagnen erstellen & bearbeiten via Blueprint

Dieser Skill erstellt oder bearbeitet vollstaendige, onboarding-aequivalente Kampagnen ueber die MCP-Tools `create_campaign` und `edit_campaign` (Scope `campaigns:write`). Kern ist das **CampaignBlueprint-Schema v1** — Claude baut aus einem Briefing ein vollstaendiges Blueprint mit allen 7 Bausteinen.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp-campaign` | Briefing interaktiv abfragen, dann erstellen |
| `/mcp-campaign <briefing-text oder datei>` | Blueprint aus Briefing bauen, dann erstellen |
| `bearbeite kampagne 80 via mcp: <aenderungswunsch>` | Edit-Flow (Voll-Blueprint-Ersatz) |

## Phase 1: Briefing sammeln

Mindestens klaeren (fehlendes nachfragen, AskUserQuestion):

1. **Angebot/Business**: Was wird verkauft, an wen (Zielgruppe/Branche/Region/Groesse)?
2. **USPs** (2-4 Punkte) und **Tonalitaet** (z.B. locker-direkt vs. formal).
3. **CTA/Offer**: Was ist der konkrete naechste Schritt (z.B. "Website-Vorschau schicken")?
4. **Qualifizierung**: Wer ist ideal, was disqualifiziert?
5. **Research-Fokus**: Wonach soll die Recherche suchen (Aufhaenger-Prioritaeten — steuert sowohl die Manuell-Subagents als auch die serverseitigen Agents)?
6. **Sequenz**: Wie viele Steps (Empfehlung: 3), Abstaende (z.B. 0/3/4 Tage)?

## Phase 2: Blueprint bauen

Struktur (Schema v1 — die vollstaendige Referenz liefert der MCP-Prompt `campaign_blueprint_guide` des ListM8-Servers):

```json
{
  "schemaVersion": 1,
  "campaign": {
    "name": "<3-255 Zeichen, sprechend>",
    "intelligence": {
      "version": 1,
      "campaign_brief": {
        "business": {"value": "...", "source": "answer", "status": "confirmed"},
        "target_audience": {"value": "...", "source": "answer", "status": "confirmed"},
        "usp": {"value": ["..."], "source": "answer", "status": "confirmed"},
        "tone": {"value": "...", "source": "answer", "status": "confirmed"}
      },
      "offer_contract": {
        "title": {"value": "...", "source": "answer", "status": "confirmed"},
        "cta": {"value": "...", "source": "answer", "status": "confirmed"}
      }
    },
    "qualificationSettings": { "idealCustomer": "...", "disqualifiers": "..." },
    "researchAgentConfig": { "researchGoals": "...", "researchDepth": "quick", "researchPriorities": "..." },
    "emailAgentConfig": { "emailLanguage": "Deutsch (DACH)", "emailTone": "..." }
  },
  "aiVariables": [
    {"name": "hallo", "prompt": "<Anrede-Anweisung, min 10 Zeichen>", "sortOrder": 1},
    {"name": "intro", "prompt": "<Lob-Opener-Anweisung mit Research-Prioritaeten>", "sortOrder": 2}
  ],
  "sequence": { "steps": [ {"stepNumber": 1, "subject": "...", "body": "{{ai.hallo}}\n\n{{ai.intro}}\n\n...", "delayDays": 0, "delayUnit": "days"} ] }
}
```

**Pflicht-Regeln (Cold-Mailing-SOP):**
- AI-Variablen `hallo` (Anrede) und `intro` (personalisierter Opener) IMMER anlegen; Namen-Regex `^[a-zA-Z][a-zA-Z0-9_]*$`, Prompt min 10 Zeichen.
- Sequenz-Bodies nutzen `{{ai.hallo}}`/`{{ai.intro}}` + `{{companyName}}`-Platzhalter; Step 1 `delayDays: 0`.
- `agentKey` in den Configs WEGLASSEN, ausser der User nennt explizit einen bestehenden Agenten (Referenz + Fallback: ohne Key greifen System-Defaults; unbekannte Keys → VALIDATION_FAILED).
- Max 50 Variablen, max 25 Steps, Blueprint < 256 KB.

Blueprint dem User zur Bestaetigung zeigen (kompakt: Name, Variablen, Step-Betreffs, Kriterien), DANN erstellen.

## Phase 3: Erstellen / Bearbeiten

**Neu:** `create_campaign(blueprint=<object>)` → Response enthaelt `campaign_id`, `imported` (steps/variables/intelligence/configs). Kampagne startet als `draft`.

**Bearbeiten:** `edit_campaign(campaign_id=<id>, blueprint=<object>, confirm_overwrite=true)` — **Replace-all**: Immer das KOMPLETTE Ziel-Blueprint senden, nie nur die Aenderung. Bei bestehender Kampagne zuerst den Ist-Stand holen (UI-Export oder `GET /campaigns/{id}/blueprint/export`), anpassen, komplett zuruecksenden. Ohne `confirm_overwrite` → `CONFIRM_OVERWRITE_REQUIRED` (Schutz).

## Fehlerbehandlung

| Code | Aktion |
|------|--------|
| `VALIDATION_FAILED` | Fehlerliste lesen, Blueprint korrigieren, erneut senden |
| `LIMIT_REACHED` | User informieren (MAX_CAMPAIGNS bzw. Variablen-/Step-Plan-Limit) |
| `CONFIRM_OVERWRITE_REQUIRED` | User fragen, ob ueberschreiben, dann confirm_overwrite=true |
| `CAMPAIGN_NOT_FOUND` | campaign_id pruefen (list_campaigns) |

## Abschluss

Report: campaign_id, Name, importierte Steps/Variablen/Configs. Hinweis: "Naechster Schritt: /mcp-import — Leads in die Kampagne laden."

## Verwandt

- `/mcp-import` (Leads laden), `/mcp-pipeline` (Qualify→Research→Generate)
- die Tool-Beschreibungen des MCP-Servers
