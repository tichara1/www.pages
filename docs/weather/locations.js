// Statický seznam lokalit. `tier` řídí, od jakého zoomu se bod kreslí.
// Souřadnice pocházejí z Open-Meteo geocoding API, zaokrouhlené na 4 desetinná místa.

const TIER_MIN_ZOOM = { 1: 0, 2: 8, 3: 9 };

export const LOCATIONS = [
  // --- tier 1: Praha, krajská města a výslovně vyžádané lokality ---
  { id: 'praha', name: 'Praha', lat: 50.0880, lon: 14.4208, tier: 1 },
  { id: 'brno', name: 'Brno', lat: 49.1952, lon: 16.6080, tier: 1 },
  { id: 'ostrava', name: 'Ostrava', lat: 49.8347, lon: 18.2820, tier: 1 },
  { id: 'plzen', name: 'Plzeň', lat: 49.7475, lon: 13.3776, tier: 1 },
  { id: 'liberec', name: 'Liberec', lat: 50.7671, lon: 15.0562, tier: 1 },
  { id: 'olomouc', name: 'Olomouc', lat: 49.5955, lon: 17.2518, tier: 1 },
  { id: 'ceske-budejovice', name: 'České Budějovice', lat: 48.9745, lon: 14.4743, tier: 1 },
  { id: 'hradec-kralove', name: 'Hradec Králové', lat: 50.2092, lon: 15.8328, tier: 1 },
  { id: 'usti-nad-labem', name: 'Ústí nad Labem', lat: 50.6607, lon: 14.0323, tier: 1 },
  { id: 'pardubice', name: 'Pardubice', lat: 50.0408, lon: 15.7766, tier: 1 },
  { id: 'zlin', name: 'Zlín', lat: 49.2264, lon: 17.6706, tier: 1 },
  { id: 'jihlava', name: 'Jihlava', lat: 49.3961, lon: 15.5912, tier: 1 },
  { id: 'karlovy-vary', name: 'Karlovy Vary', lat: 50.2327, lon: 12.8712, tier: 1 },
  { id: 'kladno', name: 'Kladno', lat: 50.1473, lon: 14.1029, tier: 1 },
  { id: 'cheb', name: 'Cheb', lat: 50.0796, lon: 12.3739, tier: 1 },
  { id: 'dretovice', name: 'Dřetovice', lat: 50.1827, lon: 14.2103, tier: 1 },

  // --- tier 2: větší okresní města ---
  { id: 'mlada-boleslav', name: 'Mladá Boleslav', lat: 50.4113, lon: 14.9032, tier: 2 },
  { id: 'pribram', name: 'Příbram', lat: 49.6899, lon: 14.0104, tier: 2 },
  { id: 'tabor', name: 'Tábor', lat: 49.4144, lon: 14.6578, tier: 2 },
  { id: 'trutnov', name: 'Trutnov', lat: 50.5610, lon: 15.9127, tier: 2 },
  { id: 'trebic', name: 'Třebíč', lat: 49.2149, lon: 15.8817, tier: 2 },
  { id: 'znojmo', name: 'Znojmo', lat: 48.8555, lon: 16.0488, tier: 2 },
  { id: 'chomutov', name: 'Chomutov', lat: 50.4605, lon: 13.4178, tier: 2 },
  { id: 'most', name: 'Most', lat: 50.5030, lon: 13.6362, tier: 2 },
  { id: 'teplice', name: 'Teplice', lat: 50.6404, lon: 13.8245, tier: 2 },
  { id: 'decin', name: 'Děčín', lat: 50.7822, lon: 14.2148, tier: 2 },
  { id: 'ceska-lipa', name: 'Česká Lípa', lat: 50.6855, lon: 14.5376, tier: 2 },
  { id: 'jablonec-nad-nisou', name: 'Jablonec nad Nisou', lat: 50.7243, lon: 15.1711, tier: 2 },
  { id: 'frydek-mistek', name: 'Frýdek-Místek', lat: 49.6833, lon: 18.3500, tier: 2 },
  { id: 'karvina', name: 'Karviná', lat: 49.8445, lon: 18.4917, tier: 2 },
  { id: 'opava', name: 'Opava', lat: 49.9387, lon: 17.9026, tier: 2 },
  { id: 'havirov', name: 'Havířov', lat: 49.7798, lon: 18.4369, tier: 2 },
  { id: 'prostejov', name: 'Prostějov', lat: 49.4719, lon: 17.1118, tier: 2 },
  { id: 'prerov', name: 'Přerov', lat: 49.4551, lon: 17.4509, tier: 2 },
  { id: 'sumperk', name: 'Šumperk', lat: 49.9653, lon: 16.9706, tier: 2 },
  { id: 'vsetin', name: 'Vsetín', lat: 49.3387, lon: 17.9962, tier: 2 },
  { id: 'uherske-hradiste', name: 'Uherské Hradiště', lat: 49.0697, lon: 17.4597, tier: 2 },
  { id: 'kromeriz', name: 'Kroměříž', lat: 49.2978, lon: 17.3931, tier: 2 },
  { id: 'breclav', name: 'Břeclav', lat: 48.7590, lon: 16.8820, tier: 2 },
  { id: 'hodonin', name: 'Hodonín', lat: 48.8489, lon: 17.1324, tier: 2 },
  { id: 'vyskov', name: 'Vyškov', lat: 49.2775, lon: 16.9990, tier: 2 },
  { id: 'blansko', name: 'Blansko', lat: 49.3630, lon: 16.6445, tier: 2 },
  { id: 'klatovy', name: 'Klatovy', lat: 49.3955, lon: 13.2950, tier: 2 },
  { id: 'sokolov', name: 'Sokolov', lat: 50.1813, lon: 12.6401, tier: 2 },
  { id: 'pisek', name: 'Písek', lat: 49.3088, lon: 14.1475, tier: 2 },
  { id: 'strakonice', name: 'Strakonice', lat: 49.2614, lon: 13.9024, tier: 2 },
  { id: 'nachod', name: 'Náchod', lat: 50.4167, lon: 16.1629, tier: 2 },
  { id: 'chrudim', name: 'Chrudim', lat: 49.9511, lon: 15.7956, tier: 2 },

  // --- tier 3: zbývající okresní města ---
  { id: 'benesov', name: 'Benešov', lat: 49.7816, lon: 14.6870, tier: 3 },
  { id: 'beroun', name: 'Beroun', lat: 49.9638, lon: 14.0720, tier: 3 },
  { id: 'kolin', name: 'Kolín', lat: 50.0281, lon: 15.1998, tier: 3 },
  { id: 'kutna-hora', name: 'Kutná Hora', lat: 49.9484, lon: 15.2682, tier: 3 },
  { id: 'melnik', name: 'Mělník', lat: 50.3505, lon: 14.4741, tier: 3 },
  { id: 'nymburk', name: 'Nymburk', lat: 50.1861, lon: 15.0417, tier: 3 },
  { id: 'rakovnik', name: 'Rakovník', lat: 50.1037, lon: 13.7334, tier: 3 },
  { id: 'cesky-krumlov', name: 'Český Krumlov', lat: 48.8109, lon: 14.3152, tier: 3 },
  { id: 'jindrichuv-hradec', name: 'Jindřichův Hradec', lat: 49.1440, lon: 15.0030, tier: 3 },
  { id: 'prachatice', name: 'Prachatice', lat: 49.0129, lon: 13.9975, tier: 3 },
  { id: 'domazlice', name: 'Domažlice', lat: 49.4405, lon: 12.9298, tier: 3 },
  { id: 'rokycany', name: 'Rokycany', lat: 49.7427, lon: 13.5946, tier: 3 },
  { id: 'tachov', name: 'Tachov', lat: 49.7953, lon: 12.6336, tier: 3 },
  { id: 'litomerice', name: 'Litoměřice', lat: 50.5335, lon: 14.1318, tier: 3 },
  { id: 'louny', name: 'Louny', lat: 50.3570, lon: 13.7967, tier: 3 },
  { id: 'semily', name: 'Semily', lat: 50.6019, lon: 15.3355, tier: 3 },
  { id: 'jicin', name: 'Jičín', lat: 50.4372, lon: 15.3516, tier: 3 },
  { id: 'rychnov-nad-kneznou', name: 'Rychnov nad Kněžnou', lat: 50.1628, lon: 16.2749, tier: 3 },
  { id: 'svitavy', name: 'Svitavy', lat: 49.7559, lon: 16.4683, tier: 3 },
  { id: 'usti-nad-orlici', name: 'Ústí nad Orlicí', lat: 49.9739, lon: 16.3936, tier: 3 },
  { id: 'havlickuv-brod', name: 'Havlíčkův Brod', lat: 49.6069, lon: 15.5794, tier: 3 },
  { id: 'pelhrimov', name: 'Pelhřimov', lat: 49.4313, lon: 15.2234, tier: 3 },
  { id: 'zdar-nad-sazavou', name: 'Žďár nad Sázavou', lat: 49.5626, lon: 15.9392, tier: 3 },
  { id: 'jesenik', name: 'Jeseník', lat: 50.2294, lon: 17.2046, tier: 3 },
  { id: 'bruntal', name: 'Bruntál', lat: 49.9884, lon: 17.4647, tier: 3 },
  { id: 'novy-jicin', name: 'Nový Jičín', lat: 49.5944, lon: 18.0103, tier: 3 },
];

export function minZoomForTier(tier) {
  return TIER_MIN_ZOOM[tier] ?? 9;
}

export function visibleAt(zoom) {
  return LOCATIONS.filter((l) => zoom >= minZoomForTier(l.tier));
}

// "Břeclav" i "breclav" i "BRECLAV" musí najít totéž — diakritika se při
// hledání zahazuje, aby šlo psát bez háčků.
const normalize = (text) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '');

// Shody od začátku názvu jsou relevantnější ("Brno" na dotaz "br" před "Příbram"),
// pak rozhoduje důležitost lokality a nakonec abeceda.
export function searchLocations(query, limit = 8) {
  const needle = normalize(query.trim());
  if (needle === '') return [];

  return LOCATIONS
    .map((loc) => ({ loc, at: normalize(loc.name).indexOf(needle) }))
    .filter((hit) => hit.at !== -1)
    .sort((a, b) => (a.at !== b.at ? a.at - b.at
      : a.loc.tier !== b.loc.tier ? a.loc.tier - b.loc.tier
        : a.loc.name.localeCompare(b.loc.name, 'cs')))
    .slice(0, limit)
    .map((hit) => hit.loc);
}
