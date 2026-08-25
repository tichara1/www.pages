/* FitSpot v2 — statická data prototypu.
   Načítá se jako obyčejný <script> (zapíše se na window) i jako CommonJS modul v testech. */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- lokality
  // Střed a zoom, na který se přeostří mapa. "all" = celá Praha.
  var LOCALITIES = [
    { id: 'all', label: 'Celá Praha', center: [50.0800, 14.4300], zoom: 12 },
    { id: 'p1',  label: 'Praha 1',  center: [50.0865, 14.4200], zoom: 14 },
    { id: 'p2',  label: 'Praha 2',  center: [50.0755, 14.4380], zoom: 14 },
    { id: 'p3',  label: 'Praha 3',  center: [50.0875, 14.4620], zoom: 14 },
    { id: 'p4',  label: 'Praha 4',  center: [50.0560, 14.4400], zoom: 14 },
    { id: 'p5',  label: 'Praha 5',  center: [50.0700, 14.4020], zoom: 14 },
    { id: 'p6',  label: 'Praha 6',  center: [50.1020, 14.3960], zoom: 14 },
    { id: 'p7',  label: 'Praha 7',  center: [50.1015, 14.4340], zoom: 14 },
    { id: 'p8',  label: 'Praha 8',  center: [50.1000, 14.4560], zoom: 14 },
    { id: 'p9',  label: 'Praha 9',  center: [50.1075, 14.5010], zoom: 14 },
    { id: 'p10', label: 'Praha 10', center: [50.0700, 14.4700], zoom: 14 }
  ];

  // ---------------------------------------------------------------- číselníky
  var ACTIVITIES = ['HYROX', 'Kruhový trénink', 'TRX', 'Jóga', 'Pilates', 'Fyzio', 'Běh'];

  var VENUES = [
    { id: 'gym',     label: 'Tělocvična', icon: '▣' },
    { id: 'oval',    label: 'Ovál',       icon: '◯' },
    { id: 'outdoor', label: 'Venku',      icon: '△' }
  ];

  var HEALTH_FLAGS = [
    'Záda', 'Kolena', 'Ramena', 'Srdce / tlak', 'Astma', 'Těhotenství', 'Rekonvalescence po úrazu'
  ];

  // ---------------------------------------------------------------- trenéři
  // praha = id lokality, lesson.venue = id z VENUES, price v Kč za lekci.
  var TRAINERS = [
    {
      id: 1, name: 'Eliška Horáková', district: 'Karlín', praha: 'p8',
      rating: 4.9, reviews: 78, lat: 50.0925, lon: 14.4425,
      photo: 'linear-gradient(135deg, #3D4D22, #1A2010)',
      bio: 'Certifikovaná HYROX Master Trainer. Skupinové lekce zaměřené na závodní přípravu i na první start.',
      lessons: [
        { id: 'e1', title: 'HYROX Simulace závodu', activity: 'HYROX', venue: 'gym', slot: 'Út 19:00', length: 90, place: 'Železná Koule, Karlín', price: 350 },
        { id: 'e2', title: 'HYROX Engine', activity: 'HYROX', venue: 'oval', slot: 'Čt 18:00', length: 60, place: 'Ovál Invalidovna, Karlín', price: 320 },
        { id: 'e3', title: 'Kruhový trénink', activity: 'Kruhový trénink', venue: 'gym', slot: 'So 9:00', length: 60, place: 'Železná Koule, Karlín', price: 250 }
      ]
    },
    {
      id: 2, name: 'David Šimek', district: 'Smíchov', praha: 'p5',
      rating: 4.7, reviews: 112, lat: 50.0700, lon: 14.4030,
      photo: 'linear-gradient(135deg, #22434D, #101A20)',
      bio: 'Silový a funkční trénink pro všechny úrovně. Deset let praxe, důraz na techniku před objemem.',
      lessons: [
        { id: 'd1', title: 'TRX Full Body', activity: 'TRX', venue: 'gym', slot: 'Po 18:00', length: 60, place: 'GymPoint, Smíchov', price: 280 },
        { id: 'd2', title: 'Ranní kruháč', activity: 'Kruhový trénink', venue: 'gym', slot: 'St 7:00', length: 45, place: 'GymPoint, Smíchov', price: 220 }
      ]
    },
    {
      id: 3, name: 'Petra Hlaváčová', district: 'Vinohrady', praha: 'p2',
      rating: 5.0, reviews: 64, lat: 50.0763, lon: 14.4390,
      photo: 'linear-gradient(135deg, #4A3D22, #201A10)',
      bio: 'Vinyasa a hatha jóga, pilates s důrazem na dech a mobilitu. Menší skupiny, individuální přístup.',
      lessons: [
        { id: 'p1', title: 'Vinyasa Flow', activity: 'Jóga', venue: 'gym', slot: 'Út 8:00', length: 75, place: 'Studio Flow, Vinohrady', price: 240 },
        { id: 'p2', title: 'Jóga v parku', activity: 'Jóga', venue: 'outdoor', slot: 'So 9:30', length: 60, place: 'Riegrovy sady', price: 200 },
        { id: 'p3', title: 'Pilates pro záda', activity: 'Pilates', venue: 'gym', slot: 'Čt 17:00', length: 60, place: 'Studio Flow, Vinohrady', price: 260 }
      ]
    },
    {
      id: 4, name: 'Ondřej Král', district: 'Holešovice', praha: 'p7',
      rating: 4.6, reviews: 41, lat: 50.1020, lon: 14.4380,
      photo: 'linear-gradient(135deg, #4D2822, #201210)',
      bio: 'Běžecká a HYROX příprava. Kombinace venkovních běhů, oválu a silových bloků v hale.',
      lessons: [
        { id: 'o1', title: 'HYROX Engine (běh + ergy)', activity: 'HYROX', venue: 'gym', slot: 'St 19:00', length: 75, place: 'Loft Gym, Holešovice', price: 320 },
        { id: 'o2', title: 'Intervaly na oválu', activity: 'Běh', venue: 'oval', slot: 'Po 18:30', length: 60, place: 'Atletický ovál, Letná', price: 260 },
        { id: 'o3', title: 'Vytrvalostní běh Stromovkou', activity: 'Běh', venue: 'outdoor', slot: 'Ne 9:00', length: 75, place: 'Stromovka', price: 180 }
      ]
    },
    {
      id: 5, name: 'Lucie Bartošová', district: 'Žižkov', praha: 'p3',
      rating: 4.8, reviews: 93, lat: 50.0880, lon: 14.4620,
      photo: 'linear-gradient(135deg, #3D224D, #170F20)',
      bio: 'Fyzioterapeutka. Skupinová cvičení zdravých zad a kompenzace pro sedavé profese.',
      lessons: [
        { id: 'l1', title: 'Zdravá záda', activity: 'Fyzio', venue: 'gym', slot: 'Po 17:00', length: 60, place: 'SilArt, Žižkov', price: 230 },
        { id: 'l2', title: 'Fyzio Pilates', activity: 'Pilates', venue: 'gym', slot: 'Pá 8:00', length: 60, place: 'SilArt, Žižkov', price: 250 }
      ]
    },
    {
      id: 6, name: 'Marek Dvořák', district: 'Dejvice', praha: 'p6',
      rating: 4.8, reviews: 57, lat: 50.1010, lon: 14.3930,
      photo: 'linear-gradient(135deg, #24404D, #0F1A20)',
      bio: 'HYROX doubles a kondiční příprava. Trénuje páry i firemní skupiny.',
      lessons: [
        { id: 'm1', title: 'HYROX Doubles', activity: 'HYROX', venue: 'gym', slot: 'Út 18:00', length: 90, place: 'Dejvická hala', price: 340 },
        { id: 'm2', title: 'Kruhový trénink na Ladronce', activity: 'Kruhový trénink', venue: 'outdoor', slot: 'So 10:00', length: 60, place: 'Ladronka', price: 210 }
      ]
    },
    {
      id: 7, name: 'Jana Nováková', district: 'Bubeneč', praha: 'p6',
      rating: 4.9, reviews: 86, lat: 50.1065, lon: 14.4080,
      photo: 'linear-gradient(135deg, #3F4D22, #1B2010)',
      bio: 'Hatha jóga a fyzio kompenzace. Specializuje se na lidi, kteří celý den sedí u počítače.',
      lessons: [
        { id: 'j1', title: 'Hatha jóga', activity: 'Jóga', venue: 'gym', slot: 'St 18:30', length: 75, place: 'Studio Klid, Bubeneč', price: 250 },
        { id: 'j2', title: 'Kompenzace pro sedavé profese', activity: 'Fyzio', venue: 'gym', slot: 'Čt 7:30', length: 45, place: 'Studio Klid, Bubeneč', price: 240 }
      ]
    },
    {
      id: 8, name: 'Tomáš Beran', district: 'Vysočany', praha: 'p9',
      rating: 4.5, reviews: 38, lat: 50.1080, lon: 14.5010,
      photo: 'linear-gradient(135deg, #4D3D22, #201810)',
      bio: 'TRX a kruhové tréninky po práci. Krátké intenzivní jednotky, žádné zbytečné prostoje.',
      lessons: [
        { id: 't1', title: 'TRX Core', activity: 'TRX', venue: 'gym', slot: 'Po 19:00', length: 45, place: 'Hala Vysočany', price: 240 },
        { id: 't2', title: 'Kruhový trénink', activity: 'Kruhový trénink', venue: 'gym', slot: 'Čt 19:00', length: 60, place: 'Hala Vysočany', price: 230 }
      ]
    },
    {
      id: 9, name: 'Klára Šťastná', district: 'Vršovice', praha: 'p10',
      rating: 4.7, reviews: 71, lat: 50.0700, lon: 14.4680,
      photo: 'linear-gradient(135deg, #43224D, #1A0F20)',
      bio: 'Pilates na reformeru i na podložce, večerní jóga venku od jara do podzimu.',
      lessons: [
        { id: 'k1', title: 'Pilates Reformer', activity: 'Pilates', venue: 'gym', slot: 'Út 17:30', length: 55, place: 'Studio Vršovice', price: 300 },
        { id: 'k2', title: 'Jóga při západu slunce', activity: 'Jóga', venue: 'outdoor', slot: 'Pá 19:00', length: 60, place: 'Grébovka', price: 220 }
      ]
    },
    {
      id: 10, name: 'Filip Horák', district: 'Nusle', praha: 'p4',
      rating: 4.6, reviews: 49, lat: 50.0570, lon: 14.4400,
      photo: 'linear-gradient(135deg, #224D3A, #10201A)',
      bio: 'Běžecký trenér. Intervaly na oválu, tempová vytrvalost a HYROX pro začátečníky.',
      lessons: [
        { id: 'f1', title: 'Intervaly 400 m', activity: 'Běh', venue: 'oval', slot: 'St 18:00', length: 60, place: 'Stadion Děkanka, Nusle', price: 250 },
        { id: 'f2', title: 'HYROX Základy', activity: 'HYROX', venue: 'gym', slot: 'So 10:30', length: 75, place: 'Fit Pankrác', price: 290 }
      ]
    },
    {
      id: 11, name: 'Nikola Ryšavá', district: 'Staré Město', praha: 'p1',
      rating: 4.9, reviews: 95, lat: 50.0865, lon: 14.4205,
      photo: 'linear-gradient(135deg, #4D4522, #201C10)',
      bio: 'Ranní jóga a polední pilates pro lidi z kanceláří v centru. Lekce do 60 minut včetně převlečení.',
      lessons: [
        { id: 'n1', title: 'Ranní jóga', activity: 'Jóga', venue: 'gym', slot: 'Po 7:00', length: 60, place: 'Studio Centrum, Praha 1', price: 280 },
        { id: 'n2', title: 'Pilates Mat', activity: 'Pilates', venue: 'gym', slot: 'St 12:00', length: 45, place: 'Studio Centrum, Praha 1', price: 270 }
      ]
    }
  ];

  // Pool klientů se skládá z křestních jmen a příjmení, aby jich bylo dost na
  // uvěřitelné rozložení návštěv — se čtrnácti jmény by každý chodil dvakrát denně.
  var FIRST_NAMES = [
    'Martin', 'Tereza', 'Jakub', 'Anna', 'Pavel', 'Kristýna', 'Radek', 'Veronika',
    'Lukáš', 'Barbora', 'Adam', 'Michaela', 'Vojtěch', 'Nikola', 'Ondřej', 'Simona'
  ];
  // [mužský tvar, ženský tvar] — přechylování je nepravidelné, tak je vypsané.
  var LAST_NAMES = [
    ['Kolář', 'Kolářová'], ['Vlček', 'Vlčková'], ['Sedlák', 'Sedláková'], ['Mareš', 'Marešová'],
    ['Doležal', 'Doležalová'], ['Novák', 'Nováková'], ['Beneš', 'Benešová'], ['Šimek', 'Šimková'],
    ['Pospíšil', 'Pospíšilová'], ['Kučera', 'Kučerová'], ['Procházka', 'Procházková'], ['Svoboda', 'Svobodová']
  ];
  var FEMALE = { 'Tereza': 1, 'Anna': 1, 'Kristýna': 1, 'Veronika': 1, 'Barbora': 1, 'Michaela': 1, 'Nikola': 1, 'Simona': 1 };

  var CLIENTS = (function () {
    var out = [];
    for (var f = 0; f < FIRST_NAMES.length; f++) {
      for (var l = 0; l < LAST_NAMES.length; l++) {
        out.push(FIRST_NAMES[f] + ' ' + LAST_NAMES[l][FEMALE[FIRST_NAMES[f]] ? 1 : 0]);
      }
    }
    return out;
  })();

  // ---------------------------------------------------------------- účetní kniha
  // Provize se počítá z jediné množiny záznamů, aby všechny tři pohledy super
  // admina seděly na stejný součet. Generátor je deterministický (pevné semínko),
  // takže testy můžou tvrdit konkrétní čísla.
  var COMMISSION_RATE = 0.15;
  var WEEKS = 8;

  function seeded(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Jeden řádek = jedna účast jednoho klienta na jedné odběhnuté lekci.
  function buildLedger() {
    var rnd = seeded(20260825);
    var rows = [];
    for (var w = 1; w <= WEEKS; w++) {
      for (var i = 0; i < TRAINERS.length; i++) {
        var t = TRAINERS[i];
        var instances = 2 + Math.floor(rnd() * (t.lessons.length + 1));
        for (var n = 0; n < instances; n++) {
          var lesson = t.lessons[Math.floor(rnd() * t.lessons.length)];
          // Naplněnost roste s hodnocením trenéra.
          var participants = 4 + Math.round((t.rating - 4.4) * 3) + Math.floor(rnd() * 5);
          for (var c = 0; c < participants; c++) {
            rows.push({
              week: w,
              trainerId: t.id,
              lessonId: lesson.id,
              activity: lesson.activity,
              venue: lesson.venue,
              client: CLIENTS[Math.floor(rnd() * CLIENTS.length)],
              price: lesson.price
            });
          }
        }
      }
    }
    return rows;
  }

  var api = {
    LOCALITIES: LOCALITIES,
    ACTIVITIES: ACTIVITIES,
    VENUES: VENUES,
    HEALTH_FLAGS: HEALTH_FLAGS,
    TRAINERS: TRAINERS,
    CLIENTS: CLIENTS,
    LEDGER: buildLedger(),
    COMMISSION_RATE: COMMISSION_RATE,
    WEEKS: WEEKS,
    PERIOD: 'srpen 2026'
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FitSpotData = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
