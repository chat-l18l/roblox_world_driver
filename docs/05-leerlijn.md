# Leerlijn en spelontwerp

Hoe de aardrijkskunde in het spel zit, en hoe die meegroeit met een kind van 6 naar 12.

---

## 1. Uitgangspunt

Een educatieve game die aanvoelt als een quiz met een spel eromheen, wordt niet
gespeeld. Andersom: een spel waarin de kennis het *middel* is om verder te komen,
wordt wél gespeeld. Daarom zit de leerstof in de **kern van de lus**, niet in een
tussenscherm:

```
  pakket krijgen  ->  adres lezen  ->  bedenken waar dat is  ->  ernaartoe  ->
  klopt het?  ->  geld  ->  betere auto  ->  verder weg  ->  moeilijker adres
```

Er is geen los quizmoment. Het "weten waar Utrecht ligt" ís de handeling.

---

## 2. Koppeling aan het Nederlandse curriculum

De topografie-leerlijn op de basisschool loopt globaal zo. Het spel volgt hem, maar
niet dwingend: een kind dat sneller wil kan door.

| Groep | Leeftijd | Leerstof | Bord in het spel |
|---|---|---|---|
| 4-5 | 6-8 | eigen omgeving, kaartlezen, windrichtingen, plattegrond | Eindhoven en omgeving |
| 6 | 9 | Nederland: 12 provincies en hoofdsteden, grote rivieren (Rijn, Maas, Waal, IJssel, Schelde), Waddeneilanden, IJsselmeer | Nederland |
| 7 | 10 | Europa: landen en hoofdsteden, zeeën, gebergten, EU, talen | Buurlanden, daarna Europa |
| 8 | 11-12 | wereld: werelddelen, oceanen, grote steden, tijdzones | Wereld |

De jongste spelers (6-7) beginnen dus met iets dat ze kennen: hun eigen stad. Dat
maakt het eerste half uur haalbaar zonder te kunnen lezen op niveau — het adres is
kort en de kaart heeft plaatjes.

---

## 3. De moeilijkheidsladder

Deze ladder staat **loodrecht** op de bordprogressie. Elk nieuw bord begint weer op
trede 1, zodat een nieuw gebied nooit meteen frustreert.

| Trede | Wat de speler ziet | Wat je moet kunnen |
|---|---|---|
| 1 | Pijl naar het doel, naam erbij | besturing leren |
| 2 | Naam op de kaart, geen pijl | kaart lezen |
| 3 | Alleen het adres, namen staan nog op de kaart | naam opzoeken op de kaart |
| 4 | Alleen het adres, **namen verborgen** | de plaats echt kennen |
| 5 | Postcode of land plus een hint (taal, vlag, rivier, buurland) | kennis combineren |
| 6 | Drie pakketten tegelijk, brandstof, deadline | plannen en prioriteren |

Trede 4 is het echte leerdoel. Trede 5 en 6 zijn voor groep 7-8.

Overgang omhoog: drie opeenvolgende correcte bezorgingen op de huidige trede binnen
de tijd. Overgang omlaag: twee fouten achter elkaar. Nooit meer dan één trede per
keer. Deze regel zit in `shared/core/Difficulty.luau` als pure functie, en is dus
een tabel met drempels die je zonder code te wijzigen kunt bijstellen.

---

## 4. Herhaling: Leitner-doosjes

Elk leerbaar item (plaats, land, rivier, luchthaven, taal) heeft per speler een
doosje 0 tot 5.

| Doosje | Betekenis | Kans om gekozen te worden |
|---|---|---|
| 0 | nieuw of net fout | hoog |
| 1-2 | wankel | midden |
| 3-4 | zit erin | laag |
| 5 | beheerst | zeer laag, maar nooit nul |

Goed antwoord: doosje omhoog. Fout: terug naar 0. Een item uit doosje 5 komt
gemiddeld eens per zoveel missies terug, zodat kennis niet wegzakt.

`Mastery.pick(profile, region, difficulty, rng)` is puur en seedbaar. Twee spelers
met hetzelfde profiel en dezelfde seed krijgen dezelfde missie — dat maakt de tests
deterministisch en maakt later een "zelfde route als je vriend"-modus mogelijk.

---

## 5. Fouten zijn leerstof

Bij een verkeerde bezorging:

1. Geen geld. Niet half, geen troostprijs — gokken mag niet lonen.
2. De kaart zoomt uit en toont **waar je was** en **waar het moest**, met de afstand
   ertussen en één feit ("Utrecht ligt aan het Amsterdam-Rijnkanaal, midden in het
   land").
3. Het item gaat naar doosje 0 en komt binnen enkele missies terug.

Punt 2 is het belangrijkste didactische moment in het hele spel. Het kost een paar
seconden en het is de reden dat het spel iets leert in plaats van iets toetst.

---

## 6. Economie en voertuigen

Beloning:

```
beloning = basis(tier) * afstandsfactor * moeilijkheidsfactor * tijdbonus
```

- `basis(tier)` — een obscure plaats levert meer op. Dat stuurt nieuwsgierigheid.
- `afstandsfactor` — logaritmisch, niet lineair. Anders wordt lang vliegen de enige
  zinnige strategie en verdwijnt de lokale leerstof.
- `moeilijkheidsfactor` — trede 4 levert flink meer op dan trede 2. Dat is de prikkel
  om de namen echt te leren in plaats van op de kaart te blijven kijken.
- `tijdbonus` — hoogstens 25% van het totaal. Bewust klein, zodat haasten nooit
  belangrijker wordt dan kloppen.

Voertuigen (indicatief, wordt in M5 gebalanceerd):

| Voertuig | Domein | Snelheid | Prijs | Ontgrendelt |
|---|---|---|---|---|
| Bakfiets | weg | 20 km/u | start | Eindhoven |
| Bestelbus | weg | 90 km/u | 500 | Nederland |
| Vrachtwagen | weg | 85 km/u, veel lading | 2.500 | Benelux |
| Sneltrein | rail | 200 km/u | 8.000 | Duitsland, Frankrijk |
| Propellervliegtuig | lucht | 450 km/u | 25.000 | Europa |
| Straalvliegtuig | lucht | 900 km/u | 120.000 | Wereld |
| Vrachtschip | zee | 40 km/u, enorme lading | 300.000 | intercontinentaal volume |

Een voertuig ontgrendelt een bord, maar het bord ontgrendelt pas echt als je op het
huidige bord trede 4 haalt. Zo kun je je niet uit de leerstof kopen.

---

## 7. Toon en toegankelijkheid

- Nederlands als eerste taal, in korte zinnen. Engels later als optie.
- Grote, contrastrijke letters. Geen tekst kleiner dan 18px op tablet.
- Kleuren kleurenblind-veilig; nooit kleur als enige informatiedrager (altijd ook
  een vorm of een label).
- Geen tijdsdruk op trede 1 tot 3. Een klok die tikt terwijl je nadenkt, leert niets.
- Geen faalgeluid dat als straf klinkt. Fout = neutraal geluid plus de kaart met het
  juiste antwoord.
- Geen chat, geen vrije tekstinvoer, geen namen van spelers in beeld.

---

## 8. Voor ouders

Vanaf M9 een eenvoudig overzicht in het spel: welke plaatsen zitten in welk doosje,
hoeveel tijd is er gespeeld, wat gaat goed en wat niet. Geen account, geen export,
geen persoonsgegevens — het staat gewoon in het spel, zichtbaar voor wie ernaast zit.
