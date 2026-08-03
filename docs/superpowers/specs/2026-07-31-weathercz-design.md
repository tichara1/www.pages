# WeatherCZ — návrh

**Datum:** 2026-07-31
**Stav:** implementováno — odchylky vzniklé při realizaci jsou zaznamenané níže
v sekci *Co se při implementaci změnilo*

## Cíl

Jednostránková statická aplikace hostovaná na GitHub Pages. Zobrazuje mapu České
republiky s ikonami počasí v jednotlivých městech. Uživatel přepíná mezi dneškem,
zítřkem a pozítřkem; kliknutím na ikonu se přepne do hodinového režimu, ve kterém
posuvníkem prochází hodiny dne a vidí, kdy kde prší.

Nefunkční požadavky:

- Žádný backend, žádný build krok, žádný API klíč.
- Co nejpřesnější předpověď pro území ČR.
- Přepínání dnů a hodin musí být okamžité (data v paměti, ne dotaz na síť).

## Zdroj dat

**Open-Meteo Forecast API** — zdarma, bez registrace, s povoleným CORS, volatelné
přímo z prohlížeče.

Jeden tvar požadavku:

```
https://api.open-meteo.com/v1/forecast
  ?latitude=<csv>&longitude=<csv>
  &hourly=weather_code,temperature_2m,precipitation
  &models=icon_d2,icon_eu
  &timezone=Europe/Prague
  &forecast_days=3
```

Ověřeno živým voláním 2026-07-31:

- Více lokalit v jednom požadavku funguje (čárkou oddělené souřadnice → pole objektů).
- `models=icon_d2,icon_eu` vrátí obě sady v jedné odpovědi pod suffixovanými klíči
  (`temperature_2m_icon_d2`, `temperature_2m_icon_eu`). Fallback tedy nevyžaduje
  druhé volání.
- ICON-D2 (DWD, ~2 km) pokrýval 69 ze 72 hodin, tj. do pozítří 20:00. Tento dosah se
  během dne posouvá — pozdě odpoledne bude kratší. Proto je fallback povinný, ne
  volitelný.

### Slučování modelů

Pro každou lokalitu a hodinu: vezmi hodnotu z ICON-D2; je-li `null`, vezmi ICON-EU.
Je-li `null` i tam, hodina nemá data.

Aplikace si drží, které modely se skutečně použily, a v horní liště zobrazí:

- `ICON-D2 · 2 km` — všechna zobrazovaná data z ICON-D2
- `ICON-D2 + ICON-EU` — část hodin doplněna hrubším modelem

### Načítání a cache

Data pro **všechny** lokality se stahují jednou při startu, v dávkách po 25 lokalitách.
Přepínání dne i hodiny pak pracuje výhradně nad daty v paměti.

Odpovědi se ukládají do `localStorage`. Klíč cache je odvozený od seznamu lokalit
(změna seznamu tedy cache invaliduje), uložený záznam nese časové razítko a platí
30 minut.

## Lokality

Napevno zapsané pole objektů `{ name, lat, lon, tier }`, přibližně 76 položek
(okresní města ČR včetně Prahy).

| Tier | Obsah | Zobrazeno při zoomu |
|-----:|-------|---------------------|
| 1 | Praha + 13 krajských měst (14) | vždy |
| 2 | větší okresní města (~30) | ≥ 8 |
| 3 | zbývající okresní města | ≥ 9 |

Data se stahují pro všechny tiery bez ohledu na zoom; zoom pouze filtruje vykreslování.
Důvod: jedno stažení je levnější a předvídatelnější než dotahování při každém pohybu mapy.

## Mapa

- **Leaflet** z CDN (unpkg), CSS i JS.
- Dlaždice **CartoDB Positron** — tlumené, barevné ikony na nich vyniknou lépe než na
  standardním OSM podkladu.
- Výřez omezený na ČR (`maxBounds`), `minZoom` 6, `maxZoom` 11, počáteční `fitBounds`
  na hranice republiky.
- Markery jsou `L.divIcon` s inline SVG ikonou a popiskem teploty pod ní.

## Ikony počasí

Vlastní inline SVG sada. Mapování WMO kódů:

