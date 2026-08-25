/* FitSpot v2 — čistá logika bez DOM.
   Načítá se jako obyčejný <script> (zapíše se na window) i jako CommonJS modul v testech. */
(function (root) {
  'use strict';

  // ------------------------------------------------------------- filtrování
  // filters: { locality: 'all'|'pN', activity: null|string, venues: string[] }
  // Prázdná aktivita i prázdný seznam prostorů znamenají "nezáleží".

  function lessonMatches(lesson, filters) {
    if (filters.activity && lesson.activity !== filters.activity) return false;
    if (filters.venues && filters.venues.length && filters.venues.indexOf(lesson.venue) === -1) return false;
    return true;
  }

  // Vrací [{ trainer, lessons }] jen pro trenéry, kterým po filtru zbyla aspoň
  // jedna lekce. Řadí se podle hodnocení sestupně, při shodě podle počtu recenzí.
  function filterTrainers(trainers, filters) {
    var f = filters || {};
    var locality = f.locality || 'all';
    return trainers
      .filter(function (t) { return locality === 'all' || t.praha === locality; })
      .map(function (t) {
        return { trainer: t, lessons: t.lessons.filter(function (l) { return lessonMatches(l, f); }) };
      })
      .filter(function (row) { return row.lessons.length > 0; })
      .sort(function (a, b) {
        return (b.trainer.rating - a.trainer.rating) || (b.trainer.reviews - a.trainer.reviews);
      });
  }

  // ------------------------------------------------------------- provize
  function totals(ledger, rate) {
    var gmv = 0;
    for (var i = 0; i < ledger.length; i++) gmv += ledger[i].price;
    return { sessions: ledger.length, gmv: gmv, commission: Math.round(gmv * rate) };
  }

  // Klíč a popisek pro každý ze tří pohledů super admina.
  var DIMENSIONS = {
    trainer: function (row, trainers) {
      var t = trainers.find(function (x) { return x.id === row.trainerId; });
      return { key: String(row.trainerId), label: t ? t.name : ('Trenér ' + row.trainerId) };
    },
    activity: function (row) { return { key: row.activity, label: row.activity }; },
    client: function (row) { return { key: row.client, label: row.client }; }
  };

  // Agreguje stejnou knihu podle zvolené dimenze. Součet commission napříč
  // řádky nemusí přesně sedět na totals().commission — každý řádek se zaokrouhluje
  // zvlášť. Pro zobrazení v žebříčku to stačí, celkové číslo ber z totals().
  function aggregate(ledger, dimension, rate, trainers) {
    var resolve = DIMENSIONS[dimension];
    if (!resolve) throw new Error('Neznámá dimenze: ' + dimension);

    var bucket = {};
    for (var i = 0; i < ledger.length; i++) {
      var row = ledger[i];
      var id = resolve(row, trainers || []);
      if (!bucket[id.key]) bucket[id.key] = { key: id.key, label: id.label, sessions: 0, gmv: 0 };
      bucket[id.key].sessions += 1;
      bucket[id.key].gmv += row.price;
    }

    return Object.keys(bucket)
      .map(function (k) {
        var b = bucket[k];
        b.commission = Math.round(b.gmv * rate);
        return b;
      })
      .sort(function (a, b) { return (b.gmv - a.gmv) || a.label.localeCompare(b.label, 'cs'); });
  }

  // Provize po týdnech, vždy 1..weeks včetně týdnů bez jediné lekce.
  function weekly(ledger, rate, weeks) {
    var sums = [];
    for (var w = 0; w < weeks; w++) sums.push(0);
    for (var i = 0; i < ledger.length; i++) {
      var idx = ledger[i].week - 1;
      if (idx >= 0 && idx < weeks) sums[idx] += ledger[i].price;
    }
    return sums.map(function (gmv, i) {
      return { week: i + 1, gmv: gmv, commission: Math.round(gmv * rate) };
    });
  }

  // ------------------------------------------------------------- požadavky
  var STATUS = { PENDING: 'pending', ACCEPTED: 'accepted', DECLINED: 'declined' };

  function createRequest(input) {
    return {
      id: input.id,
      trainerId: input.trainerId,
      lessonId: input.lessonId,
      message: (input.message || '').trim(),
      health: {
        flags: (input.health && input.health.flags ? input.health.flags.slice() : []),
        note: (input.health && input.health.note ? input.health.note.trim() : '')
      },
      status: STATUS.PENDING,
      createdAt: input.createdAt
    };
  }

  function hasHealthInfo(request) {
    return !!request && !!request.health && (request.health.flags.length > 0 || request.health.note.length > 0);
  }

  // Vyřídit se dá jen čekající požadavek — jednou přijatý už nejde odmítnout.
  function resolveRequest(requests, id, status) {
    if (status !== STATUS.ACCEPTED && status !== STATUS.DECLINED) {
      throw new Error('Neplatný stav požadavku: ' + status);
    }
    return requests.map(function (r) {
      if (r.id !== id || r.status !== STATUS.PENDING) return r;
      var next = Object.assign({}, r);
      next.status = status;
      return next;
    });
  }

  // Přijaté požadavky se propíšou do čísel super admina jako běžná účast.
  // Padnou do posledního týdne, aby se projevily v grafu napravo.
  function requestsToLedger(requests, trainers, weeks) {
    var rows = [];
    for (var i = 0; i < requests.length; i++) {
      var r = requests[i];
      if (r.status !== STATUS.ACCEPTED) continue;
      var t = trainers.find(function (x) { return x.id === r.trainerId; });
      if (!t) continue;
      var lesson = t.lessons.find(function (l) { return l.id === r.lessonId; });
      if (!lesson) continue;
      rows.push({
        week: weeks,
        trainerId: t.id,
        lessonId: lesson.id,
        activity: lesson.activity,
        venue: lesson.venue,
        client: 'Ty (tato relace)',
        price: lesson.price,
        fresh: true
      });
    }
    return rows;
  }

  var api = {
    lessonMatches: lessonMatches,
    filterTrainers: filterTrainers,
    totals: totals,
    aggregate: aggregate,
    weekly: weekly,
    STATUS: STATUS,
    createRequest: createRequest,
    hasHealthInfo: hasHealthInfo,
    resolveRequest: resolveRequest,
    requestsToLedger: requestsToLedger
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FitSpotLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
