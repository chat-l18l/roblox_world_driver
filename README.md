# Wereldpost

Educatieve Roblox-game over topografie voor kinderen van 6 tot 12. Je bezorgt
pakketten op een adres; om te bezorgen moet je weten waar dat adres ligt. De wereld
groeit mee: eerst Eindhoven, dan Nederland, dan de buurlanden, dan Europa, dan de
wereld.

**Het plan staat in [`docs/00-plan.md`](docs/00-plan.md).** Begin daar.

## Aan de slag op Windows

Eenmalig, in PowerShell. [Rokit](https://github.com/rojo-rbx/rokit) beheert de
toolchain; `rokit.toml` pint de versies zodat jouw pc en de CI hetzelfde draaien.

```powershell
Invoke-RestMethod https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | Invoke-Expression
```

Sluit PowerShell daarna helemaal en open een nieuw venster, anders kent Windows
`rokit` nog niet. Dan, in de repo:

```powershell
rokit install
rojo plugin install
```

## Spelen

```powershell
rojo build default.project.json --output build\Wereldpost.rbxl
```

Open `build\Wereldpost.rbxl` in Studio via **File -> Open**. Niet File -> New: dan
is de Explorer leeg en lijkt het kapot. Je ziet bovenin het scherm welke build je
speelt.

Voor live meekijken tijdens het werken: `rojo serve` in een apart venster laten
draaien, en in Studio de Rojo-plugin op **Connect** zetten. Elke bestandswijziging
staat dan binnen een seconde in Studio.

## Controleren voor je commit

```powershell
stylua .
selene .
selene --config selene-lune.toml tests tools
python tools\check_pure_core.py
lune run tools\run_tests.luau
rojo build default.project.json --output build\Wereldpost.rbxl
```

Dit is exact wat de CI ook draait. Groen hier is groen daar.

## Hoe het in elkaar zit

| Map | Wat er in hoort |
|---|---|
| `src/shared/core/` | de spelregels; **puur Luau, geen Roblox-API**, headless testbaar |
| `src/shared/data/` | gegenereerde geo-tabellen; niet met de hand bewerken |
| `src/server/` | Roblox-schil: parts, DataStore, remotes. Beslist alles |
| `src/client/` | weergave en invoer. Beslist niets |
| `tests/unit/` | draait onder Lune, zonder Roblox |
| `tools/` | geo-pipeline, testrunner, de bewaker van de pure-kern-regel |
| `docs/` | plan, architectuur, datamodel, workflow, ADR's |

Werkafspraken en codestijl: [`AGENTS.md`](AGENTS.md).
Bewerk **nooit** scripts in Roblox Studio — Rojo overschrijft ze. Dat is de bedoeling.

## Archief

De eerste opzet (een web-app met een Roblox-mapje eraan) staat als tag
`archive/grok` en branch `archive/grok-main`. Zie
[ADR-0001](docs/adr/0001-repo-herstart.md) voor waarom die is losgelaten.
