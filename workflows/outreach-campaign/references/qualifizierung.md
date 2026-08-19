# Qualifizierungs-Kriterien formulieren — offen statt restriktiv

> Die Qualifizierung ist ein OFFENER Vorfilter, kein Feinsieb. Falsch aussortierte Leads sind
> endgültig verloren; durchgelassene Grenzfälle kosten nur einen Research-Lauf. Der Server-Agent
> kennt diese Philosophie bereits — deine Kriterien dürfen sie nicht unterlaufen.

## So formulierst du `qualificationSettings`

- **idealCustomer / fit_criteria: INKLUSIV.** „Passt, wenn …" statt „raus, wenn nicht …".
  Positive Merkmale beschreiben (Branche des KUNDEN, Größenkorridor, Region, erkennbarer Bedarf) —
  nicht eine Checkliste, die jeder Lead vollständig erfüllen muss.
- **disqualifiers: NUR harte No-Gos.** Falsche Branche, Wettbewerber, Konzern > 500 MA,
  kein Geschäftsbetrieb erkennbar, explizite Ausschlüsse des Kunden. Jeder Disqualifier muss so
  konkret sein, dass die Ablehnung einen benennbaren Grund hat.
- **NIE als Disqualifier:** Geschmacksurteile (hässliche/dünne Website, wenig Content, kein Blog),
  fehlende Einzelinfos (kein Team auf der Website), Unsicherheit. Das sind Need-Signale oder
  Research-Aufgaben — bei Bedarfs-Offers ist die „schlechte" Website sogar das Verkaufsargument.
- **Faustregel für die Erwartung:** In einer halbwegs sauberen Liste sollten grob 60–80 % durch
  die Qualifizierung kommen (überwiegend mid_qualified/qualified). Fallen regelmäßig > 50 %
  durch, sind die Kriterien zu streng ODER die Liste ist falsch — beides beim Nutzer ansprechen,
  nicht stillschweigend hinnehmen.

## Beispiel (Webdesign/SEO an Handwerk)

```json
{
  "idealCustomer": "Inhabergeführte Handwerksbetriebe (SHK, Elektro, Dach, Bau) in DACH mit 1-50 Mitarbeitern. Passt, wenn ein aktiver Geschäftsbetrieb erkennbar ist - auch mit veralteter oder minimaler Website (das ist unser Ansatzpunkt, kein Ausschluss).",
  "disqualifiers": "Ketten und Konzerne über 500 MA, Franchise-Zentralen, reine Baumärkte/Handel, Webdesign-/Marketing-Agenturen (Wettbewerber), Betriebe in Abwicklung.",
  "additionalInstructions": "Im Zweifel mid_qualified mit ehrlicher Begründung - Research und Review filtern weiter. Ablehnung nur mit konkret benanntem Disqualifier."
}
```

## Woran du eine zu restriktive Konfiguration erkennst

- Disqualifier-Liste länger als die Fit-Beschreibung.
- Bedingungen mit UND-Ketten („muss X und Y und Z haben").
- Anforderungen an Dinge, die die Website oft nicht zeigt (Umsatz, Mitarbeiterzahl exakt).
- Der Kunde beschreibt seinen TRAUM-Kunden statt seines KAUFENDEN Kunden.
