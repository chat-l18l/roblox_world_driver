# ADR-0005 — Landmarks als pure bouwlijst in parts, niet als mesh

**Status:** aanvaard
**Datum:** 2026-08-24

## Context

Het spel krijgt herkenningspunten per stad en land: Eiffeltoren, Euromast,
Fernsehturm, Afsluitdijk. Ze dienen als geheugenanker, als navigatiehint zodra de
plaatsnamen verborgen zijn, en als aankomstbeloning.

Er zijn vier manieren om zo'n object in Roblox te krijgen:

1. Opgebouwd uit primitieve parts, beschreven als data in de repo.
2. Handgebouwd in Studio en geëxporteerd als `.rbxmx`.
3. Een mesh, gemodelleerd of gegenereerd, geüpload als Roblox-asset.
4. Een asset uit de Roblox Toolbox.

Optie 3 en 4 leveren een **asset-id in de cloud** op. Dat is geen bestand in git, geen
diff, en niet te reviewen — precies het versiebeheer-gat dat ADR-0002 dichtgooit.
Optie 4 heeft daarbovenop een onverantwoorde licentieherkomst.

Daar komt een schaalprobleem bij. De Eiffeltoren is 330 m. Op het Nederland-bord
(5 studs/km) is dat 1,65 studs, op het wereldbord 0,03 studs. Een geometrisch correct
model is dus per definitie onzichtbaar; elk landmark moet hoe dan ook gestileerd en
overdreven groot worden weergegeven.

## Besluit

1. Een landmark is een **pure Luau-bouwlijst** in `src/shared/core/landmarks/`:
   een tabel met vorm, afmeting, positie en kleur per part. Geen Roblox-API.
   `WorldService` voert de lijst uit, net als bij `Board.plan()`.
2. **Part-budget van 40 per landmark**, afgedwongen door een unit-test. De stijl is
   bewust low-poly.
3. **De landmark-schaal is losgekoppeld van de bordschaal.** Elk landmark wordt
   gerenderd binnen een vaste hoogteband (richtwaarde 40-90 studs) zodat het op elk
   bord leesbaar is; onderlinge hoogteverhoudingen blijven wel kloppen. Landmarks
   zijn kaarticoontjes in 3D, geen maquettes.
4. **Ontsnappingsluik:** `assets/landmarks/<id>.rbxmx`, gecommit en gemount via
   `$path`, voor het enkele geval dat parts echt tekortschieten. Geüploade meshes
   krijgen een regel in `assets/MANIFEST.md` met naam, asset-id, herkomst en datum.
5. **Geen Toolbox-assets.**
6. Elk landmark heeft een `rightsNote`. Moderne bouwwerken met actief gehandhaafde
   beeldrechten (het Atomium is het schoolvoorbeeld) worden vermeden of nadrukkelijk
   geabstraheerd.

## Gevolgen

**Positief**

- Alles staat in git en is een leesbare diff. Een landmark bijstellen is een getal
  wijzigen, geen her-upload.
- Testbaar: part-aantal, bounding box, niets onder de grond, kleuren uit het palet.
- Geen asset-id's, geen uploadstap, geen moderatiewachttijd in de bouwstraat.
- De stijl is uniform, want er is maar één manier om een landmark te maken.
- Werk is deelbaar: zodra het eerste landmark staat, is de rest hetzelfde patroon en
  kan een agent er een reeks van maken.

**Negatief**

- Organische vormen (Sagrada Família, Christus Verlosser) zijn in parts lastig en
  worden noodgedwongen erg abstract. Daarvoor is het `.rbxmx`-luik.
- Handmatig bouwlijsten schrijven is trager dan iets in Studio in elkaar slepen.
  Tegenwicht: het is één keer per landmark, en het resultaat is herbruikbaar.
- Een part-budget van 40 is een echte beperking. Als hij structureel knelt, is dat
  een aanleiding om deze ADR te herzien, niet om er stilzwijgend overheen te gaan.

## Overwogen alternatieven

- **Handgebouwd in Studio, `.rbxmx` gecommit.** Werkt en staat in git, maar is niet
  te reviewen als diff en niet te testen. Blijft beschikbaar als luik.
- **Meshes genereren via Studio's MCP-assettools.** Snel en visueel beter, maar het
  resultaat is een cloud-asset-id. Kan later voor een afwerkingsronde, mits elk
  asset in `MANIFEST.md` staat.
- **Toolbox-assets.** Verworpen op licentieherkomst en kwaliteitsspreiding.
