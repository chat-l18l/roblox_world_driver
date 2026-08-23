# Datamodel en geo-pipeline

Alle aardrijkskundige inhoud is **data, geen code**. De pipeline zet publieke
bronbestanden om in gegenereerde Luau-tabellen die gecommit worden. Zo heeft de build
nooit internet nodig en is elke inhoudswijziging zichtbaar in een diff.

---

## 1. Pipeline

```
  data/raw/                tools/geo/               src/shared/data/
  ---------                ----------               ----------------
  natural_earth/*.zip  --> extract.py           --> Places.luau
  ourairports/*.csv    --> normalise.py         --> Countries.luau
  wikidata/*.json      --> generate_luau.py     --> Rivers.luau
  pdok/*.csv           --> validate.py          --> Airports.luau
                                                    Regions.luau
                                                    Vehicles.luau
```

- `data/raw/` staat in `.gitignore`. `tools/geo/fetch.py` haalt het opnieuw op, met
  vastgelegde URL's en checksums, zodat de pipeline reproduceerbaar is.
- `tools/geo/generate_luau.py` schrijft **deterministisch**: gesorteerd op id, vaste
  sleutelvolgorde, vaste afronding. Twee keer draaien geeft byte-identieke uitvoer.
  Zonder die eigenschap krijg je diff-ruis bij elke regeneratie.
- `tools/geo/validate.py` draait ook in CI en faalt op: dubbele id's, coördinaten
  buiten de regio-grenzen, ontbrekende verplichte velden, hoofdsteden die niet in
  `Places` staan, en luchthavens zonder land.

Waarom Python en niet Luau voor de pipeline: de bronnen zijn shapefiles, CSV en JSON,
en `shapely`/`pyproj` doen het geometriewerk dat je in Luau niet wilt schrijven.
Python 3.13 staat al op je pc.

Waarom gegenereerde `.luau` en niet JSON die Rojo inleest: een `.luau`-tabel is
getypeerd, laadt sneller, en de generator kan er commentaar met de bron-herkomst
bovenin zetten.

---

## 2. Bronnen en licenties

