---
name: outreach-launch
description: 'Use when user says "Kampagne launchen", "Kampagne live schalten", "Versand vorbereiten", "Domains einrichten", "Postfächer einrichten", "Zapmail", "SPF DKIM DMARC", "Warm-up", "Warmup", "Instantly einrichten", "Sendelimit", "Versandvolumen", "Kampagne hochfahren", "Antwortquote verbessern", "Reply Rate verbessern", "Bounce Rate zu hoch", "Mails landen im Spam", "Kampagne auswerten", "Kampagne optimieren", "A/B-Test", "Nachtelefonieren", or asks what happens after the export from ListM8. Versand-Vorbereitung und Launch außerhalb von ListM8: Domains, Postfächer, Warm-up, Instantly-Setup, Hochfahren, KPI-Auswertung, Stopp-Schwellen, Optimierung und wann Copy, Offer oder Liste geändert werden.'
---

# Outreach Launch — vom Export zur laufenden Kampagne

> **Live-Ansicht (Claude Code mit Plugin `outreach`):** Ergebnisse von `list_leads`, `import_leads`/`get_job_status` und Lead-Runs erscheinen dort als Karte bzw. im Band über dem Prompt. Dann die Liste **nicht noch einmal als Tabelle** wiederholen – nur kurz zusammenfassen, was der Nutzer wissen oder entscheiden muss. In anderen Umgebungen (Claude-Chat, ChatGPT, Codex) wie gewohnt als kurze Liste ausgeben.

ListM8 versendet keine Mails. Es qualifiziert, recherchiert, erzeugt die AI-Variablen und übergibt
die freigegebenen Leads per CSV-Export oder Push an Instantly. Domains, Postfächer, Warm-up,
Versand, Antworten und Telefonate laufen beim Kunden in Instantly (oder einem vergleichbaren
Versandtool). Dieser Skill führt durch genau diesen Teil und sagt, wann die Arbeit zurück in
ListM8 gehört.

Ausführliche Lehre: `references/technisches-setup.md` (Domains, Zapmail, DNS, Postfächer,
Warm-up, Versand-Einstellungen, Kosten) und `references/launch-und-optimierung.md` (Einrichten in
Instantly, Hochfahren, Launch-Check, Nachtelefonieren, KPIs, Stopp-Schwellen, Diagnose, A/B-Tests,
Antworten). Bei einem Widerspruch zu `outreach-copy` gilt `outreach-copy`; zwischen diesen
Referenzen und dieser SKILL.md gilt diese SKILL.md.

## Wer macht was

| Schritt | Wo | Skill / Werkzeug |
|---|---|---|
| Leads beschaffen (eigenes Apify-/Outscraper-Konto), bereinigen, verifizieren, importieren | beim Kunden, Import in ListM8 | `datenbeschaffung`, `listen-qualitaet`, `import_leads` |
| Kampagne mit Sequenz, Variablen-Prompts, Qualifizierung und Research anlegen | ListM8 | `outreach-campaign`, `outreach-copy` |
| Qualifizieren, recherchieren, Variablen erzeugen | ListM8 | `outreach-pipeline` (`start_lead_run`) |
| Review und Freigabe | ListM8 | `outreach-verify` (`approve_lead_variables`, `reject_lead_variables`) |
| Übergabe an Instantly: CSV-Export oder Push (Verknüpfung, Variablen-Zuordnung, Sequenz-Übertragung, Lead-Push) | ListM8-Oberfläche, Reiter „Instantly" der Kampagne | kein MCP-Tool |
| Domains, Postfächer, DNS, Warm-up | beim Kunden (Domain-Anbieter, Zapmail, Instantly) | `references/technisches-setup.md` |
| Versand, Zeitplan, Limits, A/B-Varianten | Instantly | `references/launch-und-optimierung.md` |
| Antworten, Nachtelefonieren, Termine | Postfach, Telefon, CRM | `references/launch-und-optimierung.md` |
| Kontaktstatus zurück nach ListM8 (kontaktiert, geantwortet, gesperrt) | ListM8 | Kontaktstatus-Sync der Instantly-Integration, sonst `mark_leads_contacted` |

Der Agent kann weder Instantly noch Zapmail noch einen Domain-Anbieter bedienen. Er erklärt die
Schritte, prüft Angaben des Nutzers gegen die Checklisten und erledigt die ListM8-Seite per MCP.
Käufe und Abos (Domains, Zapmail, Instantly) entscheidet und bezahlt der Kunde.

## Regeln

1. **Setup vor Versand.** Kein echter Versand vor 14 Tagen Warm-up mit gutem Score, auch nicht
   „nur 20 Mails zum Testen". Nie die Hauptdomain für Cold Mailing.
2. **Mehr Volumen heißt mehr Postfächer, nie mehr Mails pro Postfach.** 30 Mails pro Inbox und Tag,
   langsam hochfahren (Woche 1: 100-150, Woche 2: 200-250, ab Woche 3: 300 bei 10 Inboxen).
3. **Stopp vor Optimierung.** Beschwerdequote über 0,3 % oder Bounce Rate über 5 %: Versand
   anhalten, nicht weiterlaufen lassen.
4. **Sperren gelten global und dauerhaft.** Abmeldungen und Beschwerden werden in ListM8 zu
   `do_not_contact`; einen Lead nur aus der Kampagne zu nehmen reicht nicht. `do_not_contact` nie
   zurücksetzen.
5. **Nichts behaupten, was nicht passiert ist.** Weder Versand noch Zustellung noch Antworten aus
   ListM8 ableiten, solange der Nutzer oder der Kontaktstatus es nicht belegt.

## Phase 1: Setup (parallel zur Arbeit in ListM8)

