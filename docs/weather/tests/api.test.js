import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunk, buildForecastUrl, mergeModels, usedModels } from '../api.js';

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

// Tři hodiny: první má data v obou modelech, druhá jen v ICON-EU, třetí nikde.
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

test('mergeModels zvládne prázdnou odpověď', () => {
  const s = mergeModels({});
  assert.deepEqual(s.time, []);
  assert.deepEqual(s.weatherCode, []);
  assert.deepEqual(usedModels(s), []);
});

test('mergeModels nepovažuje nulové hodnoty za chybějící', () => {
  const s = mergeModels({
    time: ['2026-07-31T00:00'],
    weather_code_icon_d2: [0],
    temperature_2m_icon_d2: [0],
    precipitation_icon_d2: [0],
    weather_code_icon_eu: [61],
    temperature_2m_icon_eu: [5],
    precipitation_icon_eu: [3],
  });
  assert.equal(s.source[0], 'icon_d2');
  assert.equal(s.temperature[0], 0);
});
