import { LOCATIONS, visibleAt, searchLocations, minZoomForTier } from './locations.js';
import { chunk, fetchForecast, mergeModels, usedModels, BATCH_SIZE } from './api.js';
import { forecastDates, dayAggregate, hourValue, hoursOfDay } from './aggregate.js';
import { markerHtml, iconSvg } from './icons.js';
import { labelFor, iconKeyFor } from './wmo.js';
import { hideCollidingLabels } from './labels.js';
import { CZ_BORDER } from './czechia.js';

const CZ_BOUNDS = [[48.55, 12.09], [51.06, 18.86]];
const DAY_LABELS = ['Dnes', 'Zítra', 'Pozítří'];
const CACHE_KEY = `weathercz:v1:${LOCATIONS.length}`;
const CACHE_TTL_MS = 30 * 60 * 1000;
const NIGHT_FROM = 20;
const NIGHT_TO = 6;

const state = {
  data: new Map(),   // id lokality → sloučená hodinová řada
  dates: [],         // ['YYYY-MM-DD', ...] tři dny předpovědi
  dayIndex: 0,
  mode: 'day',       // 'day' | 'hour'
  hour: 12,
  selectedId: null,
};

const markers = new Map(); // id lokality → L.Marker
const el = (id) => document.getElementById(id);

/* ---------- mapa ---------- */

// zoomSnap po čtvrtinách: na celých stupních se ČR buď ztrácí v okolní Evropě
// (zoom 7), nebo přeteče z okna (zoom 8). Mezistupeň ji nechá vyplnit výřez.
const map = L.map('map', { minZoom: 6, maxZoom: 11, zoomControl: true, zoomSnap: 0.25 });
map.fitBounds(CZ_BOUNDS);
map.setMaxBounds([[47.6, 10.5], [52.0, 20.4]]);

// Podklad bez vlastních popisků: názvy měst si kreslíme sami u markerů a
// dvojí sada jmen přes sebe se nedala číst.
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap, &copy; CARTO | předpověď <a href="https://open-meteo.com">Open-Meteo</a> (ICON)',
  maxZoom: 11,
}).addTo(map);

// Území mimo ČR se ztlumí clonou: polygon přes celý svět s dírou ve tvaru
// republiky. Hranice se pak nemusí překřikovat s podkladem, aby byla vidět.
// Clona pokrývá jen širší okolí ČR, ne celou zeměkouli — polygon přes celý
// svět Leaflet při vykreslování ořízne a na mapě zůstane viditelný šev.
// Rozsah je s rezervou větší než maxBounds, takže okraj nikdy není v záběru.
const MASK_RING = [[42, 0], [42, 30], [58, 30], [58, 0]];

L.polygon([MASK_RING, ...CZ_BORDER], {
  stroke: false,
  fillColor: '#0f172a',
  fillOpacity: 0.14,
  interactive: false,
}).addTo(map);

L.polyline(CZ_BORDER, {
  color: '#1e293b',
  weight: 2,
  opacity: 0.75,
  interactive: false,
}).addTo(map);

map.on('zoomend', renderMarkers);
map.on('moveend', updateLabelCollisions);

// Kontejner mapy je flex položka a v okamžiku konstrukce ještě nemusí znát
// svou výšku — pak by fitBounds zvolil zbytečně malý zoom. Po načtení stránky
// necháme Leaflet rozměry přeměřit a výřez dopočítat znovu.
function fitCzechia() {
  map.invalidateSize({ animate: false });
  map.fitBounds(CZ_BOUNDS, { padding: [8, 8] });
}

if (document.readyState === 'complete') fitCzechia();
else window.addEventListener('load', fitCzechia);

/* ---------- odvozený stav ---------- */

const currentDate = () => state.dates[state.dayIndex];
const isNight = (hour) => hour >= NIGHT_FROM || hour < NIGHT_TO;

// Denní režim ukazuje agregaci okna 8–20, hodinový konkrétní hodinu.
function valueFor(series) {
  return state.mode === 'hour'
    ? hourValue(series, currentDate(), state.hour)
    : dayAggregate(series, currentDate());
}

function defaultHour() {
  return state.dayIndex === 0 ? new Date().getHours() : 12;
}

/* ---------- vykreslení mapy ---------- */

