// app.jsx — Clickable app wrapper: role switcher + nav state + interactive flows

const USE_STATE = React.useState;
const USE_EFFECT = React.useEffect;
const USE_MEMO = React.useMemo;
const USE_REF = React.useRef;

// ─────────────────────────────────────────────────────────────
// App state store with localStorage persistence
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = 'reserve.v1';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const DEFAULT_STATE = {
  role: 'customer',
  tab: { customer: 'map', trainer: 'dash', admin: 'overview' },
  screen: { customer: null, trainer: null, admin: null }, // null = default tab, else overlay
  selectedLesson: null,
  bookings: {},    // { lessonId: 'booked' | 'waitlist' | 'checked_in' }
  withFriend: {},  // { lessonId: bool }
  streak: 14,
  credit: 2160,
  // filters
  mode: 'transit',
  minutes: 20,
  mapView: 'map',  // map | list
  filterStyle: 'pill',
  lang: 'cz',
  accent: 'lime',
  // trainer
  templatePublished: false,
  scannerRunning: true,
  lastCheckin: null,
  // admin
  suggestionApplied: false,
  selectedLocation: 'l4',
};

function useStore() {
  const [s, setS] = USE_STATE(() => ({ ...DEFAULT_STATE, ...loadState() }));
  USE_EFFECT(() => { saveState(s); }, [s]);
  const update = React.useCallback((patch) => {
    setS(prev => typeof patch === 'function' ? patch(prev) : { ...prev, ...patch });
  }, []);
  return [s, update];
}

const StoreCtx = React.createContext(null);
const useApp = () => React.useContext(StoreCtx);

