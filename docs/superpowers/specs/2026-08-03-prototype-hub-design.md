# Prototype hub — rozcestník a úklid repa (design)

Date: 2026-08-03
Scope: Srovnat strukturu `docs/` do jedné složky na prototyp, přidat rozcestník `docs/index.html`
řízený manifestem `docs/prototypes.json`, a zapsat do CLAUDE.md postup pro přidávání dalších prototypů.

## Výchozí stav

`docs/` root míchá rozcestník s prototypem: Reserve Fitness leží přímo v rootu ve třech HTML
variantách (`Reserve App.html`, `Reserve Fitness.html`, `prototype.html`) a osmi `.jsx` souborech,
z nichž dva (`app-admin.jsx`, `app-trainer.jsx`) neloaduje žádné HTML. `docs/index.html` je prázdný,
takže kořen GitHub Pages nevrací nic. Ostatní prototypy (`date/`, `fitspot/`, `concept/`) už svoje
složky mají, ale nikde nejsou vypsané.

## Cílová struktura

```
docs/
├── index.html          rozcestník — jediná stránka v rootu
├── prototypes.json     manifest, zdroj pravdy pro karty
├── _config.yml
├── reserve/            Reserve Fitness
│   ├── index.html      (byl "Reserve App.html")
│   └── ios-frame.jsx shared.jsx map.jsx customer.jsx trainer.jsx admin.jsx app.jsx
├── date/               Évora
│   ├── src/            živá verze, karta míří sem
│   └── prototype/      archiv (status: archived)
├── fitspot/index.html
├── concept/index.html
└── superpowers/        specs & plans — není prototyp, do manifestu nepatří
```

### Odstraněné soubory

| Soubor | Důvod |
|---|---|
| `docs/prototype.html` | 189 kB self-contained snapshot Reserve, nahrazený modulární verzí |
| `docs/Reserve Fitness.html` | design-canvas edit-mode varianta téhož prototypu |
| `docs/design-canvas.jsx` | loadoval ho jen soubor výše → po smazání orphan |
| `docs/app-admin.jsx`, `docs/app-trainer.jsx` | mrtvý kód, neodkazuje na ně žádné HTML |
| `docs/date/index.html` | mini-rozcestník s absolutními URL, nahrazený hlavním rozcestníkem |
| tři prázdné `readme.md` | 2 bajty, bez obsahu |

Vše zůstává v git historii.

### Co se nepřejmenovává

`docs/date/` zůstává `date/`, přestože prototyp se jmenuje Évora. Smazaný `date/index.html`
odkazoval absolutní URL `tichara1.github.io/www-pages/date/src/`, takže ten odkaz může kolovat.
Nesoulad slug ↔ cesta pokrývá pole `path` v manifestu.

## Manifest `docs/prototypes.json`

Pole objektů, jeden na prototyp:

```json
{
  "slug": "reserve",
  "title": "Reserve Fitness",
  "path": "reserve/",
  "tagline": "Rezervace fitness lekcí ve třech rolích",
  "description": "Klient, trenér a admin v jedné iOS aplikaci…",
  "tags": ["react", "ios", "booking"],
  "stack": "React 18 + Babel standalone",
  "status": "active",
  "updated": "2026-08-03"
}
```

- `slug` — identifikátor, obvykle shodný se složkou.
- `path` — cesta relativní k `docs/`, vždy s koncovým `/`. Explicitní, protože Évora leží v `date/src/`.
- `status` — `active` | `wip` | `archived`. `archived` se v UI standardně skrývá.
- `updated` — `YYYY-MM-DD`, řadí karty sestupně.

Pořadí karet je dané datem, ne pořadím v souboru.

## Rozcestník `docs/index.html`

Jeden soubor: inline CSS, inline JS, žádná JS knihovna (fonty jako u ostatních prototypů z Google
Fonts). Načte `fetch('prototypes.json')` a vykreslí karty.

**Vzhled.** Tmavý, navazuje na paletu prototypů — podklad `#0A0B0D`, limetkový akcent
`oklch(0.86 0.18 130)`, Inter na text, JetBrains Mono na metadata. Mesh gradient v pozadí,
karty s hairline borderem a hover liftem, responzivní grid.

**Vyhledávání.** Jeden input, filtruje živě přes `title + tagline + description + tags + slug`.
Dotaz i cíl se normalizují přes `String.normalize('NFD')` se stripnutou diakritikou, takže
„evora" najde „Évora". `/` fokusne input, `Esc` ho vyčistí.

**Ostatní interakce.** Tagy jsou klikací chipy, klik vloží tag do vyhledávání. Přepínač
„Zobrazit archivované" odkrývá položky se `status: archived`. Počet výsledků žije
v `aria-live` regionu.

**Chybové stavy.** Prázdný výsledek hledání ukáže hlášku s tlačítkem na reset. Selhání
`fetch` (nedostupný nebo nevalidní manifest) ukáže vlastní chybový blok, ne prázdnou stránku.

## CLAUDE.md

Sekce „Architecture" se přepíše na aktuální stav — pět prototypů místo dvou. Přibude sekce
**Přidání nového prototypu** s postupem: složka `docs/<slug>/` s `index.html` → záznam
do `prototypes.json` → nic nového v `docs/` rootu.

Opraví se tvrzení „Open any `.html` file directly in a browser": modulární prototypy načítají
`.jsx` přes atribut `src`, což přes `file://` spadne na CORS. Stejné omezení má nově i rozcestník
kvůli `fetch` manifestu. Static server je povinný, ne volitelný.

## README.md

Jednořádkový `# www-pages` se rozšíří o popis a odkaz na živý rozcestník.

## Ověření

1. `python3 -m http.server 8080 --directory docs` → `http://localhost:8080/` vykreslí karty všech prototypů.
2. Každá karta vede na stránku, která se načte bez chyb v konzoli.
3. Vyhledávání: „evora" najde Évoru, „hyrox" najde FitSpot, nesmysl ukáže prázdný stav.
4. `docs/` root neobsahuje žádný soubor prototypu.
5. Žádný zbylý odkaz na smazané soubory (`grep`).
