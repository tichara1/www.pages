const test = require('node:test');
const assert = require('node:assert/strict');

const data = require('../data.js');
const logic = require('../logic.js');

const ids = (rows) => rows.map((r) => r.trainer.id);
const filter = (f) => logic.filterTrainers(data.TRAINERS, f);

test('bez filtrů vrátí všechny trenéry', () => {
  const rows = filter({ locality: 'all', activity: null, venues: [] });

  assert.equal(rows.length, data.TRAINERS.length);
});

test('chybějící pole ve filtru znamenají "nezáleží"', () => {
  const rows = filter({});

  assert.equal(rows.length, data.TRAINERS.length);
});

test('lokalita zúží výběr na danou městskou část', () => {
  const rows = filter({ locality: 'p6' });

  assert.deepEqual(ids(rows), [7, 6]);
});

test('aktivita najde trenéry napříč Prahou', () => {
  const rows = filter({ locality: 'all', activity: 'Běh' });

  assert.deepEqual(ids(rows), [10, 4]);
});

test('typ prostoru filtruje podle lekcí, ne podle trenéra', () => {
  const rows = filter({ locality: 'all', venues: ['outdoor'] });

  assert.deepEqual(ids(rows), [3, 6, 9, 4]);
});

test('lokalita a aktivita se kombinují', () => {
  const rows = filter({ locality: 'p6', activity: 'Jóga' });

  assert.deepEqual(ids(rows), [7]);
});

test('aktivita a prostor se kombinují', () => {
  const rows = filter({ locality: 'all', activity: 'HYROX', venues: ['oval'] });

  assert.deepEqual(ids(rows), [1]);
});

test('víc vybraných prostorů se chová jako "nebo"', () => {
  const outdoor = ids(filter({ venues: ['outdoor'] }));
  const oval = ids(filter({ venues: ['oval'] }));
  const both = ids(filter({ venues: ['outdoor', 'oval'] }));

  assert.deepEqual(both.slice().sort(), [...new Set([...outdoor, ...oval])].sort());
});

test('kombinace bez jediné lekce vrátí prázdný seznam', () => {
  const rows = filter({ locality: 'all', activity: 'Fyzio', venues: ['oval'] });

  assert.deepEqual(rows, []);
});

test('trenérovi zůstanou jen lekce, které prošly filtrem', () => {
  const rows = filter({ locality: 'p8', activity: 'HYROX' });

  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].lessons.map((l) => l.id), ['e1', 'e2']);
  assert.equal(rows[0].trainer.lessons.length, 3, 'původní data se nemodifikují');
});

test('řadí se podle hodnocení, při shodě podle počtu recenzí', () => {
  const rows = filter({ locality: 'all' });
  const ratings = rows.map((r) => r.trainer.rating);

  assert.deepEqual(ratings, ratings.slice().sort((a, b) => b - a));
});
