# ADR-0002 — Rojo als bron van waarheid, Studio-MCP als ogen en handen

**Status:** aanvaard
**Datum:** 2026-08-23

## Context

Roblox Studio biedt AI-integratie (Assistant, en sinds 2026 een ingebouwde
MCP-server). De zorg was: als AI direct in Studio schrijft, staat het resultaat in
het cloud-place en niet in git, en werkt versiebeheer niet.

Die zorg is terecht voor de Assistant die in de place schrijft. Hij is níet terecht
voor MCP als je de rollen scheidt.

## Besluit

1. **Bestanden in git zijn de enige bron van waarheid.** Rojo synct één kant op:
   bestand -> Studio.
2. **Scripts worden nooit in Studio bewerkt.** Rojo overschrijft ze; dat is het
   gewenste gedrag, niet een tekortkoming.
3. De **ingebouwde Studio MCP-server** wordt aangezet en via Quick Connect aan Claude
   Code gekoppeld. Toegestaan gebruik: instance-tree lezen, Luau uitvoeren, Play
   starten/stoppen, console lezen, screenshots maken.
4. **Verboden gebruik van MCP:** scriptbronnen in de place wijzigen. Elke
   scriptwijziging gaat via een bestand en een commit.
5. Handgebouwde 3D-content mag in Studio ontstaan, maar wordt geëxporteerd naar
   `assets/*.rbxmx`, gecommit en via `$path` gemount.

## Gevolgen

**Positief**

- Versiebeheer blijft volledig intact; elke wijziging is een diff.
- De feedbackloop wordt kort: bij een visuele bug kan ik zelf Play draaien, de
  console lezen en een screenshot maken in plaats van te vragen wat je ziet.
- Geen losse Rust-binary meer nodig; Roblox heeft `studio-rust-mcp-server` vervangen
  door de ingebouwde server en beveelt die aan.
- Handwerk in Studio raakt niet buiten versiebeheer dankzij de `.rbxmx`-route.

**Negatief**

- De regel "nooit scripts in Studio bewerken" vraagt discipline; een snelle
  probeerwijziging in Studio is verleidelijk en gaat verloren bij de volgende sync.
- De ingebouwde MCP-server is een betrekkelijk nieuwe functie; gedrag kan wijzigen.
  Als hij uitvalt, valt het project terug op de handmatige lus (jij draait Play en
  rapporteert). Dat is trager, niet blokkerend.

## Overwogen alternatieven

- **Alleen Rojo, geen MCP.** Werkt, maar elke visuele bug kost een heen-en-weer.
- **Studio Assistant als hoofdroute.** Verworpen: schrijft in de place, buiten git.
- **Losse `Roblox/studio-rust-mcp-server`.** Verworpen: Roblox heeft de ontwikkeling
  verlegd naar de ingebouwde server en beveelt die nu aan.

## Bronnen

- https://create.roblox.com/docs/studio/mcp
- https://github.com/Roblox/studio-rust-mcp-server
