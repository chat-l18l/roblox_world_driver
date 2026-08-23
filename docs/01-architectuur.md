# Architectuur

Dit document beschrijft de indeling van de repo, de lagen, de FSM-aanpak en de
codestijl. Het is bindend: afwijken vraagt een ADR.

---

## 1. Repo-indeling

```
roblox_world_driver/
├── .github/workflows/ci.yml       CI: lint, format, unit, build, deploy
├── AGENTS.md                      instructies voor AI-agents (= CLAUDE.md symlink/kopie)
├── README.md                      korte start: clone -> spelen in 5 minuten
├── rokit.toml                     gepinde toolchain (rojo, selene, stylua, lune)
├── wally.toml                     Luau-afhankelijkheden (pas vanaf M3 nodig)
├── selene.toml  stylua.toml       lint- en formatteerconfig
├── default.project.json           Rojo: het spel
├── test.project.json              Rojo: het spel + tests/ (voor integratietests)
│
├── docs/                          dit plan en alles eromheen
│   ├── 00-plan.md ... 05-leerlijn.md
│   └── adr/                       architectuurbesluiten, genummerd, onveranderlijk
│
├── data/
│   ├── raw/                       gedownloade bronbestanden (gitignored, reproduceerbaar)
│   └── LICENSES.md                herkomst en licentie per bron
│
├── tools/
│   ├── geo/                       Python: bron -> gegenereerde Luau-tabellen
│   ├── check_pure_core.py         faalt als shared/core/ een Roblox-API aanraakt
│   └── run_tests.luau             Lune-entrypoint voor de unit-tests
│
├── assets/                        handgebouwde 3D-content, geexporteerd uit Studio
│   └── *.rbxmx                    gecommit, gemount via $path in default.project.json
│
├── src/
│   ├── shared/
│   │   ├── core/                  PURE LUAU. geen Roblox-API. hier zitten de regels
│   │   │   ├── Contract.luau      preconditie-poortwachters (fail fast)
│   │   │   ├── Fsm.luau           generieke tabelgestuurde FSM
│   │   │   ├── MissionFsm.luau    de missie-toestandsmachine (tabel + effects)
│   │   │   ├── TravelFsm.luau     voertuig/reismodus
│   │   │   ├── Mission.luau       missiegeneratie uit mastery + regio
│   │   │   ├── Mastery.luau       Leitner-doosjes, spaced repetition
│   │   │   ├── Economy.luau       beloning, prijzen, voertuig-ontgrendeling
│   │   │   ├── Board.luau         regio -> bouwlijst (pure data)
│   │   │   ├── Geo.luau           haversine, peiling, projectie lat/lon -> studs
│   │   │   ├── Rng.luau           seedbare PRNG (deterministisch, testbaar)
│   │   │   └── Types.luau         alle gedeelde typedefinities
│   │   ├── data/                  GEGENEREERD door tools/geo. niet handmatig bewerken
│   │   │   ├── Countries.luau  Places.luau  Rivers.luau  Airports.luau
│   │   │   └── Regions.luau    Vehicles.luau
│   │   └── net/
│   │       └── Remotes.luau       één plek waar elk RemoteEvent/Function staat
│   │
│   ├── server/
│   │   ├── init.server.luau       ALLEEN compositie: services maken en starten
│   │   └── services/
│   │       ├── MissionService.luau    stuurt MissionFsm, voert effects uit
│   │       ├── WorldService.luau      bouwt het bord uit Board.plan()
│   │       ├── VehicleService.luau    autoritatieve voertuigfysica
│   │       ├── SaveService.luau       DataStore, sessieprofiel
│   │       └── Effects.luau           effect-naam -> Roblox-actie (één tabel)
│   │
│   └── client/
│       ├── init.client.luau       ALLEEN compositie
│       ├── input/                 toetsenbord, touch, gamepad -> intent
│       └── views/                 HUD, MapView, BriefingView, ShopView
│
└── tests/
    ├── unit/                      draait onder Lune, geen Roblox nodig
    └── integration/               draait in de engine via Open Cloud
```

---

## 2. De drie lagen en de harde regel

```
        +-------------------------------------------+
        |  client/views   input   (weergave)        |   mag NIETS beslissen
        +---------------------+---------------------+
                              | RemoteEvent (intent)
        +---------------------v---------------------+
        |  server/services    (Roblox-schil)        |   IO, DataStore, parts
        +---------------------+---------------------+
                              | pure functie-aanroep
        +---------------------v---------------------+
        |  shared/core        (de regels)           |   GEEN Roblox-API
        +-------------------------------------------+
```

