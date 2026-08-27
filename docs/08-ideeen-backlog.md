# Ideeën-backlog

**Status: geparkeerd. Dit is geen plan.** Niets hier is toegezegd, ingepland of
ontworpen. Het staat hier zodat het niet verdwijnt, en zodat we het later kunnen
beoordelen zonder opnieuw te moeten bedenken waarom iets wel of niet paste.

Een idee verhuist pas naar de roadmap in [00-plan.md](00-plan.md) als het een
mijlpaal en een acceptatiecriterium heeft. Tot die tijd blijft het hier staan.

---

## De toetssteen

Elk idee wordt afgemeten aan de vier principes die al vastliggen. Een idee dat er
tegenin gaat komt er niet in, hoe leuk het ook is.

1. **De beloning hangt aan het weten, niet aan het rijden.** ([00-plan.md](00-plan.md), §1)
2. **Fouten zijn leerstof, geen straf.** ([05-leerlijn.md](05-leerlijn.md), §5)
3. **Geen chat, geen vrije tekst, geen persoonsgegevens.** ([00-plan.md](00-plan.md), §1)
4. **De server beslist, de client toont.** ([01-architectuur.md](01-architectuur.md), §2)

Inspiratiebronnen die hieronder terugkomen: Polarsteps (reisjournaal en
wereldkaart inkleuren), GeoGuessr (raden waar je bent), Fog of World (mist die
optrekt waar je geweest bent), 80 Days (route plannen met een budget).

---

## Sterk: past bij de kern en versterkt hem

### 1. Mist over de kaart die optrekt waar je geweest bent

De regioborden beginnen donker. Elke stad waar je echt bezorgd hebt, licht op en
blijft opgelicht. Na een maand spelen is je Europa-bord een landkaart van je eigen
geschiedenis.

**Waarom dit past.** Het is dezelfde motor als het weetjesboek uit
[07-landmarks-en-weetjes.md](07-landmarks-en-weetjes.md): lege plekken zijn een
uitnodiging. En het maakt voortgang zichtbaar zonder één getal of balkje — je
*ziet* dat je meer van de wereld kent dan vorige week.

**De valkuil, en die is echt.** We hebben al één systeem dat dingen verbergt: de
moeilijkheidsladder, waar vanaf trede 4 de plaatsnamen weg zijn. Twee systemen die
tegelijk informatie weghalen, maken een kaart onleesbaar en een kind moedeloos.

De scheiding moet daarom hard zijn:

| Systeem | Verbergt | Gaat over |
|---|---|---|
| Mist | of een gebied *bestaat* op jouw kaart | waar je geweest bent |
| Moeilijkheidsgraad | of er een *naam* bij staat | wat je weet |

Mist trekt permanent op en komt nooit terug. De moeilijkheidsgraad beweegt op en
neer. Nooit allebei tegelijk introduceren in dezelfde mijlpaal.

**Vroegste plek:** na M4, als het Nederland-bord er staat en er iets te onthullen valt.

### 2. Raden waar je bent, in plaats van rijden naar waar je moet

Een missietype waarbij je *gedropt* wordt en zelf moet uitvinden waar je staat. De
aanwijzingen zijn precies de leerstof: de taal op een bord, de vlag aan een paal,
een silhouet aan de horizon, een rivier, het landschap.

**Waarom dit past.** Het is het spiegelbeeld van de gewone missie. Normaal ga je van
naam naar plek; hier ga je van plek naar naam. Dat is didactisch een ander soort
weten, en het maakt de landmarks en taalhints uit M6 en M7 in één klap twee keer zo
waardevol.

Het sluit ook naadloos aan op trede 5 van de ladder, die al met hints werkt.

**Vroegste plek:** M7, als er genoeg landen met landmarks en talen in zitten om iets
te raden te hebben.

### 3. Reisjournaal

Een lijn op de kaart die elke rit die je ooit gemaakt hebt natekent, met de datum en
het pakket erbij. Polarsteps in het klein.

**Waarom dit past.** Het kost bijna niets — de data staat al in het profiel — en het
is een derde herhalingskanaal naast de Leitner-doosjes en het weetjesboek. Terugkijken
is oefenen zonder dat het oefenen heet.

