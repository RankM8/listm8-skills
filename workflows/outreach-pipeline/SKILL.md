---
name: outreach-pipeline
description: Use when user says "outreach:pipeline", "mcp:pipeline", "kompletter mcp durchlauf", "leads komplett verarbeiten", "lead lauf starten", "qualify research generate", "alles in einem lauf mcp", "full pipeline", or triggers /mcp:pipeline.
---

# MCP Pipeline: serverseitiger Lead-Lauf (start_lead_run)

Dieser Skill startet und ueberwacht die komplette Lead-Verarbeitung einer Kampagne als **einen serverseitigen Lauf**: das MCP-Tool `start_lead_run` verkettet Qualifizierung, Research und E-Mail-Variablen pro Lead mit den kampagneneigenen AI-Agents. Die Abrechnung erfolgt mit Plattform-Credits. Der Server reserviert Credits bei der Vorbereitung als Hold und rechnet nach Ist-Kosten ab. Dein Client orchestriert nicht mehr selbst; er startet, pollt und berichtet.

```
list_campaigns -> list_lead_runs(active_only=true) -> start_lead_run(stages=[...])
    -> get_lead_run_status (poll bis is_terminal) -> Report
(danach manuell: /outreach-verify. Review & Approve)
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-pipeline 80` | Voller Lauf fuer Kampagne 80 (alle 3 Stufen) |
| `/outreach-pipeline 80 --bis research` | Nur `stages: ["qualification","research"]` |
| `/outreach-pipeline` | Kampagne via list_campaigns waehlen |

**Vorab abfragen:** Stufen (Default: alle 3. Teilmengen und Luecken erlaubt, z.B. nur `["email"]`; bereits erfuellte Stufen werden pro Lead uebersprungen) und optional ein `budget_percent` (bei groesseren Laeufen empfehlen). Review/Approve gehoert bewusst NICHT in die Pipeline (Vier-Augen-Prinzip via /outreach-verify).

## Ablaufregeln

1. **Vorpruefung (Pflicht)**: `list_lead_runs(campaign_id, active_only=true)`. Ist ein Lauf aktiv: NICHT starten. Parallele Laeufe ueber dieselben Leads blockieren sich und koennen Leads still ueberspringen. Stattdessen den aktiven Lauf verfolgen oder mit `cancel_lead_run` stoppen. Vorbedingungen des Servers: AI-Modell konfiguriert; kein eigener OpenRouter-Key erforderlich; die email-Stufe braucht eine E-Mail-Sequenz an der Kampagne.
2. **Lead-Auswahl**: `lead_ids` (1-2000) fuer bekannte Mengen ODER `select_by_filter=true` fuer "alles, was ansteht" (Filter wie `list_leads`). FALLSTRICK: Startet der Lauf bei der Qualifizierung, `fit_level=""` und `research_status=""` setzen. Sonst matchen die Defaults frisch importierte Leads nicht (`no_leads_matched`). Leads mit bereits vorhandenen AI-Variablen fallen bei `campaign_status="processing"` (Default) bzw. `""` aus der Filterauswahl; mit `"rejected"`/`"pending_review"`/`"approved"` greift der Ausschluss nicht. `requested_count` und `selected_count` vergleichen: ist selected_count kleiner, hat knappes Credit-Guthaben die Auswahl gekappt. Die reduzierte Menge und `note` dem User berichten. `matched_total` zeigt weitere Filtertreffer jenseits des Auswahl-Deckels. Nicht ausgewaehlte Leads erst nach Abschluss und mit ausreichenden Credits in einen Folgelauf nehmen.
3. **Optionen**: `budget_percent` (1-100) begrenzt das Lauf-Budget auf diesen Anteil des verfuegbaren Credit-Guthabens. Credits werden reserviert und nach Ist-Kosten abgerechnet. `budget_usd` bleibt nur als Uebergangsoption erhalten. `agent_key` nur auf explizite User-Nennung. Ein unbekannter Key ueberspringt die Stufen STILL.
4. **Fehler beim Start**: `run_not_startable` = fehlende Vorbedingung. An den User zurueckgeben, keine Retry-Schleife. HTTP 402 mit Metrik credits wird `CREDITS_EXHAUSTED` (im Tool-Fehlertext `credits_exhausted:`): benoetigte bzw. geschaetzte und verfuegbare Credits nennen, User um Aufladen oder Tier-Wechsel bitten. Es wurde noch kein Lauf angelegt. Andere 402-Metriken bleiben `LIMIT_REACHED` fuer Bestandslimits. Keine automatische Retry-Schleife.
5. **Polling**: `get_lead_run_status(lead_run_id)` alle 30-60 s. Fortschritt am completed-Zaehler der LETZTEN Stufe in `stageProgress[]` gegen `leadTotal` messen (Fehler = Summe aller `stageProgress[].failed`). NICHT an den Stufen-Totals, die wachsen waehrend des Laufs. Stoppen bei `is_terminal: true`. CAVEAT: ein `completed` juenger als ~30 Minuten kann der Server wieder auf `running` zurueckholen. Vor dem Abschlussbericht nachpruefen.
6. **Abbruch**: `cancel_lead_run(lead_run_id)`. Storniert Wartendes und Folgestufen, laufende Jobs laufen aus (leichtes Ueberschiessen moeglich); idempotent. Endzustand via `get_lead_run_status` verifizieren.
7. **Waehrend des Laufs**: `save_lead_variables`, `approve_lead_variables`, `reject_lead_variables` und `write_lead_details` sind fuer die abgedeckten Stufen mit `lead_run_active` gesperrt (Rennschutz, kein Fehler).

