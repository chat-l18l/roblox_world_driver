# Landmarks en weetjes

Herkenningspunten op de kaart (Eiffeltoren, Euromast, Fernsehturm) en een laag
achtergrondinformatie voor het nieuwsgierige kind. Beide zijn **optioneel voor de
gameplay** en verplicht voor het leerdoel.

---

## 1. Waarom dit geen versiering is

Een kind van zeven onthoudt een silhouet eerder dan een naam. "Daar staat die
ijzeren toren" komt vóór "dat is Parijs", en "Parijs" komt vóór "hoofdstad van
Frankrijk". Landmarks zijn dus geen decoratie maar het **eerste haakje** in een
keten die eindigt bij topografische kennis.

Ze doen in dit spel vier dingen:

1. **Ankerpunt.** Elke stad krijgt een gezicht, en dat gezicht zit vast aan een plek
   op de kaart.
2. **Navigatiehint.** Vanaf moeilijkheidsgraad 4 zijn de plaatsnamen verborgen. Het
   silhouet aan de horizon is dan wat je overhoudt om op te varen.
3. **Aankomstbeloning.** Bezorgen bij de Euromast is memorabeler dan bezorgen bij een
   grijs blokje. Het maakt het moment af.
4. **Nieuw missietype.** "Bezorg bij het gebouw waar de Nederlandse regering
   werkt" — dat is Den Haag, niet Amsterdam. Een adres omschrijven in plaats van
   benoemen is de moeilijkste en leukste vorm.

De weetjes zijn een **aparte laag ernaast**: nooit blokkerend, nooit een quiz, altijd
weg te klikken. Het kind dat wil doorspelen speelt door. Het kind dat wil lezen,
leest.

---

## 2. Landmarks als bouwlijst, niet als model

Zie [ADR-0005](adr/0005-landmarks-als-bouwlijst.md). Kort:

Een landmark is een **pure Luau-bouwlijst** in `src/shared/core/landmarks/`, geen
handgebouwd model en geen mesh uit de Toolbox.

```lua
--!strict
-- landmarks/Eiffel.luau — silhouet in 22 parts.
-- Waarom parts en geen mesh: het staat in git, het is een diff, het is te testen,
-- en de stilering past bij een kaart in plaats van bij een maquette.

return {
    id = "fr-paris-eiffeltoren",
    partBudget = 22,
    parts = {
        { shape = "wedge", size = { 6, 14, 6 },  offset = { 0, 7, 0 },  color = "#8A6F4E" },
        { shape = "block", size = { 3, 10, 3 },  offset = { 0, 19, 0 }, color = "#8A6F4E" },
        -- ...
    },
}
```

Voordelen die er echt toe doen:

- Het staat **in git**. Een mesh die je in Studio genereert of uploadt, leeft als
  asset-id in de cloud en is geen diff. Dat is precies het versiebeheer-gat dat we
  in ADR-0002 dichtgooien.
- Het is **testbaar**: part-aantal binnen budget, bounding box binnen de toegestane
  hoogteband, niets onder de grond, alle kleuren uit het palet.
- Het is **schaalbaar bewerkbaar**: een landmark bijstellen is een getal wijzigen.

**Ontsnappingsluik.** Iets dat echt een mesh nodig heeft (de Sagrada Família,
bijvoorbeeld) mag als `assets/landmarks/<id>.rbxmx`, gecommit en via `$path`
gemount. Meshes die naar Roblox geüpload moeten worden krijgen een regel in
`assets/MANIFEST.md` met naam, asset-id, bron en datum, zodat ook cloud-assets
traceerbaar zijn. Gebruik dit luik zelden.

### 2.1 Schaal: landmarks zijn kaarticoontjes, geen maquettes

Dit is de belangrijkste technische keuze van dit hoofdstuk.

De Eiffeltoren is 330 m hoog. Op het Nederland-bord (5 studs/km) is dat **1,65
studs**: onzichtbaar. Op het wereldbord (0,1 studs/km) is het 0,03 studs.