| Bron | Licentie | Attributie nodig | Waarvoor |
|---|---|---|---|
| [Natural Earth](https://www.naturalearthdata.com/) | Public domain | nee (wel netjes) | landgrenzen, kustlijnen, rivieren, `ne_10m_populated_places` met inwonertal |
| [OurAirports](https://ourairports.com/data/) | Public domain | nee | luchthavens: ICAO, IATA, positie, grootte |
| [Wikidata](https://www.wikidata.org/) | CC0 | nee | hoofdsteden, officiële talen, valuta, vlagkleuren |
| [PDOK / BAG](https://www.pdok.nl/) | Public domain (Kadaster) | nee | Nederlandse straatnamen, postcodes, woonplaatsen |

**Uitgesloten: OpenStreetMap.** ODbL is share-alike; afgeleide databases moeten onder
dezelfde licentie. Op een Roblox-experience is dat een juridisch rommelig verhaal en
het levert niets op wat de bronnen hierboven niet ook geven.

Elke gegenereerde module krijgt bovenin een blok met bron, versie, ophaaldatum en
licentie. `data/LICENSES.md` verzamelt hetzelfde overzicht voor de repo als geheel.

---

## 3. Kernentiteiten

Zie `src/shared/core/Types.luau` voor de gezaghebbende definities. Hieronder de
bedoeling per veld die niet uit de naam blijkt.

### Place

```lua
{
    id = "nl-utrecht",
    name = "Utrecht",
    nameLocal = "Utrecht",
    country = "nl",
    kind = "city",
    pos = { lat = 52.0907, lon = 5.1214 },
    population = 361742,
    tier = 1,
}
```

- `id` — `<landcode>-<geslugde naam>`. Stabiel; verandert nooit, ook niet als de
  naam wordt gecorrigeerd. Het is de sleutel in `Profile.mastery`.
- `tier` — 1 tot 5, de didactische bekendheid. Afgeleid van inwonertal, hoofdstad-zijn
  en of de plaats in het curriculum voorkomt. **Niet** puur inwonertal: Den Helder is
  klein maar hoort bij de topo van groep 6, Almere is groot maar minder belangrijk.
  De afleiding staat in `tools/geo/tiers.py` met een handmatige overrides-tabel.

### Country

```lua
{
    id = "de",
    name = "Duitsland",
    nameLocal = "Deutschland",
    capital = "de-berlin",
    governmentSeat = "de-berlin",
    capitalNote = nil,
    languages = { "Duits" },
    currency = "EUR",
    continent = "europa",
    neighbours = { "nl", "be", "fr", "ch", "at", "cz", "pl", "dk", "lu" },
    flagColors = { "#000000", "#DD0000", "#FFCE00" },
    areaKm2 = { total = 357592, land = 348560, year = 2023, source = "destatis" },
    population = { value = 83600000, year = 2025, source = "wikidata" },
}
```

`neighbours` is leerstof én hint-materiaal ("dit land grenst aan Nederland").

**`capital` en `governmentSeat` zijn bewust twee velden.** Nederland is het
duidelijkste geval: de hoofdstad is Amsterdam, maar de regering, de Staten-Generaal
en de koning werken in Den Haag.

```lua
capital        = "nl-amsterdam",
governmentSeat = "nl-den-haag",
capitalNote    = "De hoofdstad is Amsterdam, maar de regering, het parlement en "
              .. "de koning werken in Den Haag.",
```

Zonder die splitsing krijg je stilzwijgend foute weetjes. Andere landen met dezelfde
nuance: Bolivia (Sucre grondwettelijk, La Paz in de praktijk), Zuid-Afrika (drie
hoofdsteden), Zwitserland (Bern is "federale stad", formeel geen hoofdstad),
Tanzania, Benin, Ivoorkust, Myanmar. `validate.py` waarschuwt als een land in die
lijst geen `capitalNote` heeft.

### Landmark

Herkenningspunten per stad of land. Ontwerp en catalogus staan in
[07-landmarks-en-weetjes.md](07-landmarks-en-weetjes.md); hier alleen het schema.

```lua
{
    id = "fr-paris-eiffeltoren",
    name = "Eiffeltoren",
    nameLocal = "Tour Eiffel",
    place = "fr-paris",
    country = "fr",
    kind = "toren",              -- toren | gebouw | brug | monument | natuur | waterwerk
    heightM = 330,
    builtYear = 1889,
    model = "parts:eiffel",      -- of "asset:landmarks/sagrada.rbxmx"
    silhouette = "eiffel",       -- 2D-icoon voor kaart en weetjesboek
    rightsNote = "Eigen gestileerde vorm; bouwwerk uit 1889, panoramavrijheid in FR.",
    facts = { ... },             -- zie Fact
}
```

`heightM` is de echte hoogte en wordt **niet** gebruikt als bouwmaat — landmarks
worden op een vaste hoogteband gerenderd zodat ze op elk bord leesbaar zijn (zie
[ADR-0005](adr/0005-landmarks-als-bouwlijst.md)). `heightM` bepaalt alleen de
onderlinge verhouding, en is zelf een weetje.

### Fact

```lua
{
    text = "De Eiffeltoren was bij de bouw in 1889 het hoogste bouwwerk ter wereld.",
    level = 3,                   -- 1 = kijken, 2 = kerncijfers, 3 = doorlezen
    source = "wikidata:Q243",
    year = 2025,
}
```

`source` en `year` zijn verplicht op niveau 2 en 3 en worden ook echt getoond. Een
kind dat leert dat cijfers een herkomst en een datum hebben, leert iets dat langer
meegaat dan de topografie zelf.

### River

```lua
{
    id = "rijn",
    name = "Rijn",
    countries = { "ch", "de", "fr", "nl" },
    polyline = { { lat = 46.6, lon = 8.6 }, ... },   -- vereenvoudigd, ~40 punten
    mouth = "nl-rotterdam",
}
```

De polyline is met Douglas-Peucker vereenvoudigd tot wat op bordschaal zichtbaar is.
Een rivier met 4000 punten is op een bord van 1500 studs verspilling.

### Airport

```lua
{
    icao = "EHEH", iata = "EIN",
    name = "Eindhoven Airport",
    country = "nl",
    pos = { lat = 51.4501, lon = 5.3745 },
    size = "medium",
    servesPlace = "nl-eindhoven",
}
```

`servesPlace` koppelt de luchthaven aan de stad, zodat een bord-overgang weet waar je
uitkomt.

### Region

```lua
{
    id = "nederland",
    name = "Nederland",
    bounds = { minLat = 50.7, maxLat = 53.6, minLon = 3.3, maxLon = 7.3 },
    studsPerKm = 5,
    unlockLevel = 3,
    parentRegion = "west-europa",
    gateways = { "EHAM", "EHEH", "EHRD" },
}
```

`bounds` plus `studsPerKm` bepalen de bordafmeting. `Geo.project()` zet lat/lon om
naar bordcoördinaten met een equirectangular projectie rond het midden van de bounds.
Voor gebieden ter grootte van Europa is de vervorming acceptabel en de wiskunde
begrijpelijk; voor het wereldbord gebruiken we dezelfde projectie bewust, omdat een
kaart die op school hangt er ook zo uitziet.

### Vehicle

```lua
{
    id = "bestelbus",
    name = "Bestelbus",
    price = 0,
    speedKmh = 90,
    capacityKg = 800,
    allowedRegionTiers = { 1, 2 },
    domain = "road",              -- road | rail | air | sea
}
```

---

## 4. Cijfers: één definitie, met herkomst en jaartal

Zodra je oppervlaktes en inwonertallen toont, en er verhoudingen mee uitrekent, wordt
de *definitie* van het cijfer belangrijker dan het cijfer zelf.

| | Totaal (incl. binnenwater) | Alleen land |
|---|---|---|
| Nederland | 41.543 km² | 33.720 km² |
| Duitsland | 357.592 km² | 348.560 km² |
| **Duitsland ten opzichte van Nederland** | **8,6 ×** | **10,3 ×** |

Allebei waar, en het scheelt bijna twee hele Nederlanden. Voor Nederland is het
verschil extra groot omdat bijna een vijfde van het land water is — wat zelf een van
de betere weetjes over Nederland is.

**Harde regels:**

1. Elk getal draagt zijn definitie mee. `areaKm2` heeft `total` én `land`; er is geen
   veld dat "de oppervlakte" heet.
2. `Compare` rekent nooit met twee verschillende definities. Een unit-test dwingt dat
   af, want dit is bij uitstek een fout die niemand ooit terugvindt.
3. Elk getal heeft `year` en `source`. Cijfers verouderen; een weetje zonder jaartal
   wordt op termijn een onwaarheid.
4. Wat het spel toont, vermeldt welke definitie is gebruikt ("inclusief binnenwater").
5. Getallen staan **nooit in prozateksten** in de data. Ze staan als getal in het
   schema en de zin wordt eromheen gebouwd door `Compare`. Anders moet je bij elke
   dataverversing honderd zinnen nalopen.

## 5. Waar de speler-data leeft

`Profile` (zie `Types.luau`) gaat in **DataStore**, sleutel `profile_<userId>`,
met `schemaVersion`. Regels:

- Geen naam, geen e-mail, geen vrije tekst. Alleen `UserId` als sleutel en getallen
  en id's als inhoud. Dat houdt het privacy-verhaal voor kinderen simpel.
- Schrijven gebeurt via `UpdateAsync`, nooit `SetAsync`, en gebufferd: hoogstens één
  schrijf per speler per 60 seconden plus één bij vertrek.
- `SaveService` valideert bij het laden tegen het schema. Een profiel dat niet
  valideert wordt niet stilzwijgend gerepareerd maar gemigreerd door een expliciete
  migratiefunctie per versiestap, of anders geweigerd met een duidelijke fout.

---

## 6. Adressen: hoe echt moet het zijn

Per moeilijkheidsniveau verschilt hoeveel adres je nodig hebt.

| Niveau | Adres dat de speler ziet | Data die nodig is |
|---|---|---|
| 1-2 | "Pakket voor Utrecht" | `Place` |
| 3-4 | "Domplein 1, Utrecht" | `Place` + één plausibele straat |
| 5 | "3512 JE, Nederland" | `Place` + postcode-prefix |
| 6 | drie adressen tegelijk | idem, plus routeplanning |

Voor niveau 3 en 4 is één herkenbare straat per stad genoeg — geen volledig
stratenbestand. Voor Nederlandse steden komt die uit PDOK; voor buitenlandse steden
uit een handmatig verzorgde lijst van bekende straten en pleinen per stad
(`data/curated/streets.csv`). Dat is bewust klein gehouden: een volledig
wereldstratenbestand voegt niets toe aan het leerdoel en kost gigabytes.
