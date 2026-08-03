# Počasí ČR

Statická mapa počasí České republiky. Denní přehled pro dnešek, zítřek a pozítřek
plus hodinový režim, ve kterém je vidět, kdy kde prší.

## Jak to funguje

**Denní přehled** ukazuje pro každé město ikonu **nejzávažnějšího jevu mezi 8:00 a 20:00**
a **vážený průměr teploty** téhož okna. Krátká odpolední bouřka se tak neschová pod celodenní
slunce — když někde v 18:00 přijde bouřka, uvidíš ji na mapě, i kdyby byl zbytek dne jasný.

Teplota se váží podle toho, kdy je den nejvíc „vidět“: 12–16 má váhu 3, 9–12 váhu 2,
16–18 váhu 1,5 a 8–9 s 18–20 váhu 1. Chladné ráno tak nestáhne teplé odpoledne dolů.
Výběr ikony vážený není — nejzávažnější jev v okně platí bez ohledu na hodinu.

Území ČR je vymezené obrysem hranice a okolí je ztlumené clonou, takže je hned
zřejmé, kam se předpověď vztahuje.

Barva bubliny nese **typ počasí** — žlutá jasno, šedá zataženo, modrá déšť, fialová
bouřka — takže se dá mapa přečíst dřív, než oko rozezná tvar ikony. Pod každou bublinou
je název lokality; mapový podklad je proto bez vlastních popisků měst. Když by se
dva názvy překryly (Kladno a Dřetovice leží 8 km od sebe), méně důležitý se skryje —
bublina s teplotou zůstává vždy, protože nese data.

**Vyhledávání** v horní liště najde město podle části názvu a nezáleží na diakritice ani
velikosti písmen (`breclav` najde Břeclav). Ovládá se i klávesnicí — šipky, Enter,
Escape. Po výběru mapa přiletí na město, přiblíží tak, aby byl jeho bod vidět, a otevře
jeho panel.

**Hodinový režim** se zapne kliknutím na kteroukoli ikonu. Zespodu vyjede panel dané
lokality s hodinovým sloupcovým grafem srážek a posuvník 0–23. Posunutí hodiny překreslí
**všechny** ikony na mapě, takže je vidět, jak srážkové pásmo putuje přes republiku.
Modré sloupce znamenají srážky, tmavé proužky suchou hodinu.

## Data

[Open-Meteo](https://open-meteo.com) — primárně model **ICON-D2** (DWD, rozlišení ~2 km,
hodinový krok), který je pro střední Evropu nejjemnější volně dostupný model. Jeho dosah
nestačí na celý třetí den, takže chybějící hodiny se automaticky doplní z **ICON-EU**
(~7 km). Odznak v horní liště říká, co se skutečně použilo:

- `ICON-D2 · 2 km` — všechna zobrazená data z jemného modelu
- `ICON-D2 + ICON-EU` — část hodin doplněna hrubším modelem

Obě veličiny jedné hodiny (ikona i teplota) pocházejí vždy ze stejného modelu, nikdy se
nemíchají. Data se stáhnou jednou při startu pro všech 74 lokalit a uloží do
`localStorage` na 30 minut; přepínání dnů a hodin proto neposílá žádný další požadavek.

Lokality jsou okresní města, Praha a navíc Cheb a Dřetovice. Podle přiblížení se
zobrazuje 16 / 48 / 74 bodů, aby se ikony na malém zoomu nepřekrývaly.

## Lokální spuštění

Aplikace je složená z ES modulů, takže ji nestačí otevřít přes `file://` — prohlížeč
by odmítl importy. Z kořene repozitáře spusť jakýkoli statický server:

    npx serve docs

a otevři <http://localhost:3000/weather/>.

## Testy

Bez jediné závislosti, stačí Node 18+. Z této složky (`docs/weather/`):

    node --test

Pokrývají logiku bez vazby na prohlížeč: převod WMO kódů, slučování modelů, agregaci
denního okna a konzistenci seznamu lokalit.

`package.json` je tu jen kvůli `"type": "module"`, aby Node při spouštění testů četl
`.js` soubory jako ES moduly. Nejsou v něm žádné závislosti a nic se neinstaluje.
Spolu s `tests/` je vyloučený z publikování v `docs/_config.yml`.

## Nasazení

Součást GitHub Pages webu [tichara1.github.io/www-pages](https://tichara1.github.io/www-pages/),
publikuje se ze složky `docs/`. Žádný build.

## Struktura

| Soubor | Co dělá |
|--------|---------|
| `index.html` | kostra stránky, styly, ovládací prvky |
| `app.js` | stav aplikace, Leaflet, vykreslování, cache |
| `wmo.js` | převod WMO kódů na závažnost, ikonu, barevnou kategorii a popisek |
| `labels.js` | potlačení kolizí popisků na mapě |
| `czechia.js` | obrys hranice ČR (OpenStreetMap, zjednodušený) |
| `api.js` | sestavení dotazu na Open-Meteo a slučování modelů |
| `aggregate.js` | agregace denního okna a výběr hodiny |
| `locations.js` | seznam lokalit se souřadnicemi |
| `icons.js` | inline SVG symboly počasí |
