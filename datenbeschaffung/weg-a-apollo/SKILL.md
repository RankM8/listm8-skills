---
name: weg-a-apollo
description: Weg A des Datenbeschaffungs-Pakets, Alternative zum Google-SERP-Weg — B2B decision makers straight from the Apollo database, with verified email, company phone and LinkedIn included. Invoked by the datenbeschaffung master; never triggered directly by the user.
---

# Weg A (Apollo) — B2B-Entscheider mit Kontaktdaten ab Werk

Für B2B-Dienstleister, Agenturen, Kanzleien, Systemhäuser, SaaS, Industrie. Der Unterschied zu
`weg-a-b2b-google`: Hier wird nicht erst die Domain gefunden und dann das Impressum gescrapt —
Name, Position, verifizierte E-Mail, Firmennummer, Website und LinkedIn kommen aus einem Zug.

**Wann dieser Weg statt Google:** Der Kunde hat bereits einen Apollo-Zugang, ODER er braucht die
Entscheider-Ebene sofort und will die Anreicherungsstrecke sparen. Der Kurs empfiehlt als Einstieg
weiterhin den Google-Weg (deutlich günstiger, teils aktuellere Daten) — Apollo ist die Alternative,
nicht der Standard.

Voraussetzungen vom Master: bestätigter ICP-Satz + Anti-ICP, Apollo-Account (Free reicht zum
Testen), Vorab-Abgleich gelaufen (falls MCP verbunden).

## Schritt 0 — Zugriffsweg

Ist der **Apollo-MCP-Connector** verbunden, wird Apollo nicht über die eigene Oberfläche bedient:
Filter, Suche, Anreicherung und Export laufen über den Connector. Ohne Connector dieselben Filter
in der Apollo-UI setzen und dort als CSV exportieren — die weiteren Schritte sind identisch.

## Schritt 1 — Credit-Ökonomie (vor dem ersten Enrichment nennen)

| Vorgang | Kosten |
|---|---|
| Personen-/Firmensuche, Filter beliebig oft ändern, Ergebnisse ansehen | **kostenlos, unbegrenzt** |
| Export ohne Kontaktdaten (zum Gegenprüfen der Liste) | **kostenlos** |
| E-Mail-Enrichment je Treffer (Firmennummer meist mit dabei) | **1 Credit** |
| Mobilnummer je Treffer | **8 Credits** |

Credits werden nur bei erfolgreichem Fund abgezogen — keine E-Mail, kein Credit.

Pläne (Stand der Kurs-Lektion, vor dem Kauf prüfen): Free 75 Credits zum Antesten, Basic ca. 65 $
monatlich bzw. 49 $ bei Jahreszahlung mit **2.500 Credits pro Monat**. Diese 2.500 sind das
Monatskontingent und damit die Obergrenze angereicherter Leads — nicht „unbegrenzt". Nicht
verbrauchte Credits nicht als Rücklage für den Folgemonat einplanen.

**Mobilnummern hier grundsätzlich nicht ziehen**: 8 Credits sind 8 E-Mails. Wenn Mobilnummern
gebraucht werden, entscheidet das `enrichment-waterfall` — und nur für die Spitze der Liste.

## Schritt 2 — ICP in Filter übersetzen

Nach den Dimensionen aus `../datenbeschaffung-referenzen/references/icp.md`: Rolle (Geschäftsführer, Inhaber, CEO),
Branche des KUNDEN, Größe (Mindest-Mitarbeiterzahl setzen), Region, Trigger. Anti-ICP wird zum
Ausschluss — der wirksamste Hebel sind **Branchen-/SIC-Code-Ausschlüsse** (belegtes Beispiel:
reine SaaS- und Softwarefirmen aus einer Systemhaus-Suche werfen, ohne die Branchenbreite zu
verlieren). Zusätzlich immer: **ein Kontakt pro Firma**.

Technologie- und Ads-Filter (nutzt Facebook Ads, hat Tool X installiert) erst zuschalten, wenn die
Grundmenge steht — und danach die Trefferzahl prüfen. Belegt: ein Facebook-Ads-Filter drückte eine
Regionssuche auf null und deutschlandweit auf 34 Treffer; solche Filter fliegen dann wieder raus.

## Schritt 3 — Test-Treppe (Pflicht-Ablauf)

Nie sofort 1.000 Leads anreichern. Jede Stufe endet mit einem Urteil des Nutzers:

| Stufe | Menge | Credits | Prüfung |
|---|---|---|---|
| 1 | 10–25 | 0 | ICP-Check von Hand: Firmen googeln. **Ziel ≥ 8 von 10 passen.** Darunter: Filter schärfen, wiederholen |
| 2 | dieselben 10 | ≤ 10 | Anreichern, als CSV exportieren, E-Mails und Telefonnummern real testen (Zustellung, Erreichbarkeit) |
| 3 | 100 | 0, dann ≤ 100 | Erst ohne Credits exportieren und im Bulk gegen den ICP prüfen, dann anreichern |
| 4 | 500–1.000 | entsprechend | Erst nach bestandener Stufe 3 |

Die Stufen 1 und 3 kosten nichts — dort wird experimentiert, nicht beim Enrichment.

## Schritt 4 — Roh-CSV bauen

Der Export liefert Vorname, Nachname, Position, Firma, E-Mail samt Status, Firmentelefon, Website,
LinkedIn-URL, Standort und Mitarbeiterzahl. Daraus das eine Format aus `csv-spalten.md` bauen:
Datensätze als JSON mit den generischen Schlüsseln (`email`, `firstName`, `lastName`, `company`,
`website`, `phone`, `city`) ablegen, dann

```
python3 ../datenbeschaffung-referenzen/scripts/build_csv.py --in apollo.json \
  --quelle "apollo <datum>" --out leads-<nische>-<region>-<datum>.csv
```

LinkedIn-URL, Position und Mitarbeiterzahl als Zusatzspalten (`linkedin_url`, `position`,
`mitarbeiter`) mitführen — sie wandern als Custom-Attribute mit und tragen die Personalisierung.

## Schritt 5 — Übergabe

An `listen-qualitaet` — immer. Dabei erwähnen, dass Apollo einen E-Mail-Status mitliefert: Adressen
mit Status „verified" müssen dort nicht erneut kostenpflichtig verifiziert werden.

## Bekannte Fallen

- **Dieselbe Firma mehrfach** in der Ergebnisliste: kostet doppelt Credits und schickt zwei Mails
  ins selbe Haus — ein Kontakt pro Firma erzwingen, bevor angereichert wird.
- **Zu kleine Betriebe** rutschen durch (Zwei-Personen-Firmen) — Mindestgröße nachziehen, solange
  es noch nichts kostet.
- **Anreichern vor dem ICP-Check**: Filterarbeit ist gratis, das Enrichment nicht. Alles Ausprobieren
  gehört vor den ersten Credit.
- **Impressum-Lauf on top**: für Leads mit persönlicher Adresse überflüssig. `impressum-enrichment`
  nur für die Lücke oder wenn Firmendaten (Adresse, HRB, USt-Id) gebraucht werden.
