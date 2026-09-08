---
name: weg-a-b2b-google
description: Dieser Skill wird vom Datenbeschaffungs-Master für B2B-Dienstleister, Agenturen, Kanzleien, Beratungen, Systemhäuser, Makler oder Planungsbüros über Google geladen. Verwendet die ListM8-MCP-Quelle google_serp_companies mit serverseitigem Bestandsabgleich, DACH-Impressum, Verifizierung und Import. Kein direkter Nutzereinstieg.
---

# Weg A: B2B-Unternehmen über Google

Firmen über ihre Websites mit `google_serp_companies` finden. Der SERP-Abruf liefert vor allem
Domains, nicht bereits vollständige Kontakte. ListM8 übernimmt die nachgelagerte Kette.
Voraussetzung sind ein bestätigter ICP, der aktuelle Katalog aus `list_lead_sources()` und ein
in ListM8 verbundenes Apify-Konto. Den Master-Ablauf für Freigabe und Polling befolgen.

## Suchstrategie und Parameter

Einen präzisen Branchenbegriff mit Stadt oder Region kombinieren, etwa „Personalvermittlung
München“, „IT Systemhaus Hamburg“ oder „Steuerkanzlei Graz“. Bei zu viel Beifang den Begriff
schärfen, statt ungeprüft größere Mengen zu bestellen. Firmengröße, Entscheiderrolle und
fachliche Passung sind keine SERP-Formularfilter; sie gehören in die spätere Qualifizierung.

| Kundenangabe | Parameter in `params` | Typ und Grenzen |
|---|---|---|
| Branche und Region als Suchbegriff | `query` | Pflicht, Text mit 1 bis 200 Zeichen |
| Land | `country` | ISO-Ländercode in Großbuchstaben, Default `DE` |
| Suchsprache | `language` | String `de` oder `en`, Default `de` |
| Maximale Treffer | `maxItems` | Ganze Zahl, 1 bis 5000; Default 500 |

Nur diese vom Katalog bestätigten Felder senden. `location`, Seitenzahlen, Actor-IDs,
Multi-Query-Arrays oder `maxPagesPerQuery` gehören nicht in dieses Formular. Die Region in
`query` aufnehmen. Ein Land je Lauf verwenden. Portalfilterung und Domain-Deduplizierung
übernimmt die Kette; keine lokale `process_serp.py`-Schleife für Katalogläufe bauen.

## Pilot schätzen und bestätigen

Mit einer Stadt und etwa 50 Treffern beginnen. Beispielargumente für
`estimate_lead_source_run` mit 0,50 USD Pilotdeckel:

```json
{
  "source_key": "google_serp_companies",
  "params": {
    "query": "Personalvermittlung München",
    "country": "DE",
    "language": "de",
    "maxItems": 50
  },
  "max_total_charge_micro_usd": 500000
}
```

`estimatedCostMicroUsd`, `minCostMicroUsd`, `maxCostMicroUsd`, `tier`, `pricingUpdatedAt`,
`budgetLimited` und den tatsächlichen Deckel vorlegen. Eine Million Micro-USD entspricht einem
USD. Die Kette kostet mehr als nur den SERP-Abruf; alte Discovery-Preise nicht als Gesamtpreis
ausgeben. Der Beispieldeckel garantiert nicht, dass alle geplanten Stufen hineinpassen.

Bei `budgetLimited=true` kleinere Mengen oder einen anderen Deckel erneut schätzen und
freigeben lassen. Erst nach ausdrücklicher Freigabe `start_lead_source_run` mit demselben
JSON-Argumentobjekt aufrufen. Ein optionales äußeres `max_items` überschreibt `params.maxItems`;
keine widersprüchlichen Mengen verwenden. Zulässig sind 1 bis 5000 Treffer und 1 bis
1000000000 Micro-USD Deckel. Ohne Deckel gilt der Benutzerstandard, initial 20 USD;
beim Start dennoch den bestätigten Wert ausdrücklich senden.

## Serverseitige Kette verfolgen

Die erhaltene `run_id` speichern und über `get_lead_source_run` pollen. Nicht wegen langer
Laufzeit erneut starten. Bis `completed`, `failed` oder `cancelled` abfragen; ein Abbruchwunsch
läuft über `cancel_lead_source_run` und beendet das Polling nicht sofort.

1. `source` ruft Suchtreffer ab und bereitet Firmen-Domains auf.
2. `dedupe` gleicht gegen vorhandene Leads ab. Bekannte Treffer benötigen keine erneute Anreicherung.
3. `imprint` ergänzt E-Mail-Lücken nur in DE, AT und CH.
4. `verify` prüft neue E-Mail-Adressen. `invalid` wird verworfen, `catch_all` und `unknown`
   bleiben ausdrücklich markiert importierbar.
5. `import` erstellt die Ergebnisliste und verknüpft beziehungsweise importiert Leads.

**Außerhalb DACH keinen Kontaktreichtum versprechen.** Der Impressum-Schritt wird übersprungen;
SERP-Domains ohne E-Mail reichen nicht für den Import. Vor dem Start diese Einschränkung
nennen. Eine gesonderte manuelle Quelle nur verwenden, wenn der benötigte Quellentyp nicht im
Katalog verfügbar ist. Einen laufenden Kataloglauf nicht durch zusätzliche Actors ergänzen.

Kein manueller Impressum-Lauf, Verifier-Aufruf, CSV-Bau oder Import für diese Kette.
Bei `failed` die Fehlerfelder und Kosten berichten, nicht automatisch wiederholen.
`limit_exceeded` kann trotz bezahlter Beschaffung einen Import wegen ListM8-Kontingent verhindern.

## Pilot bewerten, skalieren und berichten

Die tatsächliche Liste und den Pilot-Fit prüfen, nicht nur die Anzahl Google-Treffer. Portale,
Jobbörsen, Kammern oder Branchenartikel können weiterhin Beifang sein. Ab 80 % ICP-Fit
mit derselben Strategie skalieren. Neue Regionen oder Query-Varianten als eigene Läufe erneut
schätzen und freigeben lassen. Gesamtausgaben mehrerer Läufe nicht hinter Einzeldeckeln verstecken.

Report mit `found`, `known`, `newCandidates`, `enrichedByImprint`, allen vier Verifizierungszählern,
`discardedNoContact`, `doNotContactHits` und `imported` ausgeben. Run-ID, Status, Query, Filter,
Schätzung, tatsächliche Kosten, Kostendeckel sowie `leadListId` ergänzen. Null bei `leadListId`
heißt, dass keine Ergebnisliste verfügbar ist. `imported` nicht als Zahl sicher kontaktierbarer
Neukontakte interpretieren.

`../listen-qualitaet/SKILL.md` im **MCP-Katalogpfad** laden. Die vorhandene Liste per Stichprobe
prüfen, aber nicht erneut importieren oder verifizieren. Die Weiterverarbeitung erfolgt auf
Auftrag über den Outreach-Workflow mit `start_lead_run`.
