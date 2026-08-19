---
name: kontaktseiten-fallback
description: Fallback-Baustein des Datenbeschaffungs-Pakets — fills the remaining email and phone gaps by crawling contact pages (/kontakt, /contact, /impressum, /pages/kontakt …) for rows an Impressum run could not resolve; typical cases are non-DACH domains and modern onepagers. Invoked by weg-* skills or after impressum-enrichment; never triggered directly by the user.
---

# Kontaktseiten-Fallback — die zweite Runde

Ein Impressum-Actor liest die Impressumsseite. Viele Websites führen E-Mail und Telefon aber nur
auf einer separaten Kontaktseite — oder haben gar kein Impressum, weil sie nicht der deutschen
Impressumspflicht unterliegen. Dieser Baustein crawlt gezielt die typischen Kontaktseiten-Pfade
und füllt **ausschließlich leere Zellen**. Alles, was schon in der CSV steht, bleibt unberührt.

## Wann dieser Baustein NICHT genommen wird

Die wichtigste Regel steht am Anfang, weil sie am häufigsten verletzt wird:

- **Nicht für die Erstanreicherung.** Eine frische Domain-Liste läuft immer zuerst durch
  `impressum-enrichment` — direkt, in einem Batch. Der Umweg über den Kontaktseiten-Fallback
  kostet Zeit (jeder Poll ist ein zusätzlicher Schritt) und liefert weniger Felder: keine
  Entscheider, keine Rollen, kein HRB, keine USt-Id.
- **Nicht für DACH-Domains, die noch keinen Impressum-Lauf hatten.** Erst Impressum, dann die Lücke.
- **Nicht bei kleinen Restmengen.** Bleiben nach dem Impressum-Lauf nur eine Handvoll Zeilen
  offen, ist die Lücke billiger akzeptiert als geschlossen (Trichter-Prinzip).

Passend ist er genau dann: **Nicht-DACH-Domains** (`.com`, `.co.uk`, `.nl` — kein Impressum
vorhanden), **moderne Onepager und Baukasten-Seiten**, deren Kontaktdaten nur im Kontaktbereich
stehen, und Zeilen, die der Impressum-Actor ohne Ergebnis zurückgegeben hat.

## Schritt 1 — Lücke messen

Die angereicherte CSV auswerten, bevor Geld ausgegeben wird: Wie viele Zeilen haben keine E-Mail,
wie viele keine Telefonnummer? Beide Zahlen dem Nutzer nennen. Sind es weniger als ~20 Zeilen:
Lücke akzeptieren und zurück an den rufenden Weg-Skill.

## Schritt 2 — Kontaktseiten-URLs bauen

Je Lücken-Zeile die üblichen Pfade auf der Root-Domain erzeugen:

```
/kontakt  /kontakt/  /contact  /impressum  /pages/kontakt  /ueber-uns
```

Sechs Pfade je Zeile ist der bewährte Schnitt — mehr Pfade erhöhen die Kosten linear und die
Ausbeute kaum. Für Shopify-Shops lohnt `/pages/contact` zusätzlich, für englischsprachige Seiten
`/contact-us`.

## Schritt 3 — Kosten nennen, Deckel setzen

Kalkulation: `Anzahl Lücken-Zeilen × Pfade × Preis je gecrawlter Seite` — Preise ausschließlich
aus `../datenbeschaffung-referenzen/references/kosten.md` und `../datenbeschaffung-referenzen/references/apify-actors.md`, nie schätzen.
Betrag nennen, Bestätigung abwarten, harten Deckel setzen. Ohne diesen Schritt kein Lauf.

## Schritt 4 — Crawlen (ein Batch)

Actor: **Primär aus `../datenbeschaffung-referenzen/references/apify-actors.md`** — für die reine E-Mail- und
Telefon-Lücke ist der Kontaktdaten-Extraktor aus der Impressum-Kategorie (Fallback B) der
passende Eintrag. Steht für einen Sonderfall dort noch kein Actor, gilt der Recherchemodus des
Masters, und der Fund wird in `apify-actors.md` mit Datum eingetragen.

Alle URLs in EINEM Lauf, Crawl-Tiefe 0 (nur die genannten Seiten, kein Weiterlaufen), Seitenlimit
gleich der Anzahl der URLs. Der schnelle HTML-Modus reicht; der JS-Rendering-Modus ist teurer und
kommt erst in Schritt 6 zum Zug.

## Schritt 5 — Zurückschreiben

Treffer über die Root-Domain zurück in die vorhandene Roh-CSV mergen. Zwei Regeln:

1. **Nur leere Zellen füllen.** Ein Wert aus dem Impressum schlägt einen Regex-Fund von einer
   Kontaktseite immer.
2. **Herkunft mitschreiben.** `quelle` um `+kontaktseiten` ergänzen und `hinweis` um
   `kontaktseiten-fallback` — die Qualitätsstufe behandelt diese Adressen strenger, weil sie
   nicht validiert sind.

Das CSV-Format bleibt exakt `../datenbeschaffung-referenzen/references/csv-spalten.md`; neue Spalten entstehen hier keine.
Gewinn berichten: wie viele E-Mails und Telefonnummern dazugekommen sind, wie viele Zeilen weiter
leer bleiben.

## Schritt 6 — Cloudflare-geschützte Adressen (optional)

Meldet der Lauf verschleierte E-Mail-Adressen (Cloudflare-Obfuskierung), einen zweiten, kleinen
Batch nur für diese URLs im JS-Rendering-Modus fahren — das Rendering löst die Verschleierung auf.
Deutlich teurer je URL, deshalb nur für die betroffene Teilmenge und mit eigenem Deckel.

## Schritt 7 — Übergabe

Zurück an den rufenden Weg-Skill und von dort an `listen-qualitaet` — immer, ohne Ausnahme.
Diesem Baustein gehört kein Qualitäts-Urteil und keine Übergabe; er verifiziert auch keine
Adressen, das passiert in der Qualitätsstufe.

## Bekannte Fallen

- **Regex-Funde sind ungeprüft.** Von Kontaktseiten kommen auch Datenschutzbeauftragte,
  Agentur- und Webmaster-Adressen mit. Markieren statt aussortieren — die Qualitätsstufe entscheidet.
- **404 ist kein Fehler.** Nicht jede Domain hat `/kontakt`; die Zeile bleibt einfach leer.
  Kein Neustart, keine zusätzlichen Pfade hinterherschieben.
- **Tröpfeln kostet.** Ein Lauf mit allen URLs, nicht zehn Läufe mit je fünf.
- **Datenschutz einmal erwähnen:** Impressums- und Kontaktdaten sind öffentlich, für die
  Marketing-Nutzung gilt trotzdem die DSGVO.
