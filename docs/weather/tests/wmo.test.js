import { test } from 'node:test';
import assert from 'node:assert/strict';
import { severityOf, iconKeyFor, labelFor } from '../wmo.js';

test('bouřka je závažnější než déšť, déšť než jasno', () => {
  assert.ok(severityOf(95) > severityOf(61));
  assert.ok(severityOf(61) > severityOf(0));
});

test('bouřka s kroupami je nejzávažnější jev', () => {
  assert.ok(severityOf(99) > severityOf(95));
});

test('neznámý kód má nulovou závažnost', () => {
  assert.equal(severityOf(1234), 0);
});

test('iconKeyFor vrací noční variantu jen pro jasné oblohy', () => {
  assert.equal(iconKeyFor(0, false), 'clear');
  assert.equal(iconKeyFor(0, true), 'clear-night');
  assert.equal(iconKeyFor(2, true), 'partly-night');
  assert.equal(iconKeyFor(61, true), 'rain');
});

test('všechny kódy jedné skupiny sdílejí ikonu', () => {
  assert.equal(iconKeyFor(45, false), iconKeyFor(48, false));
  assert.equal(iconKeyFor(95, false), iconKeyFor(99, false));
});

test('labelFor vrací český název', () => {
  assert.equal(labelFor(0), 'Jasno');
  assert.equal(labelFor(95), 'Bouřka');
});
