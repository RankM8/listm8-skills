# Noise-Domains — DIE eine Ausschlussliste

> Kuratierter Startbestand (19.08.2026). Die früher behaupteten „280+ Domains" existierten nie als
> Datei — diese Liste ist ehrlich: jeder Eintrag wurde gesehen oder ist eine bekannte Plattform.
> **Sie wächst mit jedem Lauf:** Neue Portale, die in Ergebnissen auftauchen, werden HIER ergänzt.
>
> Einsatz: (a) `process_serp.py` filtert SERP-Treffer dagegen, (b) als `domainBlacklist` beim
> Impressum-Actor (spart bares Geld — Portale werden sonst mitberechnet), (c) im Query-Bau als
> `-site:`-Ausschlüsse für die schlimmsten Treiber.

## Verzeichnisse & Bewertungsportale (DACH)

gelbeseiten.de, 11880.com, dasoertliche.de, dastelefonbuch.de, wlw.de, yelp.de, yelp.com,
golocal.de, meinestadt.de, werkenntdenbesten.de, kununu.com, trustpilot.com, trustpilot.de,
provenexpert.com, trustlocal.de, firmenwissen.de, northdata.de, unternehmensregister.de,
online-handelsregister.de, creditreform.de, branchenbuch.me, cylex.de, marktplatz-mittelstand.de,
firmendb.de, koelnerbranchen.de, dein-heizungsbauer.de, handwerksblatt.de

## Vermittlungs- & Auftragsportale

myhammer.de, check24.de, aroundhome.de, blauarbeit.de, houzz.de, homify.de, wirsindhandwerk.de,
listando.de, fixando.de, anbieter-finden.de, 11880-*.com

## Job-Portale

indeed.com, stepstone.de, monster.de, xing.com, linkedin.com, glassdoor.de, arbeitsagentur.de,
jobware.de, kimeta.de, meinestadt-jobs.de

## Marktplätze, Ketten & Preisvergleiche

amazon.de, amazon.com, ebay.de, ebay-kleinanzeigen.de, kleinanzeigen.de, etsy.com, otto.de,
zalando.de, idealo.de, billiger.de, geizhals.de, guenstiger.de, preisvergleich.de,
mediamarkt.de, saturn.de, obi.de, hornbach.de, bauhaus.info, hagebau.de, toom.de, tchibo.de,
douglas.de, flaconi.de, lidl.de, aldi-sued.de, aldi-nord.de, rewe.de, edeka.de, dm.de, rossmann.de

## Social & Content

facebook.com, instagram.com, youtube.com, tiktok.com, pinterest.de, pinterest.com, twitter.com,
x.com, wikipedia.org, wikihow.com, reddit.com, quora.com, medium.com, chip.de, computerbild.de,
focus.de, spiegel.de, sueddeutsche.de, faz.net, welt.de, t-online.de, gutefrage.net

## Stadt- & Regionalportale (Muster)

koeln.de, muenchen.de, berlin.de, hamburg.de, stuttgart.de, wien.gv.at, zuerich.ch
→ Generell: `<stadtname>.de`-Portale sind Verzeichnisse, keine Betriebe. Beim Filtern als
Muster behandeln, nicht nur als Einzeldomains.

## Hersteller-Verzeichnisse (liefern Betriebe, aber als Unterseiten)

viessmann.de, vaillant.de, buderus.de, bosch-thermotechnology.com, stiebel-eltron.de
→ Nicht als Lead werten; die dort gelisteten Betriebe tauchen mit eigener Domain ohnehin auf.

## Sonstige Nicht-Leads

archive.org, github.com, google.com, maps.google.com, bing.com, telekom.de, vodafone.de,
jimdo.com (nur die Plattform-Domain, nicht Kunden-Subdomains), wordpress.com, wix.com,
shopify.com (Plattform), rheinnetz.de, shk-innung-*.de (Innungen sind Verbände, keine Leads —
außer der ICP zielt auf Verbände)

## Pflege-Regel

Nach jedem Lauf: `process_serp.py --report` zeigt die häufigsten gefilterten UND die häufigsten
durchgelassenen Domains. Portale, die durchgerutscht sind, hier ergänzen — mit einem Wort, warum.
