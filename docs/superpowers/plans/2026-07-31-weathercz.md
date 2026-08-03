# WeatherCZ — implementační plán

> **Stav: plán byl proveden 2026-07-31.** Dokument zůstává jako záznam postupu.
> Skutečná implementace se od něj v několika bodech liší — přípona modulů je `.js`
> (ne `.mjs`), v kořeni přibyl `package.json` s `"type": "module"`, testy se spouští
> `node --test` bez argumentu a mapa používá `zoomSnap: 0.25`. Důvody jsou popsané
> v sekci *Co se při implementaci změnilo* v návrhovém dokumentu.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statická jednostránková mapa počasí ČR pro GitHub Pages — denní přehled (okno 8–20) pro dnešek/zítřek/pozítřek a hodinový režim s posuvníkem přes celý den.

**Architecture:** Veškerá logika bez vazby na DOM žije v ES modulech, které jsou importovatelné jak prohlížečem, tak `node --test`. UI vrstva (`app.mjs`) drží stav v jediném objektu a při každé změně překreslí markery. Data se stahují jednou při startu a všechny interakce pak běží nad polem v paměti.

**Tech Stack:** vanilla ES moduly, Leaflet 1.9 z CDN, Open-Meteo API, `node --test` pro testy. Žádný build, žádný npm balíček.

## Global Constraints

