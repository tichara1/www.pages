const test = require('node:test');
const assert = require('node:assert/strict');

const data = require('../data.js');
const logic = require('../logic.js');

const RATE = data.COMMISSION_RATE;

// Malá ručně psaná kniha, ať jdou tvrdit konkrétní čísla.
const SAMPLE = [
  { week: 1, trainerId: 1, activity: 'HYROX', client: 'Anna', price: 300 },
  { week: 1, trainerId: 1, activity: 'HYROX', client: 'Bob', price: 300 },
  { week: 2, trainerId: 2, activity: 'Jóga', client: 'Anna', price: 200 },
  { week: 4, trainerId: 2, activity: 'HYROX', client: 'Cyril', price: 100 }
];

test('totals sečte obrat a spočítá provizi sazbou', () => {
  const t = logic.totals(SAMPLE, 0.15);

  assert.equal(t.sessions, 4);
  assert.equal(t.gmv, 900);
  assert.equal(t.commission, 135);
});

test('totals na prázdné knize vrátí nuly', () => {
  assert.deepEqual(logic.totals([], 0.15), { sessions: 0, gmv: 0, commission: 0 });
});

test('agregace podle trenéra použije jméno z číselníku', () => {
  const rows = logic.aggregate(SAMPLE, 'trainer', 0.15, data.TRAINERS);

  assert.deepEqual(rows.map((r) => [r.label, r.sessions, r.gmv]), [
    ['Eliška Horáková', 2, 600],
    ['David Šimek', 2, 300]
  ]);
});

test('agregace podle aktivity slučuje napříč trenéry', () => {
  const rows = logic.aggregate(SAMPLE, 'activity', 0.15, data.TRAINERS);

  assert.deepEqual(rows.map((r) => [r.label, r.sessions, r.gmv]), [
    ['HYROX', 3, 700],
    ['Jóga', 1, 200]
  ]);
});

test('agregace podle klienta slučuje napříč trenéry i aktivitami', () => {
  const rows = logic.aggregate(SAMPLE, 'client', 0.15, data.TRAINERS);

  assert.deepEqual(rows.map((r) => [r.label, r.sessions, r.gmv]), [
    ['Anna', 2, 500],
    ['Bob', 1, 300],
    ['Cyril', 1, 100]
  ]);
});

test('řádky agregace jdou sestupně podle obratu', () => {
  const gmvs = logic.aggregate(data.LEDGER, 'trainer', RATE, data.TRAINERS).map((r) => r.gmv);

  assert.deepEqual(gmvs, gmvs.slice().sort((a, b) => b - a));
});

test('neznámá dimenze skončí chybou', () => {
  assert.throws(() => logic.aggregate(SAMPLE, 'venue', 0.15, data.TRAINERS), /Neznámá dimenze/);
});

test('všechny tři pohledy sedí na stejný celkový obrat', () => {
  const expected = logic.totals(data.LEDGER, RATE).gmv;

  for (const dimension of ['trainer', 'activity', 'client']) {
    const sum = logic
      .aggregate(data.LEDGER, dimension, RATE, data.TRAINERS)
      .reduce((acc, r) => acc + r.gmv, 0);

    assert.equal(sum, expected, `pohled ${dimension} nesedí na celek`);
  }
});

test('týdenní rozpad vrátí řádek i pro týden bez lekce', () => {
  const weeks = logic.weekly(SAMPLE, 0.15, 4);

  assert.deepEqual(weeks.map((w) => w.gmv), [600, 200, 0, 100]);
  assert.deepEqual(weeks.map((w) => w.week), [1, 2, 3, 4]);
});

test('týdenní rozpad sedí na celkový obrat', () => {
  const sum = logic.weekly(data.LEDGER, RATE, data.WEEKS).reduce((acc, w) => acc + w.gmv, 0);

  assert.equal(sum, logic.totals(data.LEDGER, RATE).gmv);
});

test('generovaná data mají uvěřitelný rozsah', () => {
  const t = logic.totals(data.LEDGER, RATE);

  assert.ok(t.sessions > 1000 && t.sessions < 5000, `účastí: ${t.sessions}`);
  assert.ok(t.gmv > 300000 && t.gmv < 1000000, `obrat: ${t.gmv}`);
});
