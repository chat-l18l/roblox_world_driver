# Wereldpost — Masterplan

**Project:** educatieve Roblox-game over topografie voor kinderen van 6 tot 12 jaar.
**Repo:** https://github.com/chat-l18l/roblox_world_driver
**Status:** plan vastgesteld, nog geen implementatie.
**Datum:** 2026-08-23

---

## 1. Wat we bouwen

Je bent koerier bij Wereldpost. Je krijgt een pakket met een **adres** en je moet het
bezorgen. Het adres is het leermateriaal: *Domplein 1, Utrecht, Nederland*. Om te
bezorgen moet je weten waar Utrecht ligt. Je verdient geld met correcte bezorgingen,
koopt daarmee snellere voertuigen, en daarmee kun je verder weg bezorgen — mits je
weet waar dat is.

De leerlijn loopt mee met het spel: eerst Eindhoven en omgeving, dan Nederland, dan
de buurlanden, dan Europa, dan de wereld. Wat je leert breidt uit van steden naar
provincies, rivieren, hoofdsteden, luchthavens, talen en vlaggen.

**Ontwerpprincipe dat alles stuurt:** *de beloning hangt aan het weten, niet aan het
rijden.* Snelheid geeft een bonus, maar een verkeerde bezorging levert nul op. Anders
leer je snel klikken in plaats van aardrijkskunde.

### Niet-doelen (voor fase 1)

- Geen multiplayer-interactie tussen spelers (wel: meerdere spelers in één server, elk hun eigen route).
- Geen chat, geen user-generated content, geen Robux-monetisatie.
- Geen fotorealisme. Stijl is helder en leesbaar, low-poly, hoog contrast.

---

## 2. Waarom de huidige repo niet werkt

Dit is de diagnose van de Grok-poging, zodat we dezelfde val niet opnieuw inlopen.

| Probleem | Gevolg |
|---|---|
| De repo is in de kern een **Grok App Builder web-app** (TanStack Start + Vercel + React canvas-game in `src/`) met `rbx/` er los aan geplakt | Wie de repo cloont krijgt geen Roblox-project maar een website |
| **Twee waarheden**: de spellogica bestaat in TypeScript (`src/sim/session.ts`, 312 regels) én in Luau (`rbx/src/`) | Elke wijziging moet twee keer, ze lopen gegarandeerd uiteen |
| 977 KB `.grok/` sandbox-instructies staan gecommit | Ruis; het zijn instructies voor Groks eigen Linux-sandbox, niet voor dit project |
| De voorgeschreven Studio-workflow is `File -> New` + Connect + Accept, waarna de wereld pas bij **Play** in Lua ontstaat | Na Accept lijkt Studio leeg. Dat voelt als "het werkt niet", en er is geen place-bestand om op terug te vallen |
| `AGENTS.md` (18 KB) beschrijft Groks sandbox-contract, niet jouw project | Elke agent die de repo leest krijgt het verkeerde mentale model |

**Nauwkeurigheidsnoot.** De diagnose hierboven is gesteld op commit `53ae1d6`. Er is
daarna nog één commit op `main` gekomen, `8ccf8c1`, die het lege-Explorer-symptoom
wél aanpakt: vloer, busje en doel staan daar als letterlijke parts in
`default.project.json`, dus ze verschijnen meteen na Connect. Dat is een geldige
Rojo-techniek en een terechte verbetering.

Het verandert de conclusie niet, om twee redenen. De structurele problemen — een
web-app als repo, spellogica in twee talen, `.grok/` als ballast — staan er
ongewijzigd. En de vorm klopt niet voor waar we heen gaan: wereldgeometrie hoort bij
ons niet handgeschreven in het projectbestand, maar komt uit `Board.plan()` op basis
van geodata. Parts in `default.project.json` werkt voor één vloer en houdt op bij
vijf regioborden.

**Wat wél werkte, en geverifieerd is op deze pc (2026-08-23):**

- Rokit 1.2.0 staat in `C:\Users\panda\.rokit\bin` en staat in je user-PATH.
- `rokit install` heeft Rojo 7.4.4, selene 0.27.1 en stylua 0.20.0 opgehaald.
- De Rojo Studio-plugin is geïnstalleerd (`AppData\Local\Roblox\Plugins\RojoManagedPlugin.rbxm`).
- `rojo build rbx/default.project.json` bouwt succesvol een `.rbxl`.

De toolchain is dus niet stuk. De **projectstructuur en de workflow** waren stuk.

---

## 3. De vier vastgestelde keuzes