function renderMarkers() {
  if (state.dates.length === 0) return;

  const visible = new Set(visibleAt(map.getZoom()).map((l) => l.id));

  for (const loc of LOCATIONS) {
    const series = state.data.get(loc.id);
    const existing = markers.get(loc.id);
    const shouldShow = visible.has(loc.id) && series !== undefined;

    if (!shouldShow) {
      if (existing) {
        map.removeLayer(existing);
        markers.delete(loc.id);
      }
      continue;
    }

    const value = valueFor(series);
    const html = markerHtml({
      code: value.weatherCode,
      temperature: value.temperature,
      isNight: state.mode === 'hour' && isNight(state.hour),
      hasData: value.hasData,
      name: loc.name,
      selected: state.selectedId === loc.id,
    });

    const icon = L.divIcon({
      html,
      className: 'marker-wrap',
      iconSize: [130, 52],
      iconAnchor: [65, 26],
    });

    // Vybraná lokalita musí ležet nad sousedy, i když je jinak méně významná —
    // jinak ji u blízkých dvojic (Kladno – Dřetovice) překryje soused.
    const zIndex = state.selectedId === loc.id
      ? 10000
      : (4 - loc.tier) * 1000 - LOCATIONS.indexOf(loc);

    if (existing) {
      existing.setIcon(icon);
      existing.setZIndexOffset(zIndex);
    } else {
      // Když se dva markery překryjí (Praha – Kladno – Dřetovice), navrchu má
      // ležet důležitější lokalita, ne ta, která se náhodou vykreslila později.
      const marker = L.marker([loc.lat, loc.lon], {
        icon,
        title: loc.name,
        riseOnHover: true,
        zIndexOffset: zIndex,
      })
        .addTo(map)
        .on('click', () => selectLocation(loc.id));
      markers.set(loc.id, marker);
    }
  }

  updateLabelCollisions();
}

// Popisky se skrývají až po vykreslení, kdy jsou známé jejich skutečné rozměry.
// Skryté zůstávají přes visibility, takže si drží velikost a příští výpočet
// nemusí nic dočasně odkrývat.
const LOC_ORDER = new Map(LOCATIONS.map((loc, i) => [loc.id, i]));

function updateLabelCollisions() {
  const items = [];

  for (const [id, marker] of markers) {
    const root = marker.getElement();
    const badge = root?.querySelector('.marker__badge');
    if (!badge) continue;
    const label = root.querySelector('.marker__name');
    const loc = LOCATIONS[LOC_ORDER.get(id)];

    items.push({
      id,
      // Vybraná lokalita si popisek udrží vždy, jinak rozhoduje tier a pořadí.
      priority: state.selectedId === id ? -1 : loc.tier * 1000 + LOC_ORDER.get(id),
      badge: badge.getBoundingClientRect(),
      label: label ? label.getBoundingClientRect() : null,
    });
  }

  const hidden = hideCollidingLabels(items);
  for (const [id, marker] of markers) {
    marker.getElement()?.querySelector('.marker')
      ?.classList.toggle('marker--nolabel', hidden.has(id));
  }
}

/* ---------- panel lokality ---------- */

function selectLocation(id) {
  state.selectedId = id;
  if (state.mode === 'day') {
    state.mode = 'hour';
    state.hour = defaultHour();
  }
  renderPanel();
  renderMarkers();
}

function exitHourMode() {
  state.mode = 'day';
  state.selectedId = null;
  el('panel').classList.remove('visible');
  renderMarkers();
}

