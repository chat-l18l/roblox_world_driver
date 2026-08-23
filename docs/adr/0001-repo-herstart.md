# ADR-0001 — Repo schoon herstarten, Grok-staat archiveren

**Status:** aanvaard
**Datum:** 2026-08-23

## Context

De repo bevat een Grok App Builder web-applicatie (TanStack Start, React, Vercel) met
een Roblox-project in `rbx/` eraan geplakt. De spellogica bestaat twee keer: in
TypeScript (`src/sim/`, 682 regels) en in Luau (`rbx/src/`). Daarnaast staat 977 KB
aan `.grok/`-sandbox-instructies gecommit die niets met dit project te maken hebben,
en beschrijft `AGENTS.md` (18 KB) Groks eigen sandbox-contract.

Gevolg: wie de repo cloont krijgt geen Roblox-project. Elke agent die `AGENTS.md`
leest krijgt het verkeerde mentale model. Elke gedragswijziging moet in twee talen.

## Besluit

1. De huidige staat wordt bewaard als tag **`archive/grok`** en branch
   **`archive/grok`**, en gepusht. Er gaat niets verloren.
2. `main` wordt leeggemaakt en opnieuw opgebouwd met het Roblox-project in de root,
   volgens de indeling in `docs/01-architectuur.md`.
3. Er is één implementatietaal: **Luau**. De TypeScript-simulatie komt niet terug.
4. De React-webgame en de `.grok/`-map komen niet mee naar `main`.

## Gevolgen

**Positief**

- Eén project, één waarheid, één taal.
- Een verse clone is direct bruikbaar: `rokit install`, `rojo build`, openen.
- `AGENTS.md` beschrijft dít project, dus agents starten met het juiste model.
- De git-geschiedenis blijft intact en de Grok-staat blijft opvraagbaar.

**Negatief**

- De React-prototypes (`renderMap.ts`, `GameScreen.tsx`) zijn niet meer direct
  bruikbaar. Ze blijven raadpleegbaar op `archive/grok` als ontwerpreferentie.
- `main` krijgt een grote verwijder-commit. Dat is eenmalig en bewust zichtbaar.

## Overwogen alternatieven

- **Web-app naast Roblox houden (`web/` + `game/`).** Verworpen: twee projecten
  onderhouden en het twee-waarheden-risico blijft bestaan, terwijl de web-versie geen
  doel dient.
- **Nieuwe repo beginnen.** Verworpen: twee GitHub-repo's voor één project, en de
  geschiedenis raakt versnipperd.
- **Geleidelijk opruimen.** Verworpen: dan blijft de verkeerde structuur maandenlang
  het startpunt van elke sessie.