Daarom is de landmark-schaal **losgekoppeld** van de bordschaal. Elk landmark wordt
gerenderd binnen een vaste hoogteband (richtwaarde 40–90 studs), zodat het op elk
bord leesbaar is. De onderlinge verhoudingen blijven wel kloppen: de Eiffeltoren is
zichtbaar hoger dan de Euromast, want 330 m tegen 185 m.

Dat is geen valsspelen maar precies wat een schoolkaart aan de muur ook doet: een
plaatje van de Dom bij Utrecht, veel te groot getekend, omdat het anders niets zegt.
Bij de eerste bordwissel legt een korte animatie dat verschil uit — ook leerstof.

### 2.2 Rechten

Een eigen, gestileerde low-poly-vorm van een gebouw is geen reproductie van een foto
of een bouwtekening, en de landen waar we mee beginnen kennen panoramavrijheid. Toch
twee praktische regels:

- **Moderne bouwwerken met actief gehandhaafde beeldrechten vermijden of abstraheren.**
  Het Atomium in Brussel is het schoolvoorbeeld. Kies dan een ander herkenningspunt
  voor die stad (Grote Markt) of maak de vorm nadrukkelijk abstract.
- **Geen assets uit de Roblox Toolbox.** Herkomst en licentie zijn daar niet te
  verantwoorden, en het botst met de rest van het licentiebeleid in
  [02-datamodel.md](02-datamodel.md).

Elk landmark heeft een veld `rightsNote` waarin staat waarom het veilig is, of wat er
bewust anders is gedaan.

---

## 3. Startcatalogus

Per mijlpaal, zodat het niet als één berg werk in de planning zit.

**M2 — één stuks, om de pijplijn te bewijzen**

| Landmark | Plaats | Waarom deze |
|---|---|---|
| Evoluon | Eindhoven | Lokaal, direct herkenbaar voor jouw spelers, en een vliegende schotel is in twaalf parts te vangen |

**M4 — Nederland (twaalf, één per provincie waar het kan)**

Euromast en Erasmusbrug (Rotterdam), Domtoren (Utrecht), Paleis op de Dam
(Amsterdam), Binnenhof (Den Haag), Martinitoren (Groningen), molens van Kinderdijk
(Zuid-Holland), Afsluitdijk (Friesland/Noord-Holland), Oosterscheldekering
(Zeeland), Sint-Servaasbrug (Maastricht), Hunebed (Drenthe), Evoluon (Eindhoven).

Let op de mix: niet alleen torens maar ook **waterwerken**. De Afsluitdijk en de
Deltawerken zijn waarom Nederland Nederland is, en ze verklaren meteen die 19% water
uit de oppervlaktetabel.

**M6 — buurlanden**

Fernsehturm en Brandenburger Tor (Berlijn), Kölner Dom (Keulen), Eiffeltoren en Arc
de Triomphe (Parijs), Mont Saint-Michel, Elizabeth Tower en Tower Bridge (Londen),
Stonehenge, Belfort (Brugge), Grote Markt (Brussel).

**M7 — Europa**

Sagrada Família (Barcelona), Alhambra (Granada), Colosseum (Rome), toren van Pisa,
Karelsbrug (Praag), parlement van Boedapest, Basiliuskathedraal (Moskou),
Akropolis (Athene), Kroonprinsessenpaleis en fjorden (Noorwegen).

**M8 — wereld**

Vrijheidsbeeld, Christus Verlosser, Taj Mahal, Chinese Muur, Opera van Sydney,
piramides van Gizeh, Tokyo Skytree, Machu Picchu.

Regel voor de dekking: **elk land dat in het spel voorkomt heeft minstens één
landmark of natuurkenmerk.** Anders wordt een land een lege vlek en dat is didactisch
het slechtste wat je kunt doen.

---

## 4. Weetjes: drie diepteniveaus

Dezelfde plek, drie lagen. Het kind kiest zelf hoe diep het gaat; niets is verplicht.

