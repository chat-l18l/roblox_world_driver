# M0 — De keten werkend krijgen

Doel: van een verse clone naar een spelend kind, zonder handmatige trucs. **Geen
spelmechaniek in deze mijlpaal.** Wat er in de place staat is een vloer, een label
met het versienummer, en verder niets.

Acceptatiecriterium: iemand anders kloont de repo, draait drie commando's, opent het
place-bestand en ziet het versienummer. De CI is groen. De test-place is speelbaar op
een tablet.

---

## Stap 1 — Archiveren

```powershell
cd C:\Users\panda\roblox\roblox_world_driver
git checkout main
git tag archive/grok
git branch archive/grok
git push origin archive/grok --tags
```

Vanaf nu is de Grok-staat permanent terugvindbaar en mag `main` leeg.

## Stap 2 — main schoonmaken

Weg van `main`: `.grok/`, `.vercel/`, `src/` (web), `server/`, `scripts/`, `public/`,
`migrations/`, `artifacts/`, `package.json`, `package-lock.json`, `tsconfig.json`,
`vite.config.ts`, `eslint.config.mjs`, `.prettierrc`, `startup.sh`,
`.node_modules.lock`, `screenshots/`.

Blijft, verplaatst naar de root: de inhoud van `rbx/` als vertrekpunt, plus `docs/`
en `AGENTS.md`.

Eén commit, met een boodschap die uitlegt waarom (verwijst naar ADR-0001).

## Stap 3 — Structuur neerzetten

Volgens `docs/01-architectuur.md`, paragraaf 1. Concreet in M0:

- `rokit.toml` uitgebreid met `lune`
- `selene.toml`, `stylua.toml`
- `default.project.json` in de root
- `src/shared/core/Contract.luau` en `Types.luau` (meer nog niet)
- `src/server/init.server.luau` — bouwt een vloer en een label met de versie
- `src/client/init.client.luau` — camera op de vloer, verder niets
- `tools/check_pure_core.py`
- `tools/run_tests.luau` plus één triviale test die bewijst dat de runner werkt
- `.gitignore` met `build/`, `data/raw/`, Studio-cache
- `README.md`: clone tot spelen in vijf regels

De versie komt uit een gegenereerd `src/shared/Version.luau` dat CI vult met de
korte commit-hash. Zo zie je in beeld welke build je speelt — dat is precies wat
ontbrak toen het "niet werkte".

## Stap 4 — Lokale lus bewijzen

```powershell
rokit install
stylua --check .
selene .
python tools\check_pure_core.py
lune run tools\run_tests.luau
rojo build default.project.json --output build\Wereldpost.rbxl
```

Open `build\Wereldpost.rbxl` in Studio via **File -> Open**. Explorer moet gevuld
zijn zonder dat je Play hebt gedrukt. Dan `rojo serve` en Connect; wijzig het label,
sla op, en zie het binnen een seconde in Studio veranderen.

## Stap 5 — Studio MCP aanzetten

Studio -> Assistant -> **…** -> **Manage MCP Servers** -> **Enable Studio as MCP
server** -> Quick Connect voor **Claude Code**.

Bewijs dat het werkt: ik start Play via MCP, lees de console en maak een screenshot
van het versielabel.

## Stap 6 — Roblox-places aanmaken

Twee privé-places onder één universe:

- **Wereldpost (test)** — doelwit van CI-integratietests
- **Wereldpost** — waar de kinderen op spelen

Noteer universe-id en place-id van beide.

## Stap 7 — Open Cloud sleutel

Creator Hub -> Open Cloud -> API Keys. Eén key, rechten beperkt tot:

- `universe.places:write`
- `universe.place.luau-execution-session:write`

Zet hem in GitHub -> Settings -> Secrets -> `ROBLOX_API_KEY`. De vier id's als repo
**variabelen**, niet als secrets.

> De key zelf zet jij zelf in GitHub. Ik vraag er niet om en ik krijg hem niet te zien.

## Stap 8 — CI-workflow

`.github/workflows/ci.yml` volgens `docs/04-testen-en-ci.md`, paragraaf 4. Op
`ubuntu-latest`; Studio is nergens in CI nodig.

Bewijs: een lege commit pushen, CI wordt groen, en het `.rbxl`-artifact is te
downloaden uit de run.

## Stap 9 — Deploy bewijzen

Merge naar `main`, CI deployt naar de test-place. Open de place op een tablet en zie
hetzelfde versienummer als in de commit.

---

## Definition of done voor M0

- [ ] `archive/grok` tag en branch staan op GitHub
- [ ] `main` bevat alleen het Roblox-project, `docs/` en `AGENTS.md`
- [ ] Verse clone: `rokit install` -> `rojo build` -> place opent gevuld in Studio
- [ ] `rojo serve` + Connect: wijziging zichtbaar binnen een seconde
- [ ] Studio MCP verbonden; ik kan Play draaien en de console lezen
- [ ] Alle CI-poorten groen op een pull request
- [ ] `.rbxl`-artifact downloadbaar uit de CI-run
- [ ] Test-place draait de build van `main`, met zichtbaar versienummer
- [ ] Speelbaar geopend op een tablet
- [ ] `README.md` klopt: iemand anders komt er zonder hulp doorheen

Pas als dit lijstje af is, beginnen we aan M1.
