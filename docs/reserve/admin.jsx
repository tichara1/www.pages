// admin.jsx — Admin screens: Overview, Heatmap analytics, Users, Locations

// ─────────────────────────────────────────────────────────────
// Screen 1 — Admin overview / console
// ─────────────────────────────────────────────────────────────
function AdminOverview({ lang = 'cz' }) {
  const s = STR[lang];
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>CONSOLE · RESERVE / PRAHA</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>Úterý<br/><span style={{ color: T.fgMuted, fontWeight: 500 }}>23. dubna</span></div>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: T.surface2, border: `1px solid ${T.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.accent }} />
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, background: T.orange, boxShadow: `0 0 0 2px ${T.surface2}` }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 100 }}>
        {/* KPI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[
            { l: s.active_lessons.toUpperCase(), n: '186', s: '+12', c: T.accent, spark: [4,6,8,5,9,12,10,14,13,16] },
            { l: s.occupancy.toUpperCase(), n: '82%', s: '+4pp', c: T.cyan, spark: [0.5,0.6,0.55,0.7,0.72,0.78,0.75,0.8,0.82,0.82] },
            { l: 'NOVÍ ČLENOVÉ', n: '24', s: '+3', c: T.orange, spark: [1,2,3,2,4,3,5,4,6,5] },
            { l: s.revenue.toUpperCase() + ' MTD', n: '412K', s: '+18%', c: T.accent, spark: [5,7,8,10,9,12,14,13,16,18] },
          ].map((k, i) => (
            <Card key={i} pad={12}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.8, marginBottom: 4 }}>{k.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: T.fg }}>{k.n}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: k.c }}>{k.s}</div>
              </div>
              <svg viewBox="0 0 100 20" width="100%" height="18" preserveAspectRatio="none">
                {(() => {
                  const max = Math.max(...k.spark);
                  const pts = k.spark.map((v, j) => `${(j/(k.spark.length-1))*100},${20 - (v/max)*18}`).join(' ');
                  return <>
                    <polyline points={pts} fill="none" stroke={k.c} strokeWidth="1.5"/>
                    <polyline points={`0,20 ${pts} 100,20`} fill={k.c.replace(')', ' / 0.15)')}/>
                  </>;
                })()}
              </svg>
            </Card>
          ))}
        </div>

        {/* Alerts */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1, padding: '4px 4px 8px' }}>UPOZORNĚNÍ · 3</div>
          {[
            { t: 'Vinohrady · Spinning 18:00', d: 'Plně obsazeno 3. den v řadě · zvážit další slot', tone: 'orange' },
            { t: 'Martin K. · kapacita 112% / týden', d: 'Navrhnout odlehčení nebo druhou lekci', tone: 'cyan' },
            { t: 'Smíchov Box · QR scanner offline', d: 'Poslední ping 14 min', tone: 'rose' },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: 10, marginBottom: 6,
              background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10,
            }}>
              <div style={{ width: 3, borderRadius: 2, background: a.tone === 'orange' ? T.orange : a.tone === 'rose' ? T.rose : T.cyan }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.t}</div>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, marginTop: 2 }}>{a.d}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>{Icon.chev(T.fgMuted)}</div>
            </div>
          ))}
        </div>

        {/* Locations rail */}
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1, padding: '4px 4px 8px' }}>POBOČKY · 6</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { n: 'LETNÁ', v: 89, col: T.accent },
              { n: 'KARLÍN', v: 76, col: T.cyan },
              { n: 'SMÍCHOV', v: 62, col: T.cyan },
              { n: 'VINOHRADY', v: 94, col: T.orange },
              { n: 'ANDĚL', v: 71, col: T.cyan },
              { n: 'VRŠOVICE', v: 58, col: T.cyan },
            ].map((l, i) => (
              <div key={i} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 10 }}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.6, marginBottom: 5 }}>{l.n}</div>
                <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, color: l.col }}>{l.v}<span style={{ fontSize: 10, color: T.fgDim }}>%</span></div>
                <Meter value={l.v/100} color={l.col} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar active={0} items={[
        { icon: Icon.spark(T.accent), label: 'OVERVIEW' },
        { icon: Icon.wave(T.fgMuted), label: 'HEATMAP' },
        { icon: Icon.users(T.fgMuted), label: s.users },
        { icon: Icon.pin(T.fgMuted), label: s.locations },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — Heatmap (occupancy by location × time)
// ─────────────────────────────────────────────────────────────
function AdminHeatmap({ lang = 'cz' }) {
  const s = STR[lang];
  const LOCS = ['LETNÁ', 'KARLÍN', 'SMÍCHOV', 'VINOHRADY', 'ANDĚL', 'VRŠOVICE'];
  const HOURS = ['06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21'];
  // Generate values pseudo-random but with morning/evening peaks
  const values = LOCS.map((_, li) => HOURS.map((_, hi) => {
    const h = +HOURS[hi];
    const peak = Math.exp(-Math.pow((h - 8), 2) / 4) + Math.exp(-Math.pow((h - 18.5), 2) / 3);
    const noise = ((li * 13 + hi * 7) % 9) / 30;
    return Math.min(1, Math.max(0.05, peak * 0.9 + noise));
  }));

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>HEATMAP · OBSAZENOST</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Tento týden · po lokalitě</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginTop: 2 }}>PO–NE · 06:00 → 21:00 · AVG 82%</div>
      </div>

      <div style={{ padding: '0 20px 14px' }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {['VŠE', 'HIIT', 'YOGA', 'PERSONAL', 'SPIN'].map((c, i) => (
            <div key={c} style={{
              padding: '5px 10px', borderRadius: 8,
              background: i === 0 ? T.accentSoft : T.surface,
              border: `1px solid ${i === 0 ? T.accentBorder : T.line}`,
              color: i === 0 ? T.accent : T.fgMuted,
              fontFamily: T.mono, fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
            }}>{c}</div>
          ))}
        </div>

        {/* Heatmap grid */}
        <Card pad={12}>
          <div style={{ display: 'grid', gridTemplateColumns: `56px repeat(${HOURS.length}, 1fr)`, gap: 2 }}>
            <div />
            {HOURS.map((h, i) => (
              <div key={h} style={{ fontFamily: T.mono, fontSize: 7.5, color: T.fgDim, textAlign: 'center', padding: '2px 0' }}>
                {i % 2 === 0 ? h : ''}
              </div>
            ))}
            {LOCS.map((loc, li) => (
              <React.Fragment key={loc}>
                <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgMuted, display: 'flex', alignItems: 'center', padding: '0 4px 0 0' }}>{loc}</div>
                {values[li].map((v, hi) => {
                  const hue = 130 - v * 80; // green → orange → red
                  return (
                    <div key={hi} style={{
                      aspectRatio: '1',
                      background: `oklch(${0.25 + v * 0.6} ${v * 0.18} ${hue} / ${0.25 + v * 0.75})`,
                      borderRadius: 1.5,
                    }} />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontFamily: T.mono, fontSize: 9, color: T.fgDim }}>
            <span>VOLNO</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'linear-gradient(90deg, oklch(0.3 0.05 130 / 0.3), oklch(0.7 0.15 90), oklch(0.7 0.18 50))' }} />
            <span>PLNO</span>
          </div>
        </Card>

        {/* Insights row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
          {[
            { l: 'TOP SLOT', v: 'ÚT 18:00', sub: 'VINOHRADY · 94%', c: T.orange },
            { l: 'DEAD SLOT', v: 'NE 14:00', sub: 'ZVÁŽIT ZRUŠIT', c: T.fgMuted },
            { l: 'TREND', v: 'RÁNA ↑', sub: '+14% POSL. MĚS.', c: T.accent },
          ].map((i, k) => (
            <div key={k} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 10 }}>
              <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 3 }}>{i.l}</div>
              <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: i.c }}>{i.v}</div>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, marginTop: 2 }}>{i.sub}</div>
            </div>
          ))}
        </div>

        {/* Suggestion */}
        <div style={{
          marginTop: 12, padding: 12,
          background: 'linear-gradient(135deg, oklch(0.86 0.18 130 / 0.08), transparent)',
          border: `1px solid ${T.accentBorder}`, borderRadius: 12,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentSoft, border: `1px solid ${T.accentBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icon.bolt(T.accent)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>AI návrh: přidat HIIT 18:00 ve Vinohradech</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>PREDIKCE: 16 REZERVACÍ / 18 MÍST · +4 200 KČ / TÝDEN</div>
          </div>
          <Btn tone="accent" size="sm">APPLY</Btn>
        </div>
      </div>

      <TabBar active={1} items={[
        { icon: Icon.spark(T.fgMuted), label: 'OVERVIEW' },
        { icon: Icon.wave(T.accent), label: 'HEATMAP' },
        { icon: Icon.users(T.fgMuted), label: s.users },
        { icon: Icon.pin(T.fgMuted), label: s.locations },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — Users & roles management
// ─────────────────────────────────────────────────────────────
function AdminUsers({ lang = 'cz' }) {
  const s = STR[lang];
  const USERS = [
    { n: 'Martin Krupka', r: 'TRENÉR', m: '312 lekcí · ★4.92', tone: 'cyan', active: true },
    { n: 'Lenka Horáková', r: 'TRENÉR', m: '198 lekcí · ★4.85', tone: 'cyan', active: true },
    { n: 'Jakub Moravec', r: 'ADMIN', m: 'Finance', tone: 'accent', active: true },
    { n: 'Tereza Nová', r: 'ČLEN', m: '🔥14 · 86 lekcí', tone: 'default', active: true },
    { n: 'Petr Svoboda', r: 'ČLEN', m: '🔥6 · 42 lekcí', tone: 'default', active: true },
    { n: 'Aneta Dvořáková', r: 'ČLEN · PAUZA', m: 'Od 12.3.', tone: 'default', active: false },
    { n: 'Ondřej Malý', r: 'ČLEN', m: '🔥18 · 124 lekcí', tone: 'default', active: true },
    { n: 'David Fuchs', r: 'ČLEN · NOVÝ', m: 'Od včera', tone: 'orange', active: true },
  ];

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>UŽIVATELÉ · 1 284</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>Role & přístupy</div>
      </div>

      {/* Role pills with counts */}
      <div style={{ padding: '0 20px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[
          { r: 'ČLEN', n: 1247, c: T.fg },
          { r: 'TRENÉR', n: 32, c: T.cyan },
          { r: 'ADMIN', n: 5, c: T.accent },
        ].map((r, i) => (
          <div key={i} style={{
            padding: '10px 12px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12,
          }}>
            <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.8 }}>{r.r}</div>
            <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700, color: r.c, marginTop: 3 }}>{r.n.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: '9px 12px',
        }}>
          {Icon.search(T.fgMuted)}
          <div style={{ flex: 1, fontFamily: T.mono, fontSize: 11, color: T.fgMuted }}>jméno · e-mail · ID</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {['⌘K', 'FILTER'].map((k, i) => (
              <div key={i} style={{ padding: '2px 6px', borderRadius: 4, background: T.surface2, fontFamily: T.mono, fontSize: 9, color: T.fgDim, border: `1px solid ${T.line}` }}>{k}</div>
            ))}
          </div>
        </div>
      </div>

      {/* User list */}
      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {USERS.map((u, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10,
            opacity: u.active ? 1 : 0.5,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 10, fontWeight: 700 }}>
              {u.n.split(' ').map(x => x[0]).join('').slice(0,2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.n}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, marginTop: 1 }}>{u.m}</div>
            </div>
            <Tag tone={u.tone}>{u.r}</Tag>
            <div style={{ padding: 4 }}>
              <svg width="4" height="16" viewBox="0 0 4 16" fill={T.fgDim}><circle cx="2" cy="3" r="1.5"/><circle cx="2" cy="8" r="1.5"/><circle cx="2" cy="13" r="1.5"/></svg>
            </div>
          </div>
        ))}
      </div>

      <TabBar active={2} items={[
        { icon: Icon.spark(T.fgMuted), label: 'OVERVIEW' },
        { icon: Icon.wave(T.fgMuted), label: 'HEATMAP' },
        { icon: Icon.users(T.accent), label: s.users },
        { icon: Icon.pin(T.fgMuted), label: s.locations },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — Locations map (admin birds-eye)
// ─────────────────────────────────────────────────────────────
function AdminLocations({ lang = 'cz' }) {
  const s = STR[lang];
  const [sel, setSel] = React.useState('l4'); // Vinohrady

  return (
    <Device>
      <div style={{ padding: '8px 20px 10px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>POBOČKY · 6 · PRAHA</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Síť · live</div>
      </div>

      {/* Map */}
      <div style={{ margin: '0 20px 10px', height: 290, borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.line}`, position: 'relative' }}>
        <StyledMap mode="walk" minutes={60} showIso={false} highlightId={sel} onPinClick={(p) => setSel(p.id)} />
        <div style={{
          position: 'absolute', top: 10, left: 10, padding: '6px 10px',
          background: 'rgba(10,11,13,0.75)', border: `1px solid ${T.lineStrong}`, borderRadius: 8,
          fontFamily: T.mono, fontSize: 10, color: T.fg, letterSpacing: 0.5, display: 'flex', gap: 8,
        }}>
          <span><span style={{ color: T.accent }}>6</span> POBOČEK</span>
          <span style={{ color: T.fgDim }}>·</span>
          <span><span style={{ color: T.cyan }}>32</span> TRENÉRŮ</span>
        </div>
      </div>

      {/* Selected location detail */}
      {(() => {
        const p = LESSON_PINS.find(x => x.id === sel) || LESSON_PINS[0];
        return (
          <div style={{ padding: '0 20px 100px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 0.8 }}>#{p.id.toUpperCase()} · PRAHA 2</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{p.studio}</div>
                </div>
                <Tag tone={p.taken >= p.cap ? 'orange' : 'accent'}>LIVE</Tag>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {[
                  { l: 'DNES', v: '8', sub: 'LEKCÍ' },
                  { l: 'OBSAZ.', v: '91%', sub: 'AVG TÝDEN' },
                  { l: 'TRŽBY', v: '68K', sub: 'MTD · KČ' },
                ].map((k, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.6 }}>{k.l}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 700, marginTop: 2 }}>{k.v}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, marginTop: 1 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <Divider style={{ margin: '4px 0 10px' }} />
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim, letterSpacing: 0.8, marginBottom: 6 }}>STUDIA · 3</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { n: 'STUDIO A · HIIT / Spin', cap: 22, act: true, now: '18:00 HIIT' },
                  { n: 'STUDIO B · Yoga / Mobility', cap: 16, act: true, now: '—' },
                  { n: 'STUDIO 1:1 · Personal', cap: 2, act: true, now: '—' },
                ].map((st, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: st.act ? T.accent : T.fgDim }} />
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg, flex: 1 }}>{st.n}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>{st.now}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgMuted, width: 32, textAlign: 'right' }}>{st.cap}p</div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <Btn tone="dark" size="sm" style={{ flex: 1 }}>ROZVRH</Btn>
              <Btn tone="dark" size="sm" style={{ flex: 1 }}>TRENÉŘI</Btn>
              <Btn tone="accent" size="sm" style={{ flex: 1 }}>+ LEKCE</Btn>
            </div>
          </div>
        );
      })()}

      <TabBar active={3} items={[
        { icon: Icon.spark(T.fgMuted), label: 'OVERVIEW' },
        { icon: Icon.wave(T.fgMuted), label: 'HEATMAP' },
        { icon: Icon.users(T.fgMuted), label: s.users },
        { icon: Icon.pin(T.accent), label: s.locations },
      ]} />
    </Device>
  );
}

Object.assign(window, { AdminOverview, AdminHeatmap, AdminUsers, AdminLocations });