| # | Keuze | Besluit | ADR |
|---|---|---|---|
| 1 | Repo-strategie | Huidige staat archiveren als `archive/grok`, `main` schoon opnieuw met het Roblox-project in de root | [ADR-0001](adr/0001-repo-herstart.md) |
| 2 | Bron van waarheid + AI | Bestanden in git zijn de enige bron; Rojo synct naar Studio; Studio's **ingebouwde MCP-server** geeft Claude Code ogen en handen in Studio | [ADR-0002](adr/0002-rojo-en-mcp.md) |
| 3 | Wereldmodel | **Regioborden**: elke regio is een eigen kaartbord met eigen schaal, procedureel opgebouwd uit één geo-dataset | [ADR-0003](adr/0003-regioborden.md) |
| 4 | Doel fase 1 | Privé test-place op Roblox, gepubliceerd vanuit GitHub Actions via Open Cloud | [ADR-0004](adr/0004-ci-cd-open-cloud.md) |
| 5 | Landmarks | Herkenningspunten als pure bouwlijst in parts, in git, op vaste hoogteband los van de bordschaal | [ADR-0005](adr/0005-landmarks-als-bouwlijst.md) |

---

## 4. De keten, van bestand tot kind

```
  jij + Claude Code                GitHub                    Roblox
  -----------------                ------                    ------
  bewerkt .luau --+
                  |  git push   +-------------+
                  +------------>| Actions CI  |
                  |             |  selene     |
                  |             |  stylua     |
                  |             |  lune tests |--> falen = rood, geen deploy
                  |             |  rojo build |
                  |             |  open cloud |--> integratietests in de echte engine
                  |             +------+------+
                  |                    | deploy
                  |                    v
                  |             +-------------+
                  |             | TEST-PLACE  |<-- kinderen spelen op tablet/PC
                  |             +-------------+
                  |
                  |  rojo serve (live)      +------------------+
                  +------------------------>|  Roblox Studio   |
                                            |  (lokaal, jouw   |
   Studio MCP  <----------------------------|   pc)            |
   (play, console, screenshot)              +------------------+
```

De keten heeft twee lussen: een **snelle lokale lus** (bewerken -> Rojo -> Studio Play,
seconden) en een **trage betrouwbare lus** (push -> CI -> test-place, minuten). Beide
werken we in M0 volledig af vóór er ook maar één spelmechaniek in zit. Dat is de
expliciete wens: eerst de keten, dan pas de game.

Details: [03-workflow.md](03-workflow.md).

---

## 5. Architectuur in één alinea

Drie lagen, met één harde regel ertussen.

- **`src/shared/core/`** — pure Luau. Geen `game`, geen `Instance`, geen `workspace`,
  geen `task.wait`. Alleen data in, data uit. Hier zitten de FSM's, de economie, de
  missiegenerator, de mastery-engine en de geo-wiskunde. Deze laag draait **headless
  buiten Roblox** onder Lune, dus de tests zijn snel en draaien in CI zonder Roblox.
- **`src/server/services/`** — de Roblox-kant. Leest input, roept de pure laag aan,
  voert de teruggegeven *effects* uit, praat met DataStore en RemoteEvents. Bevat
  geen spelregels.
- **`src/client/views/`** — alleen weergave en invoer. Bevat geen spelregels. De
  client mag nooit bepalen of een bezorging klopt.

Dit is dezelfde scheiding die je in SDC2026 tussen algoritme en ROS2-node aanhoudt:
de logica is een bibliotheek, de middleware is een schil. Het maakt het testbaar en
het voorkomt dat spelregels in event-handlers verdwalen.

FSM's zijn **tabelgestuurd**, niet if-then-else. Een transitietabel is data:

```lua
TRANSITIONS[State.EnRoute][Event.Arrived] = { to = State.AtAddress, effect = Effects.CheckDelivery }
```

`Fsm.step()` is één pure functie van ~20 regels die die tabel opzoekt. Nieuwe toestand
toevoegen betekent een regel data toevoegen, geen tak in een boom.

Details: [01-architectuur.md](01-architectuur.md).

---

## 6. Wereldmodel: regioborden

Eén doorlopende wereldkaart kan niet. Op wereldschaal is Nederland ongeveer 75 studs
breed: onbruikbaar om in te rijden. Daarom: **elke regio is een eigen bord**, met een
eigen schaal, gebouwd uit dezelfde dataset.

| Bord | Breedte in km | studs/km | Bord in studs | Voertuig | Ontgrendeld bij |
|---|---|---|---|---|---|
| Eindhoven e.o. | 40 | 40 | 1600 | bakfiets, bestelbus | start |
| Nederland | 300 | 5 | 1500 | bestelbus, vrachtwagen | niveau 3 |
| Benelux + Duitsland + Engeland + Frankrijk | 1400 | 1,5 | 2100 | vrachtwagen, trein | niveau 6 |
| Europa | 4000 | 0,5 | 2000 | propellervliegtuig | niveau 10 |
| Wereld | 20000 | 0,1 | 2000 | straalvliegtuig, vrachtschip | niveau 15 |