**Vroegste plek:** M9, of eerder als het meelift op de kaart-UI.

### 4. Prestaties, mits ze over kennis gaan

Verzamelbare trofeeën, maar niet op reisgedrag. De voorbeelden uit de bron
("nachtbraker" om 3 uur 's nachts, "hoogvlieger" boven 2000 meter) horen bij een app
die je echte GPS volgt; in dit spel meten ze niets.

Wat ze in Wereldpost zouden moeten meten:

- **Blind bezorgd** — vijf bezorgingen op rij op trede 4, zonder namen op de kaart.
- **Provinciekenner** — alle twaalf provinciehoofdsteden in doosje 5.
- **Rivierloods** — een pakket bezorgd in elk land waar de Rijn doorheen loopt.
- **Taalknobbel** — tien landen gevonden op alleen een taalhint.
- **Buurman** — alle buurlanden van Nederland bezocht.

**Waarom dit past.** Elke trofee is een samenvatting van iets dat je nu kunt en
eerder niet. Dat is precies wat een prestatie hoort te zijn.

**Vroegste plek:** M5, als de mastery-data er is om ze op te baseren.

---

## Twijfelachtig: kan, maar vraagt eerst een besluit

### 5. Ranglijsten en uitdagingen met vrienden

Dit botst met principe 3 en met de niet-doelen van fase 1: geen sociale functies,
geen chat, geen namen in beeld. Op Roblox komt daar kinderveiligheid en moderatie
bovenop.

Het is niet onmogelijk, maar het is **geen feature, het is een project**. Wat er
minimaal bij hoort voordat er één regel code voor geschreven wordt:

- een ADR over wat er precies gedeeld wordt en met wie;
- geen vrije tekst, ergens;
- afgeschermd op een code die ouders delen, niet openbaar;
- vergelijken op *kennis* (hoeveel plaatsen in doosje 5), niet op speeltijd of
  kilometers, anders beloon je het kind dat het langst mag spelen.

De "verborgen schat" uit de bron — een pin die ergens valt en wie er het eerst is —
is in deze vorm een snelheidswedstrijd, en die valt onder principe 1. Een variant
die wel werkt: iedereen krijgt dezelfde week dezelfde raadselmissie, en je ziet
achteraf wie hem gevonden heeft. Niet wie het eerst was.

**Vroegste plek:** niet vóór M9, en alleen na een eigen ADR.

---

## Afgewezen in deze vorm

### 6. XP per afgelegde kilometer

Dit is de enige uit de lijst die de kern direct ondermijnt. XP voor afstand betekent:
ver vliegen levert punten op, ook als je niet weet waar je heen gaat. Dat is precies
het gedrag dat het spel niet moet belonen — je krijgt een kind dat rondjes vliegt in
plaats van de kaart leest.

De onderliggende wens is wel goed: **zichtbare, langzame groei die niet op kan.**
Munten zijn dat niet, want die geef je uit.

De vorm die wel werkt: XP per **correcte bezorging**, met een vermenigvuldiger voor
de moeilijkheidsgraad en een bonus als een item van doosje 4 naar 5 gaat. Afstand mag
er hoogstens een kleine factor in zijn, ondergeschikt aan de moeilijkheid — dezelfde
verhouding als bij de beloning in [05-leerlijn.md](05-leerlijn.md), §6.

De rangen zelf zijn prima en mogen blijven: van beginnend bezorger naar wereldkoerier.
Alleen de meetlat gaat om, van kilometers naar kennis.

---

## Wat hier níet in hoort

Ter herinnering voor later, want deze komen altijd terug:

- **Willekeurige beloningskisten of iets met kans op zeldzaamheid.** Botst met wat
  je een kind van acht wilt aanleren, en met Roblox' regels rond betaalde items voor
  jonge spelers.
- **Tijdsdruk op de lage tredes.** Een klok die tikt terwijl je nadenkt, leert niets.
- **Alles wat vrije tekst toelaat.** Namen, berichten, zelfgekozen labels.
- **Een tweede implementatie van de spellogica.** De reden dat dit project opnieuw
  begon. Zie [ADR-0001](adr/0001-repo-herstart.md).
