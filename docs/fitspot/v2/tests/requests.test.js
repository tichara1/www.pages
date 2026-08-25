const test = require('node:test');
const assert = require('node:assert/strict');

const data = require('../data.js');
const logic = require('../logic.js');

const { PENDING, ACCEPTED, DECLINED } = logic.STATUS;

const make = (over = {}) =>
  logic.createRequest({ id: 'r1', trainerId: 1, lessonId: 'e1', createdAt: 1000, ...over });

test('nový požadavek je čekající a má prázdný dotazník', () => {
  const r = make();

  assert.equal(r.status, PENDING);
  assert.deepEqual(r.health, { flags: [], note: '' });
});

test('zpráva a poznámka se ořežou o bílé znaky', () => {
  const r = make({ message: '  Začátečník  ', health: { flags: ['Záda'], note: '  bolí vlevo ' } });

  assert.equal(r.message, 'Začátečník');
  assert.equal(r.health.note, 'bolí vlevo');
  assert.deepEqual(r.health.flags, ['Záda']);
});

test('pole příznaků se kopíruje, ne sdílí', () => {
  const flags = ['Kolena'];
  const r = make({ health: { flags } });
  flags.push('Záda');

  assert.deepEqual(r.health.flags, ['Kolena']);
});

test('prázdný dotazník se pozná', () => {
  assert.equal(logic.hasHealthInfo(make()), false);
  assert.equal(logic.hasHealthInfo(make({ health: { flags: ['Astma'] } })), true);
  assert.equal(logic.hasHealthInfo(make({ health: { note: 'po operaci' } })), true);
});

test('trenér může čekající požadavek přijmout', () => {
  const next = logic.resolveRequest([make()], 'r1', ACCEPTED);

  assert.equal(next[0].status, ACCEPTED);
});

test('vyřízení se nedotkne ostatních požadavků', () => {
  const before = [make(), make({ id: 'r2', trainerId: 2, lessonId: 'd1' })];
  const after = logic.resolveRequest(before, 'r1', DECLINED);

  assert.equal(after[1].status, PENDING);
  assert.equal(after[1], before[1], 'nedotčený požadavek zůstává stejný objekt');
  assert.equal(before[0].status, PENDING, 'původní pole se nemodifikuje');
});

test('jednou vyřízený požadavek už stav nemění', () => {
  const accepted = logic.resolveRequest([make()], 'r1', ACCEPTED);
  const again = logic.resolveRequest(accepted, 'r1', DECLINED);

  assert.equal(again[0].status, ACCEPTED);
});

test('neplatný cílový stav skončí chybou', () => {
  assert.throws(() => logic.resolveRequest([make()], 'r1', 'maybe'), /Neplatný stav/);
});

test('do provizí se propíšou jen přijaté požadavky', () => {
  const requests = [
    { ...make(), status: ACCEPTED },
    { ...make({ id: 'r2' }), status: PENDING },
    { ...make({ id: 'r3' }), status: DECLINED }
  ];

  const rows = logic.requestsToLedger(requests, data.TRAINERS, data.WEEKS);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].price, 350, 'cena se bere z lekce, ne z požadavku');
  assert.equal(rows[0].activity, 'HYROX');
  assert.equal(rows[0].week, data.WEEKS, 'padne do posledního týdne grafu');
});

test('požadavek na neznámého trenéra nebo lekci se přeskočí', () => {
  const requests = [
    { ...make({ id: 'r1', trainerId: 999 }), status: ACCEPTED },
    { ...make({ id: 'r2', lessonId: 'neexistuje' }), status: ACCEPTED }
  ];

  assert.deepEqual(logic.requestsToLedger(requests, data.TRAINERS, data.WEEKS), []);
});

test('přijatý požadavek zvedne celkovou provizi', () => {
  const requests = [{ ...make(), status: ACCEPTED }];
  const extra = logic.requestsToLedger(requests, data.TRAINERS, data.WEEKS);

  const base = logic.totals(data.LEDGER, data.COMMISSION_RATE);
  const withRequest = logic.totals(data.LEDGER.concat(extra), data.COMMISSION_RATE);

  assert.equal(withRequest.sessions, base.sessions + 1);
  assert.equal(withRequest.gmv, base.gmv + 350);
});