`references/technisches-setup.md` durchgehen: 5 Sekundärdomains, Zapmail, 10 Microsoft-365-
Postfächer, SPF/DKIM/DMARC (DMARC mit `p=none` und Reporting-Adresse), Export nach Instantly,
Warm-up für alle Postfächer (Flamme grün), Versand-Einstellungen. Während der 14 Tage Warm-up
entstehen Liste und Kampagne in ListM8. Am Ende die Checkliste „Setup fertig?" mit dem Nutzer
abhaken.

## Phase 2: Übergabe aus ListM8

1. `list_campaigns` und `export_campaign_blueprint(campaign_id)`: Stimmt die Kampagne, sind Sequenz
   und Variablen nach `outreach-copy` geprüft?
2. Freigegebene Leads prüfen: `list_leads` mit `campaign_status="approved"`. Fehlt der Review noch,
   zuerst `outreach-verify`.
3. Übergabe in der Oberfläche: Im Reiter „Instantly" der Kampagne die Instantly-Kampagne verknüpfen
   oder anlegen, die Sequenz übertragen, die Variablen-Zuordnung vervollständigen (ungemappte
   Pflicht-Platzhalter blockieren den Push), die Vorschau mit einem freigegebenen Lead ansehen,
   dann die Leads pushen. Auto-Push überträgt Freigaben aus der Oberfläche sofort; nach Freigaben
   über den MCP das offene Delta (Pipeline-Streifen „Ausstehend") per Push-Button übertragen.
   Ohne Integration: CSV-Export der Kampagne in Instantly hochladen und die Variablen dort zuordnen.
4. Übertragene Leads tragen danach den Kontaktstatus `exported_to_instantly` (prüfbar mit
   `search_leads(contact_status="exported_to_instantly")`).

## Phase 3: Launch

Kampagne in Instantly einrichten, Launch-Check und Hochfahren nach
`references/launch-und-optimierung.md`. Kern des Launch-Checks ist die Stichprobe der ersten
40 AI-Opener: Fallen mehr als 8 durch, nicht starten, sondern in ListM8 nachschärfen (Ablehnung mit
`reject_lead_variables` plus `set_lead_email_feedback`, Prompt über `outreach-campaign`).
Ab Tag 1 nachtelefonieren.

## Phase 4: Auswerten (wöchentlich, ab Woche 4)

30 Minuten pro Woche mit den Instantly-Zahlen gegen die KPI-Benchmarks. Diagnose immer in der Kette
Beschwerden und Bounces → Open Rate → Reply Rate → Termine. Einzelne Tage nicht bewerten.

## Phase 5: Optimieren — was ändern?

| Befund | Was ändern | Wo |
|---|---|---|
| Beschwerdequote über 0,3 % | Versand stoppen, Betreff und Zielgruppe prüfen | Instantly, dann `outreach-copy` bzw. `datenbeschaffung` |
| Bounce Rate über 5 % | Versand stoppen, Liste bereinigen und neu verifizieren | `listen-qualitaet`; Bounces landen per Sync als `do_not_contact` |
| Open Rate unter 40 % | erst Domain-Reputation und Warm-up, dann Betreffzeilen | `references/technisches-setup.md`, `outreach-copy` |
| Reply Rate unter 0,5 % nach 200+ Mails je Variante | **Offer** neu (andere Karte, nicht andere Formulierung) | `outreach-copy` (Marketing-Offer), dann `outreach-campaign` |
| Reply Rate unter 1 %, Mail lang oder generisch | **Copy**: kürzen, `intro`-Prompt schärfen | `outreach-copy`, `outreach-campaign` |
| viele negative Antworten | **Liste**: Zielgruppe falsch, ICP schärfen | `datenbeschaffung` (ICP), Qualifizierung in `outreach-campaign` |
| Antworten, aber keine Termine | nachtelefonieren, nicht die Mail ändern | `references/launch-und-optimierung.md` |

Getestet wird immer nur eine Variable, mindestens 100 (besser 200) Mails je Variante und 7 Tage, in
der Reihenfolge Offer → Betreff → Opener-Angle → CTA → FUP-Timing. Änderungen an Sequenz oder
Variablen in ListM8 laufen über `export_campaign_blueprint` → `edit_campaign` (Vollersatz); das
Ersetzen der AI-Variablen löscht alle erzeugten Werte der Kampagne und kostet eine Neugenerierung,
deshalb vorher ausdrücklich bestätigen lassen. Eine neue Sequenz-Übertragung ersetzt die Sequenz in
Instantly samt dort angelegter Varianten.

## Phase 6: Rückmeldung nach ListM8

- Mit Instantly-Integration übernimmt der Kontaktstatus-Sync (täglich, oder „Jetzt abgleichen")
  kontaktierte Leads, Antworten (`replied`), Interessierte (`opportunity`) sowie Bounces und
  Abmeldungen (`do_not_contact`) aus dem ganzen Workspace.
- Ohne Integration oder für Abmeldungen per Antwort, Telefon oder Brief:
  `mark_leads_contacted(emails=[…], status="do_not_contact" | "contacted" | "replied" | "opportunity")`.
  Status werden nie herabgestuft; ein Zurücksetzen auf `not_contacted` nur auf ausdrücklichen
  Wunsch und nie für gesperrte Leads.
- Die nächste Liste entsteht, während die Kampagne läuft (`datenbeschaffung`); der Bestandsabgleich
  dort berücksichtigt den Kontaktstatus.

## Verwandt

- `outreach-copy` — Copy-Regeln, Betreffzeilen, Offer; gilt bei Widersprüchen.
- `outreach-campaign`, `outreach-pipeline`, `outreach-verify` — die ListM8-Seite bis zur Freigabe.
- `datenbeschaffung` und `listen-qualitaet` — Liste, ICP, Verifizierung, Sperren.