// ─────────────────────────────────────────────────────────────
// Toast system
// ─────────────────────────────────────────────────────────────
const ToastCtx = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = USE_STATE([]);
  const push = React.useCallback((msg, tone = 'accent') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = t.tone === 'accent' ? T.accent : t.tone === 'orange' ? T.orange : t.tone === 'rose' ? T.rose : T.cyan;
          return (
            <div key={t.id} style={{
              background: 'rgba(20,20,23,0.95)', backdropFilter: 'blur(20px)',
              border: `1px solid ${c}`, borderRadius: 12, padding: '10px 16px',
              fontFamily: T.mono, fontSize: 12, color: T.fg, fontWeight: 500,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'rsvToast 0.3s ease-out',
            }}>
              <span style={{ color: c, marginRight: 8 }}>●</span>{t.msg}
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx);

// ─────────────────────────────────────────────────────────────
// Role switcher (desktop chrome around the phone)
// ─────────────────────────────────────────────────────────────
function RoleSwitcher() {
  const [s, update] = useApp();
  const roles = [
    { k: 'customer', lbl: 'Zákazník', sub: 'Tereza N.' },
    { k: 'trainer',  lbl: 'Trenér',   sub: 'Martin K.' },
    { k: 'admin',    lbl: 'Admin',    sub: 'Jakub M.' },
  ];
  return (
    <div style={{
      display: 'flex', gap: 6, background: 'rgba(20,20,23,0.8)',
      border: `1px solid ${T.lineStrong}`, borderRadius: 14, padding: 4,
      backdropFilter: 'blur(20px)',
    }}>
      {roles.map(r => {
        const act = s.role === r.k;
        return (
          <button key={r.k} onClick={() => update({ role: r.k })} style={{
            padding: '8px 14px', borderRadius: 10,
            background: act ? T.accent : 'transparent',
            color: act ? T.accentInk : T.fg,
            border: 'none', cursor: 'pointer', fontFamily: T.sans,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>{r.lbl}</span>
            <span style={{ fontFamily: T.mono, fontSize: 9, opacity: act ? 0.7 : 0.5, letterSpacing: 0.5 }}>{r.sub}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Customer screens — interactive versions
// ─────────────────────────────────────────────────────────────
function CustomerMapI() {
  const [s, update] = useApp();
  const toast = useToast();
  const str = STR[s.lang];
  const setMode = (m) => update({ mode: m });
  const setMinutes = (m) => update({ minutes: m });
  const [highlight, setHighlight] = USE_STATE(null);

  const visible = LESSON_PINS.filter(p => {
    const eta = s.mode === 'walk' ? p.etaWalk : s.mode === 'transit' ? p.etaTransit : p.etaCar;
    return eta <= s.minutes;
  });

  const openLesson = (id) => {
    update({ selectedLesson: id, screen: { ...s.screen, customer: 'detail' } });
  };

  const tab = (k) => update({ tab: { ...s.tab, customer: k } });

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>RESERVE · PRAHA</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{s.lang === 'cz' ? 'Dobré ráno, Tereza' : 'Good morning, Tereza'}</div>
          </div>
          <div onClick={() => tab('profile')} style={{ cursor: 'pointer', width: 36, height: 36, borderRadius: 18, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 12, fontWeight: 600 }}>TN</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '10px 12px', cursor: 'pointer',
        }} onClick={() => toast(s.lang === 'cz' ? 'Hlasový příkaz: „HIIT do 20 min od mě"' : 'Voice: "HIIT under 20 min from me"', 'cyan')}>
          {Icon.search(T.fgMuted)}
          <div style={{ flex: 1, fontSize: 13, color: T.fgMuted }}>{str.voice}</div>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.mic(T.accent)}</div>
        </div>
      </div>

      <div style={{ padding: '0 20px 10px' }}>
        <TravelFilter mode={s.mode} setMode={setMode} minutes={s.minutes} setMinutes={setMinutes} style={s.filterStyle} lang={s.lang} />
      </div>

      {/* View toggle */}
      <div style={{ padding: '0 20px 8px', display: 'flex', gap: 4 }}>
        {['map','list'].map(v => (
          <button key={v} onClick={() => update({ mapView: v })} style={{
            padding: '5px 10px', borderRadius: 7,
            background: s.mapView === v ? T.accentSoft : 'transparent',
            border: `1px solid ${s.mapView === v ? T.accentBorder : T.line}`,
            color: s.mapView === v ? T.accent : T.fgMuted,
            fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.5, cursor: 'pointer',
            textTransform: 'uppercase',
          }}>{v === 'map' ? str.map : str.list}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 0.5, alignSelf: 'center' }}>
          {visible.length}/{LESSON_PINS.length}
        </div>
      </div>

      {s.mapView === 'map' ? (
        <>
          <div style={{ margin: '0 20px', height: 300, borderRadius: 18, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
            <StyledMap mode={s.mode} minutes={s.minutes} highlightId={highlight} onPinClick={(p) => setHighlight(p.id)} />
            <div style={{
              position: 'absolute', top: 10, left: 10, padding: '6px 10px',
              background: 'rgba(10,11,13,0.75)', border: `1px solid ${T.lineStrong}`, borderRadius: 8,
              fontFamily: T.mono, fontSize: 10.5, color: T.fg, letterSpacing: 0.6,
            }}>
              <span style={{ color: T.accent }}>{visible.length}</span> · ≤{s.minutes}m
            </div>
          </div>
          {highlight && (() => {
            const p = LESSON_PINS.find(x => x.id === highlight);
            return (
              <div style={{ padding: '12px 20px 0' }} onClick={() => openLesson(p.id)}>
                <LessonCard p={p} mode={s.mode} lang={s.lang} compact />
              </div>
            );
          })()}
        </>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 440 }}>
          {visible.length ? visible.map(p => (
            <div key={p.id} onClick={() => openLesson(p.id)}>
              <LessonCard p={p} mode={s.mode} lang={s.lang} />
            </div>
          )) : <div style={{ textAlign: 'center', padding: 40, color: T.fgDim, fontFamily: T.mono, fontSize: 11 }}>Nic v dosahu — zvedni čas ↑</div>}
        </div>
      )}

      <TabBarI active="map" />
    </Device>
  );
}

function CustomerSuggestionsI() {
  const [s, update] = useApp();
  const toast = useToast();
  const go = () => {
    update({ selectedLesson: 'l1', screen: { ...s.screen, customer: 'detail' } });
  };
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2, marginBottom: 4 }}>NAVRHUJEME · 07:42</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.1 }}>
          Stihneš ještě<br/><span style={{ color: T.accent }}>3 lekce</span> dneska.
        </div>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.accentBorder}`, borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 200,
            background: 'radial-gradient(circle, oklch(0.86 0.18 130 / 0.18), transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Tag tone="accent">{Icon.bolt(T.accent)} TEĎ</Tag>
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgMuted }}>OKNO 22 MIN</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginBottom: 4 }}>HIIT 45 @ Letná Gym</div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginBottom: 14 }}>Začíná 08:10 · tramvají 6 min · šatna připravena</div>
          <div style={{ position: 'relative', height: 44, marginBottom: 14 }}>
            <div style={{ position: 'absolute', top: 20, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }} />
            {[
              { x: 0, lbl: 'TEĎ', sub: '07:42' },
              { x: 30, lbl: 'TRAM', sub: '07:48', c: T.cyan },
              { x: 60, lbl: 'ŠATNA', sub: '07:54', c: T.cyan },
              { x: 92, lbl: 'LEKCE', sub: '08:10', c: T.accent },
            ].map((m, i) => (
              <div key={i} style={{ position: 'absolute', left: `${m.x}%`, top: 0, transform: 'translateX(-50%)', textAlign: 'center' }}>
                <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.fgDim, letterSpacing: 0.5 }}>{m.lbl}</div>
                <div style={{ width: 10, height: 10, borderRadius: 5, margin: '4px auto 2px', background: m.c || T.fg }} />
                <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fg }}>{m.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn tone="accent" style={{ flex: 1 }} onClick={go}>JDU {Icon.chev(T.accentInk)}</Btn>
            <Btn tone="dark" onClick={() => toast('Odloženo na později', 'cyan')}>POZDĚJI</Btn>
          </div>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1.2, padding: '8px 4px' }}>NEBO</div>
        {[LESSON_PINS[1], LESSON_PINS[5]].map(p => (
          <div key={p.id} onClick={() => { update({ selectedLesson: p.id, screen: { ...s.screen, customer: 'detail' } }); }}>
            <LessonCard p={p} mode="transit" lang={s.lang} compact />
          </div>
        ))}
      </div>
      <TabBarI active="now" />
    </Device>
  );
}

function CustomerLessonDetailI() {
  const [s, update] = useApp();
  const toast = useToast();
  const p = LESSON_PINS.find(x => x.id === s.selectedLesson) || LESSON_PINS[0];
  const status = s.bookings[p.id];
  const full = p.taken >= p.cap;

  const book = (withFriend = false) => {
    update({
      bookings: { ...s.bookings, [p.id]: full ? 'waitlist' : 'booked' },
      withFriend: { ...s.withFriend, [p.id]: withFriend },
      credit: s.credit - (full ? 0 : p.price * (withFriend ? 2 : 1)),
      screen: { ...s.screen, customer: 'confirm' },
    });
  };

  const back = () => update({ screen: { ...s.screen, customer: null } });

  return (
    <Device>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 12px' }}>
          <div onClick={back} style={{ cursor: 'pointer', width: 32, height: 32, borderRadius: 10, background: T.surface, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke={T.fg} strokeWidth="1.8"><path d="M8 1L2 7l6 6"/></svg>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>DETAIL · #{p.id.toUpperCase()}</div>
          {status && <Tag tone={status === 'waitlist' ? 'orange' : 'accent'}>{status === 'waitlist' ? 'WAITLIST' : 'REZERVOVÁNO'}</Tag>}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Tag tone="accent">{Icon.flame(T.accent)} {p.title.split(' ')[0].toUpperCase()}</Tag>
            <Tag>45 MIN</Tag>
            <Tag>LVL {p.lvl}/5</Tag>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.05, marginBottom: 4 }}>{p.title}</div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.fgMuted }}>{p.studio.toUpperCase()} · ZÍTRA {p.time}</div>
        </div>

        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, height: 110, position: 'relative', marginBottom: 12 }}>
          <LocationThumb pinId={p.id} />
          <div style={{
            position: 'absolute', inset: 0, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            background: 'linear-gradient(180deg, transparent 40%, rgba(10,11,13,0.85))',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { k: 'walk', i: Icon.walk, n: p.etaWalk },
                { k: 'transit', i: Icon.tram, n: p.etaTransit },
                { k: 'car', i: Icon.car, n: p.etaCar },
              ].map(x => {
                const act = s.mode === x.k;
                return (
                  <div key={x.k} onClick={() => update({ mode: x.k })} style={{
                    cursor: 'pointer',
                    padding: '5px 8px', borderRadius: 8,
                    background: act ? T.accentSoft : 'rgba(0,0,0,0.4)',
                    border: `1px solid ${act ? T.accentBorder : T.line}`,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {x.i(act ? T.accent : T.fg)}
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: act ? T.accent : T.fg }}>{x.n}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, oklch(0.35 0.08 130), oklch(0.25 0.05 200))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontWeight: 700 }}>MK</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Martin Krupka</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgMuted }}>★ 4.92 · 312 LEKCÍ</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8 }}>SHODA</div>
              <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.accent }}>94<span style={{ fontSize: 11, opacity: 0.6 }}>%</span></div>
            </div>
          </div>
        </Card>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>OBSAZENOST · {p.taken}/{p.cap}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: full ? T.rose : T.accent }}>{full ? 'PLNO' : 'VOLNO'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 2 }}>
            {Array.from({ length: 42 }).map((_, i) => {
              const v = [0.2, 0.4, 0.7, 0.9, 1, 0.8, 0.3, 0.5, 0.6, 0.85, 0.95, 1, 1, 0.4][i % 14];
              return <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: `oklch(${0.2 + v * 0.5} ${v * 0.18} ${130 - v * 60} / ${0.2 + v * 0.75})` }} />;
            })}
          </div>
        </div>

        <div style={{ height: 100 }} />
      </div>

      <div style={{
        position: 'absolute', bottom: 80, left: 12, right: 12, zIndex: 30,
        background: 'rgba(20,20,23,0.92)', backdropFilter: 'blur(24px)',
        border: `1px solid ${T.lineStrong}`, borderRadius: 20, padding: 12,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>CENA</div>
          <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700 }}>{p.price} Kč</div>
        </div>
        <div style={{ flex: 1 }} />
        {!status && (
          <>
            <Btn tone="dark" size="md" onClick={() => book(true)}>{Icon.users(T.fg)} +KÁMOŠ</Btn>
            <Btn tone="accent" size="md" onClick={() => book(false)}>
              {full ? 'NA WAITLIST' : 'REZERVOVAT'} {Icon.chev(T.accentInk)}
            </Btn>
          </>
        )}
        {status && (
          <Btn tone="dark" size="md" onClick={() => {
            const { [p.id]: _, ...rest } = s.bookings;
            update({ bookings: rest });
            toast('Rezervace zrušena', 'rose');
          }}>ZRUŠIT</Btn>
        )}
      </div>
      <TabBarI active="map" />
    </Device>
  );
}

function CustomerConfirmI() {
  const [s, update] = useApp();
  const toast = useToast();
  const p = LESSON_PINS.find(x => x.id === s.selectedLesson) || LESSON_PINS[0];
  const status = s.bookings[p.id];
  const isWaitlist = status === 'waitlist';

  const goCheckin = () => {
    update({ tab: { ...s.tab, customer: 'checkin' }, screen: { ...s.screen, customer: null } });
  };
  const goMap = () => update({ tab: { ...s.tab, customer: 'map' }, screen: { ...s.screen, customer: null } });

  return (
    <Device>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 100px)' }}>
        <div style={{
          width: 96, height: 96, borderRadius: 48,
          background: isWaitlist ? 'oklch(0.76 0.16 55 / 0.18)' : T.accentSoft,
          border: `2px solid ${isWaitlist ? T.orange : T.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: -6, borderRadius: 52, border: `1px solid ${isWaitlist ? T.orange : T.accent}`, opacity: 0.3 }} />
          <div style={{ position: 'absolute', inset: -14, borderRadius: 60, border: `1px solid ${isWaitlist ? T.orange : T.accent}`, opacity: 0.15 }} />
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke={isWaitlist ? T.orange : T.accent} strokeWidth="3" strokeLinecap="round">
            {isWaitlist
              ? <><circle cx="20" cy="20" r="14"/><path d="M20 12v8l5 3"/></>
              : <path d="M10 20l7 7 13-14"/>}
          </svg>
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2, marginBottom: 6 }}>
          {isWaitlist ? 'NA ČEKACÍ LISTINĚ' : 'REZERVOVÁNO'} · #{p.id.toUpperCase()}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, textAlign: 'center', marginBottom: 4 }}>{p.title}</div>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.fgMuted, textAlign: 'center' }}>{p.studio.toUpperCase()} · ZÍTRA {p.time}</div>
        {isWaitlist && (
          <div style={{ marginTop: 16, padding: 12, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 0.5 }}>AUTO-POTVRZENÍ ZAPNUTO</div>
            <div style={{ fontSize: 13, color: T.fg, marginTop: 4 }}>Jakmile se uvolní místo, potvrdíme tě.</div>
          </div>
        )}
        {s.withFriend[p.id] && !isWaitlist && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: T.accentSoft, border: `1px solid ${T.accentBorder}`, borderRadius: 999 }}>
            {Icon.users(T.accent)}
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent }}>+1 MÍSTO PRO KÁMOŠE</span>
          </div>
        )}

        <div style={{ marginTop: 28, display: 'flex', gap: 8, width: '100%' }}>
          <Btn tone="dark" size="md" style={{ flex: 1 }} onClick={goMap}>ZPĚT NA MAPU</Btn>
          {!isWaitlist && <Btn tone="accent" size="md" style={{ flex: 1 }} onClick={goCheckin}>CHECK-IN {Icon.chev(T.accentInk)}</Btn>}
        </div>
      </div>
      <TabBarI active="map" />
    </Device>
  );
}

