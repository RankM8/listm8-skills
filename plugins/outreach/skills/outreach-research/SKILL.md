---
name: outreach-research
description: Use when user says "outreach:research", "mcp:research", "recherchiere leads", "lead research", "research leads", "leads recherchieren", or triggers /mcp:research.
---

# MCP Research — Lead-Research durch Claude-Subagents

Dieser Skill orchestriert das Lead-Research via MCP Business Tools. Claude-Subagents recherchieren jeden Lead (Website, öffentliche Quellen) nach den Kampagnen-Vorgaben (aus `get_lead_data.researchGeneration`) und schreiben den Report via `write_lead_details` zurück. Die serverseitige Research-Pipeline (OpenRouter, serverseitiges Website-Scraping) wird dabei bewusst NICHT verwendet — dieser Skill ist der **Manuell-Modus** (eigenes Modell/eigene Quellen); entsprechend entstehen keine Screenshot-Artefakte. Der serverseitige Lauf (`/outreach-pipeline`, Tool `start_lead_run`) erzeugt sie dagegen. Vor dem Start `list_lead_runs(campaign_id, active_only=true)` prüfen: bei aktivem Lauf mit Research- ODER Qualifizierungs-Stufe blockt `write_lead_details` mit `lead_run_active`.

> **Hinweis zur Parallelisierung:** Wenn dein Client parallele Subagents unterstützt (z.B. Claude Code), spawne pro Lead einen Subagent wie beschrieben. Andernfalls arbeite die Leads **sequentiell** mit exakt denselben Schritten ab — das Ergebnis ist identisch, nur langsamer.

## Websitehinweise und gespeicherte Sperren getrennt halten

Vor dem Workflow `ping` und `list_campaigns` mit dem Auftrag abgleichen. Allgemeine Hinweise gegen Werbung in Website, Impressum oder AGB nur informativ mit Quelle im Report erfassen. Sie allein begründen weder Score-Abwertung noch fachliches `not_qualified` oder das Unterdrücken weiterer Research. Sie niemals in einen Kontaktstatus (`do_not_contact`) umdeuten. Echte gespeicherte Kontaktstatus bleiben verbindlich; nicht entsperren. Opt-in, rechtliche Prüfung und Versandentscheidung liegen beim Kunden, nicht in der Research-Klassifizierung.

## Workflow-Übersicht

```
1. list_campaigns -> Kampagne identifizieren (oder campaign_id aus Argument)
   |
2. list_leads(campaign_id, limit={batch_size}, fit_level="qualified",
              research_status="pending", campaign_status="processing")
   -> {batch_size} qualifizierte, unrecherchierte Leads
   |
3. Für jeden Lead: Sub-Agent spawnen (parallel)
   -> get_lead_data() -> Research-Vorgaben lesen -> Website/Quellen analysieren
   -> write_lead_details(research=<Report>, bestEmail, decisionMaker, ..., status="researched")
   |
4. Batch-Report -> nächster Batch (Queue idempotent: recherchierte Leads
   fallen aus research_status="pending" heraus)
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-research` | Zeigt Kampagnen via list_campaigns, User wählt |
| `/outreach-research 80` | Startet direkt für Kampagne 80 |
| `recherchiere leads für kampagne 80` | Startet direkt für Kampagne 80 |

**Batch-Größe abfragen** (wie /outreach-generate): Default 10, Optionen 50/100/200.

**Vorbedingung:** Leads sollten qualifiziert sein (`/outreach-qualify` zuerst). Wer bewusst unqualifizierte Leads recherchieren will: `fit_level=""` verwenden.

## Phase 0: Vorprüfung — kein paralleler Server-Lauf

