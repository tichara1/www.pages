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

const present = (value) => value !== null && value !== undefined;

// Pro každou hodinu vybere první model, který má kompletní data.
// Všechny veličiny dané hodiny pocházejí ze stejného modelu, aby teplota
// neodpovídala jinému modelu než ikona.
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
    const model = MODELS.find((m) => present(hourly[`weather_code_${m}`]?.[i])
      && present(hourly[`temperature_2m_${m}`]?.[i]));

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
