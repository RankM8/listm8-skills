# Städtelisten DACH

> DIE eine Städteliste — jeder Skill referenziert sie, keiner kopiert sie.
> Regel: **eine Region pro Durchlauf** scrapen (erleichtert Dedupe), Pilotstadt zuerst.

## Deutschland Top 15

Berlin, München, Hamburg, Köln, Frankfurt, Stuttgart, Düsseldorf, Leipzig, Hannover,
Nürnberg, Dresden, Bremen, Essen, Dortmund, Bonn

## Deutschland erweitert (16–30, für Skalierungsrunden)

Mannheim, Karlsruhe, Wiesbaden, Münster, Augsburg, Aachen, Mönchengladbach, Braunschweig,
Kiel, Freiburg, Krefeld, Mainz, Lübeck, Erfurt, Rostock

## Österreich Top 5

Wien, Graz, Salzburg, Linz, Innsbruck

## Schweiz Top 5

Zürich, Bern, Basel, Luzern, Genf

## Regeln

1. **Pilotstadt zuerst.** Eine mittelgroße Stadt (nicht Berlin — zu viel Noise, nicht zu klein —
   zu wenig Signal). Bewährt: Köln, Stuttgart, Hannover.
2. **Ballungsraum-Dopplung beachten:** Köln/Leverkusen, Düsseldorf/Neuss, Frankfurt/Offenbach,
   Essen/Dortmund/Bochum liefern überlappende Treffer — der Dedup (dedup.py, Root-Domain) fängt das,
   aber beim Volumen-Schätzen einrechnen.
3. **Google Maps braucht keine Stadt-Schleife:** `locationQuery` kann ein ganzes Bundesland oder
   Land sein — der Actor teilt intern in Subregionen. Die Städteliste gilt vor allem für
   SERP-Queries („<begriff> <stadt>").
4. Bei Maps gilt: **ein Land pro Lauf** (DE/AT/CH getrennt) — das hält Dedupe und CSV-Split sauber.
