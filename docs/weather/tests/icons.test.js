import { test } from 'node:test';
import assert from 'node:assert/strict';
import { iconSvg, markerHtml, ICON_KEYS } from '../icons.js';
import { iconKeyFor, categoryOf, CATEGORY_KEYS } from '../wmo.js';

test('každý klíč ikony má neprázdné SVG', () => {
  for (const key of ICON_KEYS) {
    const svg = iconSvg(key);
    assert.ok(svg.startsWith('<svg'), `${key} nevrací SVG`);
    assert.ok(svg.includes('viewBox="0 0 24 24"'), `${key} nemá očekávaný viewBox`);
    assert.ok(svg.endsWith('</svg>'), `${key} má neuzavřené SVG`);
  }
});

test('všechny WMO kódy se mapují na existující ikonu', () => {
  const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67,
    71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
  for (const code of codes) {
    for (const night of [false, true]) {
      const key = iconKeyFor(code, night);
      assert.ok(ICON_KEYS.includes(key), `kód ${code} (noc=${night}) → neznámý klíč ${key}`);
    }
  }
});

test('neznámý klíč nespadne, vrátí náhradní ikonu', () => {
  assert.ok(iconSvg('takova-ikona-neni').startsWith('<svg'));
});

test('markerHtml zobrazuje teplotu se stupni', () => {
  const html = markerHtml({ code: 0, temperature: 21, isNight: false, hasData: true });
  assert.ok(html.includes('21°'));
  assert.ok(html.includes('<svg'));
});

test('markerHtml zobrazuje i zápornou a nulovou teplotu', () => {
  assert.ok(markerHtml({ code: 71, temperature: -5, isNight: false, hasData: true }).includes('-5°'));
  assert.ok(markerHtml({ code: 3, temperature: 0, isNight: false, hasData: true }).includes('0°'));
});

test('markerHtml bez dat zobrazuje pomlčku a šedou třídu', () => {
  const html = markerHtml({ code: 0, temperature: 0, isNight: false, hasData: false });
  assert.ok(html.includes('–'));
  assert.ok(html.includes('marker--nodata'));
});

test('markerHtml použije noční ikonu, když je noc', () => {
  const den = markerHtml({ code: 0, temperature: 10, isNight: false, hasData: true });
  const noc = markerHtml({ code: 0, temperature: 10, isNight: true, hasData: true });
  assert.notEqual(den, noc);
});

test('markerHtml zobrazuje název lokality', () => {
  const html = markerHtml({ code: 0, temperature: 20, isNight: false, hasData: true, name: 'Dřetovice' });
  assert.ok(html.includes('Dřetovice'));
  assert.ok(html.includes('marker__name'));
});

test('markerHtml bez názvu popisek vynechá', () => {
  assert.ok(!markerHtml({ code: 0, temperature: 20, isNight: false, hasData: true }).includes('marker__name'));
});

test('markerHtml nese třídu barevné kategorie', () => {
  assert.ok(markerHtml({ code: 0, temperature: 20, isNight: false, hasData: true }).includes('marker--clear'));
  assert.ok(markerHtml({ code: 95, temperature: 20, isNight: false, hasData: true }).includes('marker--storm'));
  assert.ok(markerHtml({ code: 63, temperature: 20, isNight: false, hasData: true }).includes('marker--rain'));
});

test('markerHtml označí vybranou lokalitu', () => {
  const html = markerHtml({ code: 0, temperature: 20, isNight: false, hasData: true, selected: true });
  assert.ok(html.includes('marker--selected'));
});

test('každý WMO kód spadá do známé barevné kategorie', () => {
  const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67,
    71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
  for (const code of codes) {
    assert.ok(CATEGORY_KEYS.includes(categoryOf(code)), `kód ${code} → neznámá kategorie ${categoryOf(code)}`);
    assert.notEqual(categoryOf(code), 'unknown', `kód ${code} nemá kategorii`);
  }
  assert.equal(categoryOf(1234), 'unknown');
});
