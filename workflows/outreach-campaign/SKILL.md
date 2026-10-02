---
name: outreach-campaign
description: 'Use when user says "outreach:campaign", "mcp:campaign", "erstelle kampagne via mcp", "kampagne per mcp anlegen", "campaign blueprint erstellen", "bearbeite kampagne via mcp", "Kampagne mit guter Copy bauen", "Qualifizierungskriterien formulieren", or triggers /mcp:campaign. Guided campaign builder that enforces the cold-mailing SOP (copywriting, open qualification, research anchors) via the bundled references.'
---

# MCP Campaign — Kampagnen erstellen & bearbeiten via Blueprint

Dieser Skill erstellt vollständige Kampagnen über `create_campaign` und ändert vorhandene Kampagnen gezielt über `update_email_step`, `update_ai_variable` und `patch_campaign_settings` (Scope `campaigns:write`). `edit_campaign` bleibt ausschließlich der ausdrücklich bestätigte Vollersatz. Das CampaignBlueprint-Schema v1 gilt weiterhin für die Neuanlage.

## Aufruf

| Eingabe | Verhalten |
|---------|-----------|
| `/outreach-campaign` | Briefing interaktiv abfragen, dann erstellen |
| `/outreach-campaign <briefing-text oder datei>` | Blueprint aus Briefing bauen, dann erstellen |
| `bearbeite kampagne 80 via mcp: <änderungswunsch>` | Gezielter Patch; kein Vollersatz für Einzeländerungen |

## Phase 0: Umgebung und Konto prüfen

Vor jedem Schreibworkflow `get_context()` aufrufen. `environment`, `environment_source`, `deployment_environment`, `base_url`, `account`, `tenant` und `scopes` mit dem Auftrag abgleichen. Ein `prod`-Kernel beweist keine Produktionsumgebung; bei fehlender Deploymentangabe und relevantem Zweifel nachfragen. Bei falschem Host/Konto/Tenant stoppen, niemals IDs auf eine andere Umgebung übertragen. Fehlen die neuen Tools in der Discovery, Verbindung neu laden; keine Einzelkorrektur heimlich über `edit_campaign` ersetzen.

Für bestehende Kampagnen `get_campaign(campaign_id)` lesen. IDs und `revision` aus dieser Antwort übernehmen. Bei Fragen zu Defaults `list_agents()` und `get_agent(stage="email", campaign_id=…, include_rules=true)` verwenden. Die Modellangaben sind konfigurierte Slots, kein live geprüfter Providerkatalog.

## Phase 1: Briefing sammeln

Mindestens klaeren (fehlendes nachfragen, AskUserQuestion):

1. **Angebot/Business**: Was wird verkauft, an wen (Zielgruppe/Branche/Region/Groesse)?
2. **USPs** (2-4 Punkte) und **Tonalitaet** (z.B. locker-direkt vs. formal).
3. **CTA/Offer**: Was ist der konkrete naechste Schritt (z.B. "Website-Vorschau schicken")?
4. **Qualifizierung**: Wer ist ideal, was disqualifiziert?
5. **Research-Fokus**: Wonach soll die Recherche suchen (Aufhaenger-Prioritaeten — steuert sowohl die Manuell-Subagents als auch die serverseitigen Agents)?
6. **Sequenz**: Wie viele Steps (Empfehlung: 3), Abstaende (z.B. 0/3/4 Tage)?

## Phase 1b: Qualität nach SOP (Pflicht, bevor eine Zeile Blueprint entsteht)

Drei Referenzen in diesem Skill-Ordner sind beim Bauen VERBINDLICH — lesen, anwenden, nicht paraphrasieren:

| Referenz | Steuert |
|---|---|
| `references/copywriting.md` | Sequenz + Betreff + AI-Variablen-Prompts: Goldene Formel, EIN CTA, kein Pitch, Wortlimits, FUP-Dramaturgie, Spam-Schutz, Prüfdurchlauf |
| `references/qualifizierung.md` | `qualificationSettings`: inklusiv formulieren, Disqualifier nur harte No-Gos — die Qualifizierung ist ein OFFENER Vorfilter |
| `references/research.md` | `researchAgentConfig`: Anker-Hierarchie (Bewertungen zuerst), Anker positiv, Schmerzpunkte getrennt |

