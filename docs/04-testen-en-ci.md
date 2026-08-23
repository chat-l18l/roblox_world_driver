# Testen en CI

---

## 1. De piramide

```
              /\        handmatig in Studio (MCP)   -- per slice, minuten
             /  \
            /----\      integratie in de engine     -- per PR, ~2 min
           /      \        (Open Cloud Luau Execution)
          /--------\
         /          \   unit onder Lune             -- per commit, < 5 s
        /____________\     (geen Roblox nodig)
```

De brede basis is alleen mogelijk dankzij de pure-core-regel uit
[01-architectuur.md](01-architectuur.md). Dat is de hele reden dat die regel bestaat.

---

## 2. Unit-tests (Lune)

Draaien headless, zonder Roblox, op elke machine en in CI:

```powershell
lune run tools/run_tests.luau
```

Wat hier getest wordt:

- **FSM-invarianten.** Elke toestand heeft minstens één uitgang; elke toestand is
  bereikbaar vanaf `Idle`; geen transitie wijst naar een onbekende toestand. Dit zijn
  tests op de *tabel*, niet op scenario's — precies wat een tabelgestuurde FSM je
  cadeau geeft.
- **Missie-scenario's.** Bezorg goed -> beloning; bezorg fout -> nul; te laat ->
  boete; annuleren tijdens briefing -> terug naar Idle zonder kosten.
- **Economie.** Beloning is monotoon in afstand; een upgrade is nooit goedkoper dan
  de vorige; geen combinatie levert oneindig geld.
- **Mastery.** Een fout item komt binnen N missies terug; een beheerst item
  verdwijnt niet volledig; met dezelfde seed is de trekking reproduceerbaar.
- **Geo.** Haversine tegen bekende afstanden (Eindhoven-Utrecht = 71 km, met 2%
  tolerantie); projectie is omkeerbaar binnen de bordbounds.
- **Board.** `Board.plan()` geeft voor elke regio een bouwlijst binnen het
  part-budget, met elke plaats binnen de bordgrenzen.
- **Landmarks.** Elke bouwlijst blijft binnen 40 parts, valt binnen de toegestane
  hoogteband, heeft geen part onder de grond, gebruikt alleen kleuren uit het palet,
  en verwijst naar een bestaande `Place`. Elk land in het spel heeft minstens één
  landmark.
- **Compare.** De verhouding gebruikt aan beide kanten dezelfde oppervlaktedefinitie
  — Duitsland tegen Nederland is 8,6× op totaal en 10,3× op land, en die mogen nooit
  door elkaar lopen. Verder: geen zin bevat "keer zo klein", een verhouding onder 1
  wordt omgedraaid naar "past x keer in", en tussen 0,9 en 1,1 komt er "ongeveer even
  groot" uit.
- **Feiten.** Elk feit op niveau 2 of 3 heeft `source` en `year`. Geen enkel
  dataveld bevat een getal dat al in proza is gegoten.
- **Schema.** Elk gegenereerd data-bestand voldoet aan zijn type; geen dubbele id's;
  elke `capital` bestaat als `Place`; elke `servesPlace` bestaat.

Een test is een gewone Luau-functie in `tests/unit/`. De runner in
`tools/run_tests.luau` verzamelt ze, draait ze en print een samenvatting met
exit-code. Als we later rijkere matchers willen, is
[jest-lua](https://github.com/jsdotlua/jest-lua) de opvolger — dat besluit hoort in
M1 thuis, na een korte spike, niet nu.

---

## 3. Integratietests (Open Cloud)

Sommige dingen kun je alleen in de echte engine testen: DataStore, replicatie,
RemoteEvents, of een bord daadwerkelijk gebouwd wordt binnen de tijd.

Roblox heeft hier een officieel patroon voor:
[`Roblox/place-ci-cd-demo`](https://github.com/Roblox/place-ci-cd-demo). De stroom is:

1. `rojo build test.project.json` bouwt een place mét `tests/integration/`.
2. Die place wordt geüpload naar een **aparte test-place** (niet de speel-place).
3. De **Luau Execution API** voert daar een testscript uit en geeft het resultaat
   terug aan CI.

Benodigd:

| Naam | Type | Waarde |
|---|---|---|
| `ROBLOX_API_KEY` | GitHub secret | Open Cloud API-key met `universe.places:write` en `universe.place.luau-execution-session:write` |
| `ROBLOX_TEST_UNIVERSE_ID` / `ROBLOX_TEST_PLACE_ID` | repo-variabele | de test-place |
| `ROBLOX_PROD_UNIVERSE_ID` / `ROBLOX_PROD_PLACE_ID` | repo-variabele | de privé speel-place |

De Luau Execution API staat maximaal twee gelijktijdige aanvragen per universe toe,
dus de workflow krijgt een `concurrency`-groep.

---

## 4. CI-workflow

`.github/workflows/ci.yml`, in volgorde. Elke stap is een poort: faalt hij, dan stopt
het.

```
1. rokit install                      gepinde toolchain
2. python tools/check_pure_core.py    geen Roblox-API in shared/core/
3. python tools/geo/validate.py       data-integriteit
4. stylua --check .                   opmaak
5. selene .                           lint
6. lune run tools/run_tests.luau      unit-tests
7. rojo build default.project.json    bouwt het place, uploadt als artifact
8. integratietests via Open Cloud     alleen op PR en main
9. deploy naar test-place             alleen op main, alleen bij groen
```

Stap 7 levert altijd een downloadbaar `.rbxl` op. Dat is de vangnetregel: zelfs als
de deploy faalt, kun je het bestand pakken en lokaal openen.

Runner: `ubuntu-latest`. Rojo, selene, stylua en lune draaien allemaal op Linux, en
Roblox Studio is nergens in CI nodig. Dat maakt CI snel en gratis.

---

## 5. Wat we bewust niet automatiseren

- **Of het leuk is.** Dat test je met kinderen op een tablet, niet met asserts.
- **Of het leerzaam is.** M4 en verder krijgen lichte telemetrie (welke plaats hoe
  vaak fout) zodat je het kunt zien, maar de conclusie trek je zelf.
- **Visuele regressie.** Screenshot-vergelijking op Roblox-renders is broos. In
  plaats daarvan: per slice een screenshot via MCP, met het oog erop.

---

## 6. Definition of done, per PR

- [ ] Alle CI-poorten groen
- [ ] Nieuwe regels in `shared/core/` hebben unit-tests
- [ ] Publieke functies hebben commentaar met wat en waarom
- [ ] Preconditie-checks aan de poort van elke publieke functie
- [ ] Geen nieuwe if-then-else-boom waar een tabel kan
- [ ] Documentatie bijgewerkt als het gedrag zichtbaar verandert
- [ ] Het acceptatiecriterium van de mijlpaal is aantoonbaar gehaald
