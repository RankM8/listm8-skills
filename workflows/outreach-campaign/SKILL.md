---
name: outreach-campaign
description: 'Use when user says "outreach:campaign", "mcp:campaign", "erstelle kampagne via mcp", "kampagne per mcp anlegen", "campaign blueprint erstellen", "bearbeite kampagne via mcp", "Kampagne mit guter Copy bauen", "Qualifizierungskriterien formulieren", or triggers /mcp:campaign. Guided campaign builder (create_campaign, export_campaign_blueprint, edit_campaign) that enforces the cold-mailing SOP: copy via the outreach-copy skill (loaded before any sequence or variable prompt is written), open qualification and research anchors via the bundled references.'
---

# MCP Campaign — Kampagnen erstellen & bearbeiten via Blueprint

Dieser Skill erstellt vollständige Kampagnen über `create_campaign` und ändert vorhandene über den Dreischritt `export_campaign_blueprint` → Blueprint anpassen → `edit_campaign` (Scope `campaigns:write`, Lesen: `campaigns:read`). Grundlage ist das CampaignBlueprint-Schema v1; die vollständige Referenz liefert der MCP-Prompt `campaign_blueprint_guide`.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-campaign` | Briefing interaktiv abfragen, dann erstellen |
| `/outreach-campaign <briefing-text oder datei>` | Blueprint aus Briefing bauen, dann erstellen |
| `bearbeite kampagne 80 via mcp: <änderungswunsch>` | Blueprint exportieren, ändern, als Vollersatz zurückschreiben (mit Bestätigung) |

## Phase 0: Bestand prüfen

Vor dem Schreiben `list_campaigns` aufrufen: Gibt es die Kampagne schon (Name, `lifecycle`, Lead-Zahlen, Variablen, Schritte)? Für eine bestehende Kampagne den Ist-Stand mit `export_campaign_blueprint(campaign_id)` holen — das ist die einzige Quelle für Konfiguration, Variablen und Sequenz. Die Kampagnen-ID nie aus dem Gedächtnis übernehmen.

## Phase 1: Briefing sammeln

Mindestens klären (fehlendes nachfragen, AskUserQuestion):

1. **Angebot/Business**: Was wird verkauft, an wen (Zielgruppe/Branche/Region/Größe)?
2. **USPs** (2-4 Punkte) und **Tonalität** (z.B. locker-direkt vs. formal).
3. **CTA/Offer**: Was ist der konkrete nächste Schritt (z.B. "Website-Vorschau schicken")?
4. **Qualifizierung**: Wer ist ideal, was disqualifiziert?
5. **Research-Fokus**: Wonach soll die Recherche suchen (Aufhänger-Prioritäten — steuert die Recherche-Agenten der Kampagne)?
6. **Sequenz**: Standard sind 5 Steps mit `delayDays` 0/3/5/7/7 (Rollen und Wortlimits: Skill `outreach-copy`). Nur auf ausdrücklichen Wunsch entfällt Step 5.
7. **Absender und Belege**: Name, Rolle und Firma für die Signatur; ein echter Beleg für Step 3 (Case, Zahl, Ergebnis) und ein echter Kapazitäts- oder Zeitgrund für Step 4. Nichts davon erfinden.

## Phase 1b: Qualität nach SOP (Pflicht, bevor eine Zeile Blueprint entsteht)

**Den Skill `outreach-copy` VERBINDLICH laden, bevor eine Zeile Sequenz oder Variablen-Prompt
entsteht.** Er ist die einzige Copy-Doktrin: Offer-Karte A-E, Anatomie der Entry-Mail mit
Feinheiten-Satz, 5er-Sequenz, Wortlimits, Betreffzeilen, Anrede je `salutation`, Pflichtinhalt
der Prompts von `hallo` und `intro`, Verbote, Selbstprüfung und Prüfliste. Ist er nicht
installiert, nicht aus dem Gedächtnis schreiben, sondern den Nutzer bitten, die Skills zu
aktualisieren (`npx skills add RankM8/listm8-skills`).

| Quelle | Steuert |
|---|---|
| Skill `outreach-copy` (dazu `references/copy-lehre.md`, `references/marketing-offer.md`, `references/beispiel-blueprint.md` dort) | Sequenz, Betreffzeilen, Signatur, `emailAgentConfig.salutation`, Prompts der AI-Variablen |
| `references/copywriting.md` (hier) | nur Verweis auf `outreach-copy` |
| `references/qualifizierung.md` | `qualificationSettings`: inklusiv formulieren, Disqualifier nur harte No-Gos — die Qualifizierung ist ein OFFENER Vorfilter |
| `references/research.md` | `researchAgentConfig`: Anker-Hierarchie (Bewertungen zuerst), Anker positiv, Schmerzpunkte getrennt |

Dazu die Offer-Regel: Ohne konkretes Deliverable keine Copy — heißt das Angebot "Analyse",
"Audit", "Erstgespräch" o.ä., erst das Offer mit dem Nutzer schärfen (Werttest: spart Zeit,
spart Geld oder bringt Geld?). Vor dem Erstellen die fertige Sequenz und die Variablen-Prompts
gegen die Selbstprüfung und die Prüfliste aus `outreach-copy` halten; bei jedem Fund
korrigieren und von vorne prüfen.

## Phase 2: Blueprint bauen

Struktur (Schema v1 — die vollständige Referenz liefert der MCP-Prompt `campaign_blueprint_guide` des ListM8-Servers):

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
    "qualificationSettings": {
      "target_customer_profile": "<Wunschkunde>",
      "offer_summary": "<Angebot in 1-2 Sätzen>",
      "fit_criteria": "<Passt-Kriterien, inklusiv>",
      "disqualifiers": "<nur harte No-Gos>",
      "additional_prompt": "<Zusätzliche Hinweise>",
      "taxonomy_instructions": "<Kategorien und Tags, optional>"
    },
    "researchAgentConfig": { "additionalPrompt": "<kampagneneigener Recherche-Auftrag, 3-5 Anker>" },
    "emailAgentConfig": { "emailLanguage": "Deutsch (DACH)", "emailTone": "<Ton aus dem Briefing>", "salutation": "du", "additionalPrompt": "Ton und Ansprache konsistent mit dem bestätigten Briefing halten." }
  },
  "aiVariables": [
    {"name": "hallo", "prompt": "<Anrede-Anweisung, min 10 Zeichen>", "sortOrder": 1},
    {"name": "intro", "prompt": "<Lob-Opener-Anweisung mit Research-Prioritäten>", "sortOrder": 2}
  ],
  "sequence": { "steps": [ {"stepNumber": 1, "subject": "kurze Frage", "body": "{{ai.hallo}}\n\n{{ai.intro}}\n\n...", "delayDays": 0, "delayUnit": "days"} ] }
}
```

