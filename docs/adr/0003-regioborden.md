# ADR-0003 — Regioborden met eigen schaal in plaats van één wereldkaart

**Status:** aanvaard
**Datum:** 2026-08-23

## Context

Het spel speelt zich af van Eindhoven tot de hele wereld. De vraag is hoe je die
schaalsprong van vier ordes van grootte in één game onderbrengt.

Reken het door voor één doorlopende kaart. De aarde is ~40.000 km rond. Een wereldbord
dat binnen Roblox' comfortabele float-precisie blijft, is hooguit een paar duizend
studs breed. Bij 2000 studs voor 20.000 km is dat 0,1 stud per km, en dan is Nederland
**30 studs breed** — kleiner dan het voertuig. Onbruikbaar om in te rijden, en
onbruikbaar om er 12 provincies op te leren.

## Besluit

Elke regio is een **eigen bord** met een eigen schaal, procedureel opgebouwd uit
dezelfde geo-dataset.

| Bord | Breedte km | studs/km | studs |
|---|---|---|---|
| Eindhoven e.o. | 40 | 40 | 1600 |
| Nederland | 300 | 5 | 1500 |
| West-Europa | 1400 | 1,5 | 2100 |
| Europa | 4000 | 0,5 | 2000 |
| Wereld | 20000 | 0,1 | 2000 |

- Elk bord blijft 1500-2500 studs: comfortabele precisie, en een oversteek duurt
  20-60 seconden bij de snelheid van het bijbehorende voertuig.
- Overgang tussen borden gaat via **luchthavens en havens**, die zelf leerstof zijn.
- `Board.plan(region, data)` is een pure functie die een bouwlijst teruggeeft;
  `WorldService` voert die lijst uit. De kaartopbouw is daarmee testbaar zonder Studio.
- Projectie is equirectangular rond het midden van de regio-bounds. Voor Europa is de
  vervorming acceptabel; voor het wereldbord is ze bewust gekozen, omdat een
  schoolkaart er ook zo uitziet.

## Gevolgen

**Positief**

- Elke schaal is speelbaar: rijden in Eindhoven én vliegen naar Tokio.
- Eén mechanisme voor alle borden, dus één ding om te bouwen en te testen.
- Bordgrenzen vallen samen met leerlijngrenzen; de progressie is meteen didactisch.
- Part-budget per bord is begrensd en te valideren, wat prestaties op tablet borgt.

**Negatief**

- De schaal verspringt bij een bordwissel. Een kind kan denken dat Duitsland kleiner
  is op het Europa-bord dan op het West-Europa-bord. Tegenmaatregel: bij elke
  bordwissel een korte schaalbalk-animatie die het verschil laat zien — zelf ook
  leerstof.
- Geen naadloze reis van deur tot deur over de hele wereld. Dat is een
  belevingsverlies dat we accepteren.

## Overwogen alternatieven

- **Eén doorlopende wereldkaart op vaste schaal.** Verworpen om de rekensom hierboven.
- **Kaarttafel plus gedetailleerde lokale scenes per stad.** Mooiste beleving, maar
  het contentwerk per stad is dubbel en de leerlijn heeft tientallen steden nodig.
  Blijft open als latere uitbreiding voor een handvol hoofdsteden.
- **Dynamische herschaling met een floating origin.** Technisch mogelijk, maar het is
  de complexiteit van een engine-feature bovenop een schoolproject.
