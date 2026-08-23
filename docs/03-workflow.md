# Workflow

Hoe we dagelijks werken, en waarom precies zo. Dit document is het antwoord op
"versiebeheer werkt niet als je AI in Studio gebruikt".

---

## 1. De gouden regel

> **Bestanden in git zijn de enige bron van waarheid. Studio is een uitvoerder en
> een 3D-editor, nooit een scripteditor.**

Alles volgt hieruit:

- Scripts worden **nooit** in Studio bewerkt. Rojo synct één kant op (bestand ->
  Studio) en overschrijft wat je in Studio typt. Dat is geen tekortkoming maar de
  reden dat versiebeheer werkt.
- Handgebouwde 3D-content (een gebouw, een voertuigmodel) mág in Studio gemaakt
  worden, maar wordt dan **geëxporteerd** naar `assets/<naam>.rbxmx`, gecommit, en
  via `$path` gemount in `default.project.json`. Zo staat ook handwerk onder
  versiebeheer.
- De Studio Assistant die direct in de place schrijft, gebruiken we niet. Dat is
  precies het scenario waar jij bang voor was: wijzigingen die alleen in het
  cloud-place bestaan en niet in git.

---

## 2. Eenmalige installatie

Alles wat hieronder staat is geverifieerd op deze pc; Rokit, Rojo, selene en stylua
staan er al. Lune moet er nog bij.

```powershell
# 1. Rokit staat al in C:\Users\panda\.rokit\bin en in je user-PATH.
rokit --version

# 2. In de repo-root: haal de gepinde toolchain op.
cd C:\Users\panda\roblox\roblox_world_driver
rokit install

# 3. Rojo-plugin voor Studio (staat er al, herinstalleren is onschadelijk).
rojo plugin install
```

`rokit.toml` pint de versies, dus jouw pc en de CI draaien exact hetzelfde:

```toml
[tools]
rojo   = "rojo-rbx/rojo@7.4.4"
selene = "Kampfkarren/selene@0.27.1"
stylua = "JohnnyMorganz/StyLua@0.20.0"
lune   = "lune-org/lune@0.8.9"
```

---

## 3. Studio als MCP-server aanzetten

Roblox heeft de losse Rust-MCP-server vervangen door een **ingebouwde MCP-server in
Studio**. Dat is nu de aanbevolen route en er is geen compilatie of losse binary meer
nodig.

1. Open Roblox Studio.
2. Open **Assistant**.
3. Klik **…** -> **Manage MCP Servers**.
4. Zet **Enable Studio as MCP server** aan.
5. Zet in dezelfde lijst **Claude Code** aan via Quick Connect. Studio schrijft de
   configuratie zelf weg; geen JSON-gedoe.

Daarna kan ik vanuit Claude Code in Studio: de instance-tree lezen, Luau uitvoeren,
Play starten en stoppen, de console lezen en screenshots maken. Dat verandert de
feedbackloop wezenlijk: bij een visuele bug hoef jij niet meer te beschrijven wat je
ziet.

**Wat ik via MCP wél doe:** kijken, testen, Play draaien, console lezen, een
experiment uitvoeren.
**Wat ik via MCP nooit doe:** scripts in de place bewerken. Scriptwijzigingen gaan
altijd via bestanden in git.

---

## 4. De dagelijkse lus

```powershell
# Venster 1 — blijft de hele sessie open
cd C:\Users\panda\roblox\roblox_world_driver
git pull
rojo serve
```

```powershell
# Venster 2 — bouw het place-bestand
rojo build default.project.json --output build\Wereldpost.rbxl
```

Dan in Studio: **File -> Open** en kies `build\Wereldpost.rbxl`. **Niet** File -> New.

Dit is het verschil met de Grok-instructie en de reden dat je "niets zag": een
gebouwd place-bestand bevat de hele boom meteen, ook zonder Play. Daarna Rojo-plugin
-> **Connect**, en vanaf dat moment is elke bestandswijziging binnen een seconde in
Studio zichtbaar.

Werkcyclus daarna:

1. Ik bewerk `.luau`-bestanden.
2. Rojo synct automatisch.
3. Play (F5) in Studio, of ik start het via MCP.
4. Console lezen, bijstellen.
5. `lune run tools/run_tests.luau` voor de pure laag.
6. Commit met een boodschap die zegt *waarom*, niet *wat*.
7. Push -> CI draait -> bij groen deployt hij naar de test-place.

`build/` staat in `.gitignore`. Het place-bestand is een artefact, geen bron.

---

## 5. Vertakkingen en commits

- `main` is altijd groen en altijd deploybaar.
- Werk per mijlpaal op een branch: `m2/eerste-bezorging`.
- Een PR mergen mag als: selene groen, stylua groen, unit-tests groen, `rojo build`
  groen, en het acceptatiecriterium van de mijlpaal aantoonbaar gehaald.
- Commit-boodschappen in het Nederlands of Engels, maar altijd met de reden. "Fix
  bug" zegt niets; "Geef gefaalde bezorging nul beloning in plaats van halve, anders
  loont gokken" zegt alles.

---

## 6. Rol van AI in dit project

| Taak | Wie | Hoe |
|---|---|---|
| Architectuur, ADR's, moeilijke ontwerpkeuzes | jij beslist, ik stel voor | gesprek, vastgelegd in `docs/adr/` |
| Luau schrijven | ik | bestanden in git, altijd met tests |
| Geo-pipeline | ik | Python in `tools/geo/` |
| 3D-modellen, sfeer, kleur | jij (of later een asset-pass) | Studio -> `assets/*.rbxmx` |
| Playtesten met kinderen | jij | test-place op tablet |
| Balans bijstellen | samen | getallen in `shared/data/`, niet in code |

`AGENTS.md` in de repo-root beschrijft dit contract voor elke agent die de repo
opent, inclusief de codestijl. Dat bestand vervangt de Grok-versie volledig.

---

## 7. Wat te doen als het misgaat

| Symptoom | Oorzaak | Oplossing |
|---|---|---|
| Explorer blijft leeg na Connect | Je deed File -> New in plaats van het gebouwde place openen | `rojo build` en het `.rbxl` openen |
| `rojo` niet gevonden | Nieuwe terminal na Rokit-install niet geopend, of je staat niet in de repo | Nieuw PowerShell-venster; `cd` naar de repo-root (Rokit-shims zoeken `rokit.toml`) |
| Rojo klaagt over HTTP | Studio staat HTTP-verzoeken niet toe | Home -> Game Settings -> Security -> Allow HTTP Requests. Niet via een script forceren |
| Wijziging komt niet door | `rojo serve` draait niet meer, of de plugin is losgeraakt | Kijk in venster 1; opnieuw Connect |
| Studio-wijziging verdwenen | Je bewerkte een script in Studio | Verwacht gedrag. Zie de gouden regel |
| CI faalt op stylua | Opmaak wijkt af | `stylua .` lokaal draaien en committen |
