// Inline SVG symboly počasí. Vše řetězce, aby šly vložit do L.divIcon.

import { iconKeyFor, categoryOf } from './wmo.js';

const SUN = '<circle cx="12" cy="12" r="5" fill="#f6b73c"/><g stroke="#f6b73c" stroke-width="2" stroke-linecap="round"><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M19.8 4.2l-2.1 2.1M6.3 17.7l-2.1 2.1"/></g>';
const MOON = '<path d="M17 13.5A7 7 0 0 1 9.5 6a6 6 0 1 0 7.5 7.5z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.6"/>';
const CLOUD = '<path d="M7.5 19h9.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7.5 19z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.6"/>';
const CLOUD_DARK = '<path d="M7.5 19h9.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.3A3.4 3.4 0 0 0 7.5 19z" fill="#94a3b8" stroke="#64748b" stroke-width="0.6"/>';

const drops = (xs) => xs.map((x) => `<path d="M${x} 18.5l-1.2 2.8" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>`).join('');
// Sníh jako plné puntíky. Vločky s rameny se při 34 px slijí do mřížky,
// kdežto puntík vs. šikmá čárka deště je rozpoznatelný i v malém.
const flakes = (xs) => xs.map((x) => `<circle cx="${x}" cy="20.4" r="1.35" fill="#3b82f6"/>`).join('');

const SHAPES = {
  clear: SUN,
  'clear-night': MOON,
  'mostly-clear': `<circle cx="9" cy="8.5" r="4.2" fill="#f6b73c"/>${CLOUD}`,
  'mostly-clear-night': `<path d="M13.5 9.5A5 5 0 0 1 8.5 4.5 4.3 4.3 0 1 0 13.5 9.5z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.6"/>${CLOUD}`,
  partly: `<circle cx="8.5" cy="7.5" r="4" fill="#f6b73c"/>${CLOUD_DARK}`,
  'partly-night': `<path d="M13 9A5 5 0 0 1 8 4a4.3 4.3 0 1 0 5 5z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.6"/>${CLOUD_DARK}`,
  overcast: `<path d="M5 16h9a3.4 3.4 0 0 0 .3-6.8A4.7 4.7 0 0 0 5.2 10 2.9 2.9 0 0 0 5 16z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="0.6"/>${CLOUD_DARK}`,
  fog: `${CLOUD}<g stroke="#94a3b8" stroke-width="1.7" stroke-linecap="round"><path d="M4.5 21h6M13 21h6.5"/></g>`,
  drizzle: `${CLOUD}${drops([10, 14])}`,
  rain: `${CLOUD}${drops([9, 12.5, 16])}`,
  showers: `<circle cx="8" cy="6.5" r="3.4" fill="#f6b73c"/>${CLOUD}${drops([11, 15])}`,
  snow: `${CLOUD}${flakes([9, 12.5, 16])}`,
  thunder: `${CLOUD_DARK}<path d="M12.8 16.6l-3.3 4.2h2.6l-1 3.1 4.2-4.7h-2.6l1.4-2.6z" fill="#facc15" stroke="#ca8a04" stroke-width="0.5"/>`,
  unknown: '<circle cx="12" cy="12" r="8" fill="#cbd5e1"/><path d="M12 16.2v.01M12 8a2 2 0 0 1 1 3.7c-.6.4-1 .8-1 1.3" stroke="#475569" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
};

export const ICON_KEYS = Object.keys(SHAPES);

export function iconSvg(key) {
  const shape = SHAPES[key] ?? SHAPES.unknown;
  return `<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">${shape}</svg>`;
}

// Marker = barevná bublina (podklad nese kategorii počasí, ikona její tvar)
// a pod ní název lokality. Třída marker--<kategorie> jen vybírá barvu z CSS.
export function markerHtml({ code, temperature, isNight, hasData, name = '', selected = false }) {
  const label = name ? `<span class="marker__name">${name}</span>` : '';
  const flags = selected ? ' marker--selected' : '';

  if (!hasData) {
    return `<div class="marker marker--nodata${flags}">`
      + `<span class="marker__badge">${iconSvg('unknown')}<span class="marker__temp">–</span></span>`
      + `${label}</div>`;
  }

  const svg = iconSvg(iconKeyFor(code, isNight));
  return `<div class="marker marker--${categoryOf(code)}${flags}">`
    + `<span class="marker__badge">${svg}<span class="marker__temp">${temperature}°</span></span>`
    + `${label}</div>`;
}
