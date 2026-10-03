# Qualifizierungs-Kriterien formulieren — offen statt restriktiv

> Die Qualifizierung ist ein OFFENER Vorfilter, kein Feinsieb. Falsch aussortierte Leads sind
> endgültig verloren; durchgelassene Grenzfälle kosten nur einen Research-Lauf. Der Server-Agent
> kennt diese Philosophie bereits — deine Kriterien dürfen sie nicht unterlaufen.

## So formulierst du `qualificationSettings`

- **target_customer_profile / fit_criteria: INKLUSIV.** „Passt, wenn …" statt „raus, wenn nicht …".
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
  "target_customer_profile": "Inhabergeführte Handwerksbetriebe (SHK, Elektro, Dach, Bau) in DACH mit 1-50 Mitarbeitern. Passt, wenn ein aktiver Geschäftsbetrieb erkennbar ist - auch mit veralteter oder minimaler Website (das ist unser Ansatzpunkt, kein Ausschluss).",
  "offer_summary": "Kostenlose Vorschau einer neuen, mobilfreundlichen Startseite; danach die komplette Handwerker-Website.",
  "fit_criteria": "Passt, wenn der Betrieb selbst Handwerksleistungen vor Ort erbringt. Starke Signale: Website veraltet oder nicht mobilfreundlich, nur Branchenbuch- oder Google-Profil, gute Bewertungen ohne Sichtbarkeit. Keines davon ist Pflicht.",
  "disqualifiers": "Ketten und Konzerne über 500 MA, Franchise-Zentralen, reine Baumärkte/Handel, Webdesign-/Marketing-Agenturen (Wettbewerber), Innungen, Kammern, Verbände, Bildungsträger, Zeitarbeit, Branchenverzeichnisse, Betriebe in Abwicklung.",
  "additional_prompt": "Im Zweifel mid_qualified mit ehrlicher Begründung - Research und Review filtern weiter. Ablehnung nur mit konkret benanntem Disqualifier."
}
```

Immer diese kanonischen Schlüssel verwenden. Die camelCase-Aliasse (`idealCustomer`,
`additionalInstructions` …) wertet nur die Laufzeit aus; die Oberfläche zeigt die Felder dann leer.
Bei Maps-Listen gehören die typischen Nachbartreffer (Innungen, Verbände, Zeitarbeit, Händler,
Verzeichnisse) in die Disqualifier: Google Maps liefert zu einem Gewerk regelmäßig 30-40 % davon.

`additional_prompt` ist die Zusatzanweisung der Kampagne („Zusätzliche Hinweise") und wird auch
von der Recherche als Maßstab gelesen. Er gehört deshalb nur Formulierungen, die für beide Stufen gelten
(etwa „im Zweifel mid_qualified").

## Woran du eine zu restriktive Konfiguration erkennst

- Disqualifier-Liste länger als die Fit-Beschreibung.
- Bedingungen mit UND-Ketten („muss X und Y und Z haben").
- Anforderungen an Dinge, die die Website oft nicht zeigt (Umsatz, Mitarbeiterzahl exakt).
- Der Kunde beschreibt seinen TRAUM-Kunden statt seines KAUFENDEN Kunden.