function CustomerCheckInI() {
  const [s, update] = useApp();
  const toast = useToast();
  // Pick first booking or default
  const bookedId = Object.keys(s.bookings).find(id => s.bookings[id] === 'booked' || s.bookings[id] === 'checked_in');
  const p = LESSON_PINS.find(x => x.id === bookedId) || LESSON_PINS[0];
  const isCheckedIn = s.bookings[p.id] === 'checked_in';

  const QR_SIZE = 25;
  const cells = USE_MEMO(() => {
    const arr = [];
    for (let i = 0; i < QR_SIZE * QR_SIZE; i++) arr.push(((i * 7919 + 31) % 10) > 4 ? 1 : 0);
    const mark = (r, c) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) arr[(r + i) * QR_SIZE + (c + j)] = (i === 0 || i === 6 || j === 0 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5)) ? 1 : 0; };
    mark(0, 0); mark(0, QR_SIZE - 7); mark(QR_SIZE - 7, 0);
    return arr;
  }, []);

  const doCheckIn = () => {
    if (isCheckedIn) return;
    update({
      bookings: { ...s.bookings, [p.id]: 'checked_in' },
      streak: s.streak + 1,
      lastCheckin: Date.now(),
    });
    toast('Check-in úspěšný · +1 streak ✓', 'accent');
  };

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2, marginBottom: 4 }}>
          CHECK-IN · #{p.id.toUpperCase()}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>{p.title} · {p.studio}</div>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.fgMuted, marginTop: 2 }}>{p.time} · ZA 28 MIN</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div onClick={doCheckIn} style={{
          padding: 18, background: isCheckedIn ? 'oklch(0.4 0.1 130)' : T.fg, borderRadius: 20, position: 'relative', cursor: 'pointer',
          boxShadow: `0 0 0 1px ${T.line}, 0 20px 60px oklch(0.86 0.18 130 / 0.25)`,
          transition: 'background 0.3s',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${QR_SIZE}, 7px)`, gridTemplateRows: `repeat(${QR_SIZE}, 7px)` }}>
            {cells.map((c, i) => <div key={i} style={{ width: 7, height: 7, background: c ? '#0A0B0D' : 'transparent' }} />)}
          </div>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 44, height: 44, background: isCheckedIn ? T.accent : T.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, border: `3px solid ${T.accent}`,
          }}>
            {isCheckedIn ? Icon.check(T.bg) : <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, color: T.bg }}>RSV</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: isCheckedIn ? T.accentSoft : 'rgba(255,255,255,0.05)', border: `1px solid ${isCheckedIn ? T.accentBorder : T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCheckedIn ? Icon.check(T.accent) : Icon.qr(T.fgMuted)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{isCheckedIn ? 'Jsi in! Užij lekci.' : 'Klikni na QR pro check-in'}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim }}>{isCheckedIn ? 'STREAK UPDATED' : 'AUTO-REFRESH · 3s · GPS 180m'}</div>
            </div>
          </div>
        </Card>
      </div>
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Card style={{ flex: 1, padding: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>STREAK</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.accent }}>{s.streak}</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>DNÍ</div>
            </div>
          </Card>
          <Card style={{ flex: 1, padding: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>KREDIT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700 }}>{s.credit.toLocaleString()}</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>KČ</div>
            </div>
          </Card>
        </div>
      </div>
      <TabBarI active="checkin" />
    </Device>
  );
}