Dazu die Offer-Regel: Ohne konkretes Deliverable keine Copy — heisst das Angebot "Analyse",
"Audit", "Erstgespräch" o.ä., erst das Offer mit dem Nutzer schaerfen (Werttest: spart Zeit,
spart Geld oder bringt Geld?). Vor dem Erstellen die fertige Sequenz gegen den Pruefdurchlauf
aus `references/copywriting.md` halten.

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
    "qualificationSettings": {
      "target_customer_profile": "<Wunschkunde>",
      "offer_summary": "<Angebot in 1-2 Sätzen>",
      "fit_criteria": "<Passt-Kriterien, inklusiv>",
      "disqualifiers": "<nur harte No-Gos>",
      "additional_prompt": "<Zusätzliche Hinweise>",
      "taxonomy_instructions": "<Kategorien und Tags, optional>"
    },
    "researchAgentConfig": { "additionalPrompt": "<kampagneneigener Recherche-Auftrag, 3-5 Anker>" },
    "emailAgentConfig": { "additionalPrompt": "Auf Deutsch für DACH schreiben; Ton und Ansprache konsistent mit dem bestätigten Briefing halten." }
  },
  "aiVariables": [
    {"name": "hallo", "prompt": "<Anrede-Anweisung, min 10 Zeichen>", "sortOrder": 1},
    {"name": "firma", "prompt": "<Kurzname ohne Rechtsform, mit Beispielen>", "sortOrder": 2},
    {"name": "intro", "prompt": "<Lob-Opener-Anweisung mit Research-Prioritaeten>", "sortOrder": 3}
  ],
  "sequence": { "steps": [ {"stepNumber": 1, "subject": "Idee für {{ai.firma}}", "body": "{{ai.hallo}}\n\n{{ai.intro}}\n\n...", "delayDays": 0, "delayUnit": "days"} ] }
}
```

**Pflicht-Regeln (Cold-Mailing-SOP):**
- AI-Variablen `hallo` (Anrede), `firma` (Kurzname) und `intro` (personalisierter Opener) IMMER anlegen, in dieser Reihenfolge; Namen-Regex `^[a-zA-Z][a-zA-Z0-9_]*$`, Prompt min 10 Zeichen.
  - `firma`: Firmenname, wie ein Kollege ihn sagt, ohne Rechtsform, „Meisterbetrieb", „Inh. …" oder Leistungsaufzählung; mit zwei, drei Vorher-nachher-Beispielen im Prompt. Betreff und Text nutzen `{{ai.firma}}` statt `{{lead.company}}`.
  - `intro`: Der Prompt sagt ausdrücklich, dass nur der ERSTE Buchstabe klein ist und jeder weitere Satz groß beginnt. Ohne den Satz schrieb das Modell „… selten sieht. das finde ich stark."
  - Du-Anrede: `preview_campaign` meldet dafür `salutation_mode_unrecognized` (der Server kennt nur `formal` und `team`). Das ist erwartet, solange `hallo` die Anrede selbst erzeugt; kein Fehler.
- Sequenz-Bodies nutzen `{{ai.hallo}}`/`{{ai.intro}}` und `{{ai.firma}}`; Step 1 `delayDays: 0`. Keine nackten `{{companyName}}`-Tokens, If-Blöcke oder Default-Syntax verwenden.
- `agentKey` in den Configs WEGLASSEN. Seit 17.09.2026 gibt es je Stufe genau einen Agenten (`qualifier`, `researcher`, `email_generator`); ein Schluessel bezeichnet nur noch seine Stufe. Jeder Wert wird akzeptiert und auf die Stufe seiner Config gezogen, auch alte Schluessel aus frueher gespeicherten Blueprints; abgelehnt wird nur ein Nicht-String (VALIDATION_FAILED).
- Max 25 Variablen, max 25 Steps, Blueprint < 256 KB.
- `qualificationSettings` IMMER mit den kanonischen snake_case-Schlüsseln aus der Vorlage füllen, alle fünf Pflichtfelder (`target_customer_profile`, `offer_summary`, `fit_criteria`, `disqualifiers`, `additional_prompt`). Die camelCase-Aliasse (`idealCustomer`, `offerSummary`, `fitCriteria`, `additionalInstructions`, `taxonomyInstructions`) wertet die Laufzeit zwar aus, die Oberfläche zeigt die Felder dann aber als „Noch nicht ausgefüllt", und wer sie dort bearbeitet, überschreibt den Alias still. Alias und kanonischen Schlüssel nie im selben Patch mischen (`validation_failed: Conflicting qualification aliases`).
- Recherche-Auftrag als `researchAgentConfig.additionalPrompt` setzen, nicht als `researchGoals`/`researchPriorities`: sonst zeigt die Oberfläche „Standard-Prompt aktiv". E-Mail-Ton und Sprache gehören in `emailAgentConfig.additionalPrompt`.

Blueprint dem User zur Bestaetigung zeigen (kompakt: Name, Variablen, Step-Betreffs, Kriterien), DANN erstellen.

## Phase 3: Erstellen / Bearbeiten

**Neu:** `create_campaign(blueprint=<object>)` → Response enthaelt `campaign_id`, `imported` (steps/variables/intelligence/configs). Kampagne startet in der abgeleiteten Lifecycle-Stufe `draft` — der Lebenszyklus (`lifecycle` in `list_campaigns`: `draft` → `in_progress` → `exported` → `active` → `completed`) wird aus den Lead-Signalen berechnet, nicht gespeichert, und kann daher nicht manuell gesetzt werden.

**Gezielt bearbeiten (Standard):**

```text
update_email_step(campaign_id=80, step_id=<aus get_campaign>, expected_revision=<revision>, patch={"body":"{{ai.hallo}}\n\nNeuer Text"})
update_ai_variable(campaign_id=80, variable_id=<aus get_campaign>, expected_revision=<aktuelle revision>, patch={"prompt":"Neuer vollständiger Prompt mit mindestens zehn Zeichen"})
patch_campaign_settings(campaign_id=80, expected_revision=<aktuelle revision>, patch={"researchAgentConfig":{"additionalPrompt":"Nur diesen Fokus ändern"}})
```

Nach jedem erfolgreichen Patch dessen neue `revision` verwenden und `changedFields`, `invalidation`, `rerunRequired` sowie `reviewRequired` berichten. Bei `revision_conflict` zuerst neu lesen und die Benutzeränderung erneut mit dem aktuellen Stand abgleichen; nie blind überschreiben. Bereits gespeicherte UI-Änderungen werden erfasst; spätere unversionierte UI-Schreibvorgänge sind weiterhin eine ausdrücklich ausgewiesene Konkurrenzgrenze.

Omitted bleibt erhalten. Step-/Variablenfelder erlauben kein null; leerer Body ist erlaubt, leerer Prompt nicht. `subject` ist bei Neuanlage/Vollersatz immer als String anzugeben: Die erste E-Mail benötigt einen nicht leeren Betreff, ab der zweiten ist `""` erlaubt (keine reinen Leerzeichen). Bei `update_email_step` richtet sich die Pflicht nach der gespeicherten Schrittposition, nicht nach der ID. Instantly übernimmt bei leerem Follow-up-Betreff den Betreff des vorherigen Schritts und führt mit demselben Absender den Thread fort; ein anderer Betreff startet dort einen neuen Thread. Den leeren Rohwert erhalten, nicht durch einen statischen ersten Betreff ersetzen; Preview/CSV können ihn unverändert leer zeigen. Settings: null entfernt Feld/Block, Arrays ersetzen, nicht leere Objekte werden rekursiv zusammengeführt. Ein leeres Settings-Blockobjekt `{}` leert den Block. Für `intelligence` gilt stattdessen der UI-Merge: `{}` erhält die Slices und normalisiert auf `version=1`; null-Slices bleiben explizit null. Vererbte Domain-Defaults danach über `get_agent` prüfen. Nur tatsächlich ausgewertete Runtimefelder setzen: E-Mail-Konfiguration unterstützt `agentKey` und `additionalPrompt`, keine wirkungslosen `emailTone`-/`emailLanguage`-Felder; Sprache/Ton als klare Anweisung in `additionalPrompt` ausdrücken. Research unterstützt zusätzlich `allowedTools`, `researchGoals`, `researchPriorities`; Qualifizierungs-Agentkonfiguration `agentKey`/`allowedTools`/`mode`/`additionalPrompt`. Alte ungenutzte Schlüssel bei Bedarf mit null entfernen.

**Anweisung nur für die Qualifizierung.** `qualificationAgentConfig.additionalPrompt` ist die Anweisung für das Urteil der Qualifizierung dieser Kampagne: Sie ersetzt dort die Qualifizierer-Anweisung des Kontos, die Recherche sieht sie nie. Setzen mit `patch_campaign_settings(campaign_id, expected_revision, patch={"qualificationAgentConfig":{"additionalPrompt":"…"}})`, entfernen mit `null`; `get_campaign` zeigt sie unter `settings.qualificationAgentConfig`. Ohne sie gilt das Kriterium `additional_prompt` aus `qualificationSettings` (in der Oberfläche „Zusätzliche Hinweise") als Anweisung der Qualifizierung, sonst die des Kontos. Unterschied: Die Kriterien in `qualificationSettings`, auch `additional_prompt`, liest die Recherche mit; was nur das Qualifizierungsurteil steuern soll (etwa „fehlende Preisangaben sind kein Ausschlussgrund"), gehört in `qualificationAgentConfig.additionalPrompt`. In der Oberfläche ist dieselbe Anweisung in den Kampagneneinstellungen bei den Agenten als „Anweisung für die Qualifizierung" editierbar.

**Qualifizierungsmodus.** `qualificationAgentConfig.mode` ist `thorough` (Standard, das Modell des Nutzers urteilt und schreibt Summary, Angebote, Kontakte) oder `fast` (ein Entscheidungsmodell urteilt nach einer Checkliste für Bruchteile eines Cents je Lead; Summary und Kontakte füllt erst die Recherche). Den Modus nur auf ausdrücklichen Wunsch umstellen, nie von sich aus. Im Modus `fast` gilt zusätzlich: `qualificationSettings.targetLanguages` (ISO-639-1-Liste der Sprachen, die die Empfänger lesen, z. B. `["de"]`; ohne Angabe aus der Marktwahl, sonst Deutsch) entscheidet, welcher Sprachraum des Betriebs passt; `qualificationSettings.decision_checklist` wird beim ersten Lauf automatisch aus den Kriterien abgeleitet, ist danach über `get_campaign` sichtbar und per Patch änderbar — die Kernanforderung (`coreRequirement`) ist der einzige Ausschlussgrund neben dem Sprachraum. Die Fragen der Checkliste stehen in der Kampagnensprache: deutsch bei deutschen Kampagnen, sonst englisch (`questionLanguage` `de` oder `en`); ältere Checklisten ohne diese Angabe sind englisch und gelten weiter. Beim Patchen die Fragen in ihrer Sprache formulieren und `questionLanguage` weglassen — dann bleibt die gespeicherte. Eine englische Checkliste nicht von sich aus auf Deutsch umstellen; das geschieht in der Oberfläche über „Neu ableiten", auf Wunsch des Nutzers. Leads ohne brauchbare Website enden in der Qualifizierung im Modus `fast` mit `qualificationStatus = not_checked` und ohne Urteil; die Recherche läuft trotzdem weiter, stützt sich auf Maps und Websuche und setzt das Urteil selbst.

Promptänderungen erhalten Texte und Historie; aktuelle erfolgreiche Werte der Definition und expliziter transitiver `{{ai.*}}`-Abhängigkeiten werden `stale`. Betroffene freigegebene oder im Review stehende Leads mit unvollständigen benötigten Werten wechseln atomar zurück auf `processing`; `requeuedLeadCount` und `rerunRequired` berichten. Benötigt sind Vorlagenvariablen, über persistierte Instantly-Mappings verbrauchte AI-Variablen und deren explizite transitive Prompt-Abhängigkeiten, nicht alle gespeicherten Definitionen. Auch ein normaler serieller UI-Promptedit invalidiert die betroffenen Werte und öffnet die Verarbeitung wieder; daraus folgt keine Versions-/CAS-Garantie für unversionierte UI-Schreibvorgänge. Instantly-Payloads verwenden ausschließlich aktuelle `success`-Werte; `stale`-Alttexte werden nicht übertragen. Ein gezielter `start_lead_run(stages=["email"], lead_ids=[…])` erzeugt diese benötigte Variablenmenge für die ausgewählten Leads neu, nicht ausschließlich eine einzelne Variable. Keine globale Invalidierung oder automatische Neugenerierung behaupten. Rename wird bei Referenzen oder Instantly-Verknüpfung abgelehnt; keine implizite Umschreibung. `sortOrder` verschiebt die Variable auf die 1-basierte Position und lehnt Vorwärtsabhängigkeiten ab. Aktive Verarbeitung erst terminal werden lassen.

Anschließend `validate_campaign(campaign_id=80, lead_ids=[…])` und für ausgewählte Leads `preview_campaign(campaign_id=80, lead_ids=[…])` verwenden (maximal 20 pro Aufruf). Vollständige Betreffe/Bodies prüfen. Validierung ist deterministisch, keine semantische Copy-Garantie. Formal/Team sind implementiert, persönliches Du ist kein eigener Ansprachemodus. Preview/Validation lösen keine Freigabe oder externen Aktionen aus.

**Ausdrücklich gewünschter Vollersatz:** `edit_campaign(campaign_id=<id>, blueprint=<object>, confirm_overwrite=true)` — **Replace-all**: Immer das KOMPLETTE Ziel-Blueprint senden, nie nur die Aenderung. Den Ist-Stand IMMER zuerst mit dem MCP-Tool `export_campaign_blueprint(campaign_id)` holen (nie aus dem Gedaechtnis rekonstruieren — alles, was im gesendeten Blueprint fehlt, wird geloescht), anpassen, komplett zuruecksenden. Ohne `confirm_overwrite` → `confirm_overwrite_required` (Schutz). NUR dieser Code darf mit `confirm_overwrite=true` beantwortet werden.

**WARNUNG Neugenerierung:** `edit_campaign` gleicht AI-Variablen per Name ab. Gleichnamige Variablen behalten ihre generierten Werte; aendert sich Prompt oder Name, werden die Werte veraltet (`stale`), und freigegebene Leads ohne gueltigen Wert gehen zurueck auf `processing` — die Arbeit muss neu laufen und kostet erneut. Fehlt eine Variable im Blueprint, bleibt sie nur erhalten, wenn sie schon Werte hat. Vor dem Edit pruefen: Sind schon Variablen generiert (`list_leads` mit `campaign_status="pending_review"`/`approved`)? Dann dem User die Konsequenz ausdruecklich nennen und bestaetigen lassen — `confirm_overwrite=true` alleine ist KEINE informierte Zustimmung. Nie bei aktivem Lead-Run editieren (`list_lead_runs(active_only=true)` vorher pruefen).

## Phase 4: Agenten-Setup prüfen (Pflicht vor Leads)

Keine Leads in die Kampagne (`add_leads_to_campaign`, `import_leads` mit Kampagne) und kein `start_lead_run`, bevor dieser Check bestanden ist. Er gilt nach `create_campaign`, nach jedem `edit_campaign` und für jede bestehende Kampagne, die Leads bekommen soll.

1. `get_campaign(campaign_id, include=["settings"])` lesen und prüfen:
   - `qualificationSettings` enthält alle fünf Pflichtfelder unter den kanonischen Schlüsseln, jeweils nicht leer und auf diese Zielgruppe und dieses Angebot geschrieben. Stehen dort noch camelCase-Aliasse, per `patch_campaign_settings` auf die kanonischen Schlüssel umziehen.
   - `researchAgentConfig.additionalPrompt` ist kampagneneigen (nicht leer, nicht nur `researchGoals`/`researchPriorities`).
   - `emailAgentConfig.additionalPrompt` legt Sprache, Ansprache (Du/Sie) und Ton fest.
   - `qualificationAgentConfig.additionalPrompt` ist eine bewusste Entscheidung: Sie ERSETZT die Qualifizierer-Anweisung des Kontos. Vor dem Setzen `get_agent(stage="qualifier", campaign_id=…)` lesen und den Nutzer fragen.
2. `get_agent(stage=…, campaign_id=…, include_rules=false)` für `qualifier`, `researcher` und `email`: Die Laufzeit muss die Werte aus Schritt 1 zeigen (`qualificationSettings`, `additionalPrompt`).
3. `validate_campaign(campaign_id)` muss `valid: true` melden.
4. Dem Nutzer das Ergebnis als kurze Tabelle nennen (Feld, gesetzt ja/nein, erste Worte). Fehlt etwas: ergänzen oder nachfragen, NICHT mit Leads weitermachen.

Gemessen am 02.10.2026: Eine nach der alten Vorlage angelegte Kampagne zeigte in der Oberfläche Wunschkunde, Hinweise und Recherche als leer bzw. Standard, Angebot und Passt-Kriterien fehlten wirklich, und ein Probelauf startete trotzdem.

## Fehlerbehandlung

| Code | Aktion |
|------|--------|
| `validation_failed` | Fehlerliste lesen, Blueprint korrigieren, erneut senden |
| `limit_reached` | User informieren (MAX_CAMPAIGNS bzw. Variablen-/Step-Plan-Limit) |
| `confirm_overwrite_required` | User fragen, ob ueberschreiben, dann confirm_overwrite=true — nur bei genau diesem Code |
| `lead_run_active` | Ein Lauf oder eine Generierung ist aktiv. Warten (`get_lead_run_status`) oder abbrechen, NIE mit confirm_overwrite beantworten |
| `rename_conflict` | Eine umbenannte Variable wird noch in Schritten/Prompts genutzt oder ist in Instantly gemappt: erst die Verweise aendern |
| `conflict` | Sonstiger Konflikt: Meldung lesen, nicht mit confirm_overwrite beantworten |
| `campaign_not_found` | campaign_id pruefen (list_campaigns) |

Die gezielten Schreibwege `update_email_step`, `update_ai_variable` und `patch_campaign_settings` melden HTTP-Klassen als Code: `validation_failed`, `not_found` (Kampagne, Schritt oder Variable), `conflict` und `insufficient_scope`. Bei `conflict` steht die genaue Fehlerart am Anfang der Meldung, etwa `conflict: revision_conflict: …`; darauf reagieren, nicht auf den Wortlaut:

| Fehlerart nach `conflict:` | Aktion |
|------|--------|
| `revision_conflict` | `get_campaign` neu lesen, Änderung gegen den aktuellen Stand abgleichen, mit neuer `revision` erneut senden |
| `lead_run_active` | Lauf oder Generierung aktiv — Terminal-Status abwarten oder nach Rücksprache abbrechen |
| `rename_referenced_variable` / `rename_linked_variable` | Umbenennen abgelehnt: Die Variable wird in Schritten/Prompts verwendet bzw. ist in Instantly verknüpft — erst die Verweise ändern |
| `duplicate_variable_name` | Name existiert bereits in der Kampagne |
| `variable_dependency_order` | `sortOrder` würde eine Variable vor eine von ihr genutzte stellen — Position anpassen (`validate_campaign` zeigt die Abhängigkeiten) |

## Abschluss

Report: campaign_id, Name, importierte Steps/Variablen/Configs und das Ergebnis des Agenten-Checks aus Phase 4. Erst wenn er bestanden ist: "Naechster Schritt: /outreach-import — Leads in die Kampagne laden."

## Verwandt

- `/outreach-import` (Leads laden), `/outreach-pipeline` (Qualify→Research→Generate)
- die Tool-Beschreibungen des MCP-Servers
