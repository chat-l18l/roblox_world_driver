# ADR-0004 — CI/CD naar een privé test-place via Open Cloud

**Status:** aanvaard
**Datum:** 2026-08-23

## Context

Het project moet een voorbeeld zijn voor vervolgprojecten, niet een lokale
proof-of-concept. Dat vraagt een keten die van commit tot speelbaar product loopt,
zonder handmatige stappen. Tegelijk hoeft het spel in fase 1 nog niet publiek te
zijn: de spelers zijn de eigen kinderen.

Bovendien is een deel van het gedrag alleen in de echte engine te testen: DataStore,
replicatie, RemoteEvents, en of een bord binnen de tijd gebouwd wordt.

## Besluit

GitHub Actions bouwt, test en publiceert naar een **privé** Roblox-place via Open
Cloud. Twee places: een test-place voor CI, een speel-place voor de kinderen.

Volgorde in de workflow:

```
rokit install -> check_pure_core -> validate data -> stylua --check -> selene
  -> lune unit-tests -> rojo build (artifact) -> Open Cloud integratietests
  -> deploy naar test-place (alleen main, alleen bij groen)
```

Benodigde geheimen en variabelen:

| Naam | Soort | Inhoud |
|---|---|---|
| `ROBLOX_API_KEY` | secret | Open Cloud key met `universe.places:write` en `universe.place.luau-execution-session:write` |
| `ROBLOX_TEST_UNIVERSE_ID`, `ROBLOX_TEST_PLACE_ID` | variabele | de CI-test-place |
| `ROBLOX_PROD_UNIVERSE_ID`, `ROBLOX_PROD_PLACE_ID` | variabele | de privé speel-place |

De workflow krijgt een `concurrency`-groep, omdat de Luau Execution API maximaal twee
gelijktijdige aanvragen per universe toestaat.

Referentie-implementatie: [`Roblox/place-ci-cd-demo`](https://github.com/Roblox/place-ci-cd-demo).

## Gevolgen

**Positief**

- De keten is compleet vanaf M0; latere mijlpalen voegen alleen inhoud toe.
- De kinderen spelen op echte apparaten, dus je vindt touch-, prestatie- en
  DataStore-problemen vroeg in plaats van laat.
- Elke build levert een downloadbaar `.rbxl` op als vangnet.
- Het patroon is direct herbruikbaar voor vervolgprojecten.

**Negatief**

- Een Open Cloud API-key is een echt geheim dat beheerd moet worden. Hij staat alleen
  in GitHub Secrets, nooit in de repo, en krijgt de minimale rechten hierboven.
- Een tweede place kost niets, maar wel administratie.
- Bij een publieke release komt er beleid bij (leeftijdsclassificatie, chat-instellingen,
  moderatie). Dat besluit valt pas bij M9 en staat los van deze ADR.

## Overwogen alternatieven

- **Alleen lokaal in Studio.** Verworpen: je test nooit op echte apparaten, DataStore
  gedraagt zich anders, en er is geen keten om vervolgprojecten op te baseren.
- **Handmatig publiceren via File -> Publish to Roblox.** Verworpen: handmatige stappen
  worden overgeslagen en er is geen poort die een kapotte build tegenhoudt.
- **Meteen publiek uitbrengen.** Verworpen voor fase 1: het vraagt werk aan
  kindveiligheid en policy op een moment dat er nog geen content is.
