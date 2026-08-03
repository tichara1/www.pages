import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forecastDates, dayAggregate, hourValue, hoursOfDay } from '../aggregate.js';

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

test('dayAggregate počítá vážený průměr teploty jen z hodin 8 až 20', () => {
  const agg = dayAggregate(buildDay('2026-07-31'), '2026-07-31');
  // Vážený součet = 8*1 + (9+10+11)*2 + (12+..+15)*3 + (16+17)*1.5 + (18+19+20)*1 = 336.5
  // Součet vah = 1 + 6 + 12 + 3 + 3 = 25 → 13.46
  assert.equal(agg.temperature, 13);
});

test('dayAggregate dá odpoledni větší váhu než dopoledni', () => {
  const temp = Array(24).fill(10);
  for (let h = 12; h < 16; h += 1) temp[h] = 20;
  const agg = dayAggregate(buildDay('2026-07-31', { temp }), '2026-07-31');
  // Prostý průměr by byl 13, vážený = (20*12 + 10*13) / 25 = 14.8
  assert.equal(agg.temperature, 15);
});

test('dayAggregate dá podvečeru 16 až 18 větší váhu než pozdnímu večeru', () => {
  const podvecer = Array(24).fill(0);
  podvecer[16] = 100;
  podvecer[17] = 100;
  const vecer = Array(24).fill(0);
  vecer[19] = 100;
  vecer[20] = 100;

  assert.equal(dayAggregate(buildDay('2026-07-31', { temp: podvecer }), '2026-07-31').temperature, 12);
  assert.equal(dayAggregate(buildDay('2026-07-31', { temp: vecer }), '2026-07-31').temperature, 8);
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

test('dayAggregate zahrnuje krajní hodiny okna 8 a 20', () => {
  const code = Array(24).fill(0);
  code[20] = 95;
  assert.equal(dayAggregate(buildDay('2026-07-31', { code }), '2026-07-31').weatherCode, 95);

  const code2 = Array(24).fill(0);
  code2[8] = 95;
  assert.equal(dayAggregate(buildDay('2026-07-31', { code: code2 }), '2026-07-31').weatherCode, 95);
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
  // Zbývají hodiny 8..14: (8*1 + (9+10+11)*2 + (12+13+14)*3) / 16 = 11.56
  assert.equal(agg.temperature, 12);
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

test('dayAggregate nepoplete dny se stejnými hodinami', () => {
  const den1 = buildDay('2026-07-31');
  const den2 = buildDay('2026-08-01', { temp: Array(24).fill(30) });
  const spojeno = {
    time: [...den1.time, ...den2.time],
    weatherCode: [...den1.weatherCode, ...den2.weatherCode],
    temperature: [...den1.temperature, ...den2.temperature],
    precipitation: [...den1.precipitation, ...den2.precipitation],
    source: [...den1.source, ...den2.source],
  };
  assert.equal(dayAggregate(spojeno, '2026-07-31').temperature, 13);
  assert.equal(dayAggregate(spojeno, '2026-08-01').temperature, 30);
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

test('hoursOfDay označí chybějící hodiny nullem', () => {
  const s = buildDay('2026-07-31');
  s.weatherCode[5] = null;
  s.temperature[5] = null;
  const rows = hoursOfDay(s, '2026-07-31');
  assert.equal(rows[5].weatherCode, null);
  assert.equal(rows[6].weatherCode, 0);
});
