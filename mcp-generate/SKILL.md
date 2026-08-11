---
name: mcp-generate
description: Use when user says "mcp:generate", "generiere emails", "email generation", "MCP workflow", "generate emails for campaign", or triggers /mcp:generate.
---

# MCP Generate — AI-Variablen-Generierung

Dieser Skill orchestriert die vollautomatische AI-Variablen-Generierung fuer Leads via MCP Business Tools. Claude generiert AI-Variablen basierend auf Research, Qualification und Screenshots, und speichert sie via `save_lead_variables`. Email-Body und Subject werden NICHT durch diesen Skill erzeugt — sie sind in der Email-Sequenz hardcoded und werden beim CSV-Export live mit den Variablen gerendert. Dieser Skill ist der **Manuell-Modus**; Standard ist der serverseitige Lauf via `mcp-pipeline` (Tool `start_lead_run`, Stufe `email`). Vor dem Start `list_lead_runs(campaign_id, active_only=true)` pruefen: bei aktivem email-Lauf blockt `save_lead_variables` mit `lead_run_active`.

> **Hinweis zur Parallelisierung:** Wenn dein Client parallele Subagents unterstuetzt (z.B. Claude Code), spawne pro Lead einen Subagent wie beschrieben. Andernfalls arbeite die Leads **sequentiell** mit exakt denselben Schritten ab — das Ergebnis ist identisch, nur langsamer.

## Workflow-Uebersicht

```
1. list_campaigns -> Kampagne identifizieren (oder campaign_id aus Argument)
   |
2. list_leads(campaign_id, limit={batch_size})
   -> {batch_size} Leads mit Basisdaten (~0.5 KB/Lead)
   |
3. Fuer jeden Lead: Sub-Agent spawnen (parallel, bis zu {batch_size} gleichzeitig)
   -> Jeder Agent: get_lead_data() -> generiert Variablen -> save_lead_variables()
   |
4. Batch-Report: "Batch 1/N done, X/Y leads processed"
   |
5. Naechster Batch: list_leads erneut (remaining > 0?)
   |
6. Fertig: "Y Leads verarbeitet, Variablen bereit fuer Review"
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp:generate` | Zeigt Kampagnen via list_campaigns, User waehlt |
| `/mcp:generate 76` | Startet direkt fuer Kampagne 76 |
| `generiere emails fuer kampagne 76` | Startet direkt fuer Kampagne 76 |

## Schritt-fuer-Schritt Anleitung

### Phase 1: Kampagne bestimmen

Wenn KEINE campaign_id als Argument uebergeben wurde:

1. Rufe `list_campaigns` auf (MCP Tool)
2. Zeige dem User die Kampagnen mit `leadCounts.needs_email_generation > 0`
3. Frage: "Fuer welche Kampagne soll ich Variablen generieren?"
4. Merke dir die campaign_id

Wenn campaign_id als Argument uebergeben wurde: Direkt zur Batch-Groesse-Abfrage.

**Batch-Groesse abfragen:**

Frage den User:
"Wie viele Leads pro Batch? (Default: 10)"
- 10 (Standard)
- 50 (Schneller, 50 parallele Agents)
- 100 (Aggressiv)
- 200 (Maximum)

Merke dir die Antwort als `{batch_size}`. Wenn der User einfach Enter drueckt oder nichts sagt: `batch_size = 10`.

Dann weiter zu Phase 2.

### Phase 2: Leads laden (Batch)

Rufe auf:
```
list_leads(
  campaign_id = <ID>,
  limit = {batch_size}
)
```

Merke dir aus der Response:
- `campaign.name` und `campaign.id`
- `total` (Gesamtzahl zu verarbeitender Leads)
- `remaining` (verbleibend nach diesem Batch)
- Die `leads[]` mit IDs und Basisdaten

Wenn `leads` leer ist: "Keine Leads zur Verarbeitung. Alle Leads haben bereits generierte Variablen." -> STOP.

### Phase 3: Sub-Agents spawnen (parallel)

Fuer JEDEN Lead im Batch einen Agent spawnen. Verwende das Agent-Tool mit:
- `subagent_type`: nicht gesetzt (general-purpose)
- `mode`: "bypassPermissions"
- `run_in_background`: true (fuer echte Parallelitaet)
- `name`: "gen-{lead.company}" (gekuerzt auf 20 Zeichen)
- `description`: "Generate variables for {lead.company}"

**WICHTIG:** Spawne ALLE Agents eines Batches in EINEM Message-Block, damit sie parallel laufen.

#### Sub-Agent Prompt Template

Fuer jeden Lead den folgenden Prompt zusammenbauen. **Ersetze die Platzhalter** mit den tatsaechlichen Daten aus der list_leads Response:

```
Du generierst AI-Variablen fuer einen Lead via MCP Tools.

KAMPAGNE: {campaign.name} (ID: {campaign.id})
LEAD: {lead.company} (ID: {lead.id})

## Schritte

1. Rufe get_lead_data(campaign_id={campaign.id}, lead_id={lead.id}) auf
2. Lies den emailGeneration.systemPrompt sorgfaeltig — er definiert Ton, Stil und Kontext
3. Analysiere Research, Qualification und Custom Attributes
4. Analysiere die Screenshots visuell (falls URLs vorhanden und dein Client Bilder laden kann)
5. Generiere fuer JEDE Variable in emailGeneration.variables[] den Text gemaess ihrem Prompt
6. REVIEW — Pruefe JEDE generierte Variable gegen diese Checkliste:
   - Umlaute korrekt geschrieben? (Ä/Ö/Ü/ä/ö/ü/ß — NIEMALS AE/OE/UE/ae/oe/ue/ss)
   - Keine internen Metriken erwaehnt? (SEO-Score, Overall-Score, Fit-Level, Need-Flags, Dimension-Scores, Opportunity Score, ranked Keyword)
   - Keine HTTPS/SSL-Behauptungen? ("ohne HTTPS", "kein SSL" etc.)
   - Kein harscher Deficit-Sprech? (ausbaufähig, nicht erreichbar, fehlerhaft, unzureichend, kaum nutzbar, schwach, schlecht)
   - Anrede konsistent ueber alle Variablen? (durchgehend formal ODER team-basiert, nie gemischt)
   - Kein "vorallem"? (korrekt: "vor allem")
   - Keine Leerzeilen am Anfang oder Ende einer Variable?
   - Jede Variable unter 10.000 Zeichen?
   Falls ein Kriterium verletzt: Korrigiere die Variable und pruefe erneut.
7. Speichere via save_lead_variables(campaign_id={campaign.id}, lead_id={lead.id}, variables=JSON-String)

WICHTIG: variables ist ein JSON-STRING. ALLE Variablen aus emailGeneration.expectedOutput muessen enthalten sein.
```

### Phase 4: Screenshot-Handling

Screenshots sind in der `lead.screenshots[]` Liste als relative URLs enthalten (z.B. `/api/research-artifacts/abc-123`), Basis ist die ListM8-Server-URL.

Wenn dein Client Bilder von URLs laden und visuell analysieren kann: Screenshots laden und in die Generierung einbeziehen. Andernfalls: Screenshots ueberspringen und nur auf Basis von Research-Text, Qualification und Custom Attributes generieren — im Report vermerken: "Screenshots nicht einbezogen, Text-basierte Generierung."

### Phase 5: Ergebnisse sammeln & Report

Warte bis ALLE Sub-Agents des Batches fertig sind (sie laufen im Background — du wirst benachrichtigt).

Zaehle:
- Erfolgreiche Generierungen (`save_lead_variables` liefert das unveraenderte Erfolgs-Payload mit `status: "success"`)
- Fehler (`save_lead_variables` liefert ein MCP-Tool-Result mit `isError: true`; der Text beginnt mit einem Code wie `validation_failed:` oder `contact_gate:` — oder der Agent selbst ist fehlgeschlagen)

Zeige Batch-Report:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Batch {batch_nr}/{total_batches} abgeschlossen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verarbeitet: {processed}/{total_leads} Leads
Erfolg: {success_count} | Fehler: {error_count}
Verbleibend: {remaining}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase 6: Naechster Batch oder Abschluss

Wenn `remaining > 0`: Zurueck zu Phase 2 (naechster list_leads Aufruf).

Wenn `remaining == 0` oder keine Leads mehr: Zeige Abschluss-Report:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MCP Generate abgeschlossen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kampagne: {campaign.name} (ID: {campaign.id})
Gesamt verarbeitet: {total_processed} Leads
Erfolg: {total_success} | Fehler: {total_errors}
Status: Verarbeitete Leads auf "pending_review" gesetzt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Naechster Schritt: /mcp:verify — Variablen pruefen und freigeben
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## MCP Tool Reference

### list_campaigns

**Keine Parameter.** Gibt alle Kampagnen des Users zurueck.

Response-Felder:
- `campaigns[].id` — Kampagnen-ID
- `campaigns[].name` — Name
- `campaigns[].leadCounts.needs_email_generation` — Anzahl Leads in der Generierungs-Queue
- `campaigns[].leadCounts.pending_review` — Anzahl Leads mit generierten, noch nicht freigegebenen Variablen
- `campaigns[].leadCounts.approved` / `.rejected` — Final-Status
- `campaigns[].aiVariables[]` — Konfigurierte AI-Variablen (Name + sortOrder)