**Laag 1 — kijken (6 tot 8 jaar)**
Silhouet, naam, en één zin.
> *De Eiffeltoren staat in Parijs. Parijs is de hoofdstad van Frankrijk.*

**Laag 2 — kerncijfers (9 tot 10 jaar)**
Een vast blokje, elke plek hetzelfde opgebouwd, zodat vergelijken vanzelf gaat.
> Land: Frankrijk · Hoofdstad: Parijs · Taal: Frans · Inwoners: 68,4 miljoen (2025)
> · Oppervlakte: 551.695 km² · Munt: euro

**Laag 3 — doorlezen (11 tot 12 jaar en de nieuwsgierigen)**
Vergelijking, context, bron en jaartal.
> Frankrijk is met 551.695 km² ongeveer **13,3 keer zo groot als Nederland**
> (41.543 km²). Er wonen bijna vier keer zoveel mensen, maar veel dunner verspreid:
> 124 mensen per km² tegen 439 in Nederland.
> *Bron: Wikidata, cijfers 2025. Oppervlakte inclusief binnenwater.*

Die laatste regel met bron en jaartal staat er altijd. Een kind dat leert dat cijfers
een herkomst en een datum hebben, leert iets dat langer meegaat dan de topografie.

### 4.1 Wanneer verschijnt het

- **Bij aankomst**: een klein kaartje rechtsonder, "nieuw weetje ontgrendeld", met
  een knop. Verdwijnt vanzelf. Nooit een pop-up over het scherm.
- **Op de kaart**: een landmark aantikken opent zijn kaartje.
- **In het weetjesboek**: altijd, via één knop, ook midden in een rit.

Wat we **niet** doen: een verplicht leesscherm tussen twee ritten. Dat is de klassieke
manier om een educatieve game onspeelbaar te maken.

---

## 5. Het weetjesboek (verzamelalbum)

Een stickeralbum, gerangschikt per werelddeel en per land.

```
  EUROPA  >  Frankrijk                                    7 / 9 gevonden

  +--------+  +--------+  +--------+  +--------+
  | Eiffel |  |  Arc   |  |  Mont  |  |   ??   |
  | toren  |  |Triomphe|  | St-M.  |  |        |
  +--------+  +--------+  +--------+  +--------+

  Hoofdstad  Parijs          Inwoners     68,4 mln (2025)
  Taal       Frans           Oppervlakte  551.695 km2  (13,3x NL)
  Munt       euro            Buurlanden   BE DE CH IT ES LU MC AD
```

Waarom dit werkt op deze leeftijd: verzamelen is zijn eigen motivatie, lege plekken
zijn een uitnodiging, en bladeren door het album is **herhaling zonder dat het
overhoren voelt**. Het album is daarmee stiekem een tweede leerkanaal naast de
Leitner-doosjes uit [05-leerlijn.md](05-leerlijn.md).

Een landmark dat je nog niet bezocht hebt staat als grijs silhouet met een vraagteken
in het album. Zichtbaar genoeg om nieuwsgierig te maken, niet genoeg om het antwoord
weg te geven.

---

## 6. Vergelijkingen: de Compare-module

`src/shared/core/Compare.luau`, puur en getest. Hij levert de zin, niet alleen het
getal, want de formulering luistert nauw.

```lua
--!strict
--[[
    Vergelijkt een land met het referentieland (standaard Nederland) en geeft een
    zin die klopt voor een kind van tien.

    Waarom hier een module en geen tekst in de data: de zinsvorm hangt af van de
    verhouding (groter/kleiner/ongeveer gelijk), en die logica wil je op een plek.

    Poortwachter: beide landen moeten dezelfde oppervlaktedefinitie hebben.
    Land vergelijken met totaal-inclusief-water geeft stilzwijgend een fout
    antwoord, en dat is precies het soort bug dat je nooit meer terugvindt.
]]
```

Vier harde regels:

1. **Dezelfde definitie aan beide kanten.** `total` met `total`, `land` met `land`.
   Duitsland tegen Nederland is 8,6× op totale oppervlakte en 10,3× op landoppervlak.
   Beide zijn waar; door elkaar halen is fout. Een unit-test dwingt dit af.
2. **Nooit "x keer zo klein".** Dat is geen wiskunde die klopt. Bij een verhouding
   onder 1 draait de zin om: *"België past ongeveer 1,4 keer in Nederland."*
3. **Eén decimaal, en bij grote getallen afronden op iets voorstelbaars.** "Ongeveer
   9 keer zo groot" is bruikbaarder dan "8,608 keer".
4. **Bij bijna gelijk geen verhouding maar een woord.** Tussen 0,9 en 1,1:
   *"België is ongeveer even groot als Nederland."* Wat het overigens niet is —
   dit is een vormregel, geen bewering.

Het referentieland is instelbaar. Standaard Nederland, omdat je dat kent; later
wisselbaar naar "het land waar je net was", wat vergelijkingen onderling ook
interessant maakt.

---

## 7. Het Amsterdam/Den Haag-geval

Je vraag was terecht en het antwoord is: **Amsterdam is de hoofdstad, Den Haag is de
regeringszetel.** De regering, de Staten-Generaal, de Hoge Raad en de werkpaleizen
van de koning zitten in Den Haag; de grondwet wijst Amsterdam als hoofdstad aan.

Dat is precies het soort nuance dat een topografieles plat slaat en een spel juist
interessant maakt. Daarom krijgt het datamodel er twee velden voor, geen voetnoot:

```lua
capital        = "nl-amsterdam",
governmentSeat = "nl-den-haag",
capitalNote    = "De hoofdstad is Amsterdam, maar de regering, het parlement en "
              .. "de koning werken in Den Haag.",
```

Nederland is niet de enige. Bolivia (Sucre grondwettelijk, La Paz in de praktijk),
Zuid-Afrika (drie hoofdsteden), Zwitserland (Bern is "federale stad", formeel geen
hoofdstad), Tanzania, Benin, Ivoorkust, Myanmar. Zonder die velden krijg je stilletjes
foute weetjes en een quiz die kinderen terecht tegenspreken.

Het levert bovendien het leukste missietype op:

> *"Dit pakket moet naar het gebouw waar de Nederlandse regering vergadert."*

Wie "hoofdstad" hoort en naar Amsterdam rijdt, krijgt geen geld en wél de kaart met
allebei de steden erop en het verschil erbij. Dat is het foutmoment uit
[05-leerlijn.md](05-leerlijn.md) op zijn best.

---

## 8. Wat dit toevoegt aan de planning

| Mijlpaal | Toevoeging | Acceptatie |
|---|---|---|
| M2 | `Landmark`-type, `Landmark.plan()`, Evoluon in Eindhoven | Het staat er, binnen budget, en de bouwlijst-test is groen |
| M3 | Weetjeskaartje laag 1 en 2, weetjesboek-skelet | Kaartje verschijnt bij aankomst en blokkeert niets |
| M4 | 12 NL-landmarks, `Compare`-module, `capital`/`governmentSeat`, album per land | Verhoudingstests groen; het Den Haag-missietype werkt |
| M6 | Landmark-set buurlanden; silhouet als navigatiehint op graad 4-5 | Een kind vindt Parijs op silhouet zonder plaatsnamen |
| M7 | Europa-set; laag 3 met bron en jaartal | Elk land in het spel heeft minstens één landmark |
| M8 | Wereld-set; referentieland instelbaar | Wereldalbum vulbaar |

De extra kosten zitten vooral in **contentwerk per landmark**, niet in techniek. Eén
landmark is naar schatting een half uur: vorm bedenken, bouwlijst schrijven, feiten
ophalen, test toevoegen. Dat is te doen in porties, en het is bij uitstek werk dat je
kunt uitbesteden aan een agent zodra het patroon van het eerste landmark staat.
