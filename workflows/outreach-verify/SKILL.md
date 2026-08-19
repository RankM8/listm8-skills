---
name: outreach-verify
description: Use when user says "outreach:verify", "mcp:verify", "verify emails", "email verification", "pruefe emails", "email review", "emails pruefen", or triggers /mcp:verify.
---

# MCP Verify — AI-Variablen-Review

Dieser Skill orchestriert den automatischen Review von AI-generierten Variablen via MCP Business Tools. Claude reviewt jede Variable, gibt qualifizierte Variablen frei (`approve_lead_variables`) oder lehnt unbrauchbare ab (`reject_lead_variables`).

> **Hinweis zur Parallelisierung:** Wenn dein Client parallele Subagents unterstuetzt (z.B. Claude Code), spawne pro Lead einen Subagent wie beschrieben. Andernfalls arbeite die Leads **sequentiell** mit exakt denselben Schritten ab — das Ergebnis ist identisch, nur langsamer.

> **Wichtig:** Reviewt werden die **AI-Variablen-Werte** (z.B. `hallo`, `intro`), NICHT der Email-Body. Der Email-Body ist in der Email-Sequenz hardcoded und wird beim CSV-Export live mit den Variablen gerendert. Falls Variablen unbrauchbar sind, gibt es **keine Inline-Korrektur** — entweder approve, reject mit Begruendung, oder neu generieren via `/mcp:generate` bzw. `save_lead_variables`.

## Workflow-Uebersicht

```
1. list_campaigns -> Kampagne identifizieren (oder campaign_id aus Argument)
   |
2. list_leads(campaign_id, campaign_status="pending_review", fit_level="", research_status="", limit={batch_size})
   -> Leads mit generierten, noch nicht freigegebenen Variablen
   |
3. Fuer jeden Lead: Sub-Agent spawnen (parallel, bis zu {batch_size} gleichzeitig)
   -> Jeder Agent: get_lead_variables() -> Review -> approve_lead_variables() oder reject_lead_variables()
   |
4. Batch-Report: "Batch 1/N done, X approved, Y rejected"
   |
5. Naechster Batch: list_leads erneut (remaining > 0?)
   |
6. Fertig: Abschluss-Report
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/mcp:verify` | Zeigt Kampagnen via list_campaigns, User waehlt |
| `/mcp:verify 76` | Startet direkt fuer Kampagne 76 |
| `pruefe emails fuer kampagne 76` | Startet direkt fuer Kampagne 76 |

## Schritt-fuer-Schritt Anleitung

### Phase 1: Kampagne bestimmen

Wenn KEINE campaign_id als Argument uebergeben wurde:

1. Rufe `list_campaigns` auf (MCP Tool)
2. Zeige dem User die Kampagnen mit `leadCounts.pending_review > 0`
3. Frage: "Fuer welche Kampagne soll ich Variablen reviewen?"
4. Merke dir die campaign_id
5. Vorpruefung: `list_lead_runs(campaign_id, active_only=true)` — solange ein serverseitiger Lauf mit E-Mail-Stufe aktiv ist, lehnen `approve_lead_variables`/`reject_lead_variables` mit `lead_run_active` ab (Rennschutz). Erst nach dem Terminal-Status des Laufs reviewen.

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
  campaign_status = "pending_review",
  fit_level = "",
  research_status = "",
  limit = {batch_size}
)
```

**WICHTIG:** `campaign_status="pending_review"` filtert auf Leads mit generierten, noch nicht freigegebenen Variablen. `fit_level=""` und `research_status=""` MUESSEN explizit gesetzt werden — die Defaults (`qualified`/`researched`) filtern sonst still mit, und pending_review-Leads aus Server-Runs ohne eigene Qualifizierung/Research tauchen NIE im Review auf ("Keine Leads zur Review" trotz pending_review > 0 in list_campaigns).

Merke dir aus der Response:
- `campaign.name` und `campaign.id`
- `total` (Gesamtzahl zu reviewender Leads)
- `remaining` (verbleibend nach diesem Batch)
- Die `leads[]` mit IDs und Basisdaten

Wenn `leads` leer ist: "Keine Leads zur Review. Alle Leads sind bereits freigegeben oder abgelehnt." -> STOP.

### Phase 3: Sub-Agents spawnen (parallel)

Fuer JEDEN Lead im Batch einen Agent spawnen. Verwende das Agent-Tool mit:
- `subagent_type`: nicht gesetzt (general-purpose)
- `mode`: "bypassPermissions"
- `run_in_background`: true (fuer echte Parallelitaet)
- `name`: "verify-{lead.company}" (gekuerzt auf 20 Zeichen)
- `description`: "Review variables for {lead.company}"

**WICHTIG:** Spawne ALLE Agents eines Batches in EINEM Message-Block, damit sie parallel laufen.

#### Sub-Agent Prompt Template

Fuer jeden Lead den folgenden Prompt zusammenbauen. **Ersetze die Platzhalter** mit den tatsaechlichen Daten aus der list_leads Response:

```
Du reviewst AI-generierte Variablen fuer einen Lead via MCP Tools.