function CustomerProfileI() {
  const [s, update] = useApp();
  const totalBooked = Object.values(s.bookings).length;
  const weeks = Array.from({ length: 20 }).map((_, i) => Array.from({ length: 7 }).map((_, j) => {
    const v = ((i * 31 + j * 7) % 11) / 10;
    return Math.max(0, Math.min(1, v));
  }));
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>PROFIL · LEVEL 07</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, oklch(0.86 0.18 130), oklch(0.75 0.15 200))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontWeight: 800, fontSize: 20, color: T.bg }}>TN</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Tereza N.</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted }}>SMÍCHOV · OD BŘEZNA 2024</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 110 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { k: s.streak, u: 'DNÍ', l: 'STREAK', c: T.accent },
            { k: 86 + totalBooked, u: 'LEKCÍ', l: 'CELKEM', c: T.fg },
            { k: s.credit.toLocaleString(), u: 'KČ', l: 'KREDIT', c: T.cyan },
          ].map((x, i) => (
            <Card key={i} pad={12}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>{x.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: x.c }}>{x.k}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>{x.u}</div>
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: 1, color: T.fgDim }}>AKTIVITA · 20 TÝDNŮ</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>+42%</div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                {w.map((v, j) => (
                  <div key={j} style={{ aspectRatio: '1', borderRadius: 2, background: v > 0 ? `oklch(0.86 0.18 130 / ${0.15 + v * 0.85})` : 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ))}
          </div>
        </Card>

        {Object.keys(s.bookings).length > 0 && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1, padding: '0 4px 8px' }}>TVOJE REZERVACE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.keys(s.bookings).map(id => {
                const p = LESSON_PINS.find(x => x.id === id);
                if (!p) return null;
                return (
                  <div key={id} onClick={() => update({ selectedLesson: id, screen: { ...s.screen, customer: 'detail' } })}>
                    <LessonCard p={p} mode={s.mode} lang={s.lang} compact />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Btn tone="ghost" onClick={() => { localStorage.removeItem(STORAGE_KEY); location.reload(); }}>RESETOVAT APP</Btn>
      </div>
      <TabBarI active="profile" />
    </Device>
  );
}

function TabBarI({ active }) {
  const [s, update] = useApp();
  const str = STR[s.lang];
  const go = (k) => update({ tab: { ...s.tab, customer: k }, screen: { ...s.screen, customer: null } });
  const items = [
    { k: 'map', icon: Icon.pin, label: str.map },
    { k: 'now', icon: Icon.bolt, label: 'TEĎ' },
    { k: 'checkin', icon: Icon.qr, label: 'CHECK-IN' },
    { k: 'profile', icon: Icon.users, label: str.profile },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 10, zIndex: 40,
      background: 'rgba(20,20,23,0.78)', backdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${T.line}`, borderRadius: 20, padding: '10px 6px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {items.map((it) => {
        const act = it.k === active;
        return (
          <div key={it.k} onClick={() => go(it.k)} style={{
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 14px', borderRadius: 12,
            color: act ? T.accent : T.fgMuted,
            background: act ? T.accentSoft : 'transparent',
            fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            {it.icon(act ? T.accent : T.fgMuted)}
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function CustomerApp() {
  const [s] = useApp();
  const screen = s.screen.customer;
  if (screen === 'detail') return <CustomerLessonDetailI />;
  if (screen === 'confirm') return <CustomerConfirmI />;
  switch (s.tab.customer) {
    case 'now': return <CustomerSuggestionsI />;
    case 'checkin': return <CustomerCheckInI />;
    case 'profile': return <CustomerProfileI />;
    default: return <CustomerMapI />;
  }
}

// ─────────────────────────────────────────────────────────────
// Trainer — interactive tab wrapper (uses existing static screens)
// ─────────────────────────────────────────────────────────────
function TrainerTabBarI({ active }) {
  const [s, update] = useApp();
  const str = STR[s.lang];
  const go = (k) => update({ tab: { ...s.tab, trainer: k } });
  const items = [
    { k: 'dash', icon: Icon.spark, label: str.dashboard },
    { k: 'schedule', icon: Icon.clock, label: str.schedule },
    { k: 'templates', icon: Icon.plus, label: str.templates },
    { k: 'attendees', icon: Icon.users, label: 'ÚČAST.' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 10, zIndex: 40,
      background: 'rgba(20,20,23,0.78)', backdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${T.line}`, borderRadius: 20, padding: '10px 6px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {items.map((it) => {
        const act = it.k === active;
        return (
          <div key={it.k} onClick={() => go(it.k)} style={{
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 14px', borderRadius: 12,
            color: act ? T.accent : T.fgMuted, background: act ? T.accentSoft : 'transparent',
            fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{it.icon(act ? T.accent : T.fgMuted)}<span>{it.label}</span></div>
        );
      })}
    </div>
  );
}

function TrainerDashI() {
  const [s, update] = useApp();
  const toast = useToast();
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>COACH · MARTIN K.</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>Dnes 3 lekce<br/><span style={{ color: T.fgMuted, fontWeight: 500 }}>42 klientů</span></div>
          </div>
          <div onClick={() => update({ tab: { ...s.tab, trainer: 'templates' } })} style={{ cursor: 'pointer', width: 42, height: 42, borderRadius: 12, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.plus(T.fg)}
          </div>
        </div>
      </div>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.accentBorder}`, borderRadius: 16, padding: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 140, background: 'radial-gradient(circle, oklch(0.86 0.18 130 / 0.15), transparent 70%)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Tag tone="accent">{Icon.bolt(T.accent)} ZA 28 MIN</Tag>
            <Tag>HIIT 45</Tag>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>HIIT 45 · Letná Gym</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginBottom: 12 }}>08:10 → 08:55 · STUDIO 2</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 3 }}>OBSAZENO</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: T.accent }}>11</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>/18</div>
              </div>
              <Meter value={11/18} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 3 }}>WAITLIST</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700 }}>3</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>AUTO</div>
              </div>
            </div>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn tone="accent" size="sm" style={{ flex: 1 }} onClick={() => { update({ scannerRunning: true, tab: { ...s.tab, trainer: 'attendees' } }); toast('QR scanner spuštěn', 'accent'); }}>{Icon.qr(T.accentInk)} SPUSTIT CHECK-IN</Btn>
            <Btn tone="dark" size="sm" onClick={() => update({ tab: { ...s.tab, trainer: 'attendees' } })}>{Icon.users(T.fg)} ÚČASTNÍCI</Btn>
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>DNES</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>3 LEKCE · 2.5 H</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { t: '08:10', e: '08:55', n: 'HIIT 45', loc: 'LETNÁ · ST.2', cap: [11,18], now: true },
              { t: '12:30', e: '13:15', n: 'Personal · L. Nová', loc: 'LETNÁ · 1:1', cap: [1,1] },
              { t: '18:00', e: '19:00', n: 'HIIT 60 · pokročilí', loc: 'KARLÍN · ST.A', cap: [14,16] },
            ].map((x, i) => (
              <div key={i} onClick={() => update({ tab: { ...s.tab, trainer: 'attendees' } })} style={{ cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', background: T.surface, border: `1px solid ${x.now ? T.accentBorder : T.line}`, borderRadius: 12, padding: 12 }}>
                <div style={{ fontFamily: T.mono, width: 56 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{x.t}</div>
                  <div style={{ fontSize: 10, color: T.fgDim }}>→ {x.e}</div>
                </div>
                <div style={{ width: 1, height: 32, background: T.line }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{x.n}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>{x.loc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: x.cap[0] === x.cap[1] ? T.orange : T.fg }}>{x.cap[0]}/{x.cap[1]}</div>
                  <Meter value={x.cap[0]/x.cap[1]} color={x.cap[0] === x.cap[1] ? T.orange : T.accent} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TrainerTabBarI active="dash" />
    </Device>
  );
}

function TrainerTemplateI() {
  const [s, update] = useApp();
  const toast = useToast();
  return (
    <Device>
      <TrainerTemplate lang={s.lang} />
      {/* Override the publish button by intercepting clicks at the bottom */}
      <div style={{
        position: 'absolute', bottom: 80, left: 12, right: 12, zIndex: 35,
        display: 'flex', gap: 8, padding: 10,
        background: 'rgba(20,20,23,0.92)', backdropFilter: 'blur(24px)',
        border: `1px solid ${T.lineStrong}`, borderRadius: 20,
      }}>
        <Btn tone="dark" size="md" style={{ flex: 1 }} onClick={() => toast('Šablona duplikována', 'cyan')}>DUPLIKOVAT</Btn>
        <Btn tone="accent" size="md" style={{ flex: 2 }} onClick={() => { update({ templatePublished: true, tab: { ...s.tab, trainer: 'schedule' } }); toast('Publikováno · 15 slotů tento týden', 'accent'); }}>
          {s.templatePublished ? 'PUBLIKOVÁNO ✓' : 'PUBLIKOVAT NA TÝDEN'} {Icon.chev(T.accentInk)}
        </Btn>
      </div>
      <TrainerTabBarI active="templates" />
    </Device>
  );
}

function TrainerScheduleI() {
  const [s] = useApp();
  return (
    <Device>
      <TrainerSchedule lang={s.lang} />
      <TrainerTabBarI active="schedule" />
    </Device>
  );
}

function TrainerAttendeesI() {
  const [s, update] = useApp();
  const toast = useToast();
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>ÚČASTNÍCI · LIVE · 08:09</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>HIIT 45 · Letná</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginTop: 2 }}>KOMP. HODNOCENÍ: ★ 4.88</div>
      </div>
      <div style={{ padding: '0 20px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[{ n: 4, l: 'ZDE', c: T.accent }, { n: 2, l: 'ČEKÁ', c: T.fg }, { n: 3, l: 'WAITLIST', c: T.orange }].map((x, i) => (
          <div key={i} style={{ padding: '10px 12px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: x.c }}>{x.n}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>{x.l}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 20px 10px' }}>
        <div onClick={() => { update({ scannerRunning: !s.scannerRunning }); toast(s.scannerRunning ? 'Scanner pozastaven' : 'Scanner spuštěn', s.scannerRunning ? 'orange' : 'accent'); }} style={{
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          background: T.surface, border: `1px solid ${s.scannerRunning ? T.accentBorder : T.line}`, borderRadius: 12, padding: 10,
        }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <div style={{ position: 'absolute', inset: 4, borderRadius: 12, background: s.scannerRunning ? T.accent : T.fgDim, animation: s.scannerRunning ? 'rsvPulse 1.5s infinite' : 'none' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `1px solid ${s.scannerRunning ? T.accent : T.fgDim}`, opacity: 0.3 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{s.scannerRunning ? 'QR scanner aktivní' : 'Scanner pozastaven'}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>POSLEDNÍ: T. NOVÁ · 07:58:21</div>
          </div>
          <Btn tone="dark" size="sm">{s.scannerRunning ? 'PAUSE' : 'START'}</Btn>
        </div>
      </div>
      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { name: 'Tereza Nová', note: 'ZNOVU · #14', status: 'in', streak: 14 },
          { name: 'Petr Svoboda', note: 'PÁR', status: 'in', streak: 6 },
          { name: 'Jana Dvořák', note: 'NOVÁ', status: 'in', streak: 1 },
          { name: 'Aleš Král', note: '', status: 'in', streak: 22 },
          { name: 'Kateřina H.', note: '', status: 'pending', streak: 3 },
          { name: 'Tomáš R.', note: '', status: 'pending', streak: 9 },
          { name: 'Lucie Nová', note: 'COMP: 91%', status: 'waitlist', streak: 4 },
        ].map((a, i) => {
          const st = { in: { bg: T.accentSoft, fg: T.accent, bd: T.accentBorder, lbl: 'ZDE' },
            pending: { bg: 'rgba(255,255,255,0.05)', fg: T.fgMuted, bd: T.line, lbl: 'ČEKÁ' },
            waitlist: { bg: 'oklch(0.76 0.16 55 / 0.12)', fg: T.orange, bd: 'oklch(0.76 0.16 55 / 0.3)', lbl: 'WL' },
          }[a.status];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 10, fontWeight: 700 }}>
                {a.name.split(' ').map(x => x[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 1 }}>
                  {a.streak > 0 && <span style={{ fontFamily: T.mono, fontSize: 9, color: a.streak > 10 ? T.accent : T.fgDim }}>🔥{a.streak}</span>}
                  {a.note && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim }}>{a.note}</span>}
                </div>
              </div>
              <div style={{ padding: '4px 8px', borderRadius: 6, background: st.bg, color: st.fg, border: `1px solid ${st.bd}`, fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5 }}>{st.lbl}</div>
            </div>
          );
        })}
      </div>
      <TrainerTabBarI active="attendees" />
    </Device>
  );
}

function TrainerApp() {
  const [s] = useApp();
  switch (s.tab.trainer) {
    case 'schedule': return <TrainerScheduleI />;
    case 'templates': return <TrainerTemplateI />;
    case 'attendees': return <TrainerAttendeesI />;
    default: return <TrainerDashI />;
  }
}

// ─────────────────────────────────────────────────────────────
// Admin — wrap existing screens in interactive tab bar
// ─────────────────────────────────────────────────────────────
function AdminTabBarI({ active }) {
  const [s, update] = useApp();
  const go = (k) => update({ tab: { ...s.tab, admin: k } });
  const items = [
    { k: 'overview', icon: Icon.spark, label: 'OVERVIEW' },
    { k: 'heatmap', icon: Icon.wave, label: 'HEATMAP' },
    { k: 'users', icon: Icon.users, label: 'USERS' },
    { k: 'locations', icon: Icon.pin, label: 'POBOČKY' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 10, zIndex: 40,
      background: 'rgba(20,20,23,0.78)', backdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${T.line}`, borderRadius: 20, padding: '10px 6px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {items.map((it) => {
        const act = it.k === active;
        return (
          <div key={it.k} onClick={() => go(it.k)} style={{
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 14px', borderRadius: 12,
            color: act ? T.accent : T.fgMuted, background: act ? T.accentSoft : 'transparent',
            fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>{it.icon(act ? T.accent : T.fgMuted)}<span>{it.label}</span></div>
        );
      })}
    </div>
  );
}

