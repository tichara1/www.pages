import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hideCollidingLabels } from '../labels.js';

// Pomocník: obdélník ze středu, šířky a výšky.
const box = (cx, cy, w, h) => ({
  left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2,
});

// Marker: bublina nahoře, popisek pod ní.
const item = (id, cx, cy, priority, labelWidth = 60) => ({
  id,
  priority,
  badge: box(cx, cy, 60, 30),
  label: box(cx, cy + 24, labelWidth, 14),
});

test('vzdálené popisky se neskrývají', () => {
  const hidden = hideCollidingLabels([item('a', 0, 0, 1), item('b', 500, 0, 2)]);
  assert.equal(hidden.size, 0);
});

test('při překryvu popisků zmizí ten s horší prioritou', () => {
  const hidden = hideCollidingLabels([item('dulezity', 0, 0, 1), item('vedlejsi', 20, 0, 2)]);
  assert.ok(hidden.has('vedlejsi'));
  assert.ok(!hidden.has('dulezity'));
});

test('na pořadí ve vstupu nezáleží, rozhoduje priorita', () => {
  const prvni = hideCollidingLabels([item('vedlejsi', 20, 0, 2), item('dulezity', 0, 0, 1)]);
  assert.ok(prvni.has('vedlejsi'));
  assert.ok(!prvni.has('dulezity'));
});

test('popisek se skryje i když koliduje s cizí bublinou', () => {
  // Bublina 'b' leží přesně tam, kde by byl popisek 'a'.
  const a = item('a', 0, 0, 2);
  const b = { id: 'b', priority: 1, badge: box(0, 24, 60, 30), label: box(0, 48, 60, 14) };
  const hidden = hideCollidingLabels([a, b]);
  assert.ok(hidden.has('a'), 'popisek a měl ustoupit bublině b');
});

test('vlastní bublina popisek neskrývá', () => {
  const hidden = hideCollidingLabels([item('sam', 0, 0, 1)]);
  assert.equal(hidden.size, 0);
});

test('skrytý popisek neblokuje místo dalším', () => {
  // a je nejdůležitější; b s ním koliduje a zmizí; c koliduje jen s b,
  // takže po jeho skrytí má volno a musí zůstat.
  const hidden = hideCollidingLabels([
    item('a', 0, 0, 1),
    item('b', 30, 0, 2),
    item('c', 70, 0, 3),
  ]);
  assert.ok(hidden.has('b'));
  assert.ok(!hidden.has('c'));
});

test('prázdný vstup vrací prázdný výsledek', () => {
  assert.equal(hideCollidingLabels([]).size, 0);
});

test('dotýkající se hrany se nepovažují za kolizi', () => {
  const a = { id: 'a', priority: 1, badge: box(0, 0, 10, 10), label: box(0, 20, 10, 10) };
  const b = { id: 'b', priority: 2, badge: box(100, 0, 10, 10), label: box(10, 20, 10, 10) };
  // popisky se dotýkají na x = 5, bez odstupu to není překryv
  assert.equal(hideCollidingLabels([a, b], 0).size, 0);
});

test('odstup zvětšuje nárok popisku na místo', () => {
  const a = { id: 'a', priority: 1, badge: box(0, 0, 10, 10), label: box(0, 20, 10, 10) };
  const b = { id: 'b', priority: 2, badge: box(100, 0, 10, 10), label: box(14, 20, 10, 10) };
  assert.equal(hideCollidingLabels([a, b], 0).size, 0);
  assert.ok(hideCollidingLabels([a, b], 5).has('b'));
});

test('položky bez popisku se ignorují', () => {
  const bezPopisku = { id: 'x', priority: 1, badge: box(0, 0, 60, 30), label: null };
  const hidden = hideCollidingLabels([bezPopisku, item('a', 0, 0, 2)]);
  assert.ok(!hidden.has('x'));
});
