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

// Barevná kategorie markeru. Hrubší dělení než ikony — jde o to, aby se dal
// typ počasí přečíst z barvy dřív, než oko rozezná tvar ikony.
const CATEGORIES = new Map([
  [0, 'clear'], [1, 'clear'],
  [2, 'partly'], [3, 'cloudy'],
  [45, 'fog'], [48, 'fog'],
  [51, 'drizzle'], [53, 'drizzle'], [55, 'drizzle'], [56, 'drizzle'], [57, 'drizzle'],
  [61, 'rain'], [63, 'rain'], [65, 'rain'], [66, 'rain'], [67, 'rain'],
  [80, 'showers'], [81, 'showers'], [82, 'showers'],
  [71, 'snow'], [73, 'snow'], [75, 'snow'], [77, 'snow'], [85, 'snow'], [86, 'snow'],
  [95, 'storm'], [96, 'storm'], [99, 'storm'],
]);

export const CATEGORY_KEYS = ['clear', 'partly', 'cloudy', 'fog', 'drizzle', 'showers', 'rain', 'snow', 'storm', 'unknown'];

export function categoryOf(code) {
  return CATEGORIES.get(code) ?? 'unknown';
}

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
