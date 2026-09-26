---
name: outreach-research
description: Use when user says "outreach:research", "mcp:research", "recherchiere leads", "lead research", "research leads", "leads recherchieren", or triggers /mcp:research.
---

# MCP Research — Lead-Research durch Claude-Subagents

Dieser Skill orchestriert das Lead-Research via MCP Business Tools. Claude-Subagents recherchieren jeden Lead (Website, oeffentliche Quellen) nach den Kampagnen-Vorgaben (aus `get_lead_data.researchGeneration`) und schreiben den Report via `write_lead_details` zurueck. Die serverseitige Research-Pipeline (OpenRouter, serverseitiges Website-Scraping) wird dabei bewusst NICHT verwendet — dieser Skill ist der **Manuell-Modus** (eigenes Modell/eigene Quellen); entsprechend entstehen keine Screenshot-Artefakte. Der serverseitige Lauf (`/outreach-pipeline`, Tool `start_lead_run`) erzeugt sie dagegen — wer Screenshots fuer die Variablen-Generierung will, nimmt den Lauf. Vor dem Start `list_lead_runs(campaign_id, active_only=true)` pruefen: bei aktivem Lauf mit Research- ODER Qualifizierungs-Stufe blockt `write_lead_details` mit `lead_run_active`.

> **Hinweis zur Parallelisierung:** Wenn dein Client parallele Subagents unterstuetzt (z.B. Claude Code), spawne pro Lead einen Subagent wie beschrieben. Andernfalls arbeite die Leads **sequentiell** mit exakt denselben Schritten ab — das Ergebnis ist identisch, nur langsamer.

## Websitehinweise und gespeicherte Sperren getrennt halten

Vor dem Workflow `get_context()` und `get_agent(stage="researcher", campaign_id=…, include_rules=true)` prüfen. Allgemeine Hinweise gegen Werbung in Website, Impressum oder AGB nur informativ mit Quelle im Report erfassen. Sie allein begründen weder Score-Abwertung noch fachliches `not_qualified` oder das Unterdrücken weiterer Research. Sie niemals in `contact_status`/`do_not_contact` umdeuten. Echte gespeicherte DNC-/Abmelde-/Kundensperren bleiben verbindlich; nicht entsperren. Opt-in, rechtliche Prüfung und Versandentscheidung liegen beim Kunden, nicht in der Research-Klassifizierung.

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
| `/outreach-research` | Zeigt Kampagnen via list_campaigns, User waehlt |
| `/outreach-research 80` | Startet direkt fuer Kampagne 80 |
| `recherchiere leads fuer kampagne 80` | Startet direkt fuer Kampagne 80 |

**Batch-Groesse abfragen** (wie /outreach-generate): Default 10, Optionen 50/100/200.

**Vorbedingung:** Leads sollten qualifiziert sein (`/outreach-qualify` zuerst). Wer bewusst unqualifizierte Leads recherchieren will: `fit_level=""` verwenden.

## Phase 0: Vorpruefung — kein paralleler Server-Lauf

`list_lead_runs(campaign_id, active_only=true)` aufrufen. Ist ein serverseitiger Lauf aktiv, der Research ODER Qualifizierung abdeckt, lehnt `write_lead_details` jeden Schreibvorgang mit `lead_run_active` ab (Rennschutz — das Tool prueft beide Stufen gemeinsam). Dann: auf den Terminal-Status warten (`get_lead_run_status`) oder den Lauf nach Ruecksprache mit `cancel_lead_run` stoppen — NICHT parallel losarbeiten.

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
   - Entscheider (Name/Rolle, meist im Impressum/Ueber-uns) und die Adresse, ueber die die Entscheidungsperson am wahrscheinlichsten erreicht wird (Regel in Schritt 5).
