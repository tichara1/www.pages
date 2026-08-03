// customer.jsx — Zákazník screens: Map/List discovery, Lesson detail, Booking, Check-in, Profile

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
function TravelFilter({ mode, setMode, minutes, setMinutes, style = 'pill', lang = 'cz' }) {
  const s = STR[lang];
  const modes = [
    { k: 'walk', icon: Icon.walk, label: s.walk },
    { k: 'transit', icon: Icon.tram, label: s.transit },
    { k: 'car', icon: Icon.car, label: s.car },
  ];

  if (style === 'slider') {
    return (
      <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: T.fgDim }}>
            {s.travel_by}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.accent }}>
            ≤ {minutes} {s.mins}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {modes.map(m => (
            <button key={m.k} onClick={() => setMode(m.k)} style={{
              flex: 1, padding: '8px 0', borderRadius: 8,
              background: mode === m.k ? T.accentSoft : 'transparent',
              border: `1px solid ${mode === m.k ? T.accentBorder : T.line}`,
              color: mode === m.k ? T.accent : T.fgMuted,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontFamily: T.sans, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>{m.icon(mode === m.k ? T.accent : T.fgMuted)} {m.label}</button>
          ))}
        </div>
        {/* slider track */}
        <div style={{ position: 'relative', height: 26 }}>
          <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', top: 11, left: 0, width: `${(minutes / 60) * 100}%`, height: 4, borderRadius: 2, background: T.accent }} />
          <input type="range" min="5" max="60" step="5" value={minutes}
            onChange={(e) => setMinutes(+e.target.value)}
            style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
          <div style={{ position: 'absolute', top: 5, left: `calc(${(minutes / 60) * 100}% - 8px)`,
            width: 16, height: 16, borderRadius: 8, background: T.accent,
            boxShadow: '0 0 0 4px rgba(10,11,13,1), 0 0 0 5px oklch(0.86 0.18 130 / 0.5)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>
          <span>5</span><span>20</span><span>40</span><span>60 min</span>
        </div>
      </div>
    );
  }

  if (style === 'dial') {
    // Compact dial: concentric rings show 5/15/30/60 min
    const rings = [5, 15, 30, 60];
    return (
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 16, padding: 12 }}>
        <svg width="58" height="58" viewBox="0 0 58 58">
          {rings.map((r, i) => {
            const rad = 6 + (r / 60) * 22;
            const active = minutes >= r;
            return (
              <circle key={r} cx="29" cy="29" r={rad} fill="none"
                stroke={active ? T.accent : 'rgba(255,255,255,0.08)'}
                strokeWidth={minutes === r ? 2 : 1} />
            );
          })}
          <circle cx="29" cy="29" r="2" fill={T.accent}/>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {modes.map(m => (
              <button key={m.k} onClick={() => setMode(m.k)} style={{
                padding: '6px 10px', borderRadius: 6,
                background: mode === m.k ? T.accentSoft : 'transparent',
                border: `1px solid ${mode === m.k ? T.accentBorder : T.line}`,
                color: mode === m.k ? T.accent : T.fgMuted, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: T.sans,
              }}>{m.icon(mode === m.k ? T.accent : T.fgMuted)}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {rings.map(r => (
              <button key={r} onClick={() => setMinutes(r)} style={{
                flex: 1, padding: '5px 0', borderRadius: 5,
                background: minutes === r ? T.accent : 'rgba(255,255,255,0.04)',
                color: minutes === r ? T.accentInk : T.fgMuted,
                border: 'none', fontFamily: T.mono, fontSize: 10, fontWeight: 600, cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: pill style
  return (
    <div style={{ display: 'flex', gap: 6, padding: '0 20px' }}>
      <div style={{
        display: 'flex', background: T.surface, border: `1px solid ${T.line}`,
        borderRadius: 12, padding: 3, gap: 2,
      }}>
        {modes.map(m => (
          <button key={m.k} onClick={() => setMode(m.k)} style={{
            padding: '6px 10px', borderRadius: 9,
            background: mode === m.k ? T.accentSoft : 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            color: mode === m.k ? T.accent : T.fgMuted,
            fontFamily: T.sans, fontSize: 12, fontWeight: 500,
          }}>{m.icon(mode === m.k ? T.accent : T.fgMuted)} {m.label}</button>
        ))}
      </div>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 8,
        background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '0 12px',
      }}>
        {Icon.clock(T.fgMuted)}
        <input type="range" min="5" max="60" step="5" value={minutes}
          onChange={(e) => setMinutes(+e.target.value)}
          style={{ flex: 1, accentColor: 'oklch(0.86 0.18 130)' }} />
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.accent, minWidth: 36, textAlign: 'right' }}>{minutes}m</span>
      </div>
    </div>
  );
}

// Lesson card (horizontal list row)
function LessonCard({ p, mode = 'walk', lang = 'cz', onClick, compact = false }) {
  const s = STR[lang];
  const eta = mode === 'walk' ? p.etaWalk : mode === 'transit' ? p.etaTransit : p.etaCar;
  const modeIcon = mode === 'walk' ? Icon.walk : mode === 'transit' ? Icon.tram : Icon.car;
  const full = p.taken >= p.cap;
  const occ = p.cap ? p.taken / p.cap : 0;
  return (
    <div onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: 14, display: 'flex', gap: 12, cursor: 'pointer',
    }}>
      <div style={{
        width: 54, height: 54, borderRadius: 10,
        background: T.surface2, border: `1px solid ${T.line}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 700, color: T.fg }}>{p.time}</div>
        <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.fgDim, letterSpacing: 0.5 }}>TODAY</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
          {p.hot && <Tag tone="orange">{Icon.flame(T.orange)} HOT</Tag>}
          {full && <Tag tone="rose">FULL</Tag>}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim, marginBottom: 8 }}>{p.studio.toUpperCase()}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.fgMuted, fontSize: 11, fontFamily: T.mono }}>
            {modeIcon(T.fgMuted)} <span>{eta}m</span>
          </div>
          <div style={{ width: 3, height: 3, borderRadius: 2, background: T.fgDim }} />
          <Dots filled={p.lvl} total={5} color={T.accent} />
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: T.mono, fontSize: 11, color: full ? T.rose : T.fgMuted }}>
            {p.taken}/{p.cap}
          </div>
        </div>
        {!compact && (
          <div style={{ marginTop: 8 }}>
            <Meter value={occ} color={full ? T.rose : occ > 0.7 ? T.orange : T.accent} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 1 — Map discovery
// ─────────────────────────────────────────────────────────────
function CustomerMap({ lang = 'cz', filterStyle = 'pill', view = 'map' }) {
  const s = STR[lang];
  const [mode, setMode] = React.useState('transit');
  const [minutes, setMinutes] = React.useState(20);
  const [highlight, setHighlight] = React.useState(null);

  const visible = LESSON_PINS.filter(p => {
    const eta = mode === 'walk' ? p.etaWalk : mode === 'transit' ? p.etaTransit : p.etaCar;
    return eta <= minutes;
  });

  return (
    <Device>
      {/* Header */}
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>RESERVE · PRAHA</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Dobré ráno, Tereza</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 12, fontWeight: 600 }}>TN</div>
        </div>
        {/* Search pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14, padding: '10px 12px',
        }}>
          {Icon.search(T.fgMuted)}
          <div style={{ flex: 1, fontSize: 13, color: T.fgMuted }}>{s.voice}</div>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{Icon.mic(T.accent)}</div>
        </div>
      </div>

      {/* Travel filter */}
      <div style={{ marginBottom: 10 }}>
        {filterStyle === 'slider' || filterStyle === 'dial'
          ? <div style={{ padding: '0 20px' }}><TravelFilter mode={mode} setMode={setMode} minutes={minutes} setMinutes={setMinutes} style={filterStyle} lang={lang} /></div>
          : <TravelFilter mode={mode} setMode={setMode} minutes={minutes} setMinutes={setMinutes} style={filterStyle} lang={lang} />}
      </div>

      {view === 'map' ? (
        <>
          {/* Map */}
          <div style={{ margin: '6px 20px 0', height: 320, borderRadius: 18, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
            <StyledMap mode={mode} minutes={minutes} highlightId={highlight} onPinClick={(p) => setHighlight(p.id)} />
            {/* overlay: reachable count */}
            <div style={{
              position: 'absolute', top: 10, left: 10, padding: '6px 10px',
              background: 'rgba(10,11,13,0.75)', border: `1px solid ${T.lineStrong}`, borderRadius: 8,
              fontFamily: T.mono, fontSize: 10.5, color: T.fg, letterSpacing: 0.6,
            }}>
              <span style={{ color: T.accent }}>{visible.length}</span> / {LESSON_PINS.length} · ≤{minutes}m {mode}
            </div>
            {/* scale */}
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              fontFamily: T.mono, fontSize: 9, color: T.fgMuted, letterSpacing: 0.5,
              background: 'rgba(10,11,13,0.6)', padding: '3px 6px', borderRadius: 4,
            }}>500m</div>
          </div>
          {/* Peek card of highlighted */}
          {highlight && (() => {
            const p = LESSON_PINS.find(x => x.id === highlight);
            return (
              <div style={{ padding: '12px 20px 0' }}>
                <LessonCard p={p} mode={mode} lang={lang} compact />
              </div>
            );
          })()}
        </>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', height: 470 }}>
          {visible.length ? visible.map(p => <LessonCard key={p.id} p={p} mode={mode} lang={lang} />) :
            <div style={{ textAlign: 'center', padding: 40, color: T.fgDim, fontFamily: T.mono, fontSize: 11 }}>Nic v dosahu ↑ zvedni čas</div>}
        </div>
      )}

      <TabBar active={0} items={[
        { icon: Icon.pin(T.accent), label: s.map },
        { icon: Icon.search(T.fgMuted), label: 'HLEDAT' },
        { icon: Icon.qr(T.fgMuted), label: 'CHECK-IN' },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — Smart suggestions ("stihl bys jít teď")
// ─────────────────────────────────────────────────────────────
function CustomerSuggestions({ lang = 'cz' }) {
  const s = STR[lang];
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2, marginBottom: 4 }}>NAVRHUJEME · 07:42</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.1 }}>
          Stihneš ještě<br/><span style={{ color: T.accent }}>3 lekce</span> dneska.
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Primary suggestion — big card */}
        <div style={{
          background: T.surface, border: `1px solid ${T.accentBorder}`, borderRadius: 16, padding: 16,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: 200,
            background: 'radial-gradient(circle, oklch(0.86 0.18 130 / 0.18), transparent 70%)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Tag tone="accent">{Icon.bolt(T.accent)} TEĎ</Tag>
            <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgMuted }}>OKNO 22 MIN</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginBottom: 4 }}>HIIT 45 @ Letná Gym</div>
          <div style={{ fontSize: 13, color: T.fgMuted, marginBottom: 14 }}>Začíná 08:10 · tramvají 6 min · šatna připravena</div>

          {/* Timeline bar */}
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
            <Btn tone="accent" style={{ flex: 1 }}>JDU {Icon.chev(T.accentInk)}</Btn>
            <Btn tone="dark">POZDĚJI</Btn>
          </div>
        </div>

        {/* Secondary alternatives */}
        <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1.2, padding: '8px 4px' }}>NEBO</div>
        <LessonCard p={LESSON_PINS[1]} mode="transit" lang={lang} compact />
        <LessonCard p={LESSON_PINS[5]} mode="walk" lang={lang} compact />
      </div>

      <TabBar active={0} items={[
        { icon: Icon.pin(T.accent), label: s.map },
        { icon: Icon.bolt(T.fgMuted), label: 'TEĎ' },
        { icon: Icon.qr(T.fgMuted), label: 'CHECK-IN' },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — Lesson detail
// ─────────────────────────────────────────────────────────────
function CustomerLessonDetail({ lang = 'cz' }) {
  const s = STR[lang];
  const p = LESSON_PINS[0]; // HIIT Letná

  return (
    <Device>
      <div style={{ padding: '0 20px' }}>
        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0 12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.surface, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke={T.fg} strokeWidth="1.8"><path d="M8 1L2 7l6 6"/></svg>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>DETAIL · #LES-4821</div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <Tag tone="accent">{Icon.flame(T.accent)} HIIT</Tag>
            <Tag>45 MIN</Tag>
            <Tag>ÚROVEŇ 3/5</Tag>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.05, marginBottom: 4 }}>
            HIIT 45 /<br/>Spálit ráno
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.fgMuted }}>LETNÁ GYM · ZÍTRA 07:30</div>
        </div>

        {/* Route thumb */}
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, height: 120, position: 'relative', marginBottom: 14 }}>
          <LocationThumb pinId={p.id} />
          <div style={{
            position: 'absolute', inset: 0, padding: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: 'linear-gradient(180deg, transparent 40%, rgba(10,11,13,0.85))',
          }}>
            <div />
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {[
                { i: Icon.walk(T.fg), n: `${p.etaWalk}m`, lbl: 'PĚŠKY' },
                { i: Icon.tram(T.accent), n: `${p.etaTransit}m`, lbl: 'MHD', active: true },
                { i: Icon.car(T.fg), n: `${p.etaCar}m`, lbl: 'AUTO' },
              ].map((x, i) => (
                <div key={i} style={{
                  padding: '5px 8px', borderRadius: 8,
                  background: x.active ? T.accentSoft : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${x.active ? T.accentBorder : T.line}`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {x.i}
                  <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: x.active ? T.accent : T.fg }}>{x.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coach + compat */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, oklch(0.35 0.08 130), oklch(0.25 0.05 200))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontWeight: 700 }}>MK</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Martin Krupka</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgMuted }}>★ 4.92 · 312 LEKCÍ</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 0.8 }}>{s.compat}</div>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.accent }}>94<span style={{ fontSize: 12, opacity: 0.6 }}>%</span></div>
            </div>
          </div>
          <Divider style={{ margin: '12px 0' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, marginBottom: 3, letterSpacing: 0.8 }}>STYL</div>
              <div style={{ fontSize: 12, color: T.fg }}>Intenzivní</div>
              <Meter value={0.88} />
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, marginBottom: 3, letterSpacing: 0.8 }}>ENERGIE</div>
              <div style={{ fontSize: 12, color: T.fg }}>Vysoká</div>
              <Meter value={0.95} color={T.orange} />
            </div>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, marginBottom: 3, letterSpacing: 0.8 }}>JAZYK</div>
              <div style={{ fontSize: 12, color: T.fg }}>CZ · EN</div>
              <Meter value={1} color={T.cyan} />
            </div>
          </div>
        </Card>

        {/* Heatmap of capacity */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>OBSAZENOST · TÝDEN</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>TEĎ · 11/18</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: 2 }}>
            {Array.from({ length: 42 }).map((_, i) => {
              const v = [0.2, 0.4, 0.7, 0.9, 1, 0.8, 0.3, 0.5, 0.6, 0.85, 0.95, 1, 1, 0.4][i % 14];
              const hot = v > 0.85;
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 2,
                  background: `oklch(${0.2 + v * 0.5} ${v * 0.18} ${130 - v * 60} / ${0.2 + v * 0.75})`,
                  border: hot ? '1px solid oklch(0.76 0.16 55 / 0.5)' : 'none',
                }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: T.mono, fontSize: 9, color: T.fgDim }}>
            <span>PO</span><span>ÚT</span><span>ST</span><span>ČT</span><span>PÁ</span><span>SO</span><span>NE</span>
          </div>
        </div>

        <div style={{ height: 90 }} />
      </div>

      {/* Sticky booking bar */}
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
        <Btn tone="dark" size="md">{Icon.users(T.fg)} +KÁMOŠ</Btn>
        <Btn tone="accent" size="md">REZERVOVAT {Icon.chev(T.accentInk)}</Btn>
      </div>
      <TabBar active={1} items={[
        { icon: Icon.pin(T.fgMuted), label: s.map },
        { icon: Icon.search(T.accent), label: 'HLEDAT' },
        { icon: Icon.qr(T.fgMuted), label: 'CHECK-IN' },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — QR Check-in
// ─────────────────────────────────────────────────────────────
function CustomerCheckIn({ lang = 'cz' }) {
  const s = STR[lang];
  // Build a fake QR grid
  const QR_SIZE = 25;
  const cells = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < QR_SIZE * QR_SIZE; i++) {
      // deterministic pseudo-random
      arr.push(((i * 7919 + 31) % 10) > 4 ? 1 : 0);
    }
    // position markers
    const mark = (r, c) => { for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) arr[(r + i) * QR_SIZE + (c + j)] = (i === 0 || i === 6 || j === 0 || j === 6 || (i > 1 && i < 5 && j > 1 && j < 5)) ? 1 : 0; };
    mark(0, 0); mark(0, QR_SIZE - 7); mark(QR_SIZE - 7, 0);
    return arr;
  }, []);

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px', textAlign: 'center' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2, marginBottom: 4 }}>CHECK-IN · TICKET #4821</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>HIIT 45 · Letná Gym</div>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.fgMuted, marginTop: 2 }}>08:10 · ZA 28 MIN</div>
      </div>

      {/* QR */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div style={{
          padding: 18, background: T.fg, borderRadius: 20, position: 'relative',
          boxShadow: `0 0 0 1px ${T.line}, 0 20px 60px oklch(0.86 0.18 130 / 0.25)`,
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${QR_SIZE}, 7px)`, gridTemplateRows: `repeat(${QR_SIZE}, 7px)`, gap: 0,
          }}>
            {cells.map((c, i) => <div key={i} style={{ width: 7, height: 7, background: c ? '#0A0B0D' : 'transparent' }} />)}
          </div>
          {/* Center logo */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 44, height: 44, background: T.fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, border: `3px solid ${T.accent}`,
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, color: T.bg }}>RSV</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{ padding: '0 20px', marginBottom: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icon.check(T.accent)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Připraveno ke scanu</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim }}>AUTO-REFRESH · 3s · GPS 180m</div>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ width: 3, height: 16 - i * 3, borderRadius: 1, background: T.accent, opacity: 0.4 + i * 0.2 }} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Streak */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Card style={{ flex: 1, padding: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>STREAK</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700, color: T.accent }}>14</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>DNÍ</div>
            </div>
          </Card>
          <Card style={{ flex: 1, padding: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>KREDIT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <div style={{ fontFamily: T.mono, fontSize: 26, fontWeight: 700 }}>2 160</div>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>KČ</div>
            </div>
          </Card>
        </div>
      </div>

      <TabBar active={2} items={[
        { icon: Icon.pin(T.fgMuted), label: s.map },
        { icon: Icon.search(T.fgMuted), label: 'HLEDAT' },
        { icon: Icon.qr(T.accent), label: 'CHECK-IN' },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 5 — Profile (streak + upcoming + friends)
// ─────────────────────────────────────────────────────────────
function CustomerProfile({ lang = 'cz' }) {
  const s = STR[lang];
  const weeks = Array.from({ length: 20 }).map((_, i) => Array.from({ length: 7 }).map((_, j) => {
    const v = [(i * 31 + j * 7) % 11] / 10;
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
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { k: '14', u: 'DNÍ', l: 'STREAK', c: T.accent },
            { k: '86', u: 'LEKCÍ', l: 'CELKEM', c: T.fg },
            { k: '18.2', u: 'H', l: 'TENTO MĚS.', c: T.cyan },
          ].map((x, i) => (
            <Card key={i} pad={12}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>{x.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: x.c }}>{x.k}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>{x.u}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Activity grid */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: 1, color: T.fgDim }}>AKTIVITA · POSLEDNÍCH 20 TÝDNŮ</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>+42%</div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                {w.map((v, j) => (
                  <div key={j} style={{
                    aspectRatio: '1', borderRadius: 2,
                    background: v > 0 ? `oklch(0.86 0.18 130 / ${0.15 + v * 0.85})` : 'rgba(255,255,255,0.04)',
                  }} />
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1, padding: '0 4px 8px' }}>NADCHÁZEJÍCÍ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <LessonCard p={LESSON_PINS[0]} mode="transit" lang={lang} compact />
            <LessonCard p={LESSON_PINS[4]} mode="walk" lang={lang} compact />
          </div>
        </div>
      </div>

      <TabBar active={3} items={[
        { icon: Icon.pin(T.fgMuted), label: s.map },
        { icon: Icon.search(T.fgMuted), label: 'HLEDAT' },
        { icon: Icon.qr(T.fgMuted), label: 'CHECK-IN' },
        { icon: Icon.users(T.accent), label: s.profile },
      ]} />
    </Device>
  );
}

Object.assign(window, {
  CustomerMap, CustomerSuggestions, CustomerLessonDetail, CustomerCheckIn, CustomerProfile,
  LessonCard, TravelFilter,
});