`list_lead_runs(campaign_id, active_only=true)` aufrufen. Ist ein serverseitiger Lauf aktiv, der Research ODER Qualifizierung abdeckt, lehnt `write_lead_details` jeden Schreibvorgang mit `lead_run_active` ab (Rennschutz — das Tool prüft beide Stufen gemeinsam). Dann: auf den Terminal-Status warten (`get_lead_run_status`) oder den Lauf nach Rücksprache mit `cancel_lead_run` stoppen — NICHT parallel losarbeiten.

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

Für JEDEN Lead einen Agent spawnen (general-purpose, `run_in_background: true`, alle in EINEM Message-Block, `name`: "res-{lead.company}" gekürzt).

### Sub-Agent Prompt Template

```
Du recherchierst einen Lead für eine Cold-Mailing-Kampagne via MCP Tools.

KAMPAGNE: {campaign.name} (ID: {campaign.id})
LEAD: {lead.company} (ID: {lead.id})

## Schritte

1. Rufe get_lead_data(campaign_id={campaign.id}, lead_id={lead.id}) auf.
2. Lies lead.researchGeneration:
   - "config" = Research-Ziele/Prioritäten der Kampagne (researchGoals, researchPriorities, additionalPrompt). Sie sind MASSGEBLICH dafür, WONACH du suchst.
   - "agent.additionalPrompt" = zusätzliche Anweisung des Research-Agents; ein "config.additionalPrompt" der Kampagne ergänzt sie, beide gelten.
3. Recherchiere:
   - Website (lead.website) per WebFetch laden; relevante Unterseiten (Leistungen, Über uns, Team, Referenzen, Impressum, Kontakt) gezielt nachladen.
   - WebSearch für öffentliche Signale (Bewertungen, Verzeichniseinträge), wenn die Website wenig hergibt.
   - Qualifizierungs-Kontext (lead.qualification) als Ausgangspunkt nutzen.
4. Extrahiere gemäß den Research-Zielen, typischerweise:
   - Konkrete, verifizierbare Aufhänger (Spezialisierung, Bewertungen, Projekte, Besonderheiten) für die spätere Personalisierung.
   - Entscheider (Name/Rolle, meist im Impressum/Über-uns) und die Adresse, über die die Entscheidungsperson am wahrscheinlichsten erreicht wird (Regel in Schritt 5).
5. Schreibe das Ergebnis:
   write_lead_details(campaign_id={campaign.id}, lead_id={lead.id}, fields={
     "research": "<Markdown-Report: ## Unternehmen, ## Aufhänger (mit Quellen-URLs), ## Kontakt, ## Besonderheiten>",
     "bestEmail": "<gewählte Versandadresse nach der Regel unten>",
     "decisionMaker": "<Name, Rolle — nur wenn öffentlich belegt>",
     "contactRecommendation": "<1-2 Sätze: wen wie ansprechen>",
     "status": "researched"
   })
   Felder ohne belegte Erkenntnis WEGLASSEN (nicht mit Vermutungen füllen).
   `bestEmail` ist die gewählte Versandadresse. Gewählt wird die Adresse, über die die
   Entscheidungsperson am wahrscheinlichsten erreicht wird: belegte persönliche Adresse der
   Entscheidungsperson vor Funktionsadresse (vertrieb@, geschäftsführung@) vor allgemeiner
   Adresse (info@, kontakt@). Nur Adressen mit Fundstelle; nie eine aus Vor- und Nachname
   geratene, nie eine als unzustellbar bekannte (Bounce), nie Platzhalter wie "null". Ohne
   belegte Adresse `bestEmail` weglassen.
   Steht `bestEmail` danach in `skipped_fields`, hat ein Mensch die Versandadresse schon
   gewählt (Text in `warnings`). Die Wahl gilt: nicht erneut schreiben, nicht selbst per
   `switch_primary_email` ändern, im Report vermerken.
   Keinen Platzhalter-Entscheider ("unbekannt", "n/a") schreiben — Feld weglassen.
   Wenn Website UND Suche nichts hergeben: minimalen Report schreiben (was geprüft wurde,
   was nicht erreichbar war) und trotzdem status="researched" setzen — der Lead soll die
   Queue verlassen; die Bewertung übernimmt der Review-Schritt.

## Regeln

- NICHTS ERFINDEN: Jede Aussage im Report braucht eine Quelle (URL). Aus dem Namen abgeleitete Adressen (Muster) explizit als Vermutung kennzeichnen oder weglassen, nie als `bestEmail` schreiben.
- Keine internen Metriken/Scores in den Report-Text.
- Allgemeine Website-/Impressums-Werbehinweise ausschließlich als Information mit Quelle dokumentieren. Dadurch allein keinen Score/Fit abwerten, Research unterdrücken oder einen Kontaktstatus setzen. Echte gespeicherte Sperren erhalten; Opt-in und Versandentscheidung bleiben beim Kunden.
- Deutsch, korrekte Umlaute (Ä/Ö/Ü/ß — niemals AE/OE/UE/ss).
- Antworte am Ende NUR mit: "OK lead={lead.id} aufhänger=<kurz>" oder "FEHLER lead={lead.id}: <Grund>".
```

