# Wereldpost — Roblox-helft (slice 1)

Kaal skelet: vloer, bus, doel, WASD. A = links onder chase-cam. Geen quiz, geen kaart, geen FSM.

De sessie-machine leeft nog in `../src/sim` (TypeScript). Port die pas in slice 2. Bouw geen tweede waarheid in Studio-scripts.

## Eenmalig op de werk-pc

1. [Roblox Studio](https://create.roblox.com)
2. Git
3. [Rokit](https://github.com/rojo-rbx/rokit#installation)

```sh
git clone https://github.com/chat-l18l/roblox_world_driver.git
cd roblox_world_driver/rbx
rokit install
rojo plugin install
```

Windows (PowerShell): zelfde commando's als `rbx` in PATH zit na Rokit.

## Elke sessie

```sh
cd rbx
rojo serve
```

Studio: **File → New**, Rojo-plugin → **Connect**. Play.

Je ziet een zandkleurige vloer, een donker busje, een rood DOEL. WASD. A draait de neus naar links op het scherm.

Niet committen: `.rbxl`, Studio-cache. Bron is `src/`.

Publiceren (kinderen) pas als Play lokaal klopt: Studio → File → Publish to Roblox.

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
