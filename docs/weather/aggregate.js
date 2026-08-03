// Agregace hodinových řad. Časové řetězce se zpracovávají textově — jsou
// v lokálním čase bez zóny a new Date() by je posunul podle zóny prohlížeče.

import { severityOf } from './wmo.js';

export const DAY_START = 8;
export const DAY_END = 20; // včetně

// Váha hodiny v denním průměru teploty. Odpoledne rozhoduje, jak den vyzní,
// ráno a pozdní večer jen dokresluje.
function weightOf(hour) {
  if (hour >= 12 && hour < 16) return 3;
  if (hour >= 9 && hour < 12) return 2;
  if (hour >= 16 && hour < 18) return 1.5;
  return 1;
}

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
  let sumWeight = 0;
  let sumPrec = 0;

  for (const i of indexes) {
    const code = series.weatherCode[i];
    if (severityOf(code) > severityOf(worst)) worst = code;
    const weight = weightOf(hourOf(series.time[i]));
    sumTemp += series.temperature[i] * weight;
    sumWeight += weight;
    sumPrec += series.precipitation[i] ?? 0;
  }

  return {
    weatherCode: worst,
    temperature: Math.round(sumTemp / sumWeight),
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