5. Schreibe das Ergebnis:
   write_lead_details(campaign_id={campaign.id}, lead_id={lead.id}, fields={
     "research": "<Markdown-Report: ## Unternehmen, ## Aufhaenger (mit Quellen-URLs), ## Kontakt, ## Besonderheiten>",
     "bestEmail": "<gewaehlte Versandadresse nach der Regel unten>",
     "decisionMaker": "<Name, Rolle — nur wenn oeffentlich belegt>",
     "contactRecommendation": "<1-2 Saetze: wen wie ansprechen>",
     "status": "researched"
   })
   Felder ohne belegte Erkenntnis WEGLASSEN (nicht mit Vermutungen fuellen).
   `bestEmail` ist verbindlich: Eine gueltige Adresse wird die Versandadresse, auch wenn
   zugleich ein `contactProfileJson` andere Adressen nennt. Gewaehlt wird die Adresse, ueber
   die die Entscheidungsperson am wahrscheinlichsten erreicht wird: belegte persoenliche
   Adresse der Entscheidungsperson vor Funktionsadresse (vertrieb@, geschaeftsfuehrung@) vor
   allgemeiner Adresse (info@, kontakt@). Nur Adressen mit Fundstelle; nie eine aus Vor- und
   Nachname geratene, nie eine als unzustellbar bekannte (Bounce, Pruefergebnis `invalid`),
   nie Platzhalter wie "null". Ohne belegte Adresse `bestEmail` weglassen.
   Steht `bestEmail` danach in `skipped_fields`, nennt `skipped_reasons.bestEmail` den Grund:
   - `user_choice`: Ein Mensch hat die Versandadresse gewaehlt. Die Wahl gilt: nicht erneut
     schreiben, nicht selbst per `switch_primary_email` aendern, im Report vermerken.
   - `undeliverable`: Die Adresse ist als unzustellbar (`invalid`) geprueft oder nur eine
     Vermutung ohne gueltige Pruefung; sie wird nicht Versandadresse (Grund in `warnings`).
     Eine andere belegte, erreichbare Adresse der Entscheidungsperson nach der Rangfolge oben
     suchen und einmal nur mit `bestEmail` neu schreiben. Gibt es keine, `bestEmail` weglassen
     und die Wahl der Anreicherung ueberlassen; im Report vermerken.
   Ein Platzhalter-Entscheider ("unbekannt", "n/a") landet ebenfalls in `skipped_fields`.
   Wenn Website UND Suche nichts hergeben: minimalen Report schreiben (was geprueft wurde,
   was nicht erreichbar war) und trotzdem status="researched" setzen — der Lead soll die
   Queue verlassen; die Bewertung uebernimmt der Review-Schritt.

## Regeln

- NICHTS ERFINDEN: Jede Aussage im Report braucht eine Quelle (URL). "pattern_inferred"-E-Mails explizit als Vermutung kennzeichnen oder weglassen, nie als `bestEmail` schreiben.
- Keine internen Metriken/Scores in den Report-Text.
- Allgemeine Website-/Impressums-Werbehinweise ausschließlich als Information mit Quelle dokumentieren. Dadurch allein keinen Score/Fit abwerten, Research unterdrücken oder internen DNC-/Abmeldestatus setzen. Echte gespeicherte Sperren erhalten; Opt-in und Versandentscheidung bleiben beim Kunden.
- Deutsch, korrekte Umlaute (Ä/Ö/Ü/ß — niemals AE/OE/UE/ss).
- Antworte am Ende NUR mit: "OK lead={lead.id} aufhaenger=<kurz>" oder "FEHLER lead={lead.id}: <Grund>".
```

## Phase 3: Report & naechster Batch

Wie /outreach-generate: Batch-Report, dann erneut `list_leads` bis `remaining == 0`. Fehlgeschlagene Leads bleiben `research_status=pending`.

Abschluss-Report + Hinweis: "Naechster Schritt: /outreach-generate — AI-Variablen generieren".

## Versandadresse auf Wunsch des Users wechseln

`switch_primary_email(campaign_id, lead_id, email, reason?)` macht eine Adresse, die schon am Lead steht (`get_lead_data`: `lead.email`, `research.bestEmail`, Zweitadressen, `research.contactProfile`), zur Versandadresse und markiert sie als Menschenwahl. Nur auf ausdrueckliche Entscheidung des Users aufrufen, nie aus einem Sub-Agent und nie, um eine gerade recherchierte Adresse "aufzuraeumen". Eine als unzustellbar (`invalid`) gepruefte Adresse lehnt das Tool mit `undeliverable_address` ab (REST: HTTP 422), auch auf Wunsch; dann dem User eine andere erreichbare Adresse der Entscheidungsperson vorschlagen. `unknown_address` nennt die waehlbaren Adressen; bei `address_conflict` versendet schon ein anderer Lead an diese Adresse, die beiden Leads zusammenfuehren statt doppelt zu schreiben.

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| leads[] leer | "Keine Leads mit ausstehendem Research" -> STOP |
| `validation_failed` bei write_lead_details (z. B. ungueltige E-Mail oder Website) | Feld aus dem Text korrigieren oder weglassen und einmal neu schreiben; klappt es nicht, Lead als Fehler notieren und weiter. Kein Verbindungsfehler, NIE den Batch stoppen |
| write_lead_details error (sonstiger Code) | Fehler notieren, weiter mit naechstem Lead |
| `bestEmail` in `skipped_fields` | Kein Fehler: `skipped_reasons.bestEmail` lesen. `user_choice` respektieren; bei `undeliverable` eine andere belegte, erreichbare Adresse schreiben oder weglassen (Schritt 5) |
| `lead_run_active` | Parallel laeuft ein Server-Lauf — Batch pausieren, `get_lead_run_status` bis Terminal-Status, dann fortsetzen (Queue ist idempotent) |
| Sub-Agent Timeout/Crash | Als Fehler zaehlen, Lead bleibt in der Queue |
| MCP-Verbindungsfehler (JSON-RPC-Fehler ohne Tool-Ergebnis, Transport weg) | 1x Retry, dann STOP |

## Verwandt

- `/outreach-qualify` — Qualifizierung (vorherige Phase)
- `/outreach-generate` — AI-Variablen (naechste Phase), `/outreach-verify` — Review
