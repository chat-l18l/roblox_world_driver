# Wereldpost — instructies voor agents

Educatieve Roblox-game over topografie voor kinderen van 6 tot 12. Je bezorgt
pakketten op een adres; om te bezorgen moet je weten waar dat adres ligt.

**Lees eerst [`docs/00-plan.md`](docs/00-plan.md).** Dit bestand is de korte versie
voor dagelijks werk.

> Dit bestand verving de AGENTS.md van Grok, die het sandbox-contract van een
> Linux-webbuilder beschreef en niets met dit project te maken had. Als je
> instructies leest over `/workspace`, poort 8080, TanStack Start of Vercel, zit je
> op de verkeerde branch (`archive/grok`).

---

## Bron van waarheid

Bestanden in git. Rojo synct één kant op naar Studio. **Bewerk nooit scripts in
Roblox Studio** — Rojo overschrijft ze. Handgebouwde 3D-content exporteer je naar
`assets/*.rbxmx` en commit je.

Studio's ingebouwde MCP-server mag je gebruiken om te kijken, Play te draaien, de
console te lezen en screenshots te maken. Niet om scriptbronnen te wijzigen.

---

## Lagen, en de harde regel

| Map | Rol | Mag Roblox-API gebruiken |
|---|---|---|
| `src/shared/core/` | de spelregels; puur Luau | **nee, nooit** |
| `src/shared/data/` | gegenereerde geo-tabellen; niet handmatig bewerken | nee |
| `src/server/services/` | Roblox-schil: parts, DataStore, remotes | ja |
| `src/client/` | weergave en invoer; beslist niets | ja |

In `src/shared/core/` komt geen `game`, `workspace`, `Instance`, `script`, `task`,
`wait`, `Enum`, `Vector3`, `CFrame` of welke Roblox-service dan ook voor.
`tools/check_pure_core.py` dwingt dit af in CI. Die regel is wat de unit-tests in
milliseconden laat draaien zonder Roblox.

De client is dom: hij stuurt intenties, de server beslist. Of een bezorging klopt
bepaalt uitsluitend de server.

---

## Codestijl (Hintjens, vertaald naar Luau)

1. `--!strict` bovenaan elk bestand. Geen uitzonderingen.
2. **Design by contract**: elke publieke functie begint met `Contract.require(...)`.
3. **Fail fast**: ongeldige invoer is een bug van de aanroeper. Niet stilzwijgend
   corrigeren, niet negeren, geen troostwaarde teruggeven.
4. Na de poortwachter geen defensieve ruis; binnen de functie klopt de invoer.
5. Commentaar boven elke publieke functie: **wat** het doet en **waarom**, niet hoe.
6. Geen if-then-else-boom waar een tabel kan. Meer dan drie takken op dezelfde
   variabele wordt een tabel-opzoeking.
7. FSM's zijn tabelgestuurd en geven **effects** terug; de service voert ze uit.
8. Eén module, één verantwoordelijkheid. Past hij niet in één scherm, splits hem.
9. Geen globals; elke module eindigt met een expliciete return-tabel.
10. Namen in het Engels, commentaar en documentatie in het Nederlands.
11. `stylua` bepaalt de opmaak. Niet handmatig uitlijnen.

Onderscheid dat vaak fout gaat: een **onbekende toestand** in een FSM is een
programmeerfout en faalt hard. Een **event dat in deze toestand niet geldt** is
normale spelersinvoer en wordt stil genegeerd.

---

## Voordat je klaar bent

```powershell
stylua .
selene .
python tools/check_pure_core.py
lune run tools/run_tests.luau
rojo build default.project.json --output build\Wereldpost.rbxl
```

Nieuwe regels in `shared/core/` zonder unit-test zijn niet af.

---

## Werken met Rojo en Studio

```powershell
# venster 1, blijft open
rojo serve

# venster 2, eenmalig per sessie
rojo build default.project.json --output build\Wereldpost.rbxl
```

Open in Studio `build\Wereldpost.rbxl` via **File -> Open**. **Niet** File -> New:
dan is de Explorer leeg en lijkt het kapot. Daarna Rojo-plugin -> Connect.

---

## Werkafspraken

- Werk per mijlpaal op een branch (`m2/eerste-bezorging`). `main` blijft groen.
- Een architectuurkeuze leg je vast als ADR in `docs/adr/`, genummerd, niet
  achteraf herschreven.
- Balansgetallen horen in `src/shared/data/`, niet in code.
- Landmarks zijn pure bouwlijsten in `src/shared/core/landmarks/`, maximaal 40 parts,
  nooit een Toolbox-asset. Zie [ADR-0005](docs/adr/0005-landmarks-als-bouwlijst.md).
- Elk feitelijk getal draagt `year` en `source`, en oppervlaktes hebben altijd zowel
  `total` als `land`. Meng die twee nooit in een vergelijking.
- Geen chat, geen vrije tekstinvoer, geen persoonsgegevens. In DataStore alleen
  `UserId` als sleutel plus getallen en id's.
- Bij twijfel waar iets hoort: zie de beslistabel onderaan
  [`docs/01-architectuur.md`](docs/01-architectuur.md).
