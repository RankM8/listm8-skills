---
name: outreach-pipeline
description: Use when user says "outreach:pipeline", "mcp:pipeline", "kompletter mcp durchlauf", "leads komplett verarbeiten", "lead lauf starten", "qualify research generate", "alles in einem lauf mcp", "full pipeline", or triggers /mcp:pipeline.
---

# MCP Pipeline — serverseitiger Lead-Lauf (start_lead_run)

> **Live-Ansicht (Claude Code mit Plugin `outreach`):** Ergebnisse von `list_leads`, `import_leads`/`get_job_status` und Lead-Runs erscheinen dort als Karte bzw. im Band über dem Prompt. Dann die Liste **nicht noch einmal als Tabelle** wiederholen – nur kurz zusammenfassen, was der Nutzer wissen oder entscheiden muss. In anderen Umgebungen (Claude-Chat, ChatGPT, Codex) wie gewohnt als kurze Liste ausgeben.

Dieser Skill startet und überwacht die komplette Lead-Verarbeitung einer Kampagne als **einen serverseitigen Lauf**: das MCP-Tool `start_lead_run` verkettet Qualifizierung, Research und E-Mail-Variablen pro Lead mit den kampagneneigenen AI-Agents — abgerechnet über den OpenRouter-Account des Users (der Lauf kostet echtes Geld). Dein Client orchestriert nicht mehr selbst; er startet, pollt und berichtet.