KAMPAGNE: {campaign.name} (ID: {campaign.id})
LEAD: {lead.company} (ID: {lead.id})
LEAD EMAIL: {lead.email}
LEAD WEBSITE: {lead.website}

## Schritte

1. Rufe get_lead_variables(campaign_id={campaign.id}, lead_id={lead.id}) auf
2. Lies JEDE Variable in variables[] sorgfaeltig (name + value)
3. Pruefe Research-Daten und Lead-Stammdaten fuer Kontext
4. REVIEW — Pruefe JEDE Variable gegen die Verification-Checkliste (siehe unten)
5. ENTSCHEIDUNG (binaer):
   a) ALLE Variablen OK -> approve_lead_variables(campaign_id={campaign.id}, lead_id={lead.id})
   b) MINDESTENS EINE Variable unbrauchbar -> reject_lead_variables(campaign_id={campaign.id}, lead_id={lead.id}, reason="...")

## Verification-Checkliste (pro Variable)

Pruefe JEDE Variable gegen ALLE folgenden Kriterien:

### Personalisierung
- [ ] Bezug zu Research/Website erkennbar? (nicht generisch)
- [ ] Informationen stimmen mit Lead-Daten ueberein? (Company, Website, Branche, Stadt)

### Sprache & Stil
- [ ] Umlaute korrekt? (echte Ä/Ö/Ü/ä/ö/ü/ß, nicht AE/OE/UE/ae/oe/ue/ss)
- [ ] Kein "vorallem"? (korrekt: "vor allem")
- [ ] Anrede konsistent zwischen allen Variablen? (durchgehend formal ODER team-basiert, nie gemischt)
- [ ] Laenge angemessen? (nicht zu kurz, nicht zu lang)
- [ ] Keine Leerzeilen am Anfang oder Ende?
- [ ] Keine M-dashes? (nur normale Bindestriche -)

### Inhaltliche Korrektheit
- [ ] Keine internen Metriken erwaehnt? (SEO-Score, Overall-Score, Fit-Level, Need-Flags, Dimension-Scores, Opportunity Score, ranked Keywords)
- [ ] Keine HTTPS/SSL-Behauptungen? ("ohne HTTPS", "kein SSL" — selbst wenn die Website nur http erreichbar ist)
- [ ] Kein harscher Deficit-Sprech? (ausbaufaehig, nicht erreichbar, fehlerhaft, unzureichend, kaum nutzbar, schwach, schlecht)
- [ ] Faktisch korrekt? (keine erfundenen Findings, keine vermeintlichen "Probleme" die nicht existieren)

### Technisch
- [ ] Variable hat Status "success" (nicht "error" oder "skipped")
- [ ] Inhalt ist nicht leer

## Entscheidungslogik

- **approve_lead_variables**: ALLE Variablen passen die Checkliste → freigegeben fuer CSV-Export
- **reject_lead_variables(reason=...)**: MINDESTENS EINE Variable bricht die Checkliste oder ist grundlegend unbrauchbar:
  - Komplett generischer Text (kein Personalisierungs-Bezug)
  - Falsche Lead-Informationen (falsches Unternehmen, falsche Branche)
  - Interne Metriken im Text (Score-Werte, Fit-Level etc.)
  - Erfundene Findings, die nicht in der Research stehen
  - Anrede-Mix oder andere Style-Bruch
  - Falsche HTTPS/SSL-Behauptungen

`reason` muss konkret sein (nennt die problematische Variable + den Defekt), damit beim Re-Generate via `/mcp:generate` oder `save_lead_variables` der Fehler vermieden werden kann.