**De harde regel:** in `src/shared/core/` komt geen enkele verwijzing voor naar
`game`, `workspace`, `Instance`, `script`, `task`, `wait`, `spawn`, `Enum`,
`RemoteEvent`, `DataStoreService` of welke Roblox-service dan ook. `Vector3` en
`CFrame` mogen niet; gebruik eigen `Vec2`/`Vec3`-tabellen uit `Types.luau`.

`tools/check_pure_core.py` dwingt dit af in CI. De regel is geen netheid maar
functie: hij is wat de unit-tests in milliseconden laat draaien op elke machine,
zonder Roblox, en wat voorkomt dat spelregels in event-handlers verdwalen.

De client is *dom*. Hij stuurt intenties ("ik wil hier bezorgen") en toont wat de
server zegt. Of een bezorging klopt bepaalt uitsluitend de server. Dat is niet
alleen anti-cheat maar ook didactisch: de score moet betrouwbaar zijn.

---

## 3. FSM: tabel plus effects

Twee toestandsmachines, allebei in `shared/core/`, allebei puur.

### 3.1 MissionFsm

```
  Idle --Accept--> Briefing --Depart--> EnRoute --Arrived--> AtAddress
                                           |                     |
                                           |                  Confirm
                                        Timeout                  |
                                           |            +--------+--------+
                                           v            v                 v
                                        Failed      Delivered        Misdelivered
                                           |            |                 |
                                           +----> Settlement <------------+
                                                       |
                                                       v
                                                     Idle
```

### 3.2 Waarom een tabel, en niet if-then-else

Een transitietabel is data. Je kunt hem printen, valideren, en er een test op
loslaten die zegt "elke toestand heeft minstens één uitgang" en "elke toestand is
bereikbaar". Dat kan niet met een boom van `if`.

```lua
--!strict
-- MissionFsm.luau (fragment)

local TRANSITIONS: { [State]: { [Event]: Transition } } = {
    [State.Idle] = {
        [Event.Accept]  = { to = State.Briefing,  effect = Effect.IssueMission },
    },
    [State.Briefing] = {
        [Event.Depart]  = { to = State.EnRoute,   effect = Effect.StartClock },
        [Event.Decline] = { to = State.Idle,      effect = Effect.DropMission },
    },
    [State.EnRoute] = {
        [Event.Arrived] = { to = State.AtAddress, effect = Effect.StopClock },
        [Event.Timeout] = { to = State.Failed,    effect = Effect.Penalise },
    },
    -- ...
}
```

`Fsm.step` is de enige plek waar de tabel wordt opgezocht:

```lua
--!strict
-- Fsm.luau — generiek, hergebruikt door MissionFsm en TravelFsm

--[[
    Doet één transitie. Puur: geen zijeffecten, geen tijd, geen willekeur.

    Waarom een lijst effects terug in plaats van ze hier uitvoeren:
    dan blijft deze module puur en testbaar, en bepaalt de aanroeper
    (een service) hoe een effect in Roblox landt.

    Poortwachter: een onbekende (state, event)-combinatie is een bug van de
    caller, geen speler-fout. We falen hard.
]]
local function step(machine: Machine, state: State, event: Event, ctx: Context): (State, { Effect })
    Contract.require(machine.transitions[state] ~= nil, "onbekende toestand: " .. tostring(state))

    local row = machine.transitions[state]
    local transition = row[event]
    if transition == nil then
        return state, {}          -- event niet geldig hier: negeren, geen crash
    end

    Contract.require(machine.transitions[transition.to] ~= nil, "transitie naar onbekende toestand")
    return transition.to, { transition.effect }
end
```

Let op het onderscheid dat Hintjens maakt: een **onbekende toestand** is een
programmeerfout van de caller en faalt hard; een **event dat hier niet geldt** is
normale invoer (speler drukt op iets dat nu niet kan) en wordt stil genegeerd.

### 3.3 Effects

`Effect` is een enum-achtige string. `server/services/Effects.luau` is één tabel
`[Effect] -> function(ctx)`. Geen switch, geen boom:

```lua
local HANDLERS: { [Effect]: (Context) -> () } = {
    [Effect.IssueMission] = function(ctx) ... end,
    [Effect.StartClock]   = function(ctx) ... end,
}
```

Een test op de pure kant kan dus asserteren: "gegeven toestand EnRoute en event
Arrived, is de nieuwe toestand AtAddress en zit `StopClock` in de effects" — zonder
dat er ooit een klok bestaat.

---

## 4. Datastructuren

Alles wat tussen lagen reist is een platte tabel met vaste velden, gedefinieerd in
`shared/core/Types.luau`. Geen OOP-hiërarchie, geen metatables voor domeindata.