```
ping + list_campaigns -> Konfiguration prüfen (export_campaign_blueprint) -> list_lead_runs(active_only=true)
    -> start_lead_run(stages=[...]) -> get_lead_run_status (poll bis is_terminal) -> Report
(danach manuell: /outreach-verify — Review & Approve)
```

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-pipeline 80` | Voller Lauf für Kampagne 80 (alle 3 Stufen) |
| `/outreach-pipeline 80 --bis research` | Nur `stages: ["qualification","research"]` |
| `/outreach-pipeline` | Kampagne via list_campaigns wählen |

**Vorab abfragen:** Stufen (Default: alle 3 — Teilmengen und Lücken erlaubt, z.B. nur `["email"]`; bereits erfüllte Stufen werden pro Lead übersprungen) und optional ein `budget_usd` (bei größeren Läufen empfehlen). Review/Approve gehört bewusst NICHT in die Pipeline (Vier-Augen-Prinzip via /outreach-verify).

## Ablaufregeln

0. **Umgebung und Konfiguration (Pflicht)**: `ping` und `list_campaigns` — Konto und Kampagne müssen zum Auftrag passen. Dann `export_campaign_blueprint(campaign_id)` lesen: Qualifizierungskriterien, Research-Vorgaben, E-Mail-Schritte und AI-Variablen müssen vorhanden und sinnvoll sein (Details: `/outreach-campaign`). Fehlt etwas, NICHT starten, sondern erst ergänzen. Ein Lauf auf unvollständigem Setup kostet Geld, und ein abgeschlossenes Qualifizierungsurteil ist pro Kampagne final: der Lauf überspringt es, `write_lead_details` lehnt Änderungen mit `verdict_final` ab.
1. **Vorprüfung (Pflicht)**: `list_lead_runs(campaign_id, active_only=true)`. Ist ein Lauf aktiv: NICHT starten — parallele Läufe über dieselben Leads blockieren sich und können Leads still überspringen. Stattdessen den aktiven Lauf verfolgen oder mit `cancel_lead_run` stoppen. Vorbedingungen des Servers: OpenRouter-Key + AI-Modell konfiguriert; die email-Stufe braucht eine E-Mail-Sequenz an der Kampagne.
2. **Lead-Auswahl**: `lead_ids` (1-2000) für bekannte Mengen ODER `select_by_filter=true` für „alles, was ansteht" (Filter wie `list_leads`). Urteile gelten **pro Kampagne**: Ein Lead, der nur in einer anderen Kampagne qualifiziert wurde, gilt hier als nie qualifiziert. FALLSTRICK: Startet der Lauf bei der Qualifizierung, `fit_level=""` und `research_status=""` setzen — sonst matchen die Defaults frisch hinzugefügte Leads nicht (`no_leads_matched`). Bei `matched_total > selected` sind nur die Top-2000 nach Score im Lauf — Folgelauf für den Rest. Bereits kontaktierte Leads blendet der Default-Filter aus (`contact_status`).
3. **Optionen**: `budget_usd` (0.01-10000; erreicht => Lauf endet als `budget_exhausted`, laufende Jobs laufen aus). `agent_key` nur auf explizite User-Nennung — ein unbekannter Schlüssel überspringt die Qualifizierungs- und Research-Stufe still pro Lead.
4. **Fehler beim Start** (Text `<code>: <Meldung>`): `run_not_startable` = fehlende Vorbedingung (OpenRouter-Key, AI-Modell, E-Mail-Sequenz, gesperrter KI-Anbieter) — an den User zurückgeben, keine Retry-Schleife. `no_leads_matched` = der Filter trifft nichts — Filter anpassen oder mit `list_leads` und denselben Parametern gegenprüfen. `validation_failed` = ungültige Parameter (Stufen, Budget, `lead_ids` UND `select_by_filter` zugleich). `limit_reached` = mehr als 2000 `lead_ids` (in mehrere Läufe splitten) ODER Plan-Limit/Paywall (HTTP 402, der Text nennt den Grund) — dann an den User, kein Retry. `campaign_not_found` = falsche Kampagne. Ein erschöpftes Plan-Kontingent kann sich auch erst nach dem Start zeigen: Der Lauf endet dann als `limit_exhausted` (nur im Status sichtbar).
5. **Polling**: `get_lead_run_status(lead_run_id)` alle 30-60 s. Fortschritt am completed-Zähler der LETZTEN Stufe in `stageProgress[]` gegen `leadTotal` messen (Fehler = Summe aller `stageProgress[].failed`) — NICHT an den Stufen-Totals, die wachsen während des Laufs. Stoppen bei `is_terminal: true`. CAVEAT: ein `completed` jünger als ~30 Minuten kann der Server wieder auf `running` zurückholen — vor dem Abschlussbericht nachprüfen.
6. **Abbruch**: `cancel_lead_run(lead_run_id)` — storniert noch nicht gestartete Jobs und Folgestufen, bereits laufende Jobs laufen aus (`running_jobs`; leichtes Überschießen möglich); idempotent (`already_terminal`). Endzustand via `get_lead_run_status` verifizieren.
7. **Während des Laufs**: `save_lead_variables`, `approve_lead_variables` und `reject_lead_variables` (E-Mail-Stufe) sowie `write_lead_details` (Qualifizierung/Research) sind mit `lead_run_active` gesperrt, ebenso `switch_primary_email` bei aktiver Research-Stufe (Rennschutz, kein Fehler).

## Terminal-Status deuten

| Status | Bedeutung | Nächster Schritt |
|--------|-----------|-------------------|
| `completed` | Alle Leads durch | /outreach-verify |
| `completed_with_failures` | Mind. ein Job endgültig gescheitert | Fehl-Leads berichten, Folgelauf anbieten |
| `budget_exhausted` | Budget erreicht, Rest storniert | Restmenge beziffern, höheres Budget anbieten |
| `limit_exhausted` | Plan-Limit mitten im Lauf | An den User (Plan/Limit) — kein Auto-Retry |
| `provider_exhausted` | KI-Anbieter (OpenRouter) lehnt das Konto ab | An den User — kein Retry |
| `cancelled` | Vom User gestoppt | Stand berichten |
| `failed` | Vorbereitung gescheitert, nichts verarbeitet | `statusReason` ausgeben, Vorbedingungen prüfen |

## Abschluss-Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lead-Lauf abgeschlossen — Kampagne {campaign.name} ({status})
Stufen: {stages} | Leads: {completed}/{leadTotal} | Fehler: {failed}
Kosten: {spentUsd} USD{von budgetUsd USD}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Hinweis zu den Kosten: `spentUsd` ist der Betrag, an dem `budgetUsd` stoppt. Laufende Jobs können nach dem Stopp noch Kosten nachbuchen.

Hinweis zu den Zahlen: `not_qualified`-Leads und Leads mit blockierendem Kontaktstatus verlassen die Kette OHNE Job — sie erscheinen in keinem Stufen-Zähler; `completed` kann deshalb legitim unter `leadTotal` bleiben.

Danach: "Nächster Schritt: /outreach-verify — Variablen prüfen und freigeben."

## Manuell-Modus (Subagent-Orchestrierung)

Soll der Client selbst denken (eigenes Modell/eigene Quellen, kein OpenRouter-Key, gezielte Einzelfälle): die Phasen-Skills `/outreach-qualify`, `/outreach-research`, `/outreach-generate` einzeln fahren. Regeln:

1. **Phasen strikt sequentiell**: Research erst, wenn die Qualifizierung für die Kampagne komplett durch ist (Research nutzt den Qualifizierungs-Kontext); Generate erst nach Research. Innerhalb einer Phase laufen die Subagent-Batches parallel.
2. **Jede Phase folgt exakt ihrem Skill** — Prompts, Regeln und Fehlerbehandlung von dort übernehmen, keine abweichende Logik. Jede Phase läuft, bis ihre Queue leer ist.
3. **Idempotenz nutzen**: Jede Phase zieht ihre Queue über die list_leads-Filter; bereits verarbeitete Leads tauchen nicht mehr auf. Ein abgebrochener Lauf kann jederzeit fortgesetzt werden.
4. **Fehler blockieren nicht**: Fehlgeschlagene Leads bleiben in ihrer Phase-Queue und werden im Report ausgewiesen. Nur wenn ein KOMPLETTER Batch fehlschlägt: stoppen und User fragen.
5. **not_qualified-Leads** verlassen die Pipeline nach der Qualifizierung automatisch (Research filtert fit_level="qualified").
6. **Rennschutz**: Vorher ebenfalls `list_lead_runs(active_only=true)` prüfen (Regel 7 gilt auch hier); fällt ein Schreib-Tool mitten im Lauf mit `lead_run_active` aus, hat parallel jemand einen Server-Lauf gestartet — Phase pausieren, Terminal-Status abwarten, fortsetzen.

## Verwandt

- Review: `/outreach-verify` · Manuell-Modus: `/outreach-qualify`, `/outreach-research`, `/outreach-generate`
- Vorbereitung: `/outreach-campaign`, `/outreach-import`, `/outreach-lists`
- Copy-Fragen (Sequenz, Betreffzeilen, Offer, Prompts von `hallo`/`intro`, Prüfung der Mails) laufen über den Skill `outreach-copy`.