## Phase 3: Report & nächster Batch

Wie /outreach-generate: Batch-Report, dann erneut `list_leads` bis `remaining == 0`. Fehlgeschlagene Leads bleiben `research_status=pending`.

Abschluss-Report + Hinweis: "Nächster Schritt: /outreach-generate — AI-Variablen generieren".

## Versandadresse auf Wunsch des Users wechseln

`switch_primary_email(campaign_id, lead_id, email, reason?)` macht eine Adresse, die schon am Lead steht (`get_lead_data`: `lead.email`, `lead.sendingEmail`, `lead.secondaryEmails`, `lead.research.bestEmail`, `lead.research.contactProfile`), zur Versandadresse. Die Wahl gilt danach als Menschenwahl: weder Research noch `write_lead_details` überschreiben sie. Nur auf ausdrückliche Entscheidung des Users aufrufen, nie aus einem Sub-Agent und nie, um eine gerade recherchierte Adresse "aufzuräumen". `unknown_address` nennt die wählbaren Adressen; bei `address_conflict` versendet schon ein anderer Lead an diese Adresse — die beiden Leads zusammenführen statt doppelt zu schreiben. Leads mit Kontaktstatus `do_not_contact` lehnt das Tool ab; bei bereits kontaktierten Leads meldet es `already_contacted` (die an Instantly übergebene Adresse ändert sich dort nicht).

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| leads[] leer | "Keine Leads mit ausstehendem Research" -> STOP |
| `validation_failed` bei write_lead_details (z. B. ungültige E-Mail oder Website) | Feld aus dem Text korrigieren oder weglassen und einmal neu schreiben; klappt es nicht, Lead als Fehler notieren und weiter. Kein Verbindungsfehler, NIE den Batch stoppen |
| `contact_gate` | Kontaktstatus des Leads ist nicht `not_contacted` (kontaktiert, exportiert, gesperrt …) — Lead überspringen, nicht erneut schreiben |
| write_lead_details error (sonstiger Code) | Fehler notieren, weiter mit nächstem Lead |
| `bestEmail` in `skipped_fields` | Kein Fehler: eine manuell gewählte Versandadresse bleibt bestehen (Hinweis in `warnings`) — respektieren, im Report vermerken |
| `lead_run_active` | Parallel läuft ein Server-Lauf — Batch pausieren, `get_lead_run_status` bis Terminal-Status, dann fortsetzen (Queue ist idempotent) |
| Sub-Agent Timeout/Crash | Als Fehler zählen, Lead bleibt in der Queue |
| MCP-Verbindungsfehler (JSON-RPC-Fehler ohne Tool-Ergebnis, Transport weg) | 1x Retry, dann STOP |

## Verwandt

- `/outreach-qualify` — Qualifizierung (vorherige Phase)
- `/outreach-generate` — AI-Variablen (nächste Phase), `/outreach-verify` — Review
