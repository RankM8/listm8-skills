# Copywriting — siehe Skill `outreach-copy`

Die Copy-Regeln für Kampagnen stehen ausschließlich im Skill `outreach-copy`
(Skill `outreach-copy`). Er ist vor jeder Zeile Sequenz oder Variablen-Prompt
VERBINDLICH zu laden. Hier steht bewusst keine zweite Fassung.

Dort zu finden:

- Offer-Karten A-E mit den festen Überleitungen, Marketing-Offer-Regeln, verbotene Offer-Begriffe
- Anatomie der Entry-Mail: `{{ai.hallo}}` → `{{ai.intro}}` → Überleitung + Offer →
  Feinheiten-Satz (A/C Pflicht) → EIN Frage-CTA → Klartext-Signatur
- 5er-Sequenz (`delayDays` 0/3/5/7/7, max. 120/50/80/60/60 Wörter), Betreffzeilen
- Anrede je `emailAgentConfig.salutation` (`du`, `team`, `sie`), Vornamen über den `hallo`-Prompt
  statt Platzhalter, erlaubte Platzhalter (`{{ai.*}}`, `{{lead.company}}`, `{{lead.website}}`,
  `{{lead.city}}`, `{{custom.*}}`)
- Pflichtinhalt der Prompts von `hallo` und `intro`, Intro-Regeln mit Fallback-Satz
- Verbote, Spam-Wörter, „kostenlos“-Regel, Selbstprüfung (14 Punkte) und Prüfliste
- `references/copy-lehre.md`, `references/marketing-offer.md`,
  `references/beispiel-blueprint.md` (vollständiger Blueprint)