```lua
--!strict

export type PlaceId = string      -- "nl-utrecht", "de-berlin"
export type CountryId = string    -- ISO 3166-1 alpha-2, kleine letters: "nl"

export type LatLon = { lat: number, lon: number }
export type Vec2   = { x: number, y: number }

export type Place = {
    id: PlaceId,
    name: string,                 -- Nederlandse naam
    nameLocal: string?,           -- lokale naam, voor de taalles
    country: CountryId,
    kind: "capital" | "city" | "town" | "village",
    pos: LatLon,
    population: number,
    tier: number,                 -- 1 = zeer bekend, 5 = obscuur; stuurt moeilijkheid
}

export type Address = {
    street: string,
    number: number,
    postcode: string?,
    place: PlaceId,
}

export type Parcel = {
    id: string,
    address: Address,
    weightKg: number,
    fragile: boolean,
    deadlineSec: number?,
    baseReward: number,
}

export type MasteryBox = { box: number, lastSeenAtSec: number }  -- box 0..5

export type Profile = {
    userId: number,
    coins: number,
    level: number,
    vehicleId: string,
    unlockedRegions: { string },
    mastery: { [string]: MasteryBox },   -- sleutel = PlaceId of CountryId
    schemaVersion: number,
}
```

`schemaVersion` staat er vanaf dag één in. DataStore-migraties zonder versienummer
zijn later niet meer te doen.

---

## 5. Codestijl

Gebaseerd op jouw Hintjens-instructies uit `~/.codex/AGENTS.md`, vertaald naar Luau.

1. **Design by contract.** Elke publieke functie begint met preconditie-checks via
   `Contract.require(cond, msg)`. Ongeldige invoer is een bug van de aanroeper.
2. **Fail fast.** `Contract.require` doet `error(msg, 2)` — de stacktrace wijst naar
   de aanroeper, niet naar de check. Niet stilzwijgend corrigeren of negeren.
3. **Na de poort geen defensieve ruis.** Binnen de functie ga je ervan uit dat de
   invoer klopt. Geen dubbele nil-checks.
4. **Compact en voorspelbaar.** Eén module, één verantwoordelijkheid. Een module die
   je niet in één scherm overziet is te groot.
5. **Commentaar boven elke publieke functie: wat het doet en waarom.** Niet hoe.
6. **`--!strict` bovenaan elk bestand.** Zonder uitzondering.
7. **Geen globals.** Elke module eindigt met een expliciete return-tabel.
8. **Namen in het Engels, documentatie in het Nederlands.** Zo blijft de code
   leesbaar voor externe voorbeelden en de uitleg leesbaar voor jou en de kinderen.
9. **Geen if-then-else-boom waar een tabel kan.** Meer dan drie takken op dezelfde
   variabele is een tabel-opzoeking.
10. **stylua bepaalt de opmaak.** Geen discussie, geen handmatige uitlijning.

`Contract.luau` in zijn geheel:

```lua
--!strict
--[[
    Poortwachter-helpers. Hintjens-stijl: ongeldige invoer is een bug van de
    caller, dus we stoppen meteen en wijzen naar de aanroepregel.

    Waarom niet assert(): assert() geeft een stacktrace die naar assert zelf
    wijst, en Luau optimaliseert de boodschap-concatenatie niet weg. error(msg, 2)
    wijst één frame omhoog, precies waar de fout gemaakt is.
]]

local Contract = {}

--[[ Faalt als cond onwaar is. Gebruik aan de poort van elke publieke functie. ]]
function Contract.require(cond: boolean, msg: string)
    if not cond then
        error("contract geschonden: " .. msg, 2)
    end
end

--[[ Faalt als value nil is; geeft anders value terug, zodat je kunt ketenen. ]]
function Contract.present<T>(value: T?, name: string): T
    if value == nil then
        error("contract geschonden: " .. name .. " ontbreekt", 2)
    end
    return value :: T
end

return Contract
```

---

## 6. Wat waar hoort — beslistabel

Twijfel je waar iets thuishoort, gebruik deze tabel.

| De code ... | hoort in |
|---|---|
| berekent een beloning, kiest een missie, bepaalt of een adres klopt | `shared/core/` |
| maakt een `Part`, luistert op `Touched`, schrijft naar DataStore | `server/services/` |
| tekent een label, leest een toetsaanslag, animeert een pin | `client/` |
| is een lijst steden, landen, prijzen | `shared/data/` (gegenereerd) |
| is een handgebouwd 3D-model | `assets/*.rbxmx` |
| is een eenmalig conversieprogramma | `tools/` |

Als iets in twee kolommen past, is het te groot en moet het gesplitst.