// Postaví panel od základu. Volá se při změně lokality nebo dne, ne při
// posunu hodiny — ten mění jen zvýraznění, viz updateHourUi().
function renderPanel() {
  const panel = el('panel');
  const loc = LOCATIONS.find((l) => l.id === state.selectedId);
  const series = loc && state.data.get(loc.id);

  if (!loc || !series) {
    panel.classList.remove('visible');
    return;
  }

  const rows = hoursOfDay(series, currentDate());
  const peak = Math.max(0, ...rows.map((r) => r.precipitation ?? 0));
  const total = Math.round(rows.reduce((sum, r) => sum + (r.precipitation ?? 0), 0) * 10) / 10;
  const scale = Math.max(peak, 0.2); // aby i mrholení 0.1 mm bylo vidět

  const bars = rows.map((r) => {
    const wet = (r.precipitation ?? 0) > 0;
    const height = wet ? Math.max(8, Math.round((r.precipitation / scale) * 100)) : 0;
    const missing = r.weatherCode === null ? ' hourbar--missing' : '';
    const dry = !wet && r.weatherCode !== null ? ' hourbar--dry' : '';
    const title = r.weatherCode === null
      ? `${r.hour}:00 — bez dat`
      : `${r.hour}:00 — ${labelFor(r.weatherCode)}, ${r.temperature}°, ${r.precipitation} mm`;
    return `<button type="button" class="hourbar${missing}${dry}" data-hour="${r.hour}" title="${title}">
        <span class="hourbar__fill" style="height:${height}%"></span>
        <span class="hourbar__label">${r.hour}</span>
      </button>`;
  }).join('');

  const rainInfo = total > 0
    ? `srážky ${total} mm za den, špička ${peak} mm/h`
    : 'za celý den se nečekají srážky';

  panel.innerHTML = `
    <div class="panel__head">
      <span class="panel__name">${loc.name}</span>
      <span class="panel__now" id="panel-now"></span>
      <span class="panel__rain">${rainInfo}</span>
      <button id="back-to-day" type="button">
        <span class="label-wide">Zpět na denní přehled</span><span class="label-narrow">Zpět</span>
      </button>
    </div>
    <input type="range" id="hour-slider" min="0" max="23" step="1" value="${state.hour}"
           aria-label="Hodina">
    <div class="hourbars" id="hourbars">${bars}</div>
  `;
  panel.classList.add('visible');

  el('hour-slider').addEventListener('input', (event) => {
    state.hour = Number(event.target.value);
    updateHourUi();
    renderMarkers();
  });

  el('hourbars').addEventListener('click', (event) => {
    const bar = event.target.closest('.hourbar');
    if (!bar) return;
    state.hour = Number(bar.dataset.hour);
    el('hour-slider').value = String(state.hour);
    updateHourUi();
    renderMarkers();
  });

  el('back-to-day').addEventListener('click', exitHourMode);
  updateHourUi();
}

// Lehká aktualizace při posunu hodiny — přebarví hlavičku a zvýraznění sloupce.
function updateHourUi() {
  const loc = LOCATIONS.find((l) => l.id === state.selectedId);
  const series = loc && state.data.get(loc.id);
  if (!series) return;

  const now = hourValue(series, currentDate(), state.hour);
  const hh = String(state.hour).padStart(2, '0');
  el('panel-now').innerHTML = now.hasData
    ? `${iconSvg(iconKeyFor(now.weatherCode, isNight(state.hour)))}
       <span>${hh}:00 · ${now.temperature}° · ${labelFor(now.weatherCode)}${now.precipitation ? ` · ${now.precipitation} mm` : ''}</span>`
    : `<span>${hh}:00 · bez dat</span>`;

  for (const bar of document.querySelectorAll('.hourbar')) {
    bar.classList.toggle('hourbar--active', Number(bar.dataset.hour) === state.hour);
  }
}

/* ---------- vyhledávání ---------- */

const search = { results: [], active: -1 };

function closeSearch() {
  search.results = [];
  search.active = -1;
  el('search-results').classList.remove('visible');
  el('search-input').setAttribute('aria-expanded', 'false');
}

function renderSearchResults() {
  const box = el('search-results');

  if (search.results.length === 0) {
    box.innerHTML = '<li class="search__empty">Nic nenalezeno</li>';
    box.classList.add('visible');
    el('search-input').setAttribute('aria-expanded', 'true');
    return;
  }

  box.innerHTML = search.results.map((loc, i) => `
    <li class="search__item" role="option" data-id="${loc.id}"
        aria-selected="${i === search.active}">
      <span>${loc.name}</span>
      <span class="search__tier">${loc.tier === 1 ? 'krajské' : 'okresní'}</span>
    </li>`).join('');
  box.classList.add('visible');
  el('search-input').setAttribute('aria-expanded', 'true');
}

// Přiblíží na lokalitu tak, aby byl její marker při daném tieru vůbec vykreslený,
// a rovnou otevře její panel.
function goToLocation(id) {
  const loc = LOCATIONS.find((l) => l.id === id);
  if (!loc) return;

  const needed = Math.max(map.getZoom(), minZoomForTier(loc.tier), 9);
  map.flyTo([loc.lat, loc.lon], needed, { duration: 0.8 });

  el('search-input').value = '';
  closeSearch();
  el('search-input').blur();
  selectLocation(loc.id);
}

function moveSearchSelection(delta) {
  if (search.results.length === 0) return;
  const count = search.results.length;
  search.active = (search.active + delta + count) % count;
  renderSearchResults();
}