Gib am Ende eine kurze Zusammenfassung zurueck:
- Entscheidung: approved / rejected
- Bei rejection: welche Variable + warum
```

### Phase 4: Ergebnisse sammeln & Report

Warte bis ALLE Sub-Agents des Batches fertig sind (sie laufen im Background — du wirst benachrichtigt).

Zaehle:
- Freigegeben (approve_lead_variables erfolgreich)
- Abgelehnt (reject_lead_variables erfolgreich)
- Fehler (Agent-Fehler oder Tool-Fehler)

Zeige Batch-Report:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Batch {batch_nr}/{total_batches} abgeschlossen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verarbeitet: {processed}/{total_leads} Leads
Freigegeben: {approved_count} | Abgelehnt: {rejected_count} | Fehler: {error_count}
Verbleibend: {remaining}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase 5: Naechster Batch oder Abschluss

Wenn `remaining > 0`: Zurueck zu Phase 2 (naechster list_leads Aufruf).

Wenn `remaining == 0` oder keine Leads mehr: Zeige Abschluss-Report:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MCP Verify abgeschlossen
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kampagne: {campaign.name} (ID: {campaign.id})
Gesamt verarbeitet: {total_processed} Leads
Freigegeben: {total_approved} | Abgelehnt: {total_rejected} | Fehler: {total_errors}
Status: Freigegebene Leads auf "approved" gesetzt (ready fuer CSV-Export)
        Abgelehnte Leads auf "rejected" gesetzt (nicht im Export; siehe Hinweis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**WICHTIG — "rejected" ist NICHT final:** Ein rejected-Lead zaehlt als generierungsbeduerftig — der naechste E-Mail-Run bzw. Re-Generate erzeugt neue Variablen und setzt ihn zurueck auf pending_review (der `reason` fliesst in die Neu-Generierung ein). Soll ein Lead DAUERHAFT raus: aus der Kampagne entfernen oder `mark_leads_contacted(emails=[...], status="do_not_contact")` setzen — dann wird er global von allen AI-Jobs und Exporten ausgeschlossen.

## MCP Tool Reference

### list_campaigns

**Keine Parameter.** Gibt alle Kampagnen des Users zurueck.

Response-Felder:
- `campaigns[].id` — Kampagnen-ID
- `campaigns[].name` — Name
- `campaigns[].leadCounts.pending_review` — Anzahl Leads zur Review
- `campaigns[].leadCounts.approved` / `.rejected` — Final-Status-Zaehler

### list_leads

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `limit` | int | `10` | Anzahl Leads (1-200) |
| `campaign_status` | string | `"processing"` | Campaign-Status-Filter |

**WICHTIG:** Fuer den Verify-Workflow immer `campaign_status="pending_review"` verwenden!

### get_lead_variables

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `lead_id` | int | **required** | Lead-ID |

Gibt zurueck:
- `campaign` (id, name)
- `lead` (id, email, company, website, score, qualification, research)
- `version` — aktuelle Variablen-Version
- `variables[]` — Array mit:
  - `name` — Variablen-Name (z.B. "hallo", "intro")
  - `value` — der generierte Text
  - `status` — "success", "error", "skipped"
  - `errorMessage` — bei status=error
  - `generatedAt` — ISO-Timestamp
- `totalVariables` — Anzahl Variablen

### approve_lead_variables

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `lead_id` | int | **required** | Lead-ID |

Setzt `LeadCampaignStatus.status = approved`. Voraussetzung: mindestens eine `LeadAIVariableValue` muss existieren — sonst `error`.

Success-Response:
```json
{
  "status": "success",
  "lead_id": 456,
  "campaign_id": 123,
  "variables_approved": 2,
  "campaign_status": "approved"
}
```

### reject_lead_variables

| Parameter | Typ | Default | Beschreibung |
|-----------|-----|---------|--------------|
| `campaign_id` | int | **required** | Kampagnen-ID |
| `lead_id` | int | **required** | Lead-ID |
| `reason` | string | **required** | Ablehnungsgrund (non-empty) |

Setzt `LeadCampaignStatus.status = rejected`. `reason` wird im Logger-Audit-Trail persistiert (info-level: leadId, campaignId, userId, reason). Wirft `error` bei leerem `reason`.

Success-Response:
```json
{
  "status": "success",
  "lead_id": 456,
  "campaign_id": 123,
  "variables_rejected": 2,
  "reason": "Variable 'intro' enthaelt erfundene HTTPS-Behauptung",
  "campaign_status": "rejected"
}
```

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| `list_leads` gibt leere leads[] | "Keine Leads zur Review" -> STOP |
| Sub-Agent approve/reject Error | Fehler notieren, weitermachen mit naechstem Lead |
| `lead_run_active` | Parallel laeuft ein Server-Lauf mit E-Mail-Stufe — Review pausieren, `get_lead_run_status` bis Terminal-Status, dann fortsetzen |
| Sub-Agent Timeout/Crash | Als Fehler zaehlen, im Report erwaehnen |
| Alle Agents eines Batches fehlgeschlagen | Warnung ausgeben, User fragen ob fortfahren |
| Netzwerk/MCP-Verbindungsfehler | 1x Retry, dann STOP mit Fehlermeldung |

**Kein automatischer Retry einzelner Leads** — fehlgeschlagene Leads koennen spaeter mit `/mcp:verify` erneut verarbeitet werden (sie behalten den Status `pending_review` und tauchen wieder in list_leads auf).

## Wichtige Hinweise

1. **Voll autonom** — Keine Rueckfragen waehrend der Review. Durchlaufen bis fertig.
2. **{batch_size}er-Batches** — {batch_size} Leads pro Batch (vom User gewaehlt, Default 10, Maximum 200).
3. **Parallel** — Alle Agents eines Batches gleichzeitig spawnen (ein Message-Block).
4. **Idempotent** — Freigegebene/abgelehnte Leads tauchen nicht mehr in list_leads(`pending_review`) auf.
5. **Binaere Entscheidung** — Approve oder Reject. Keine Inline-Korrektur. Fuer Korrekturen: re-generate via `/mcp:generate` oder `save_lead_variables`.
6. **Audit-Trail** — Reject-Reasons werden via Logger persistiert (siehe `RejectLeadVariablesTool`).