| Symbol | WMO kódy |
|--------|----------|
| jasno | 0 |
| skoro jasno | 1 |
| polojasno | 2 |
| zataženo | 3 |
| mlha | 45, 48 |
| mrholení | 51, 53, 55, 56, 57 |
| déšť | 61, 63, 65, 66, 67 |
| přeháňky | 80, 81, 82 |
| sněžení | 71, 73, 75, 77, 85, 86 |
| bouřka | 95, 96, 99 |

Symboly `jasno`, `skoro jasno` a `polojasno` mají noční variantu (měsíc místo slunce).
Ta se použije jen v hodinovém režimu, pro hodiny mimo denní světlo (zjednodušeně
20:00–06:00). Denní přehled pokrývá jen hodiny 8–20, a proto vždy používá denní variantu.

## Denní agregace

Okno **8:00–20:00 včetně** (13 hodin) v místním čase.

- **Ikona** = jev s nejvyšší závažností v okně.
- **Teplota** = aritmetický průměr teplot v okně, zaokrouhlený na celé °C.
- Pokud v okně chybí část hodin, počítá se z těch dostupných. Chybí-li všechny,
  je marker šedý s pomlčkou.

### Stupnice závažnosti

Vyšší číslo vyhraje. Definováno jako mapa `WMO kód → závažnost`:

| Závažnost | Jev | WMO |
|----------:|-----|-----|
| 100 | bouřka s kroupami | 96, 99 |
| 95 | bouřka | 95 |
| 85 | silný déšť / silné sněžení | 65, 67, 75, 82, 86 |
| 75 | déšť / sněžení | 61, 63, 66, 71, 73, 77 |
| 65 | přeháňky | 80, 81, 85 |
| 55 | mrholení | 51, 53, 55, 56, 57 |
| 45 | mlha | 45, 48 |
| 30 | zataženo | 3 |
| 20 | polojasno | 2 |
| 10 | skoro jasno | 1 |
| 0 | jasno | 0 |

Záměr: uživatel se ptá „kdy bude pršet", takže krátká odpolední bouřka nesmí zmizet
pod celodenním sluncem.

## Uživatelské rozhraní

### Horní lišta

Přepínač `Dnes | Zítra | Pozítří`, odznak použitého modelu, čas posledního načtení,
tlačítko pro znovunačtení.

### Denní režim (výchozí)

Mapa s markery podle denní agregace zvoleného dne.

### Hodinový režim

Zapne se kliknutím na kterýkoli marker.

- Zespodu vyjede panel vybrané lokality: název, hodinová osa 0–23 se sloupci srážek
  (mm), křivkou teploty a ikonami; aktuálně vybraná hodina zvýrazněná.
- Nad panelem posuvník `0–23`. Jeho posunutí překreslí **všechny** markery na mapě na
  danou hodinu — je vidět, jak srážkové pásmo putuje přes republiku.
- Výchozí hodina: aktuální hodina, jde-li o dnešek, jinak 12:00.
- Kliknutí na jiný marker přepne panel na jinou lokalitu a hodinu ponechá.
- Tlačítko `Zpět na denní přehled` vrátí do denního režimu a panel zavře.

Přepnutí dne v hodinovém režimu zůstává v hodinovém režimu a zachová zvolenou hodinu.

## Ošetření chyb

| Situace | Chování |
|---------|---------|
| Stahování selže, cache je prázdná | Pruh „Data se nepodařilo načíst" s tlačítkem *Zkusit znovu*; mapa zůstane prázdná, ale funkční |
| Stahování selže, cache existuje | Použije se cache, pruh varuje, že data mohou být zastaralá |
| Část dávek selže | Použijí se úspěšné; chybějící lokality se nevykreslí |
| Hodina bez dat v obou modelech | Šedý marker s pomlčkou |

Žádná chyba nesmí shodit celou stránku.

## Struktura a nasazení

Jeden soubor `index.html` obsahující HTML, CSS i JS (odhad 600–800 řádků). Leaflet
tažený z CDN. Žádný `package.json`, žádný build.

Nasazení: repozitář → Settings → Pages → *Deploy from a branch*, `main`, kořen.
Aplikace běží z `https://<uživatel>.github.io/weathercz/`.

Logika bez vazby na DOM se drží v pojmenovaných čistých funkcích, aby šla ověřit
izolovaně:

- `mergeModels(hourlyResponse)` → sloučené hodinové řady + informace o zdrojích
- `dayAggregate(hours, dayIndex)` → `{ weatherCode, temperature }` pro okno 8–20
- `severityOf(wmoCode)` → číslo
- `iconFor(wmoCode, isNight)` → klíč symbolu

## Ověření hotové práce

1. Stránka otevřená lokálně (`file://` i přes lokální server) zobrazí mapu ČR
   s ikonami do několika sekund.
2. Přepnutí `Zítra` / `Pozítří` změní ikony bez síťového požadavku (ověřitelné
   v Network panelu).
3. Odznak modelu odpovídá skutečnosti — u pozítřka pozdě odpoledne musí ukázat
   doplnění ICON-EU.
4. Klik na marker otevře panel a přepne mapu do hodinového režimu.
5. Posun posuvníku překreslí všechny markery.
6. Zablokování sítě v devtools po prvním načtení → aplikace se nastartuje z cache
   a zobrazí varovný pruh.
7. Aplikace funguje na mobilním viewportu (panel nesmí zakrýt celou mapu).

## Co se při implementaci změnilo

Zaznamenáno zpětně, aby dokument odpovídal skutečnosti.

1. **Jeden `index.html` se rozpadl na `index.html` + pět `.js` modulů.** Čisté funkce
   musí být importovatelné, aby šly testovat bez prohlížeče. Podmínka „žádný build,
   nahraj a běží" platí dál.

2. **Přípona `.js`, ne `.mjs`.** Původní záměr byl `.mjs`. Při ověření se ukázalo, že
   `python -m http.server` posílá `.mjs` s typem `application/octet-stream` a prohlížeč
   modul odmítne. Spoléhat na to, že každý statický server `.mjs` zná, je zbytečné
   riziko, takže moduly mají `.js` a v kořeni je `package.json` s jediným účelem —
   `"type": "module"`, aby je Node při testech četl jako ES moduly. Žádné závislosti.

3. **Testy se spouští `node --test` bez argumentu.** Node 26 neumí vzít adresář jako
   parametr (`node --test tests/` skončí `MODULE_NOT_FOUND`); bez argumentu si testy
   najde sám.

4. **Mapa používá `zoomSnap: 0.25`.** Na celých stupních se ČR buď ztrácí v okolní
   Evropě (zoom 7), nebo přeteče z okna (zoom 8). Výřez se navíc dopočítává až po
   události `load`, protože kontejner mapy je flex položka a v okamžiku konstrukce
   ještě nezná svou výšku.

5. **Panel doplněn o úhrn srážek** (`srážky X mm za den, špička Y mm/h`, nebo
   `za celý den se nečekají srážky`) a suché hodiny mají v grafu tmavý proužek místo
   modrého. Bez toho nešlo poznat nulové srážky od chyby vykreslení.

6. **Lokalit je 74, ne ~76.** Okresy Praha-východ a Praha-západ nemají vlastní
   sídelní město, takže v seznamu nejsou.

## Doplněno nad rámec původního návrhu (2026-08-02)

Vyžádáno po nasazení první verze:

- **Barevné bubliny markerů** podle kategorie počasí (`categoryOf` ve `wmo.js`).
  Zvažovaná varianta s bílými siluetami na sytém podkladu byla zamítnuta —
  ztrácela tvar srážek, takže déšť nešel odlišit od zataženo.
- **Názvy lokalit u markerů.** Vynutilo si to přepnutí podkladu na
  `light_nolabels`; dvě sady názvů přes sebe se nedaly číst.
- **Potlačení kolizí popisků** (`labels.js`). Bubliny se nikdy neskrývají,
  názvy ano — podle priority (vybraná lokalita, pak tier).
- **Vyhledávání lokalit** (`searchLocations` v `locations.js`) — bez ohledu na
  diakritiku a velikost písmen, ovládání klávesnicí.
- **Zvýraznění hranice ČR** (`czechia.js`): obrys z OpenStreetMap zjednodušený
  Douglas-Peuckerem ze 125 600 na 2316 bodů, plus clona ztlumující okolí.

## Vědomě mimo rozsah

- Přepínač meteorologického modelu v UI (nahrazen automatikou).
- Geolokace uživatele a vyhledávání měst.
- Radarová/srážková vrstva mapy.
- Předpověď dále než 3 dny.