**Pflicht-Regeln (Cold-Mailing-SOP):**
- AI-Variablen `hallo` (Anrede) und `intro` (personalisierter Opener) IMMER anlegen (der Server verlangt sie im Blueprint-Guide). `firma` (Kurzname) ist optional: nur anlegen, wenn die Firmennamen der Liste lang sind oder Rechtsformen tragen; sonst `{{lead.company}}` wie in `outreach-copy`. Reihenfolge `hallo`, (`firma`), `intro`; Namen-Regex `^[a-zA-Z][a-zA-Z0-9_]*$`, Prompt min. 10 Zeichen, Namen eindeutig.
  - `firma` (optional): Firmenname, wie ein Kollege ihn sagt, ohne Rechtsform, „Meisterbetrieb", „Inh. …" oder Leistungsaufzählung; mit zwei, drei Vorher-nachher-Beispielen im Prompt. Wenn angelegt, nutzen Betreff und Text `{{ai.firma}}` statt `{{lead.company}}`.
  - `intro`: Der Prompt sagt ausdrücklich, dass nur der ERSTE Buchstabe klein ist und jeder weitere Satz groß beginnt. Ohne den Satz schrieb das Modell „… selten sieht. das finde ich stark."
- Ansprache (Du, Sie, Team) in `emailAgentConfig.salutation` festlegen: `"du"`, `"sie"` oder `"team"`. Sie gilt für alle generierten Variablen einer Mail. Fehlt der Wert, leitet der Server sie aus Ton und Sprache ab; `salutation` setzen ist sicherer. Zusätzlich `emailLanguage` (z. B. „Deutsch (DACH)") und `emailTone` angeben.
- Platzhalter in Betreff und Body: nur `{{ai.<variable>}}`, `{{lead.<feld>}}` (`email`, `company`, `website`, `phoneNumber`, `city`) und `{{custom.<schlüssel>}}`. Alles andere (`{{firstName}}`, `{{companyName}}`, If-Blöcke, Default-Syntax) wird nicht aufgelöst und bleibt als Text in der Mail stehen. Sequenz-Bodies nutzen `{{ai.hallo}}`, `{{ai.intro}}` und `{{ai.firma}}`; Step 1 hat `delayDays: 0`.
- Jeder Schritt braucht einen nicht leeren `subject` (String); `delayUnit` ist `days` oder `hours`, `delayDays` eine ganze Zahl >= 0.
- `agentKey` in den Configs WEGLASSEN, außer der Nutzer nennt ausdrücklich einen bestehenden Agenten. Unbekannte oder deaktivierte Keys werden mit `validation_failed` abgelehnt; ohne Key greifen die Standard-Agenten.
- Max. 25 Variablen und 25 Steps je Kampagne.
- `qualificationSettings` IMMER mit den kanonischen snake_case-Schlüsseln füllen: `target_customer_profile`, `offer_summary`, `fit_criteria`, `disqualifiers`, `additional_prompt` (optional `taxonomy_instructions`). Die camelCase-Aliasse (`idealCustomer`, `offerSummary`, `fitCriteria`, `additionalInstructions`, `taxonomyInstructions`) wertet die Laufzeit zwar aus, die Oberfläche zeigt die Felder dann aber als „Noch nicht ausgefüllt". Auch wenn der `campaign_blueprint_guide` die Aliasse nennt: kanonisch schreiben.
- Recherche-Auftrag als `researchAgentConfig.additionalPrompt` setzen, nicht nur als `researchGoals`/`researchPriorities`: sonst zeigt die Oberfläche „Standard-Prompt aktiv". E-Mail-Ton, Sprache und Ansprache gehören in `emailAgentConfig` (`emailTone`, `emailLanguage`, `salutation`, ggf. `additionalPrompt`).

Blueprint dem User zur Bestätigung zeigen (kompakt: Name, Variablen, Step-Betreffs, Kriterien), DANN erstellen.

## Phase 3: Erstellen / Bearbeiten

**Neu:** `create_campaign(blueprint=<object>)` → Response enthält `campaign_id`, `imported` (steps/variables/intelligence/configs) und `warnings`. Warnungen zur Sequenz (z. B. „letzte Woche" in einer Mail, die nur 3 Tage nach der vorigen kommt) dem Nutzer nennen und den Text anpassen. Die Kampagne startet in der abgeleiteten Lifecycle-Stufe `draft` — der Lebenszyklus (`lifecycle` in `list_campaigns`: `draft` → `in_progress` → `exported` → `active` → `completed`) wird aus den Lead-Signalen berechnet, nicht gespeichert, und kann nicht manuell gesetzt werden. Atomar: bei einem Fehler wird nichts angelegt.

**Bearbeiten (immer Vollersatz):** `edit_campaign(campaign_id=<id>, blueprint=<object>, confirm_overwrite=true)` — **Replace-all**: Immer das KOMPLETTE Ziel-Blueprint senden, nie nur die Änderung. Ablauf:

1. `export_campaign_blueprint(campaign_id)` holen (nie aus dem Gedächtnis rekonstruieren — alles, was im gesendeten Blueprint fehlt, wird gelöscht).
2. Nur die gewünschte Stelle ändern, den Rest unverändert lassen.
3. Dem Nutzer die Änderung und die Konsequenz (siehe Warnung) nennen und bestätigen lassen.
4. `edit_campaign` mit `confirm_overwrite=true` senden. Ohne `confirm_overwrite` antwortet das Tool bei bestehender Konfiguration mit `confirm_overwrite_required`. NUR dieser Code darf mit `confirm_overwrite=true` beantwortet werden.
5. Danach `warnings` der Antwort lesen und mit erneutem `export_campaign_blueprint` kontrollieren, dass Config-Blöcke, Variablen und Schritte wie beabsichtigt stehen.

**WARNUNG Neugenerierung:** Das Ersetzen der AI-Variablen LÖSCHT alle erzeugten Variablenwerte aller Leads der Kampagne (Cascade). Die Generierungsarbeit ist verloren, die Leads müssen neu generiert werden, und das kostet erneut. Vor dem Edit prüfen, ob schon Variablen erzeugt wurden (`list_leads` mit `campaign_status="pending_review"` bzw. `"approved"`). Wenn ja, dem Nutzer die Konsequenz ausdrücklich nennen und bestätigen lassen — `confirm_overwrite=true` allein ist KEINE informierte Zustimmung. Wer nur Schritte oder Config-Blöcke ändern will, sendet die Variablen unverändert aus dem Export zurück (der Server gleicht sie per Name ab); die Tool-Beschreibung warnt trotzdem ohne Einschränkung vor dem Verlust der Werte — nicht darauf verlassen, sondern bei vorhandenen Werten immer den Nutzer fragen. Änderungen an Prompt oder Name einer Variable machen ihre bisherigen Werte unbrauchbar. Nie bei aktivem Lead-Run editieren (`list_lead_runs(active_only=true)` vorher prüfen): die E-Mail-Stufe würde gegen den neuen Variablensatz generieren.

## Phase 4: Setup prüfen (Pflicht vor Leads)

Keine Leads in die Kampagne (`add_leads_to_campaign`, `import_leads` mit Kampagne) und kein `start_lead_run`, bevor dieser Check bestanden ist. Er gilt nach `create_campaign`, nach jedem `edit_campaign` und für jede bestehende Kampagne, die Leads bekommen soll.

1. `export_campaign_blueprint(campaign_id)` lesen und prüfen:
   - `qualificationSettings` enthält die fünf Pflichtfelder unter den kanonischen Schlüsseln, jeweils nicht leer und auf diese Zielgruppe und dieses Angebot geschrieben. Stehen dort camelCase-Aliasse, per `edit_campaign` (Vollersatz, Ablauf aus Phase 3) auf die kanonischen Schlüssel umziehen.
   - `researchAgentConfig.additionalPrompt` ist kampagneneigen (nicht leer, nicht nur `researchGoals`/`researchPriorities`).
   - `emailAgentConfig` legt Sprache, Ansprache (`salutation`) und Ton fest.
   - Variablen `hallo` und `intro` sind vorhanden (`firma` optional); Schritte nutzen nur erlaubte Platzhalter.
2. Dem Nutzer das Ergebnis als kurze Tabelle nennen (Feld, gesetzt ja/nein, erste Worte). Fehlt etwas: ergänzen oder nachfragen, NICHT mit Leads weitermachen.

Gemessen am 02.10.2026: Eine nach der alten Vorlage angelegte Kampagne zeigte in der Oberfläche Wunschkunde, Hinweise und Recherche als leer bzw. Standard, und Angebot und Passt-Kriterien fehlten wirklich.

## Fehlerbehandlung

Fehler sind MCP-Tool-Results mit `isError: true`; der Text beginnt mit `<code>:`.

| Code | Aktion |
|------|--------|
| `validation_failed` | Fehlerliste lesen (Pflichtfelder, Längen, Namens-Regex, Prompt-Länge, unbekannter `agentKey`, `salutation`), Blueprint korrigieren, erneut senden |
| `limit_reached` | Nutzer informieren (Kampagnen-Limit bzw. Variablen-/Step-Limit des Plans) |
| `confirm_overwrite_required` | Nutzer fragen, ob überschreiben, dann `confirm_overwrite=true` — nur bei genau diesem Code |
| `campaign_not_found` | `campaign_id` prüfen (`list_campaigns`) |
| `insufficient_scope` / `access_denied` | Token ohne Berechtigung: Scope `campaigns:write` (Lesen: `campaigns:read`) nötig |
| `create_failed` / `edit_failed` / `internal_error` | Meldung berichten, nicht blind wiederholen; mit `list_campaigns` bzw. Export den Zustand prüfen |

## Abschluss

Report: `campaign_id`, Name, importierte Steps/Variablen/Configs, `warnings` und das Ergebnis des Setup-Checks aus Phase 4. Erst wenn er bestanden ist: „Nächster Schritt: /outreach-import — Leads in die Kampagne laden."

## Verwandt

- `/outreach-import` (Leads laden), `/outreach-pipeline` (Qualify→Research→Generate)
- `/outreach-launch` (Versand nach dem Export: Domains, Warm-up, Instantly, Auswertung und Optimierung)
- die Tool-Beschreibungen des MCP-Servers