### list_leads

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `limit` | int | `10` | Anzahl Leads (1-200) |
| `fit_level` | string | `"qualified"` | Qualification-Filter |
| `research_status` | string | `"researched"` | Research-Status-Filter |
| `campaign_status` | string | `"processing"` | Campaign-Status-Filter |
| `qualification_status` | string | `''` | Qualification-Status-Filter: '' (alle), 'pending' (inkl. nie qualifiziert), 'processing', 'completed', 'failed' |

Gibt nur Basisdaten zurueck: id, email, company, website, city, phoneNumber, score, qualification (fitLevel, category, summary).

**WICHTIG:** Der Default `campaign_status="processing"` ist korrekt fuer den Generierungs-Workflow (= Leads mit Status "Ausstehend").

### get_lead_data

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `lead_id` | int | **required** | Lead-ID |

Gibt vollen Generierungs-Context zurueck:
- Stammdaten (email, company, website, city, phoneNumber, score)
- `qualification` (fitLevel, category, summary, snapshot)
- `research` (text, bestEmail, decisionMaker, contactRecommendation)
- `screenshots[]` (type, viewport, url, label)
- `customAttributes` (key-value Paare)
- `emailGeneration.systemPrompt` — Der aufgeloeste System-Prompt
- `emailGeneration.variables[]` — Variablen mit aufgeloesten Prompts
- `emailGeneration.expectedOutput` — JSON-Schema der erwarteten Ausgabe (Variablen-Namen)

### save_lead_variables

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `lead_id` | int | **required** | Lead-ID |
| `variables` | string | **required** | JSON-String mit generierten Werten |

**variables-Format:** `"{\"hallo\": \"...\", \"intro\": \"...\"}"`

Verhalten: Persistiert eine neue `LeadAIVariableValue`-Version pro Variable (vorherige Versionen bleiben als Historie erhalten). Setzt `LeadCampaignStatus.status = pending_review`. Beruehrt KEINE Email-Steps (Body/Subject werden beim CSV-Export live aus den Variablen gerendert).

Success-Response:
```json
{
  "status": "success",
  "lead_id": 456,
  "campaign_id": 123,
  "version": 1,
  "variables_saved": 2,
  "campaign_status": "pending_review"
}
```

Fehler bei fehlenden Variablen: Das MCP-Tool-Result trägt `isError: true`; sein TextContent lautet:

```text
validation_failed: Variable(s) missing from submission: 'intro'
```

Das Tool liefert nur den Text `<lowercase_code>: <message>` und keine strukturierte Fehler-Response. Weitere erwartete Codes sind z.B. `contact_gate`, `variables_not_configured`, `campaign_not_found`, `lead_not_found`, `lead_not_in_campaign` und `insufficient_scope`.

### Verification-Tools (siehe `/mcp:verify`)

Die folgenden Tools werden im Verification-Workflow verwendet, NICHT in der Generierung:

- **get_lead_variables** — laedt aktuelle Variablen-Werte (Name, Wert, Status, generatedAt) zur Pruefung
- **approve_lead_variables** — gibt Variablen frei (`LeadCampaignStatus = approved`, ready fuer CSV-Export)
- **reject_lead_variables** — lehnt Variablen ab mit `reason` (`LeadCampaignStatus = rejected`, vom CSV-Export ausgeschlossen)

Details: siehe `/mcp:verify` Skill.

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| `list_leads` gibt leere leads[] | "Keine Leads in Queue" -> STOP |
| Sub-Agent save_lead_variables Error | Fehler notieren, weitermachen mit naechstem Lead |
| Sub-Agent Timeout/Crash | Als Fehler zaehlen, im Report erwaehnen |
| Alle Agents eines Batches fehlgeschlagen | Warnung ausgeben, User fragen ob fortfahren |
| Netzwerk/MCP-Verbindungsfehler | 1x Retry, dann STOP mit Fehlermeldung |

**Kein automatischer Retry einzelner Leads** — fehlgeschlagene Leads koennen spaeter mit `/mcp:generate` erneut verarbeitet werden (sie haben noch keinen `pending_review`-Status und tauchen wieder in list_leads auf).

## Wichtige Hinweise

1. **Voll autonom** — Keine Rueckfragen waehrend der Generierung. Durchlaufen bis fertig.
2. **{batch_size}er-Batches** — {batch_size} Leads pro Batch (vom User gewaehlt, Default 10, Maximum 200).
3. **Parallel** — Alle Agents eines Batches gleichzeitig spawnen (ein Message-Block).
4. **Idempotent** — Leads mit bereits generierten Variablen tauchen nicht mehr in list_leads (default-filter `campaign_status="processing"`) auf.
5. **Versionierung** — Jeder save_lead_variables-Aufruf erzeugt eine neue Version, aeltere Versionen bleiben als Historie erhalten.
