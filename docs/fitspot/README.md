# FitSpot

Dvě verze prototypu vedle sebe. `index.html` v kořeni složky je jen slupka: pruh s přepínačem
`v1 / v2` a pod ním iframe s vybranou verzí.

Volba verze se drží v `localStorage` pod klíčem `fitspot.version` a zároveň v query parametru,
takže `?v=v1` i `?v=v2` jde poslat odkazem. Bez parametru a bez uloženého stavu se otevře v2.

## v1 — pronájem prostorů

`v1/index.html`, 1,1 MB bundle vygenerovaný Claude Design canvasem: markup `<x-dc>` s vlastním
templatovacím jazykem, logika ve třídě `DCLogic` a base64 assety včetně nabakovaných OSM dlaždic
Prahy. **Neupravovat ručně** — soubor je výstup nástroje, ne zdroják.

Taby: Prostory · Trenéři · Lekce · Přehled · Majitel.

## v2 — hledání trenéra

Modulární React 18 + Babel standalone, stejný zero-build stack jako `reserve/` a `date/src/`.
Mapa je Leaflet s tmavými dlaždicemi CartoDB.

```
v2/
├── index.html   CDN závislosti a pořadí skriptů
├── data.js      lokality, trenéři, lekce, číselníky, generovaná účetní kniha
├── logic.js     čisté funkce — filtrování, agregace provizí, stavy požadavků
├── store.jsx    useStore + localStorage („fitspot.v2")
├── ui.jsx       sdílené prvky (Chip, Card, Tag, StatTile, BottomNav, …)
├── map.jsx      Leaflet obal s piny trenérů
├── search.jsx   tab Hledat + detail trenéra + formulář požadavku
├── lessons.jsx  tab Lekce
├── trainer.jsx  tab Trenér
├── admin.jsx    tab Super admin
├── app.jsx      router + mount
└── tests/       node --test nad data.js a logic.js
```

`data.js` a `logic.js` jsou obyčejné skripty se zápisem na `window` a s `module.exports` guardem,
takže je načte prohlížeč i Node. Pořadí `<script>` tagů v `index.html` je významné — `search.jsx`
musí být před `lessons.jsx` a `trainer.jsx`, které z něj berou `venueLabel`.

Účetní kniha v `data.js` se generuje deterministicky (pevné semínko), takže testy můžou tvrdit
konkrétní čísla a všechny tři pohledy super admina sedí na stejný součet obratu.

### Testy

```
cd docs/fitspot/v2 && node --test
```

### Ruční kontrola

Statický server je nutný, `file://` nefunguje — landing page fetchuje manifest a `.jsx` se načítá
přes `src=`.

```
npx serve docs
```

1. `/fitspot/` se otevře na v2, přepínač nahoře přehodí na v1 a zpátky; `?v=v1` otevře rovnou v1.
2. **Hledat** — mapa Prahy s piny; výběr Prahy 6 přeostří mapu a zúží seznam na dva trenéry;
   přidání cvičení a prostoru dál zužuje; nemožná kombinace ukáže prázdný stav.
3. Klik na pin zvýrazní kartu v seznamu, klik na kartu otevře detail, `Požádat` otevře formulář.
4. Formulář jde odeslat s prázdným i vyplněným zdravotním dotazníkem; po odeslání naskočí toast
   a přepne se tab na **Lekce**.
5. **Lekce** ukazují požadavek se stavem „Čeká na trenéra" a tím, co bylo v dotazníku.
6. **Trenér** je přepnutý na adresáta požadavku, ukazuje zdravotní omezení a jde přijmout/odmítnout.
7. **Super admin** — po přijetí naskočí zelený pruh „z toho v téhle relaci" a provize se zvedne;
   přepínač Trenéři/Cvičení/Klienti mění žebříček, součet obratu zůstává stejný.
8. Reload stránky stav zachová (localStorage).
