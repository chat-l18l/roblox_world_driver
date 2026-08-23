# Wereldpost — Roblox-helft (slice 1)

Kaal skelet: vloer, bus, doel, WASD. A = links onder chase-cam. Geen quiz, geen kaart, geen FSM.

## Zien in Studio — volgorde

Doe dit **in deze volgorde**. Overslaan = leeg tegeltje.

1. **Git Bash / PowerShell**, repo up-to-date:
   ```sh
   cd ~/roblox/roblox_world_driver
   git pull
   cd rbx
   ```
2. **`rojo serve`** laten lopen in die `rbx/`-map. Venster open laten. Er moet iets staan als `Rojo listening on ... 34872`.
3. **Roblox Studio** → File → **New** (lege Baseplate, geen gepubliceerde game).
4. **Home → Game Settings → Security → Allow HTTP Requests** aan, Save.
5. Tab **Plugins** → **Rojo** → **Connect** (localhost / poort 34872) → **Accept** als hij dat vraagt.
6. **View → Explorer**. Je moet zien:
   - `Workspace` → `Wereldpost` → `Floor`, `Van`, `Goal`
   - `ReplicatedStorage` → `Shared` → `Sim` → `Vehicle`
   - `ServerScriptService` → `Server`
7. In het 3D-venster: muiswiel **uitzoomen** of toets **F** met Van geselecteerd in Explorer. Na Connect (nog zonder Play) zie je een zandvloer, een donker blok (bus) en een rood blok (DOEL). Het grijze spawn-tegeltje is de lege place; die verdwijnt bij Play.
8. **Play** — groene knop bovenin, of **F5**. Niet “Run”. Geen avatar; jij *bent* de bus.
9. **Klik in het 3D-venster** (niet Explorer, niet Output).
10. **W** = vooruit, **A/D** = sturen (A = links), **S** = achteruit. Rij naar het rode DOEL.

Rojo-plugin Connected houden terwijl je Playt. `rojo serve` niet dichtdoen.

---

De sessie-machine leeft nog in `../src/sim` (TypeScript). Port die pas in slice 2.

## Eenmalig op Windows 11

Roblox Studio en Git heb je al. **Rokit en Rojo zitten niet in de clone.** Installeer Rokit in **PowerShell** (niet Git Bash, niet WSL):

```powershell
Invoke-RestMethod https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | Invoke-Expression
```

Nieuw PowerShell-venster, daarna:

```powershell
cd pad\naar\roblox_world_driver\rbx
rokit install
rojo plugin install
```

HTTP zet je in Game Settings, niet in Explorer. Studio blokkeert `HttpService.HttpEnabled` voor plugins.

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

Niet committen: `.rbxl`, Studio-cache. Bron is `src/`. Publiceren pas als Play lokaal klopt.