- **Žádný build krok a žádná runtime npm závislost.** Repozitář se nasazuje na GitHub Pages tak, jak je. Node se používá výhradně ke spouštění testů (`node --test`), nikdy ne ke generování artefaktů.
- **Jediná externí runtime závislost je Leaflet 1.9.4 z CDN** (`unpkg.com/leaflet@1.9.4`) — JS i CSS.
- Všechny soubory jsou ES moduly s příponou `.mjs`, aby je `node --test` i `<script type="module">` četly stejně.
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`, parametry `hourly=weather_code,temperature_2m,precipitation`, `models=icon_d2,icon_eu`, `timezone=Europe/Prague`, `forecast_days=3`.
- **Časové řetězce z API se nikdy neparsují přes `new Date()`.** Přicházejí jako lokální čas bez zóny (`"2026-07-31T08:00"`); pracuje se s nimi řetězcovými operacemi, jinak je JS posune podle zóny prohlížeče.
- **Denní okno je 8–20 včetně** (13 hodin).
- Uživatelské texty jsou česky.
- Dávka pro API má **nejvýše 25 lokalit**.
- Cache v `localStorage` platí **30 minut**.

### Odchylka od specifikace (schválena při psaní plánu)

Specifikace v sekci *Struktura a nasazení* uvádí jediný `index.html`. Plán ho rozděluje
na `index.html` + čtyři `.mjs` moduly. Důvod: čisté funkce musí být importovatelné, aby
šly testovat bez prohlížeče. Podmínka „žádný build, nahraj a běží" zůstává splněna.

Důsledek: ES moduly nefungují přes `file://`. Lokální náhled vyžaduje
`python -m http.server 8000` v kořeni repozitáře. Ověřovací bod 1 ve specifikaci
(„`file://` i přes lokální server") je tímto zúžen jen na lokální server.

---

## File Structure

| Soubor | Zodpovědnost |
|--------|--------------|
| `wmo.mjs` | Překlad WMO kódů: závažnost a klíč ikony. Žádné jiné znalosti. |
| `api.mjs` | Sestavení URL, dělení na dávky, sloučení modelů ICON-D2/ICON-EU. |
| `aggregate.mjs` | Denní agregace okna 8–20 a výběr jedné hodiny. |
| `locations.mjs` | Statická data lokalit se souřadnicemi a tierem. |
| `icons.mjs` | Inline SVG symboly + složení HTML markeru. |
| `app.mjs` | Stav aplikace, Leaflet, vykreslování, obsluha událostí, cache. |
| `index.html` | Kostra dokumentu, CSS, ovládací prvky. |
| `tests/*.test.mjs` | Testy čistých modulů. |
| `README.md` | Popis, lokální spuštění, nasazení. |

---

## Task 1: WMO tabulky — závažnost a ikony

**Files:**
- Create: `wmo.mjs`
- Test: `tests/wmo.test.mjs`

**Interfaces:**
- Consumes: nic
- Produces:
  - `severityOf(code: number): number` — vyšší číslo = závažnější jev, neznámý kód → `0`
  - `iconKeyFor(code: number, isNight: boolean): string` — klíč symbolu, např. `"clear"`, `"clear-night"`, `"thunder"`
  - `labelFor(code: number): string` — český název jevu pro popisky

- [ ] **Step 1: Napiš padající test**

`tests/wmo.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { severityOf, iconKeyFor, labelFor } from '../wmo.mjs';

test('bouřka je závažnější než déšť, déšť než jasno', () => {
  assert.ok(severityOf(95) > severityOf(61));
  assert.ok(severityOf(61) > severityOf(0));
});

test('bouřka s kroupami je nejzávažnější jev', () => {
  assert.ok(severityOf(99) > severityOf(95));
});

test('neznámý kód má nulovou závažnost', () => {
  assert.equal(severityOf(1234), 0);
});

test('iconKeyFor vrací noční variantu jen pro jasné oblohy', () => {
  assert.equal(iconKeyFor(0, false), 'clear');
  assert.equal(iconKeyFor(0, true), 'clear-night');
  assert.equal(iconKeyFor(2, true), 'partly-night');
  assert.equal(iconKeyFor(61, true), 'rain');
});

test('všechny kódy jedné skupiny sdílejí ikonu', () => {
  assert.equal(iconKeyFor(45, false), iconKeyFor(48, false));
  assert.equal(iconKeyFor(95, false), iconKeyFor(99, false));
});

test('labelFor vrací český název', () => {
  assert.equal(labelFor(0), 'Jasno');
  assert.equal(labelFor(95), 'Bouřka');
});
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `node --test tests/wmo.test.mjs`
Expected: FAIL — `Cannot find module '../wmo.mjs'`

- [ ] **Step 3: Implementuj `wmo.mjs`**

```javascript
// Překlad WMO weather codes (Open-Meteo) na závažnost, ikonu a český popisek.

const SEVERITY = new Map([
  [0, 0], [1, 10], [2, 20], [3, 30],
  [45, 45], [48, 45],
  [51, 55], [53, 55], [55, 55], [56, 55], [57, 55],
  [61, 75], [63, 75], [66, 75], [71, 75], [73, 75], [77, 75],
  [80, 65], [81, 65], [85, 65],
  [65, 85], [67, 85], [75, 85], [82, 85], [86, 85],
  [95, 95],
  [96, 100], [99, 100],
]);

const ICONS = new Map([
  [0, 'clear'], [1, 'mostly-clear'], [2, 'partly'], [3, 'overcast'],
  [45, 'fog'], [48, 'fog'],
  [51, 'drizzle'], [53, 'drizzle'], [55, 'drizzle'], [56, 'drizzle'], [57, 'drizzle'],
  [61, 'rain'], [63, 'rain'], [65, 'rain'], [66, 'rain'], [67, 'rain'],
  [71, 'snow'], [73, 'snow'], [75, 'snow'], [77, 'snow'], [85, 'snow'], [86, 'snow'],
  [80, 'showers'], [81, 'showers'], [82, 'showers'],
  [95, 'thunder'], [96, 'thunder'], [99, 'thunder'],
]);

const LABELS = new Map([
  [0, 'Jasno'], [1, 'Skoro jasno'], [2, 'Polojasno'], [3, 'Zataženo'],
  [45, 'Mlha'], [48, 'Mrznoucí mlha'],
  [51, 'Slabé mrholení'], [53, 'Mrholení'], [55, 'Silné mrholení'],
  [56, 'Mrznoucí mrholení'], [57, 'Silné mrznoucí mrholení'],
  [61, 'Slabý déšť'], [63, 'Déšť'], [65, 'Silný déšť'],
  [66, 'Mrznoucí déšť'], [67, 'Silný mrznoucí déšť'],
  [71, 'Slabé sněžení'], [73, 'Sněžení'], [75, 'Silné sněžení'], [77, 'Sněhová zrna'],
  [80, 'Slabé přeháňky'], [81, 'Přeháňky'], [82, 'Silné přeháňky'],
  [85, 'Sněhové přeháňky'], [86, 'Silné sněhové přeháňky'],
  [95, 'Bouřka'], [96, 'Bouřka s kroupami'], [99, 'Silná bouřka s kroupami'],
]);

// Ikony, které mají smysl rozlišovat na denní a noční.
const NIGHT_VARIANTS = new Map([
  ['clear', 'clear-night'],
  ['mostly-clear', 'mostly-clear-night'],
  ['partly', 'partly-night'],
]);

export function severityOf(code) {
  return SEVERITY.get(code) ?? 0;
}

export function iconKeyFor(code, isNight) {
  const key = ICONS.get(code) ?? 'unknown';
  return isNight ? (NIGHT_VARIANTS.get(key) ?? key) : key;
}

export function labelFor(code) {
  return LABELS.get(code) ?? 'Neznámo';
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `node --test tests/wmo.test.mjs`
Expected: PASS, 6 testů

- [ ] **Step 5: Commit**

```bash
git add wmo.mjs tests/wmo.test.mjs
git commit -m "feat: překlad WMO kódů na závažnost, ikonu a popisek"
```

---

## Task 2: API vrstva — URL, dávkování, sloučení modelů

**Files:**
- Create: `api.mjs`
- Test: `tests/api.test.mjs`

**Interfaces:**
- Consumes: nic
- Produces:
  - `chunk(items: Array, size: number): Array<Array>`
  - `buildForecastUrl(locations: Array<{lat, lon}>): string`
  - `mergeModels(hourly: object): { time: string[], weatherCode: (number|null)[], temperature: (number|null)[], precipitation: (number|null)[], source: (string|null)[] }`
  - `usedModels(series): string[]` — seznam skutečně použitých modelů, např. `['icon_d2']`

- [ ] **Step 1: Napiš padající test**

`tests/api.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunk, buildForecastUrl, mergeModels, usedModels } from '../api.mjs';

test('chunk dělí pole na dávky dané velikosti', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunk([], 3), []);
});

test('buildForecastUrl skládá souřadnice do čárkou oddělených seznamů', () => {
  const url = new URL(buildForecastUrl([
    { lat: 50.08, lon: 14.42 },
    { lat: 49.19, lon: 16.61 },
  ]));
  assert.equal(url.searchParams.get('latitude'), '50.08,49.19');
  assert.equal(url.searchParams.get('longitude'), '14.42,16.61');
  assert.equal(url.searchParams.get('models'), 'icon_d2,icon_eu');
  assert.equal(url.searchParams.get('timezone'), 'Europe/Prague');
  assert.equal(url.searchParams.get('forecast_days'), '3');
});

// Dvě hodiny: první má data v obou modelech, druhá jen v ICON-EU, třetí nikde.
const HOURLY = {
  time: ['2026-07-31T00:00', '2026-07-31T01:00', '2026-07-31T02:00'],
  weather_code_icon_d2: [0, null, null],
  temperature_2m_icon_d2: [15.4, null, null],
  precipitation_icon_d2: [0, null, null],
  weather_code_icon_eu: [3, 61, null],
  temperature_2m_icon_eu: [16.1, 14.2, null],
  precipitation_icon_eu: [0, 1.2, null],
};

test('mergeModels upřednostní ICON-D2 a doplní z ICON-EU', () => {
  const s = mergeModels(HOURLY);
  assert.deepEqual(s.weatherCode, [0, 61, null]);
  assert.deepEqual(s.temperature, [15.4, 14.2, null]);
  assert.deepEqual(s.source, ['icon_d2', 'icon_eu', null]);
});

test('mergeModels nemíchá modely uvnitř jedné hodiny', () => {
  const s = mergeModels(HOURLY);
  // Druhá hodina pochází celá z ICON-EU, včetně srážek.
  assert.equal(s.precipitation[1], 1.2);
});

test('usedModels vrací jen modely, které skutečně dodaly data', () => {
  assert.deepEqual(usedModels(mergeModels(HOURLY)).sort(), ['icon_d2', 'icon_eu']);
});
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `node --test tests/api.test.mjs`
Expected: FAIL — `Cannot find module '../api.mjs'`

- [ ] **Step 3: Implementuj `api.mjs`**

```javascript
// Komunikace s Open-Meteo: sestavení dotazu a sloučení dvou modelů do jedné řady.

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const VARIABLES = ['weather_code', 'temperature_2m', 'precipitation'];
const MODELS = ['icon_d2', 'icon_eu']; // pořadí = priorita
export const BATCH_SIZE = 25;

export function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function buildForecastUrl(locations) {
  const params = new URLSearchParams({
    latitude: locations.map((l) => l.lat).join(','),
    longitude: locations.map((l) => l.lon).join(','),
    hourly: VARIABLES.join(','),
    models: MODELS.join(','),
    timezone: 'Europe/Prague',
    forecast_days: '3',
  });
  return `${ENDPOINT}?${params}`;
}

// Pro každou hodinu vybere první model, který má kompletní data.
// Všechny veličiny dané hodiny pocházejí ze stejného modelu.
export function mergeModels(hourly) {
  const time = hourly.time ?? [];
  const series = {
    time,
    weatherCode: [],
    temperature: [],
    precipitation: [],
    source: [],
  };

  for (let i = 0; i < time.length; i += 1) {
    const model = MODELS.find((m) => {
      const code = hourly[`weather_code_${m}`]?.[i];
      const temp = hourly[`temperature_2m_${m}`]?.[i];
      return code !== null && code !== undefined && temp !== null && temp !== undefined;
    });

    if (model === undefined) {
      series.weatherCode.push(null);
      series.temperature.push(null);
      series.precipitation.push(null);
      series.source.push(null);
      continue;
    }

    series.weatherCode.push(hourly[`weather_code_${model}`][i]);
    series.temperature.push(hourly[`temperature_2m_${model}`][i]);
    series.precipitation.push(hourly[`precipitation_${model}`]?.[i] ?? 0);
    series.source.push(model);
  }

  return series;
}

export function usedModels(series) {
  return [...new Set(series.source.filter((s) => s !== null))];
}

export async function fetchForecast(locations, signal) {
  const response = await fetch(buildForecastUrl(locations), { signal });
  if (!response.ok) throw new Error(`Open-Meteo odpovědělo ${response.status}`);
  const body = await response.json();
  // Jedna lokalita vrací objekt, více lokalit pole. Sjednotíme na pole.
  return Array.isArray(body) ? body : [body];
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `node --test tests/api.test.mjs`
Expected: PASS, 5 testů

- [ ] **Step 5: Commit**

```bash
git add api.mjs tests/api.test.mjs
git commit -m "feat: sestavení dotazu na Open-Meteo a slučování modelů"
```

---

## Task 3: Agregace dne a výběr hodiny

**Files:**
- Create: `aggregate.mjs`
- Test: `tests/aggregate.test.mjs`

**Interfaces:**
- Consumes: `severityOf` z `wmo.mjs`
- Produces:
  - `forecastDates(series): string[]` — pole dat `"YYYY-MM-DD"` v pořadí, jak jdou v řadě
  - `dayAggregate(series, date: string): { weatherCode: number, temperature: number, precipitation: number, hasData: boolean }`
  - `hourValue(series, date: string, hour: number): { weatherCode, temperature, precipitation, hasData }`
  - `hoursOfDay(series, date: string): Array<{ hour, weatherCode, temperature, precipitation }>` — 24 položek, chybějící mají `weatherCode: null`

- [ ] **Step 1: Napiš padající test**

`tests/aggregate.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forecastDates, dayAggregate, hourValue, hoursOfDay } from '../aggregate.mjs';

// Postaví řadu jednoho dne: 24 hodin, teplota = hodina, kód 0 (jasno).
function buildDay(date, overrides = {}) {
  const series = { time: [], weatherCode: [], temperature: [], precipitation: [], source: [] };
  for (let h = 0; h < 24; h += 1) {
    const hh = String(h).padStart(2, '0');
    series.time.push(`${date}T${hh}:00`);
    series.weatherCode.push(overrides.code?.[h] ?? 0);
    series.temperature.push(overrides.temp?.[h] ?? h);
    series.precipitation.push(overrides.prec?.[h] ?? 0);
    series.source.push('icon_d2');
  }
  return series;
}

test('forecastDates vrací data v pořadí bez duplicit', () => {
  const s = buildDay('2026-07-31');
  s.time.push('2026-08-01T00:00');
  assert.deepEqual(forecastDates(s), ['2026-07-31', '2026-08-01']);
});

test('dayAggregate počítá průměr teploty jen z hodin 8 až 20', () => {
  const agg = dayAggregate(buildDay('2026-07-31'), '2026-07-31');
  // Průměr 8..20 včetně = (8+9+...+20)/13 = 14
  assert.equal(agg.temperature, 14);
});

test('dayAggregate vybere nejzávažnější jev v okně, i když trvá hodinu', () => {
  const code = Array(24).fill(0);
  code[14] = 95; // bouřka
  const agg = dayAggregate(buildDay('2026-07-31', { code }), '2026-07-31');
  assert.equal(agg.weatherCode, 95);
});

test('dayAggregate ignoruje jevy mimo okno 8 až 20', () => {
  const code = Array(24).fill(0);
  code[3] = 95;  // noční bouřka
  code[22] = 95; // pozdní večerní bouřka
  const agg = dayAggregate(buildDay('2026-07-31', { code }), '2026-07-31');
  assert.equal(agg.weatherCode, 0);
});

test('dayAggregate sčítá srážky v okně', () => {
  const prec = Array(24).fill(0);
  prec[9] = 1.5;
  prec[10] = 2.5;
  prec[2] = 100; // mimo okno, nesmí se započítat
  const agg = dayAggregate(buildDay('2026-07-31', { prec }), '2026-07-31');
  assert.equal(agg.precipitation, 4);
});

test('dayAggregate počítá z dostupných hodin, když část chybí', () => {
  const s = buildDay('2026-07-31');
  for (let h = 15; h < 24; h += 1) {
    s.weatherCode[h] = null;
    s.temperature[h] = null;
  }
  const agg = dayAggregate(s, '2026-07-31');
  assert.equal(agg.hasData, true);
  // Zbývají hodiny 8..14, průměr = 11
  assert.equal(agg.temperature, 11);
});

test('dayAggregate hlásí hasData false, když okno nemá žádná data', () => {
  const s = buildDay('2026-07-31');
  s.weatherCode.fill(null);
  s.temperature.fill(null);
  const agg = dayAggregate(s, '2026-07-31');
  assert.equal(agg.hasData, false);
});

test('dayAggregate hlásí hasData false pro neznámé datum', () => {
  assert.equal(dayAggregate(buildDay('2026-07-31'), '2026-09-09').hasData, false);
});

test('hourValue vrací konkrétní hodinu', () => {
  const v = hourValue(buildDay('2026-07-31'), '2026-07-31', 13);
  assert.equal(v.temperature, 13);
  assert.equal(v.hasData, true);
});

test('hourValue hlásí hasData false pro chybějící hodinu', () => {
  const s = buildDay('2026-07-31');
  s.weatherCode[13] = null;
  s.temperature[13] = null;
  assert.equal(hourValue(s, '2026-07-31', 13).hasData, false);
});

test('hoursOfDay vrací 24 položek seřazených podle hodiny', () => {
  const rows = hoursOfDay(buildDay('2026-07-31'), '2026-07-31');
  assert.equal(rows.length, 24);
  assert.equal(rows[0].hour, 0);
  assert.equal(rows[23].hour, 23);
  assert.equal(rows[13].temperature, 13);
});
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `node --test tests/aggregate.test.mjs`
Expected: FAIL — `Cannot find module '../aggregate.mjs'`

- [ ] **Step 3: Implementuj `aggregate.mjs`**

```javascript
// Agregace hodinových řad. Časové řetězce se zpracovávají textově — jsou
// v lokálním čase bez zóny a new Date() by je posunul podle zóny prohlížeče.

import { severityOf } from './wmo.mjs';

export const DAY_START = 8;
export const DAY_END = 20; // včetně

const dateOf = (t) => t.slice(0, 10);
const hourOf = (t) => Number(t.slice(11, 13));

export function forecastDates(series) {
  const seen = [];
  for (const t of series.time) {
    const d = dateOf(t);
    if (!seen.includes(d)) seen.push(d);
  }
  return seen;
}

function indexesFor(series, date, fromHour, toHour) {
  const out = [];
  for (let i = 0; i < series.time.length; i += 1) {
    const t = series.time[i];
    if (dateOf(t) !== date) continue;
    const h = hourOf(t);
    if (h < fromHour || h > toHour) continue;
    out.push(i);
  }
  return out;
}

export function dayAggregate(series, date) {
  const empty = { weatherCode: 0, temperature: 0, precipitation: 0, hasData: false };
  const indexes = indexesFor(series, date, DAY_START, DAY_END)
    .filter((i) => series.weatherCode[i] !== null && series.temperature[i] !== null);

  if (indexes.length === 0) return empty;

  let worst = series.weatherCode[indexes[0]];
  let sumTemp = 0;
  let sumPrec = 0;

  for (const i of indexes) {
    const code = series.weatherCode[i];
    if (severityOf(code) > severityOf(worst)) worst = code;
    sumTemp += series.temperature[i];
    sumPrec += series.precipitation[i] ?? 0;
  }

  return {
    weatherCode: worst,
    temperature: Math.round(sumTemp / indexes.length),
    precipitation: Math.round(sumPrec * 10) / 10,
    hasData: true,
  };
}

export function hourValue(series, date, hour) {
  const [i] = indexesFor(series, date, hour, hour);
  if (i === undefined || series.weatherCode[i] === null || series.temperature[i] === null) {
    return { weatherCode: 0, temperature: 0, precipitation: 0, hasData: false };
  }
  return {
    weatherCode: series.weatherCode[i],
    temperature: Math.round(series.temperature[i]),
    precipitation: series.precipitation[i] ?? 0,
    hasData: true,
  };
}

export function hoursOfDay(series, date) {
  const rows = [];
  for (let h = 0; h < 24; h += 1) {
    const v = hourValue(series, date, h);
    rows.push({
      hour: h,
      weatherCode: v.hasData ? v.weatherCode : null,
      temperature: v.hasData ? v.temperature : null,
      precipitation: v.hasData ? v.precipitation : null,
    });
  }
  return rows;
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `node --test tests/aggregate.test.mjs`
Expected: PASS, 11 testů

- [ ] **Step 5: Commit**

```bash
git add aggregate.mjs tests/aggregate.test.mjs
git commit -m "feat: denní agregace okna 8-20 a výběr hodiny"
```

---

## Task 4: Seznam lokalit

**Files:**
- Create: `locations.mjs`
- Test: `tests/locations.test.mjs`

**Interfaces:**
- Consumes: nic
- Produces:
  - `LOCATIONS: Array<{ id: string, name: string, lat: number, lon: number, tier: 1|2|3 }>`
  - `minZoomForTier(tier: number): number`
  - `visibleAt(zoom: number): Array<location>`

**Poznámka k obsahu:** tier 1 obsahuje Prahu, 13 krajských měst a navíc **Cheb** a **Dřetovice**, které si uživatel výslovně vyžádal (Dřetovice jsou obec se 430 obyvateli, do seznamu okresních měst by nespadly). Tier 2 a 3 doplň zbývajícími okresními městy ČR na celkem zhruba 76 položek; souřadnice ber z `https://geocoding-api.open-meteo.com/v1/search?name=<jméno>&countryCode=CZ` a zaokrouhli na 4 desetinná místa.

- [ ] **Step 1: Napiš padající test**

`tests/locations.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS, minZoomForTier, visibleAt } from '../locations.mjs';

test('seznam má rozumnou velikost', () => {
  assert.ok(LOCATIONS.length >= 70, `očekáváno alespoň 70 lokalit, je ${LOCATIONS.length}`);
});

test('všechny souřadnice leží uvnitř ČR', () => {
  for (const l of LOCATIONS) {
    assert.ok(l.lat > 48.5 && l.lat < 51.1, `${l.name} má podezřelou zeměpisnou šířku ${l.lat}`);
    assert.ok(l.lon > 12.0 && l.lon < 18.9, `${l.name} má podezřelou zeměpisnou délku ${l.lon}`);
  }
});

test('identifikátory jsou unikátní', () => {
  const ids = LOCATIONS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('každá lokalita má platný tier', () => {
  for (const l of LOCATIONS) {
    assert.ok([1, 2, 3].includes(l.tier), `${l.name} má neplatný tier ${l.tier}`);
  }
});

test('tier 1 obsahuje výslovně vyžádané lokality', () => {
  const tier1 = LOCATIONS.filter((l) => l.tier === 1).map((l) => l.name);
  for (const name of ['Praha', 'Cheb', 'Dřetovice']) {
    assert.ok(tier1.includes(name), `${name} chybí v tier 1`);
  }
});

test('visibleAt přidává lokality s rostoucím zoomem', () => {
  const low = visibleAt(minZoomForTier(1));
  const high = visibleAt(minZoomForTier(3));
  assert.ok(low.length < high.length);
  assert.equal(high.length, LOCATIONS.length);
  assert.ok(low.every((l) => l.tier === 1));
});
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `node --test tests/locations.test.mjs`
Expected: FAIL — `Cannot find module '../locations.mjs'`

- [ ] **Step 3: Implementuj `locations.mjs`**

Kostra a tier 1 v plném znění; tier 2 a 3 doplň podle poznámky výše.

```javascript
// Statický seznam lokalit. `tier` řídí, od jakého zoomu se bod kreslí.

const TIER_MIN_ZOOM = { 1: 0, 2: 8, 3: 9 };

export const LOCATIONS = [
  // --- tier 1: Praha, krajská města a výslovně vyžádané lokality ---
  { id: 'praha', name: 'Praha', lat: 50.0880, lon: 14.4208, tier: 1 },
  { id: 'brno', name: 'Brno', lat: 49.1951, lon: 16.6068, tier: 1 },
  { id: 'ostrava', name: 'Ostrava', lat: 49.8346, lon: 18.2820, tier: 1 },
  { id: 'plzen', name: 'Plzeň', lat: 49.7475, lon: 13.3776, tier: 1 },
  { id: 'liberec', name: 'Liberec', lat: 50.7671, lon: 15.0562, tier: 1 },
  { id: 'olomouc', name: 'Olomouc', lat: 49.5938, lon: 17.2509, tier: 1 },
  { id: 'ceske-budejovice', name: 'České Budějovice', lat: 48.9745, lon: 14.4743, tier: 1 },
  { id: 'hradec-kralove', name: 'Hradec Králové', lat: 50.2092, lon: 15.8328, tier: 1 },
  { id: 'usti-nad-labem', name: 'Ústí nad Labem', lat: 50.6607, lon: 14.0323, tier: 1 },
  { id: 'pardubice', name: 'Pardubice', lat: 50.0343, lon: 15.7812, tier: 1 },
  { id: 'zlin', name: 'Zlín', lat: 49.2265, lon: 17.6683, tier: 1 },
  { id: 'jihlava', name: 'Jihlava', lat: 49.3961, lon: 15.5912, tier: 1 },
  { id: 'karlovy-vary', name: 'Karlovy Vary', lat: 50.2306, lon: 12.8712, tier: 1 },
  { id: 'kladno', name: 'Kladno', lat: 50.1473, lon: 14.1028, tier: 1 },
  { id: 'cheb', name: 'Cheb', lat: 50.0796, lon: 12.3739, tier: 1 },
  { id: 'dretovice', name: 'Dřetovice', lat: 50.1827, lon: 14.2103, tier: 1 },

  // --- tier 2: větší okresní města (doplň zhruba 30 položek) ---
  { id: 'tabor', name: 'Tábor', lat: 49.4144, lon: 14.6578, tier: 2 },
  { id: 'trutnov', name: 'Trutnov', lat: 50.5606, lon: 15.9128, tier: 2 },
  // ...

  // --- tier 3: zbývající okresní města (doplň do celkových ~76) ---
  { id: 'rakovnik', name: 'Rakovník', lat: 50.1043, lon: 13.7331, tier: 3 },
  // ...
];

export function minZoomForTier(tier) {
  return TIER_MIN_ZOOM[tier] ?? 9;
}

export function visibleAt(zoom) {
  return LOCATIONS.filter((l) => zoom >= minZoomForTier(l.tier));
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `node --test tests/locations.test.mjs`
Expected: PASS, 6 testů. Test na velikost seznamu prochází až po doplnění tier 2 a 3 — dokud padá, seznam není hotový.

- [ ] **Step 5: Commit**

```bash
git add locations.mjs tests/locations.test.mjs
git commit -m "feat: seznam lokalit s tiery podle zoomu"
```

---

## Task 5: SVG ikony a obsah markeru

**Files:**
- Create: `icons.mjs`
- Test: `tests/icons.test.mjs`

**Interfaces:**
- Consumes: `iconKeyFor` z `wmo.mjs`
- Produces:
  - `iconSvg(key: string): string` — inline SVG jako řetězec, viewBox `0 0 24 24`
  - `markerHtml({ code, temperature, isNight, hasData }): string` — obsah `L.divIcon`

- [ ] **Step 1: Napiš padající test**

`tests/icons.test.mjs`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iconSvg, markerHtml, ICON_KEYS } from '../icons.mjs';
import { iconKeyFor } from '../wmo.mjs';

test('každý klíč ikony má neprázdné SVG', () => {
  for (const key of ICON_KEYS) {
    const svg = iconSvg(key);
    assert.ok(svg.startsWith('<svg'), `${key} nevrací SVG`);
    assert.ok(svg.includes('viewBox="0 0 24 24"'), `${key} nemá očekávaný viewBox`);
  }
});

test('všechny WMO kódy se mapují na existující ikonu', () => {
  const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67,
    71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
  for (const code of codes) {
    for (const night of [false, true]) {
      const key = iconKeyFor(code, night);
      assert.ok(ICON_KEYS.includes(key), `kód ${code} (noc=${night}) → neznámý klíč ${key}`);
    }
  }
});

test('neznámý klíč nespadne, vrátí náhradní ikonu', () => {
  assert.ok(iconSvg('takova-ikona-neni').startsWith('<svg'));
});

test('markerHtml zobrazuje teplotu se stupni', () => {
  const html = markerHtml({ code: 0, temperature: 21, isNight: false, hasData: true });
  assert.ok(html.includes('21°'));
  assert.ok(html.includes('<svg'));
});

test('markerHtml bez dat zobrazuje pomlčku a šedou třídu', () => {
  const html = markerHtml({ code: 0, temperature: 0, isNight: false, hasData: false });
  assert.ok(html.includes('–'));
  assert.ok(html.includes('marker--nodata'));
});
```

- [ ] **Step 2: Spusť test a ověř, že padá**

Run: `node --test tests/icons.test.mjs`
Expected: FAIL — `Cannot find module '../icons.mjs'`

- [ ] **Step 3: Implementuj `icons.mjs`**

Níže je celý soubor. SVG jsou záměrně jednoduchá — jednotný viewBox, barvy napevno,
aby fungovaly i na světlém podkladu mapy.

```javascript
// Inline SVG symboly počasí. Vše řetězce, aby šly vložit do L.divIcon.

import { iconKeyFor } from './wmo.mjs';

const SUN = '<circle cx="12" cy="12" r="5" fill="#f6b73c"/><g stroke="#f6b73c" stroke-width="2" stroke-linecap="round"><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1"/></g>';
const MOON = '<path d="M17 13.5A7 7 0 0 1 9.5 6a6 6 0 1 0 7.5 7.5z" fill="#cbd5e1"/>';
const CLOUD = '<path d="M7.5 19h9.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7.5 19z" fill="#94a3b8"/>';
const CLOUD_DARK = '<path d="M7.5 19h9.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7.5 19z" fill="#64748b"/>';

const drops = (xs) => xs.map((x) =>
  `<path d="M${x} 18.5l-1.2 2.6" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>`).join('');
const flakes = (xs) => xs.map((x) =>
  `<circle cx="${x}" cy="20" r="1.1" fill="#93c5fd"/>`).join('');

const SHAPES = {
  'clear': SUN,
  'clear-night': MOON,
  'mostly-clear': `<circle cx="9" cy="9" r="4" fill="#f6b73c"/>${CLOUD}`,
  'mostly-clear-night': `${MOON}${CLOUD}`,
  'partly': `<circle cx="9" cy="8" r="4" fill="#f6b73c"/>${CLOUD}`,
  'partly-night': `<path d="M13 9.5A5 5 0 0 1 8 4.5 4.3 4.3 0 1 0 13 9.5z" fill="#cbd5e1"/>${CLOUD}`,
  'overcast': `${CLOUD_DARK}`,
  'fog': `${CLOUD}<g stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"><path d="M5 21h6M13 21h6"/></g>`,
  'drizzle': `${CLOUD}${drops([10, 14])}`,
  'rain': `${CLOUD}${drops([9, 12.5, 16])}`,
  'showers': `<circle cx="8" cy="7" r="3.2" fill="#f6b73c"/>${CLOUD}${drops([11, 15])}`,
  'snow': `${CLOUD}${flakes([9, 12.5, 16])}`,
  'thunder': `${CLOUD_DARK}<path d="M12.5 17l-3 4h2.5l-1 3 4-4.5h-2.5l1.5-2.5z" fill="#facc15"/>`,
  'unknown': '<circle cx="12" cy="12" r="8" fill="#cbd5e1"/><path d="M12 16v.01M12 8a2 2 0 0 1 1 3.7c-.6.4-1 .8-1 1.3" stroke="#475569" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
};

export const ICON_KEYS = Object.keys(SHAPES);

export function iconSvg(key) {
  const shape = SHAPES[key] ?? SHAPES.unknown;
  return `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">${shape}</svg>`;
}

export function markerHtml({ code, temperature, isNight, hasData }) {
  if (!hasData) {
    return `<div class="marker marker--nodata">${iconSvg('unknown')}<span class="marker__temp">–</span></div>`;
  }
  const svg = iconSvg(iconKeyFor(code, isNight));
  return `<div class="marker">${svg}<span class="marker__temp">${temperature}°</span></div>`;
}
```

- [ ] **Step 4: Spusť test a ověř, že prochází**

Run: `node --test tests/icons.test.mjs`
Expected: PASS, 5 testů

- [ ] **Step 5: Commit**

```bash
git add icons.mjs tests/icons.test.mjs
git commit -m "feat: SVG sada ikon počasí a obsah markeru"
```

---

## Task 6: Stránka, mapa a denní markery

Od tohoto místa jde o UI. Ověřuje se v prohlížeči podle uvedených kroků, ne testem.
Po každém tasku spusť `node --test tests/` a ujisti se, že nic z předchozích tasků neselhalo.

**Files:**
- Create: `index.html`, `app.mjs`
- Test: ruční ověření v prohlížeči

**Interfaces:**
- Consumes: `LOCATIONS`, `visibleAt` (`locations.mjs`); `chunk`, `fetchForecast`, `mergeModels`, `usedModels`, `BATCH_SIZE` (`api.mjs`); `forecastDates`, `dayAggregate` (`aggregate.mjs`); `markerHtml` (`icons.mjs`)
- Produces: globální stav `state` v `app.mjs` s tvarem
  `{ data: Map<locationId, series>, dates: string[], dayIndex: 0|1|2, mode: 'day'|'hour', hour: number, selectedId: string|null, zoom: number }`

- [ ] **Step 1: Vytvoř `index.html`**

```html
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Počasí ČR</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
  :root { --bg: #0f172a; --panel: #1e293b; --text: #e2e8f0; --muted: #94a3b8; --accent: #38bdf8; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  body { display: flex; flex-direction: column; background: var(--bg); color: var(--text); }

  header { display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
           padding: 8px 12px; background: var(--panel); border-bottom: 1px solid #334155; }
  h1 { font-size: 16px; margin: 0 8px 0 0; font-weight: 600; }
  .days { display: flex; gap: 4px; }
  .days button { padding: 6px 14px; border: 1px solid #475569; background: transparent;
                 color: var(--text); border-radius: 6px; cursor: pointer; font-size: 14px; }
  .days button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #0f172a; font-weight: 600; }
  .meta { margin-left: auto; display: flex; gap: 10px; align-items: center; font-size: 12px; color: var(--muted); }
  .badge { padding: 3px 8px; border: 1px solid #475569; border-radius: 999px; }

  #map { flex: 1; min-height: 0; background: #1e293b; }

  #banner { display: none; padding: 8px 12px; background: #7f1d1d; color: #fee2e2; font-size: 14px;
            align-items: center; gap: 12px; }
  #banner.visible { display: flex; }
  #banner button { margin-left: auto; padding: 4px 10px; border: 0; border-radius: 4px; cursor: pointer; }

  .marker { display: flex; flex-direction: column; align-items: center; width: 44px;
            margin-left: -22px; margin-top: -22px; pointer-events: auto; cursor: pointer; }
  .marker__temp { font-size: 12px; font-weight: 700; color: #0f172a; background: #f8fafc;
                  border-radius: 4px; padding: 0 4px; line-height: 15px;
                  box-shadow: 0 1px 3px rgba(0,0,0,.35); }
  .marker--nodata { opacity: .45; }

  #panel { display: none; background: var(--panel); border-top: 1px solid #334155; padding: 10px 12px; }
  #panel.visible { display: block; }
</style>
</head>
<body>
  <header>
    <h1>Počasí ČR</h1>
    <div class="days" id="days"></div>
    <div class="meta">
      <span class="badge" id="model-badge">načítám…</span>
      <span id="updated"></span>
    </div>
  </header>
  <div id="banner"><span id="banner-text"></span><button id="retry">Zkusit znovu</button></div>
  <div id="map"></div>
  <div id="panel"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module" src="./app.mjs"></script>
</body>
</html>
```

- [ ] **Step 2: Vytvoř `app.mjs` s mapou a denním vykreslením**

```javascript
import { LOCATIONS, visibleAt } from './locations.mjs';
import { chunk, fetchForecast, mergeModels, usedModels, BATCH_SIZE } from './api.mjs';
import { forecastDates, dayAggregate } from './aggregate.mjs';
import { markerHtml } from './icons.mjs';

const CZ_BOUNDS = [[48.5, 12.0], [51.1, 18.9]];

const state = {
  data: new Map(),   // id lokality → sloučená řada
  dates: [],         // ['YYYY-MM-DD', ...] tři dny
  dayIndex: 0,
  mode: 'day',
  hour: 12,
  selectedId: null,
  zoom: 7,
};

const markers = new Map(); // id lokality → L.Marker

const map = L.map('map', { minZoom: 6, maxZoom: 11, zoomControl: true })
  .fitBounds(CZ_BOUNDS);
map.setMaxBounds([[47.8, 10.8], [51.8, 20.0]]);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap, &copy; CARTO | data Open-Meteo (ICON)',
  maxZoom: 11,
}).addTo(map);

map.on('zoomend', () => {
  state.zoom = map.getZoom();
  render();
});

function currentDate() {
  return state.dates[state.dayIndex];
}

// Vrátí { weatherCode, temperature, hasData } podle aktivního režimu.
function valueFor(series) {
  if (state.mode === 'hour') {
    return hourValueOf(series);
  }
  return dayAggregate(series, currentDate());
}

function render() {
  const visible = new Set(visibleAt(map.getZoom()).map((l) => l.id));

  for (const loc of LOCATIONS) {
    const series = state.data.get(loc.id);
    const shouldShow = visible.has(loc.id) && series !== undefined;
    const existing = markers.get(loc.id);

    if (!shouldShow) {
      if (existing) { map.removeLayer(existing); markers.delete(loc.id); }
      continue;
    }

    const value = valueFor(series);
    const html = markerHtml({
      code: value.weatherCode,
      temperature: value.temperature,
      isNight: state.mode === 'hour' && (state.hour >= 20 || state.hour < 6),
      hasData: value.hasData,
    });
    const icon = L.divIcon({ html, className: '', iconSize: [44, 52] });

    if (existing) {
      existing.setIcon(icon);
    } else {
      const marker = L.marker([loc.lat, loc.lon], { icon, title: loc.name })
        .addTo(map)
        .on('click', () => selectLocation(loc.id));
      markers.set(loc.id, marker);
    }
  }
}

// Doplněno v Tasku 8.
function hourValueOf(series) {
  return dayAggregate(series, currentDate());
}

// Doplněno v Tasku 8.
function selectLocation(id) {
  state.selectedId = id;
}

async function load() {
  const batches = chunk(LOCATIONS, BATCH_SIZE);
  for (const batch of batches) {
    const responses = await fetchForecast(batch);
    responses.forEach((response, i) => {
      state.data.set(batch[i].id, mergeModels(response.hourly));
    });
  }

  const first = state.data.values().next().value;
  state.dates = forecastDates(first).slice(0, 3);

  const models = new Set();
  for (const series of state.data.values()) usedModels(series).forEach((m) => models.add(m));
  document.getElementById('model-badge').textContent =
    models.has('icon_eu') ? 'ICON-D2 + ICON-EU' : 'ICON-D2 · 2 km';

  render();
}

load();
```

- [ ] **Step 3: Spusť lokální server a otevři stránku**

```bash
python -m http.server 8000
```

Otevři `http://localhost:8000/`.

- [ ] **Step 4: Ověř v prohlížeči**

Očekávaný stav:
- mapa vyplňuje okno a je vycentrovaná na ČR
- při počátečním zoomu je vidět 16 markerů (tier 1) s ikonou a teplotou
- přiblížení na zoom 9+ přidá zbylé lokality, oddálení je zase odebere
- konzole je bez chyb, odznak modelu ukazuje ICON-D2

- [ ] **Step 5: Commit**

```bash
git add index.html app.mjs
git commit -m "feat: mapa s denními markery a filtrováním podle zoomu"
```

---

## Task 7: Přepínač dnů, čas aktualizace a cache

**Files:**
- Modify: `app.mjs`

**Interfaces:**
- Consumes: stav a `render()` z Tasku 6
- Produces: `readCache()`, `writeCache(payload)`, `renderDayButtons()`

- [ ] **Step 1: Přidej do `app.mjs` cache a popisky dnů**

Vlož nad funkci `load()`:

```javascript
const CACHE_KEY = `weathercz:${LOCATIONS.length}:${LOCATIONS.map((l) => l.id).join('|').length}`;
const CACHE_TTL_MS = 30 * 60 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...parsed, stale: Date.now() - parsed.savedAt > CACHE_TTL_MS };
  } catch {
    return null; // poškozený nebo nedostupný localStorage není důvod aplikaci shodit
  }
}

function writeCache(entries) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), entries }));
  } catch {
    // Překročená kvóta — cache je nice-to-have, běž dál.
  }
}

const DAY_LABELS = ['Dnes', 'Zítra', 'Pozítří'];

function renderDayButtons() {
  const host = document.getElementById('days');
  host.innerHTML = '';
  state.dates.forEach((date, i) => {
    const button = document.createElement('button');
    button.textContent = DAY_LABELS[i] ?? date;
    button.setAttribute('aria-pressed', String(i === state.dayIndex));
    button.addEventListener('click', () => {
      state.dayIndex = i;
      renderDayButtons();
      render();
      // renderPanel vzniká až v Tasku 8; do té doby není co překreslovat.
      if (state.selectedId && typeof renderPanel === 'function') renderPanel();
    });
    host.append(button);
  });
}

function setUpdated(timestamp) {
  const t = new Date(timestamp);
  document.getElementById('updated').textContent =
    `aktualizováno ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
}

function showBanner(text) {
  document.getElementById('banner-text').textContent = text;
  document.getElementById('banner').classList.add('visible');
}

function hideBanner() {
  document.getElementById('banner').classList.remove('visible');
}
```

- [ ] **Step 2: Nahraď `load()` verzí s cache a ošetřením chyb**

```javascript
function applyEntries(entries, savedAt) {
  state.data = new Map(entries.map(([id, series]) => [id, series]));
  const first = state.data.values().next().value;
  if (!first) return false;

  state.dates = forecastDates(first).slice(0, 3);

  const models = new Set();
  for (const series of state.data.values()) usedModels(series).forEach((m) => models.add(m));
  document.getElementById('model-badge').textContent =
    models.has('icon_eu') ? 'ICON-D2 + ICON-EU' : 'ICON-D2 · 2 km';

  setUpdated(savedAt);
  renderDayButtons();
  render();
  return true;
}

async function load() {
  const cached = readCache();
  if (cached && applyEntries(cached.entries, cached.savedAt) && !cached.stale) {
    return; // čerstvá cache, síť není potřeba
  }

  try {
    const entries = [];
    const batches = chunk(LOCATIONS, BATCH_SIZE);
    const results = await Promise.allSettled(batches.map((b) => fetchForecast(b)));

    results.forEach((result, bi) => {
      if (result.status !== 'fulfilled') return;
      result.value.forEach((response, i) => {
        entries.push([batches[bi][i].id, mergeModels(response.hourly)]);
      });
    });

    if (entries.length === 0) throw new Error('žádná dávka neuspěla');

    const savedAt = Date.now();
    writeCache(entries);
    applyEntries(entries, savedAt);

    if (entries.length < LOCATIONS.length) {
      showBanner(`Načteno ${entries.length} z ${LOCATIONS.length} lokalit.`);
    } else {
      hideBanner();
    }
  } catch (error) {
    console.error(error);
    if (cached) {
      showBanner('Nová data se nepodařilo načíst, zobrazená předpověď může být zastaralá.');
    } else {
      showBanner('Data se nepodařilo načíst.');
    }
  }
}

document.getElementById('retry').addEventListener('click', () => {
  hideBanner();
  load();
});

load();
```

Smaž původní volání `load()` na konci souboru, ať se nespustí dvakrát.

- [ ] **Step 3: Ověř v prohlížeči**

- Tlačítka `Dnes / Zítra / Pozítří` jsou vykreslená, aktivní je zvýrazněné.
- Přepnutí dne změní ikony **bez nového požadavku** — ověř v záložce Network.
- Po reloadu do 30 minut se stránka naplní okamžitě z cache a Network neukáže volání Open-Meteo.
- V devtools zapni offline režim a dej reload: objeví se varovný pruh a data z cache.
- Smaž `localStorage`, zůstaň offline, reload: pruh „Data se nepodařilo načíst.", stránka nespadne.

- [ ] **Step 4: Spusť testy**

Run: `node --test tests/`
Expected: PASS, vše z Tasků 1–5

- [ ] **Step 5: Commit**

```bash
git add app.mjs
git commit -m "feat: přepínání dnů, cache v localStorage a chybové stavy"
```

---

## Task 8: Hodinový režim a panel lokality

**Files:**
- Modify: `app.mjs`, `index.html`

**Interfaces:**
- Consumes: `hourValue`, `hoursOfDay` (`aggregate.mjs`); `labelFor` (`wmo.mjs`); `iconSvg`, `iconKeyFor`
- Produces: `renderPanel()`, `enterHourMode(hour)`, `exitHourMode()`

- [ ] **Step 1: Rozšiř import v `app.mjs`**

```javascript
import { forecastDates, dayAggregate, hourValue, hoursOfDay } from './aggregate.mjs';
import { markerHtml, iconSvg } from './icons.mjs';
import { labelFor, iconKeyFor } from './wmo.mjs';
```

- [ ] **Step 2: Nahraď zástupné funkce z Tasku 6**

Odstraň provizorní `hourValueOf` a `selectLocation` a vlož:

```javascript
function hourValueOf(series) {
  return hourValue(series, currentDate(), state.hour);
}

function defaultHour() {
  if (state.dayIndex !== 0) return 12;
  return new Date().getHours();
}

function selectLocation(id) {
  state.selectedId = id;
  if (state.mode === 'day') {
    state.mode = 'hour';
    state.hour = defaultHour();
  }
  renderPanel();
  render();
}

function exitHourMode() {
  state.mode = 'day';
  state.selectedId = null;
  document.getElementById('panel').classList.remove('visible');
  render();
}

function renderPanel() {
  const panel = document.getElementById('panel');
  const loc = LOCATIONS.find((l) => l.id === state.selectedId);
  const series = loc && state.data.get(loc.id);
  if (!loc || !series) { panel.classList.remove('visible'); return; }

  const rows = hoursOfDay(series, currentDate());
  const maxPrec = Math.max(0.5, ...rows.map((r) => r.precipitation ?? 0));
  const now = hourValue(series, currentDate(), state.hour);

  const bars = rows.map((r) => {
    const height = r.precipitation ? Math.round((r.precipitation / maxPrec) * 100) : 0;
    const selected = r.hour === state.hour ? ' hourbar--active' : '';
    const missing = r.weatherCode === null ? ' hourbar--missing' : '';
    return `<button class="hourbar${selected}${missing}" data-hour="${r.hour}" title="${r.hour}:00">
        <span class="hourbar__fill" style="height:${height}%"></span>
        <span class="hourbar__label">${r.hour}</span>
      </button>`;
  }).join('');

  panel.innerHTML = `
    <div class="panel__head">
      <strong>${loc.name}</strong>
      <span class="panel__now">
        ${iconSvg(iconKeyFor(now.weatherCode, state.hour >= 20 || state.hour < 6))}
        ${now.hasData ? `${now.temperature}° · ${labelFor(now.weatherCode)} · ${now.precipitation} mm` : 'bez dat'}
      </span>
      <button id="back-to-day">Zpět na denní přehled</button>
    </div>
    <input type="range" id="hour-slider" min="0" max="23" step="1" value="${state.hour}">
    <div class="hourbars">${bars}</div>
  `;
  panel.classList.add('visible');

  const slider = document.getElementById('hour-slider');
  slider.addEventListener('input', () => {
    state.hour = Number(slider.value);
    renderPanel();
    render();
    document.getElementById('hour-slider').focus();
  });
  panel.querySelectorAll('.hourbar').forEach((bar) => {
    bar.addEventListener('click', () => {
      state.hour = Number(bar.dataset.hour);
      renderPanel();
      render();
    });
  });
  document.getElementById('back-to-day').addEventListener('click', exitHourMode);
}
```

- [ ] **Step 3: Doplň CSS panelu do `index.html`**

Vlož do `<style>` před uzavírací `</style>`:

```css
  .panel__head { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; flex-wrap: wrap; }
  .panel__now { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 14px; }
  .panel__now svg { width: 26px; height: 26px; }
  #back-to-day { margin-left: auto; padding: 5px 10px; border: 1px solid #475569;
                 background: transparent; color: var(--text); border-radius: 6px; cursor: pointer; }
  #hour-slider { width: 100%; margin: 4px 0 8px; accent-color: var(--accent); }
  .hourbars { display: flex; gap: 2px; align-items: flex-end; height: 56px; }
  .hourbar { flex: 1; display: flex; flex-direction: column; justify-content: flex-end;
             align-items: center; height: 100%; padding: 0; border: 0; background: transparent;
             cursor: pointer; border-radius: 3px 3px 0 0; }
  .hourbar__fill { width: 70%; min-height: 2px; background: #3b82f6; border-radius: 2px 2px 0 0; }
  .hourbar__label { font-size: 9px; color: var(--muted); line-height: 12px; }
  .hourbar--active { background: rgba(56, 189, 248, .18); }
  .hourbar--active .hourbar__label { color: var(--accent); font-weight: 700; }
  .hourbar--missing .hourbar__fill { background: #475569; }
```

- [ ] **Step 4: Ověř v prohlížeči**

- Klik na marker otevře spodní panel a **všechny** markery na mapě se přepnou na vybranou hodinu.
- Tah posuvníkem překresluje celou mapu plynule; sloupce srážek ukazují, kdy prší.
- Klik na jiný marker přepne panel na jinou lokalitu, zvolená hodina zůstane.
- Přepnutí dne v hodinovém režimu ponechá hodinu a aktualizuje panel i mapu.
- Po 20. hodině mají jasné oblohy měsíc místo slunce.
- `Zpět na denní přehled` panel zavře a vrátí denní agregaci.

- [ ] **Step 5: Commit**

```bash
git add app.mjs index.html
git commit -m "feat: hodinový režim s posuvníkem a panelem lokality"
```

---

## Task 9: Mobil, README a nasazení na GitHub Pages

**Files:**
- Modify: `index.html`
- Create: `README.md`

- [ ] **Step 1: Přidej responzivní pravidla do `<style>`**

```css
  @media (max-width: 640px) {
    header { gap: 8px; padding: 6px 8px; }
    h1 { font-size: 14px; }
    .meta { margin-left: 0; width: 100%; order: 3; }
    .days button { padding: 5px 10px; font-size: 13px; }
    #panel { max-height: 42vh; overflow-y: auto; }
    .hourbar__label { font-size: 8px; }
  }
```

- [ ] **Step 2: Napiš `README.md`**

```markdown
# Počasí ČR

Statická mapa počasí České republiky. Denní přehled pro dnešek, zítřek a pozítřek
plus hodinový režim, ve kterém je vidět, kdy kde prší.

## Data

[Open-Meteo](https://open-meteo.com) — model **ICON-D2** (DWD, rozlišení ~2 km).
Kde ICON-D2 nedosáhne, doplní se automaticky **ICON-EU** (~7 km); použitý model
je vidět v horní liště.

Denní ikona ukazuje **nejzávažnější jev mezi 8:00 a 20:00**, teplota je průměr
téhož okna. Krátká odpolední bouřka se tak neschová pod celodenní slunce.

## Lokální spuštění

Aplikace používá ES moduly, takže nestačí otevřít soubor přes `file://`:

    python -m http.server 8000

Pak otevři <http://localhost:8000/>.

## Testy

Bez jediné závislosti, stačí Node 18+:

    node --test tests/

## Nasazení

Settings → Pages → Deploy from a branch → `main` / `/ (root)`. Žádný build.
```

- [ ] **Step 3: Ověř mobilní zobrazení**

V devtools přepni na šířku 390 px: hlavička se zalomí, mapa zabírá většinu plochy,
panel zabere nejvýš 42 % výšky a jde v něm rolovat.

- [ ] **Step 4: Spusť celou testovou sadu**

Run: `node --test tests/`
Expected: PASS, všechny testy Tasků 1–5

- [ ] **Step 5: Commit a nasazení**

```bash
git add index.html README.md
git commit -m "feat: responzivní úpravy a README"
git push -u origin main
```

Poté v GitHubu Settings → Pages → Deploy from a branch → `main`, kořen.

- [ ] **Step 6: Ověř nasazenou stránku**

Otevři `https://<uživatel>.github.io/weathercz/` a projdi ověřovací body ze
specifikace, zejména: mapa se načte, přepínání dnů nevolá síť, hodinový posuvník
překresluje celou mapu.

---

## Ověření hotové práce

Převzato ze specifikace, sekce *Ověření hotové práce*:

1. Stránka přes lokální server zobrazí mapu ČR s ikonami do několika sekund.
2. Přepnutí `Zítra` / `Pozítří` změní ikony bez síťového požadavku (Network panel).
3. Odznak modelu odpovídá skutečnosti — u pozítřka pozdě odpoledne ukáže doplnění ICON-EU.
4. Klik na marker otevře panel a přepne mapu do hodinového režimu.
5. Posun posuvníku překreslí všechny markery.
6. Zablokování sítě po prvním načtení → aplikace nastartuje z cache a zobrazí varovný pruh.
7. Aplikace funguje na mobilním viewportu; panel nezakryje celou mapu.
8. `node --test tests/` prochází celá.
