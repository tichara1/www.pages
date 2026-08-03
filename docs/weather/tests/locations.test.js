import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LOCATIONS, minZoomForTier, visibleAt, searchLocations } from '../locations.js';

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

test('žádné dvě lokality nesdílejí souřadnice', () => {
  const keys = LOCATIONS.map((l) => `${l.lat},${l.lon}`);
  assert.equal(new Set(keys).size, keys.length);
});

test('každá lokalita má platný tier a název', () => {
  for (const l of LOCATIONS) {
    assert.ok([1, 2, 3].includes(l.tier), `${l.name} má neplatný tier ${l.tier}`);
    assert.ok(l.name.length > 0);
    assert.match(l.id, /^[a-z0-9-]+$/, `${l.name} má nevhodné id "${l.id}"`);
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

test('tier 1 je vidět i na nejmenším zoomu mapy', () => {
  const visible = visibleAt(6); // minZoom mapy
  assert.equal(visible.length, LOCATIONS.filter((l) => l.tier === 1).length);
});

test('hledání najde město podle začátku názvu', () => {
  assert.equal(searchLocations('praha')[0].name, 'Praha');
  assert.equal(searchLocations('brn')[0].name, 'Brno');
});

test('hledání ignoruje diakritiku i velikost písmen', () => {
  assert.equal(searchLocations('breclav')[0].name, 'Břeclav');
  assert.equal(searchLocations('BŘECLAV')[0].name, 'Břeclav');
  assert.equal(searchLocations('dretovice')[0].name, 'Dřetovice');
  assert.equal(searchLocations('Dřet')[0].name, 'Dřetovice');
});

test('hledání najde i podle části uprostřed názvu', () => {
  const names = searchLocations('hrad').map((l) => l.name);
  assert.ok(names.includes('Hradec Králové'));
  assert.ok(names.includes('Uherské Hradiště'));
});

test('shoda od začátku názvu je před shodou uvnitř', () => {
  const results = searchLocations('brno');
  assert.equal(results[0].name, 'Brno');
});

test('prázdný dotaz nevrací nic', () => {
  assert.deepEqual(searchLocations(''), []);
  assert.deepEqual(searchLocations('   '), []);
});

test('neznámý dotaz nevrací nic', () => {
  assert.deepEqual(searchLocations('kodaň'), []);
});

test('hledání respektuje limit', () => {
  assert.ok(searchLocations('a', 3).length <= 3);
  assert.ok(searchLocations('a', 100).length <= 100);
});

test('při stejné shodě mají přednost důležitější lokality', () => {
  // "k" je uvnitř i na začátku mnoha názvů; první musí být tier 1.
  const [first] = searchLocations('k');
  assert.equal(first.tier, 1);
});