el('search-input').addEventListener('input', (event) => {
  const query = event.target.value;
  if (query.trim() === '') { closeSearch(); return; }
  search.results = searchLocations(query);
  search.active = search.results.length > 0 ? 0 : -1;
  renderSearchResults();
});

el('search-input').addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowDown': event.preventDefault(); moveSearchSelection(1); break;
    case 'ArrowUp': event.preventDefault(); moveSearchSelection(-1); break;
    case 'Enter':
      event.preventDefault();
      if (search.active >= 0) goToLocation(search.results[search.active].id);
      break;
    case 'Escape': event.target.value = ''; closeSearch(); event.target.blur(); break;
    default: break;
  }
});

el('search-results').addEventListener('mousedown', (event) => {
  // mousedown, ne click — blur inputu by stihl seznam zavřít dřív.
  const item = event.target.closest('.search__item');
  if (item) { event.preventDefault(); goToLocation(item.dataset.id); }
});

el('search-input').addEventListener('blur', () => setTimeout(closeSearch, 120));

/* ---------- hlavička ---------- */

function renderDayButtons() {
  const host = el('days');
  host.innerHTML = '';
  state.dates.forEach((date, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = DAY_LABELS[i] ?? date;
    button.setAttribute('aria-pressed', String(i === state.dayIndex));
    button.addEventListener('click', () => {
      state.dayIndex = i;
      renderDayButtons();
      renderMarkers();
      if (state.selectedId) renderPanel();
    });
    host.append(button);
  });
}

function setUpdated(timestamp) {
  const t = new Date(timestamp);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  el('updated').textContent = `aktualizováno ${hh}:${mm}`;
}

function showBanner(text) {
  el('banner-text').textContent = text;
  el('banner').classList.add('visible');
}

function hideBanner() {
  el('banner').classList.remove('visible');
}

/* ---------- cache ---------- */

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) return null;
    return { ...parsed, stale: Date.now() - parsed.savedAt > CACHE_TTL_MS };
  } catch {
    return null; // poškozený nebo nedostupný localStorage není důvod aplikaci shodit
  }
}

function writeCache(entries) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), entries }));
  } catch {
    // Překročená kvóta — cache je jen zrychlení, běž dál.
  }
}

/* ---------- načtení dat ---------- */

function applyEntries(entries, savedAt) {
  state.data = new Map(entries);
  const first = state.data.values().next().value;
  if (!first) return false;

  state.dates = forecastDates(first).slice(0, 3);

  const models = new Set();
  for (const series of state.data.values()) {
    for (const model of usedModels(series)) models.add(model);
  }
  el('model-badge').textContent = models.has('icon_eu')
    ? 'ICON-D2 + ICON-EU'
    : 'ICON-D2 · 2 km';
  el('model-badge').title = models.has('icon_eu')
    ? 'Část hodin nepokrývá ICON-D2 (2 km), doplněno modelem ICON-EU (7 km).'
    : 'Všechna data z modelu ICON-D2 (DWD, rozlišení 2 km).';

  setUpdated(savedAt);
  renderDayButtons();
  renderMarkers();
  return true;
}

async function load() {
  const cached = readCache();
  if (cached && applyEntries(cached.entries, cached.savedAt)) {
    hideBanner();
    if (!cached.stale) return; // čerstvá cache, síť není potřeba
  }

  try {
    const batches = chunk(LOCATIONS, BATCH_SIZE);
    const results = await Promise.allSettled(batches.map((batch) => fetchForecast(batch)));

    const entries = [];
    let failed = 0;
    results.forEach((result, bi) => {
      if (result.status !== 'fulfilled') {
        failed += batches[bi].length;
        return;
      }
      result.value.forEach((response, i) => {
        entries.push([batches[bi][i].id, mergeModels(response.hourly)]);
      });
    });

    if (entries.length === 0) throw new Error('žádná dávka neuspěla');

    const savedAt = Date.now();
    writeCache(entries);
    applyEntries(entries, savedAt);

    if (failed > 0) {
      showBanner(`Načteno ${entries.length} z ${LOCATIONS.length} lokalit.`);
    } else {
      hideBanner();
    }
  } catch (error) {
    console.error(error);
    showBanner(cached
      ? 'Nová data se nepodařilo načíst, zobrazená předpověď může být zastaralá.'
      : 'Data se nepodařilo načíst.');
  }
}

el('retry').addEventListener('click', () => {
  hideBanner();
  load();
});

load();