## Terminal-Status deuten

| Status | Bedeutung | Naechster Schritt |
|--------|-----------|-------------------|
| `completed` | Alle Leads durch | /outreach-verify |
| `completed_with_failures` | Mind. ein Job endgueltig gescheitert | Fehl-Leads berichten, Folgelauf anbieten |
| `credits_exhausted` | Credit-Guthaben oder Credit-Laufbudget erschoepft | An den User (aufladen oder Tier wechseln), danach `resume_lead_run(lead_run_id)` fuer DENSELBEN Lauf statt `start_lead_run`; anschliessend wieder pollen |
| `budget_exhausted` | Uebergangs-USD-Budget erreicht, Rest storniert | Restmenge beziffern, Folgelauf mit passendem Budget anbieten |
| `limit_exhausted` | Plan-Limit, nicht Credit-Guthaben | An den User (Kontogrenzen fuer Kampagnen/Leads), kein Auto-Retry |
| `provider_exhausted` | Provider-Stoerung oder serverseitiges Key-Problem | An den User bzw. Support, kein Retry; kein eigenes OpenRouter-Guthaben nachladen lassen |
| `cancelled` | Vom User gestoppt | Stand berichten |
| `failed` | Vorbereitung gescheitert, nichts verarbeitet | `statusReason` ausgeben, Vorbedingungen pruefen |

## Abschluss-Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lead-Lauf abgeschlossen. Kampagne {campaign.name} ({status})
Stufen: {stages} | Leads: {completed}/{leadTotal} | Fehler: {failed}
Credits: verbraucht {spent_credits}, reserviert {reserved_credits}, Lauf-Budget {budget_credits}
Wiederaufnahmen: {resume_count}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Hinweis zu den Zahlen: `not_qualified`-Leads und Leads mit blockierendem Kontaktstatus verlassen die Kette OHNE Job. Sie erscheinen in keinem Stufen-Zaehler; `completed` kann deshalb legitim unter `leadTotal` bleiben.

Nach erfolgreichem Abschluss: "Naechster Schritt: /outreach-verify. Variablen pruefen und freigeben."

## Manuell-Modus (Subagent-Orchestrierung)

Soll der Client selbst denken (eigenes Modell/eigene Quellen, gezielte Einzelfaelle): die Phasen-Skills `/outreach-qualify`, `/outreach-research`, `/outreach-generate` einzeln fahren. Regeln:

1. **Phasen strikt sequentiell**: Research erst, wenn die Qualifizierung fuer die Kampagne komplett durch ist (Research nutzt den Qualifizierungs-Kontext); Generate erst nach Research. Innerhalb einer Phase laufen die Subagent-Batches parallel.
2. **Jede Phase folgt exakt ihrem Skill**. Prompts, Regeln und Fehlerbehandlung von dort uebernehmen, keine abweichende Logik. Jede Phase laeuft, bis ihre Queue leer ist.
3. **Idempotenz nutzen**: Jede Phase zieht ihre Queue ueber die list_leads-Filter; bereits verarbeitete Leads tauchen nicht mehr auf. Ein abgebrochener Lauf kann jederzeit fortgesetzt werden.
4. **Fehler blockieren nicht**: Fehlgeschlagene Leads bleiben in ihrer Phase-Queue und werden im Report ausgewiesen. Nur wenn ein KOMPLETTER Batch fehlschlaegt: stoppen und User fragen.
5. **not_qualified-Leads** verlassen die Pipeline nach der Qualifizierung automatisch (Research filtert fit_level="qualified").
6. **Rennschutz**: Vorher ebenfalls `list_lead_runs(active_only=true)` pruefen (Regel 7 gilt auch hier); faellt ein Schreib-Tool mitten im Lauf mit `lead_run_active` aus, hat parallel jemand einen Server-Lauf gestartet. Phase pausieren, Terminal-Status abwarten, fortsetzen.

## Verwandt

- Review: `/outreach-verify` · Manuell-Modus: `/outreach-qualify`, `/outreach-research`, `/outreach-generate`
- Vorbereitung: `/outreach-campaign`, `/outreach-import`, `/outreach-lists`