function AdminAppI() {
  const [s, update] = useApp();
  const toast = useToast();

  const wrap = (node) => <Device>{node}<AdminTabBarI active={s.tab.admin} /></Device>;

  if (s.tab.admin === 'heatmap') {
    return (
      <Device>
        <div style={{ padding: '8px 20px 14px' }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>HEATMAP · OBSAZENOST</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Tento týden · po lokalitě</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginTop: 2 }}>PO–NE · 06:00 → 21:00 · AVG 82%</div>
        </div>
        <div style={{ padding: '0 20px 14px' }}>
          <AdminHeatmapBody applied={s.suggestionApplied} onApply={() => { update({ suggestionApplied: true }); toast('Slot přidán · publikováno', 'accent'); }} />
        </div>
        <AdminTabBarI active="heatmap" />
      </Device>
    );
  }
  if (s.tab.admin === 'users') return wrap(<AdminUsers lang={s.lang} />);
  if (s.tab.admin === 'locations') return wrap(<AdminLocationsI />);
  return wrap(<AdminOverview lang={s.lang} />);
}

function AdminHeatmapBody({ applied, onApply }) {
  const LOCS = ['LETNÁ', 'KARLÍN', 'SMÍCHOV', 'VINOHRADY', 'ANDĚL', 'VRŠOVICE'];
  const HOURS = ['06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21'];
  const values = LOCS.map((_, li) => HOURS.map((_, hi) => {
    const h = +HOURS[hi];
    const peak = Math.exp(-Math.pow((h - 8), 2) / 4) + Math.exp(-Math.pow((h - 18.5), 2) / 3);
    const noise = ((li * 13 + hi * 7) % 9) / 30;
    return Math.min(1, Math.max(0.05, peak * 0.9 + noise));
  }));
  return (
    <>
      <Card pad={12}>
        <div style={{ display: 'grid', gridTemplateColumns: `56px repeat(${HOURS.length}, 1fr)`, gap: 2 }}>
          <div />
          {HOURS.map((h, i) => <div key={h} style={{ fontFamily: T.mono, fontSize: 7.5, color: T.fgDim, textAlign: 'center', padding: '2px 0' }}>{i % 2 === 0 ? h : ''}</div>)}
          {LOCS.map((loc, li) => (
            <React.Fragment key={loc}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgMuted, display: 'flex', alignItems: 'center', padding: '0 4px 0 0' }}>{loc}</div>
              {values[li].map((v, hi) => {
                const hue = 130 - v * 80;
                return <div key={hi} style={{ aspectRatio: '1', background: `oklch(${0.25 + v * 0.6} ${v * 0.18} ${hue} / ${0.25 + v * 0.75})`, borderRadius: 1.5 }} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>
      <div style={{
        marginTop: 12, padding: 12,
        background: applied ? 'linear-gradient(135deg, oklch(0.86 0.18 130 / 0.18), transparent)' : 'linear-gradient(135deg, oklch(0.86 0.18 130 / 0.08), transparent)',
        border: `1px solid ${T.accentBorder}`, borderRadius: 12,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {applied ? Icon.check(T.accent) : Icon.bolt(T.accent)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{applied ? 'Aplikováno · publikováno' : 'AI návrh: přidat HIIT 18:00 ve Vinohradech'}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>PREDIKCE: 16/18 · +4 200 KČ / TÝDEN</div>
        </div>
        {!applied && <Btn tone="accent" size="sm" onClick={onApply}>APPLY</Btn>}
      </div>
    </>
  );
}

function AdminLocationsI() {
  const [s, update] = useApp();
  const [sel, setSel] = [s.selectedLocation, (v) => update({ selectedLocation: v })];
  return (
    <>
      <div style={{ padding: '8px 20px 10px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>POBOČKY · 6 · PRAHA</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Síť · live</div>
      </div>
      <div style={{ margin: '0 20px 10px', height: 290, borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
        <StyledMap mode="walk" minutes={60} showIso={false} highlightId={sel} onPinClick={(p) => setSel(p.id)} />
      </div>
      {(() => {
        const p = LESSON_PINS.find(x => x.id === sel) || LESSON_PINS[0];
        return (
          <div style={{ padding: '0 20px 100px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 0.8 }}>#{p.id.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{p.studio}</div>
                </div>
                <Tag tone={p.taken >= p.cap ? 'orange' : 'accent'}>LIVE</Tag>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[{ l: 'DNES', v: '8', sub: 'LEKCÍ' }, { l: 'OBSAZ.', v: '91%', sub: 'AVG' }, { l: 'TRŽBY', v: '68K', sub: 'KČ' }].map((k, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.6 }}>{k.l}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, marginTop: 2 }}>{k.v}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, marginTop: 1 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      })()}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────
function App() {
  const store = useStore();
  const [s] = store;

  // Apply accent
  USE_EFFECT(() => {
    const ACCENTS = {
      lime: { accent: 'oklch(0.86 0.18 130)', accentInk: '#0A0B0D', accentSoft: 'oklch(0.86 0.18 130 / 0.14)', accentBorder: 'oklch(0.86 0.18 130 / 0.35)' },
      cyan: { accent: 'oklch(0.82 0.14 220)', accentInk: '#0A0B0D', accentSoft: 'oklch(0.82 0.14 220 / 0.14)', accentBorder: 'oklch(0.82 0.14 220 / 0.35)' },
      orange: { accent: 'oklch(0.78 0.17 55)', accentInk: '#0A0B0D', accentSoft: 'oklch(0.78 0.17 55 / 0.14)', accentBorder: 'oklch(0.78 0.17 55 / 0.35)' },
    };
    Object.assign(T, ACCENTS[s.accent] || ACCENTS.lime);
  }, [s.accent]);

  return (
    <StoreCtx.Provider value={store}>
      <ToastProvider>
        <div style={{
          minHeight: '100vh', background: '#050608',
          backgroundImage: 'radial-gradient(ellipse at top, oklch(0.15 0.04 260 / 0.4), transparent 60%), radial-gradient(ellipse at bottom right, oklch(0.2 0.08 130 / 0.15), transparent 60%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 40px',
          fontFamily: T.sans,
        }}>
          {/* Top bar */}
          <div style={{ width: 'min(900px, 100vw)', padding: '0 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: T.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.mono, fontWeight: 800, fontSize: 15, color: T.accentInk,
              }}>R</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>RESERVE</div>
                <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8 }}>PRAHA · LIVE APP</div>
              </div>
            </div>
            <RoleSwitcher />
            <div style={{ display: 'flex', gap: 6 }}>
              {['cz', 'en'].map(l => (
                <button key={l} onClick={() => store[1]({ lang: l })} style={{
                  padding: '6px 10px', borderRadius: 7,
                  background: s.lang === l ? T.accentSoft : 'transparent',
                  border: `1px solid ${s.lang === l ? T.accentBorder : T.line}`,
                  color: s.lang === l ? T.accent : T.fgMuted,
                  fontFamily: T.mono, fontSize: 10, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Device */}
          <div>
            {s.role === 'customer' && <CustomerApp />}
            {s.role === 'trainer' && <TrainerApp />}
            {s.role === 'admin' && <AdminAppI />}
          </div>

          {/* Hint strip */}
          <div style={{
            marginTop: 22, padding: '10px 16px',
            background: 'rgba(20,20,23,0.6)', border: `1px solid ${T.line}`, borderRadius: 12,
            fontFamily: T.mono, fontSize: 11, color: T.fgMuted, letterSpacing: 0.3, display: 'flex', gap: 16, alignItems: 'center',
          }}>
            <span><span style={{ color: T.accent }}>●</span> Klikni na pin na mapě · pak detail · rezervuj</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Přepínej role nahoře</span>
          </div>
        </div>
      </ToastProvider>
    </StoreCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
