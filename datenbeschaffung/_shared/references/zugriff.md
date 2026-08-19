# Zugriffsschicht — Actor starten, Ergebnis abholen

> Die Skills reden nur über **Actor + Input**. WIE der Aufruf rausgeht, steht ausschließlich hier —
> damit jeder Weg in jeder Umgebung läuft (Claude Desktop, Claude Code, Codex, jede Umgebung mit HTTP).

## Umgebung feststellen (einmal am Anfang jedes Laufs)

1. Gibt es Apify-MCP-Tools (`search-actors`, `call-actor`, `get-dataset-items`)? → **Weg A: MCP**
2. Sonst: Gibt es einen `APIFY_TOKEN` (Env oder vom Nutzer genannt) und HTTP-Zugriff? → **Weg B: REST**
3. Sonst: Ist `apify` (CLI) installiert und eingeloggt? → **Weg C: CLI**
4. Nichts davon → Setup-Referenz (`setup.md`) durchgehen, NICHT improvisieren.

## Weg A: MCP

| Schritt | Tool | Hinweise |
|---|---|---|
| Actor prüfen | `fetch-actor-details` (pricing, stats, inputSchema) | IMMER vor dem ersten kostenpflichtigen Lauf |
| Lauf starten | `call-actor` mit `input` | **Pflicht:** `callOptions.maxTotalChargeUsd` setzen (Pilot: ≤ 0,50 $; Skalierung: kalkulierter Deckel + 50 %) |
| Warten | `get-actor-run` mit `waitSecs` | Große Läufe: alle 2–4 Min pollen, nicht dauerpollen |
| Ergebnis | `get-dataset-items` mit `fields=` | Nur benötigte Felder projizieren — spart Kontext |

## Weg B: REST

```
# Lauf starten (asynchron)
POST https://api.apify.com/v2/acts/{actorId}/runs
Authorization: Bearer $APIFY_TOKEN
Content-Type: application/json
{ ...input... }
# actorId-Format in URLs: username~actor-name (Tilde statt Slash)

# Status
GET https://api.apify.com/v2/actor-runs/{runId}

# Ergebnis
GET https://api.apify.com/v2/datasets/{datasetId}/items?format=json&fields=...
```

Kosten-Deckel bei REST: `?maxTotalChargeUsd=0.5` als Query-Parameter beim Start mitgeben.

## Weg C: CLI

```
apify call {username}/{actor-name} --input '{...}' --timeout 600
apify datasets get-items {datasetId} --format json
```

## Eiserne Regeln (gelten auf allen Wegen)

1. **Kein kostenpflichtiger Lauf ohne genannten Preis.** Vorher aus `apify-actors.md`/`kosten.md`
   kalkulieren und dem Nutzer nennen: „Das kostet etwa X $ — ok?"
2. **Jeder Lauf hat einen Kosten-Deckel** (maxTotalChargeUsd bzw. Query-Parameter).
3. **Pilot vor Skalierung.** Erst ~50 Ergebnisse in EINER Stadt, Trefferquote prüfen, dann hochziehen.
4. **Actor-IDs kommen aus `apify-actors.md`** — nie raten, nie aus dem Gedächtnis.
