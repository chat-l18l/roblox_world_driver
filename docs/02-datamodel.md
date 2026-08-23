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
    languages = { "Duits" },
    currency = "EUR",
    continent = "europa",
    neighbours = { "nl", "be", "fr", "ch", "at", "cz", "pl", "dk", "lu" },
    flagColors = { "#000000", "#DD0000", "#FFCE00" },
}
```

`neighbours` is leerstof én hint-materiaal ("dit land grenst aan Nederland").

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

## 4. Waar de speler-data leeft

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

## 5. Adressen: hoe echt moet het zijn

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