Elk bord blijft rond de 1500-2500 studs: ruim binnen de comfortabele float-precisie
van Roblox, en een oversteek duurt 20-60 seconden bij realistische snelheden.
Overgang tussen borden gaat via **luchthavens en havens** — wat meteen leerstof is.

`Board.plan(region, data)` is een **pure functie** die een bouwlijst teruggeeft
(lijst van parts, labels, pins). De Roblox-kant voert die lijst uit. Zo is de
kaartopbouw testbaar zonder Studio.

---

## 7. Datamodel en bronnen

Alle aardrijkskundige inhoud komt uit publieke datasets, wordt door een pipeline in
`tools/geo/` omgezet naar gegenereerde `.luau`-tabellen in `src/shared/data/`, en die
worden **gecommit**. De build heeft dus nooit internet nodig, en elke wijziging in de
data is zichtbaar in een diff.

| Bron | Licentie | Waarvoor |
|---|---|---|
| Natural Earth | Public domain | landgrenzen, rivieren, plaatsen met inwonertal |
| OurAirports | Public domain | luchthavens met ICAO/IATA en positie |
| Wikidata | CC0 | hoofdsteden, talen, vlaggen, valuta |
| PDOK / BAG (Kadaster) | Public domain | Nederlandse straten en postcodes |

**Bewust niet: OpenStreetMap.** ODbL is share-alike en dat wil je niet op een
Roblox-experience laten drukken. De publieke-domeinbronnen dekken de behoefte.

Details en schema's: [02-datamodel.md](02-datamodel.md).

---

## 8. Leren: hoe het spel iets leert

Twee mechanismen, allebei pure modules.

**Moeilijkheidsladder** — onafhankelijk van de regio, zodat elk nieuw gebied opnieuw
van makkelijk naar moeilijk loopt:

1. Pijl wijst naar het doel, naam staat erbij.
2. Naam staat op de kaart, geen pijl.
3. Alleen het adres; namen staan nog op de kaart.
4. Alleen het adres; **namen zijn verborgen** — dit is de echte topografietoets.
5. Alleen postcode/land plus een hint (taal, vlag, rivier, buurland).
6. Meerdere pakketten tegelijk: route plannen, brandstof, deadlines.

**Mastery per item** — elke stad, elk land, elke rivier heeft een Leitner-doosje
(0-5) per speler. De missiegenerator trekt gewogen: wat je fout deed komt snel terug,
wat je beheerst komt zelden terug maar verdwijnt niet. `Mastery.pick()` is een pure
functie met een seedbare RNG, dus volledig te testen.

**Landmarks en weetjes** — elke stad krijgt een gezicht: de Euromast in Rotterdam, de
Eiffeltoren in Parijs, het Evoluon in Eindhoven. Een silhouet onthoud je eerder dan
een naam, en vanaf trede 4 (namen verborgen) is dat silhouet precies wat je overhoudt
om op te varen. Daarnaast een optionele laag achtergrondinformatie in drie
diepteniveaus — van één zin tot inwonertal, oppervlakte en de verhouding tot
Nederland — met bron en jaartal erbij. Nooit blokkerend, altijd weg te klikken, en
verzamelbaar in een weetjesboek.

Details: [07-landmarks-en-weetjes.md](07-landmarks-en-weetjes.md).
Koppeling aan het Nederlandse curriculum (groep 4 t/m 8): [05-leerlijn.md](05-leerlijn.md).

---

## 9. Kwaliteit en testen

Testpiramide met drie niveaus, oplopend in kosten:

| Niveau | Waar | Waarmee | Wanneer | Duur |
|---|---|---|---|---|
| Unit | `tests/unit/` | Lune, headless Luau, geen Roblox | elke save, elke commit | < 5 s |
| Integratie | `tests/integration/` | Open Cloud Luau Execution API in de echte engine | elke PR | ~2 min |
| Handmatig | Studio Play | Studio MCP: play starten, console lezen, screenshot | elke slice | minuten |

Plus statisch: `selene` (lint), `stylua --check` (format), en `--!strict` in elk
bestand. Alle drie blokkeren de merge.

De pure-core-regel is wat dit mogelijk maakt: als spelregels in `shared/core/` zitten
zonder Roblox-API, dan test je ze in milliseconden. Zodra spelregels in een
`Touched`-handler kruipen, kun je alleen nog handmatig testen. Dat is de reden voor
de regel, niet netheid.

---

## 10. Roadmap

Elke mijlpaal heeft een **acceptatiecriterium dat een ander kan controleren**. We
stoppen na elke mijlpaal en kijken of het klopt voordat de volgende begint.

