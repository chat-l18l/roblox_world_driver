# Wereldpost — Roblox-helft (slice 1)

Kaal skelet: vloer, bus, doel, WASD. A = links onder chase-cam. Geen quiz, geen kaart, geen FSM.

De sessie-machine leeft nog in `../src/sim` (TypeScript). Port die pas in slice 2. Bouw geen tweede waarheid in Studio-scripts.

## Eenmalig op Windows 11

Roblox Studio en Git heb je al. **Rokit en Rojo zitten niet in de clone** — Rokit is een toolchain-manager, zoals rustup. Installeer die eerst, in **PowerShell** (niet Git Bash, niet WSL).

### 1. Rokit zelf

In PowerShell:

```powershell
Invoke-RestMethod https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | Invoke-Expression
```

Als het script geblokkeerd wordt:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

en daarna hetzelfde `Invoke-RestMethod`-commando opnieuw.

Alternatief: download `rokit.exe` van [Rokit releases](https://github.com/rojo-rbx/rokit/releases/latest), dubbelklik in Explorer (dat triggert `self-install`). Vanuit de terminal: `.\rokit.exe self-install`.

**Sluit PowerShell helemaal en open een nieuw venster.** Anders kent Windows `rokit` nog niet (PATH). Check:

```powershell
rokit --version
```

### 2. Rojo uit deze repo

```powershell
cd pad\naar\roblox_world_driver\rbx
rokit install
rojo --version
rojo plugin install
```

`rokit.toml` in deze map pinned Rojo al. `rokit add` is niet nodig.

Plugin-install mag ook later: in Studio, Plugins-map, of `rojo plugin install` nog eens.

### 3. Elke sessie

`rojo serve` in `rbx/` laten draaien. Studio: **File → New**, Rojo-plugin → **Connect** → **Accept**.

Accept vult de Explorer (scripts). De 3D-wereld (vloer, bus, DOEL) bestaat pas als je **Play** doet (groene knop, of F5). Dat is geen bug: we spawnen die parts in Lua, niet als place-file.

Check na Accept, vóór Play: **View → Explorer**

- `ReplicatedStorage` → `Shared` → `Sim` → `Vehicle`
- `ServerScriptService` → `Server`
- `StarterPlayer` → `StarterPlayerScripts` → `Client`

Zie je die drie: Accept is gelukt. Daarna Play. `rojo serve` moet open blijven.

Explorer nog leeg na Accept, of Rojo klaagt over HttpService:

1. **Home → Game Settings → Security → Allow HTTP Requests** — Studio laat Rojo deze property niet zetten. Niet in de Explorer forceren.
2. **View → Output** — rode regels van Rojo.
3. Plugins beheren → Rojo → **Script Injection** aan. Studio herstarten, opnieuw Connect.

Je ziet een zandkleurige vloer, een donker busje, een rood DOEL. WASD. A draait de neus naar links op het scherm.

Niet committen: `.rbxl`, Studio-cache. Bron is `src/`.

Publiceren (kinderen) pas als Play lokaal klopt: Studio → File → Publish to Roblox.

## Geen WSL

Studio draait op Windows, niet in Linux. Rojo in WSL praten met Studio op Windows is extra gedoe (localhost, plugin-pad). Blijf in PowerShell of Git Bash, zolang `rojo` op PATH staat.

VS Code mag: extensie “Rojo - Roblox Studio Sync” gebruikt dezelfde `rojo` op je PATH. De CLI-route hierboven is genoeg.

## Slices

| Slice | Status | Wat |
|---|---|---|
| 0 | dit | Rojo + Git, serve → Play |
| 1 | dit | bewegen, A = links |
| 2 | volgende | overlap DOEL → arrive, nog geen quiz |
| 3 | later | quiz-FSM = `src/sim/session.ts` |
| 4 | later | kaart als theater |
| 5 | later | mastery / labels |
| 6 | later | juice |

Stop na elke slice. 3D-wereld te vroeg is de val.