| M | Naam | Levert | Acceptatie |
|---|---|---|---|
| **M0** | De keten | Schone repo, rokit/rojo/lune, CI groen, place op Roblox | Een verse clone -> `rokit install` -> `rojo build` -> place opent in Studio en toont het versienummer op het scherm. CI-artifact downloadbaar. Test-place speelbaar op tablet. |
| **M1** | Fundament | `Fsm`, `MissionFsm`, `Contract`, `Rng`, `Geo`, effects-patroon, Lune-runner | 25 of meer unit-tests groen, nul Roblox-API in `shared/core/` (geautomatiseerde check) |
| **M2** | Eerste bezorging | Eindhoven-bord uit data, bestelbus, adres, aankomstcontrole, beloning, **Evoluon als eerste landmark** | Een kind bezorgt drie pakketten zonder uitleg vooraf |
| **M3** | Kaart en opslag | Kaart-UI met pins, adreskaart, HUD, DataStore save/load, **weetjeskaartje laag 1-2 en weetjesboek-skelet** | Voortgang overleeft server-restart; kaart werkt op touch; weetje blokkeert niets |
| **M4** | Nederland | NL-bord, 12 provincies, hoofdsteden, grote rivieren, mastery-engine, **12 NL-landmarks, `Compare`-module, hoofdstad/regeringszetel** | Moeilijkheidsniveau 4 (namen verborgen) is haalbaar en meetbaar; het Den Haag-missietype werkt |
| **M5** | Economie | Voertuigen, winkel, prijzen, balans | Een sessie van 20 min geeft een zinvolle upgrade; geen exploit om te farmen zonder kennis |
| **M6** | Buurlanden | België, Duitsland, Engeland, Frankrijk; luchthaven-transitie; vliegtuig; **landmark-set en silhouet als navigatiehint** | Grensovergang werkt, taal-hint verschijnt, een kind vindt Parijs op silhouet |
| **M7** | Europa | Europa-bord, talen, vlaggen, rivieren, gebergten als hints, **Europa-landmarks en weetjes laag 3** | 30 of meer landen met correcte data; elk land heeft minstens één landmark |
| **M8** | Wereld | Wereldbord, zeevracht, tijdzones, werelddelen, **wereld-landmarks, instelbaar referentieland** | Wereldroute Eindhoven -> Tokio speelbaar |
| **M9** | Afwerking | Geluid, feedback, telemetrie, ouderrapport, publicatie-afweging | Speelsessie van 30 min zonder crash; besluit over publieke release |

M0 en M1 samen zijn het echte fundament. Alles daarna is content op een werkende basis.

---

## 11. Risico's

| Risico | Kans | Tegenmaatregel |
|---|---|---|
| Opnieuw twee waarheden (logica in Lua én ergens anders) | hoog | Eén taal: Luau. De TypeScript-sim gaat naar `archive/grok` en komt niet terug |
| Handmatig werk in Studio wordt overschreven door Rojo | hoog | Scripts nooit in Studio bewerken. Handgebouwde 3D-content exporteren naar `assets/*.rbxmx` en committen |
| Data-licentie besmetting | midden | Alleen public-domain/CC0-bronnen; licentietabel in `02-datamodel.md`; `tools/geo/` noteert de herkomst per veld |
| Scope creep (wereld bouwen vóór de eerste bezorging werkt) | hoog | Mijlpaalpoorten met acceptatiecriteria; M2 is één stad |
| Roblox verandert de toolchain | midden | Versies gepind in `rokit.toml`; CI draait dezelfde pins |
| Prestaties op tablet | midden | Bord maximaal 2500 studs, labels via `BillboardGui` met `MaxDistance`, part-budget per bord in de bouwlijst-validatie |
| Landmarks worden een contentberg die de planning opeet | midden | Per landmark een half uur en een part-budget van 40; per mijlpaal een afgebakende set; werk is uitbesteedbaar zodra het eerste landmark het patroon zet |
| Verouderde of verkeerd gedefinieerde cijfers in weetjes | midden | Elk getal draagt `year` en `source`; `Compare` mengt nooit twee oppervlaktedefinities; unit-test dwingt dat af |
| Kindveiligheid / privacy | midden | Geen chat, geen vrije tekst, geen PII in DataStore, alleen `UserId` als sleutel |

---

## 12. Wat er nu moet gebeuren

1. Dit plan lezen en akkoord geven (of aanpassen).
2. `archive/grok` tag en branch pushen — de Grok-staat blijft dan permanent terugvindbaar.
3. `main` schoon opzetten volgens [01-architectuur.md](01-architectuur.md), paragraaf Repo-indeling.
4. M0 uitvoeren en de keten aantoonbaar rond krijgen.

Pas daarna schrijven we spellogica.
