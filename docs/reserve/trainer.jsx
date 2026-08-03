// trainer.jsx — Trenér screens: Dashboard, Template editor, Schedule/week view, Attendees

// ─────────────────────────────────────────────────────────────
// Screen 1 — Trainer dashboard
// ─────────────────────────────────────────────────────────────
function TrainerDashboard({ lang = 'cz' }) {
  const s = STR[lang];
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>COACH · MARTIN K.</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>Dnes 3 lekce<br/><span style={{ color: T.fgMuted, fontWeight: 500 }}>42 klientů</span></div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.plus(T.fg)}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 100 }}>
        {/* Next lesson card */}
        <div style={{
          background: T.surface, border: `1px solid ${T.accentBorder}`, borderRadius: 16, padding: 14,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 140,
            background: 'radial-gradient(circle, oklch(0.86 0.18 130 / 0.15), transparent 70%)' }} />
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
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 3 }}>ČEKACÍ LISTINA</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <div style={{ fontFamily: T.mono, fontSize: 20, fontWeight: 700 }}>3</div>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgDim }}>AUTO-POST</div>
              </div>
              <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                {[1,2,3].map(i => <div key={i} style={{ width: 14, height: 3, borderRadius: 2, background: T.cyan, opacity: 0.7 }} />)}
              </div>
            </div>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn tone="accent" size="sm" style={{ flex: 1 }}>{Icon.qr(T.accentInk)} SPUSTIT CHECK-IN</Btn>
            <Btn tone="dark" size="sm">{Icon.users(T.fg)} ÚČASTNÍCI</Btn>
          </div>
        </div>

        {/* Today's schedule rail */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px 8px' }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>DNES · ÚTERÝ 23.4.</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>3 LEKCE · 2.5 H</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { t: '08:10', e: '08:55', n: 'HIIT 45', loc: 'LETNÁ · ST.2', cap: [11,18], tone: 'accent', now: true },
              { t: '12:30', e: '13:15', n: 'Personal · L. Nová', loc: 'LETNÁ · 1:1', cap: [1,1], tone: 'cyan' },
              { t: '18:00', e: '19:00', n: 'HIIT 60 · pokročilí', loc: 'KARLÍN · ST.A', cap: [14,16], tone: 'orange' },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', background: T.surface, border: `1px solid ${x.now ? T.accentBorder : T.line}`, borderRadius: 12, padding: 12 }}>
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

        {/* Earnings sparkline */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>VÝDĚLEK · 14 DNÍ</div>
            <div style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600 }}>18 420 <span style={{ color: T.fgDim }}>KČ</span></div>
          </div>
          <svg width="100%" height="50" viewBox="0 0 320 50" preserveAspectRatio="none">
            <path d="M 0 40 L 20 32 L 40 36 L 60 24 L 80 28 L 100 18 L 120 22 L 140 14 L 160 20 L 180 12 L 200 16 L 220 8 L 240 14 L 260 6 L 280 12 L 300 4 L 320 10"
              fill="none" stroke="oklch(0.86 0.18 130)" strokeWidth="1.5"/>
            <path d="M 0 40 L 20 32 L 40 36 L 60 24 L 80 28 L 100 18 L 120 22 L 140 14 L 160 20 L 180 12 L 200 16 L 220 8 L 240 14 L 260 6 L 280 12 L 300 4 L 320 10 L 320 50 L 0 50 Z"
              fill="oklch(0.86 0.18 130 / 0.1)"/>
          </svg>
        </Card>
      </div>

      <TabBar active={0} items={[
        { icon: Icon.spark(T.accent), label: s.dashboard },
        { icon: Icon.clock(T.fgMuted), label: s.schedule },
        { icon: Icon.plus(T.fgMuted), label: s.templates },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — Template editor
// ─────────────────────────────────────────────────────────────
function TrainerTemplate({ lang = 'cz' }) {
  const s = STR[lang];
  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.surface, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke={T.fg} strokeWidth="1.8"><path d="M8 1L2 7l6 6"/></svg>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>ŠABLONA · #TPL-HIIT45</div>
          <div style={{ flex: 1 }} />
          <Tag tone="accent">AKTIVNÍ</Tag>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>HIIT 45</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginTop: 2 }}>POUŽITO 32× · POSLEDNÍ 23.4.</div>
      </div>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 100 }}>
        {/* Basics grid */}
        <Card pad={0}>
          {[
            { l: 'NÁZEV', v: 'HIIT 45 · Spálit ráno' },
            { l: 'POPIS', v: 'Vysoce intenzivní intervaly. Kardio + core.', multi: true },
            { l: 'DÉLKA', v: '45 min', meta: 'SLOTS 08:00, 12:00, 18:00' },
            { l: 'KAPACITA', v: '18', meta: 'WAITLIST ZAPNUTO · MAX +5' },
            { l: 'ÚROVEŇ', v: '3 / 5', dots: 3 },
            { l: 'POMŮCKY', v: 'Kettlebell · TRX · Box', chips: true },
            { l: 'CENA', v: '320 Kč', meta: 'KREDIT / ČLENSTVÍ' },
          ].map((r, i, a) => (
            <div key={i} style={{
              padding: '12px 14px',
              borderBottom: i < a.length - 1 ? `1px solid ${T.line}` : 'none',
            }}>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.8, marginBottom: 4 }}>{r.l}</div>
              {r.chips ? (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {r.v.split(' · ').map((c, j) => <Tag key={j}>{c}</Tag>)}
                  <Tag tone="default" style={{ opacity: 0.5, borderStyle: 'dashed' }}>+ ADD</Tag>
                </div>
              ) : r.dots ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 14, color: T.fg }}>{r.v}</div>
                  <Dots filled={r.dots} total={5} />
                </div>
              ) : (
                <div style={{ fontSize: 14, color: T.fg, lineHeight: 1.35 }}>{r.v}</div>
              )}
              {r.meta && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, marginTop: 3 }}>{r.meta}</div>}
            </div>
          ))}
        </Card>

        {/* Repeat schedule */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>{s.repeat.toUpperCase()} · TÝDEN</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>5× / TÝDEN</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {['PO','ÚT','ST','ČT','PÁ','SO','NE'].map((d, i) => {
              const active = i < 5;
              return (
                <div key={i} style={{
                  padding: '10px 0', borderRadius: 8, textAlign: 'center',
                  background: active ? T.accentSoft : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? T.accentBorder : T.line}`,
                  color: active ? T.accent : T.fgDim,
                  fontFamily: T.mono, fontSize: 11, fontWeight: 600,
                }}>{d}</div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
            {['08:00', '12:00', '18:00'].map(t => (
              <div key={t} style={{
                padding: '6px 10px', borderRadius: 8, background: T.surface2, border: `1px solid ${T.line}`,
                fontFamily: T.mono, fontSize: 11, color: T.fg, display: 'flex', alignItems: 'center', gap: 5,
              }}>{t} <span style={{ opacity: 0.4 }}>×</span></div>
            ))}
            <div style={{
              padding: '6px 10px', borderRadius: 8, background: 'transparent', border: `1px dashed ${T.line}`,
              fontFamily: T.mono, fontSize: 11, color: T.fgDim, display: 'flex', alignItems: 'center', gap: 5,
              cursor: 'pointer',
            }}>+ SLOT</div>
          </div>
        </Card>

        {/* Rundown (workout blocks) */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.fgDim, letterSpacing: 1 }}>PRŮBĚH LEKCE</div>
            <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.accent }}>45:00</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { n: 'Warm-up', t: 8, c: T.cyan },
              { n: 'HIIT blok A · 4×40/20', t: 12, c: T.accent },
              { n: 'Strength · kettlebell', t: 12, c: T.accent },
              { n: 'HIIT blok B · 3×30/15', t: 8, c: T.orange },
              { n: 'Cool-down · mobility', t: 5, c: T.fgMuted },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, width: 18 }}>{String(i+1).padStart(2, '0')}</div>
                <div style={{ flex: 1, fontSize: 12, color: T.fg }}>{b.n}</div>
                <div style={{ width: `${b.t * 4}px`, height: 6, borderRadius: 2, background: b.c, opacity: 0.8 }} />
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fg, width: 30, textAlign: 'right' }}>{b.t}'</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{
        position: 'absolute', bottom: 80, left: 12, right: 12, zIndex: 30,
        background: 'rgba(20,20,23,0.92)', backdropFilter: 'blur(24px)',
        border: `1px solid ${T.lineStrong}`, borderRadius: 20, padding: 10,
        display: 'flex', gap: 8,
      }}>
        <Btn tone="dark" size="md" style={{ flex: 1 }}>DUPLIKOVAT</Btn>
        <Btn tone="accent" size="md" style={{ flex: 2 }}>PUBLIKOVAT NA TENTO TÝDEN {Icon.chev(T.accentInk)}</Btn>
      </div>
      <TabBar active={2} items={[
        { icon: Icon.spark(T.fgMuted), label: s.dashboard },
        { icon: Icon.clock(T.fgMuted), label: s.schedule },
        { icon: Icon.plus(T.accent), label: s.templates },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — Weekly schedule grid
// ─────────────────────────────────────────────────────────────
function TrainerSchedule({ lang = 'cz' }) {
  const s = STR[lang];
  const HOURS = ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  const DAYS = ['PO 22', 'ÚT 23', 'ST 24', 'ČT 25', 'PÁ 26', 'SO 27', 'NE 28'];
  // events: [day(0-6), startHour(0-based of HOURS), duration_hours, name, tone]
  const EVENTS = [
    [0, 1, 0.75, 'HIIT', 'accent'],
    [0, 5.5, 0.75, '1:1 Nová', 'cyan'],
    [0, 11, 1, 'HIIT 60', 'orange'],
    [1, 1, 0.75, 'HIIT', 'accent'],
    [1, 11, 1, 'HIIT 60', 'orange'],
    [2, 5.5, 0.75, '1:1 P.', 'cyan'],
    [2, 11, 1, 'Mobility', 'cyan'],
    [3, 1, 0.75, 'HIIT', 'accent'],
    [3, 11, 1, 'HIIT 60', 'orange'],
    [4, 1, 0.75, 'HIIT', 'accent'],
    [4, 11, 1, 'Spin', 'rose'],
    [5, 3, 1.5, 'Outdoor', 'accent'],
  ];

  const TONE = { accent: T.accent, cyan: T.cyan, orange: T.orange, rose: T.rose };

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>ROZVRH · T17 · DUBEN</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn tone="dark" size="sm" style={{ padding: '6px 10px' }}>{Icon.chev(T.fg)}</Btn>
            <Btn tone="dark" size="sm" style={{ padding: '6px 10px', transform: 'scaleX(-1)' }}>{Icon.chev(T.fg)}</Btn>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>22 — 28. dubna</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginTop: 2 }}>12 LEKCÍ · 14.5 H · 184 MÍST</div>
      </div>

      {/* Week header */}
      <div style={{ padding: '0 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
          <div />
          {DAYS.map((d, i) => (
            <div key={i} style={{
              fontFamily: T.mono, fontSize: 9.5, color: i === 1 ? T.accent : T.fgDim,
              textAlign: 'center', letterSpacing: 0.5,
              padding: '4px 0', borderRadius: 4,
              background: i === 1 ? T.accentSoft : 'transparent',
            }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          position: 'relative', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12,
          overflow: 'hidden',
        }}>
          {HOURS.map((h, hi) => (
            <div key={h} style={{
              display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)',
              borderBottom: hi < HOURS.length - 1 ? `1px solid ${T.line}` : 'none',
              height: 28, alignItems: 'center',
            }}>
              <div style={{ fontFamily: T.mono, fontSize: 8.5, color: T.fgDim, textAlign: 'center' }}>{h}</div>
              {Array.from({ length: 7 }).map((_, di) => (
                <div key={di} style={{ borderLeft: `1px solid ${T.line}`, height: '100%' }} />
              ))}
            </div>
          ))}

          {/* Events absolutely positioned over grid */}
          {EVENTS.map((e, i) => {
            const [day, hr, dur, name, tone] = e;
            const cellW = `calc((100% - 28px) / 7)`;
            const left = `calc(28px + ${day} * ${cellW} + 2px)`;
            const width = `calc(${cellW} - 4px)`;
            const top = hr * 28 + 2;
            const height = dur * 28 - 4;
            const color = TONE[tone];
            return (
              <div key={i} style={{
                position: 'absolute', left, top, width, height,
                background: `${color.replace(')', ' / 0.18)')}`,
                border: `1px solid ${color.replace(')', ' / 0.6)')}`,
                borderLeft: `3px solid ${color}`,
                borderRadius: 5,
                padding: '2px 4px',
                fontFamily: T.mono, fontSize: 8.5, color: T.fg, fontWeight: 600,
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>{name}</div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', padding: '0 4px' }}>
          {[
            { c: T.accent, l: 'HIIT' },
            { c: T.cyan, l: 'MOBILITY · 1:1' },
            { c: T.orange, l: 'POKROČILÍ' },
            { c: T.rose, l: 'SPIN' },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.fgDim, letterSpacing: 0.5 }}>{x.l}</div>
            </div>
          ))}
        </div>

        {/* Action strip */}
        <div style={{
          marginTop: 14, display: 'flex', gap: 6,
        }}>
          <Btn tone="accent" size="sm" style={{ flex: 1 }}>{Icon.plus(T.accentInk)} LEKCE</Btn>
          <Btn tone="dark" size="sm" style={{ flex: 1 }}>ZE ŠABLONY</Btn>
          <Btn tone="ghost" size="sm" style={{ flex: 1 }}>KOPÍROVAT TÝDEN</Btn>
        </div>
      </div>

      <TabBar active={1} items={[
        { icon: Icon.spark(T.fgMuted), label: s.dashboard },
        { icon: Icon.clock(T.accent), label: s.schedule },
        { icon: Icon.plus(T.fgMuted), label: s.templates },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — Attendees / live check-in
// ─────────────────────────────────────────────────────────────
function TrainerAttendees({ lang = 'cz' }) {
  const s = STR[lang];
  const ATTENDEES = [
    { name: 'Tereza Nová', note: 'ZNOVU · #14', status: 'in', streak: 14, tags: ['PAIR→P.S.'] },
    { name: 'Petr Svoboda', note: 'PÁR', status: 'in', streak: 6, tags: ['PAIR→T.N.'] },
    { name: 'Jana Dvořák', note: 'NOVÁ · PRVNÍ LEKCE', status: 'in', streak: 1, tags: ['NEW'] },
    { name: 'Aleš Král', note: '', status: 'in', streak: 22 },
    { name: 'Kateřina H.', note: '', status: 'pending', streak: 3 },
    { name: 'Tomáš R.', note: '', status: 'pending', streak: 9 },
    { name: 'Lucie Nová', note: 'COMP: 91%', status: 'waitlist', streak: 4 },
    { name: 'David F.', note: 'AUTO POKUD UVOLNĚNO', status: 'waitlist', streak: 2 },
    { name: 'Ondřej M.', note: '', status: 'waitlist', streak: 18 },
  ];

  const inCount = ATTENDEES.filter(a => a.status === 'in').length;
  const pendCount = ATTENDEES.filter(a => a.status === 'pending').length;
  const wlCount = ATTENDEES.filter(a => a.status === 'waitlist').length;

  const statusStyle = (st) => ({
    in: { bg: T.accentSoft, fg: T.accent, bd: T.accentBorder, ic: Icon.check(T.accent), lbl: 'ZDE' },
    pending: { bg: 'rgba(255,255,255,0.05)', fg: T.fgMuted, bd: T.line, ic: Icon.clock(T.fgMuted), lbl: 'ČEKÁ' },
    waitlist: { bg: 'oklch(0.76 0.16 55 / 0.12)', fg: T.orange, bd: 'oklch(0.76 0.16 55 / 0.3)', ic: Icon.users(T.orange), lbl: 'WL' },
  }[st]);

  return (
    <Device>
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim, letterSpacing: 1.2 }}>ÚČASTNÍCI · LIVE · 08:09</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>HIIT 45 · Letná</div>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.fgMuted, marginTop: 2 }}>KOMP. HODNOCENÍ: ★ 4.88</div>
      </div>

      {/* KPI strip */}
      <div style={{ padding: '0 20px 12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {[
          { n: inCount, l: 'ZDE', c: T.accent },
          { n: pendCount, l: 'ČEKÁ', c: T.fg },
          { n: wlCount, l: 'WAITLIST', c: T.orange },
        ].map((x, i) => (
          <div key={i} style={{
            padding: '10px 12px', background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 700, color: x.c }}>{x.n}</div>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>{x.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Live scan pulse */}
      <div style={{ padding: '0 20px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: T.surface, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: 10,
        }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <div style={{ position: 'absolute', inset: 4, borderRadius: 12, background: T.accent }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `1px solid ${T.accent}`, opacity: 0.3 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>QR scanner aktivní</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.fgDim }}>POSLEDNÍ: T. NOVÁ · 07:58:21</div>
          </div>
          <Btn tone="dark" size="sm">PAUSE</Btn>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0 20px 100px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ATTENDEES.map((a, i) => {
          const st = statusStyle(a.status);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: '8px 10px',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: T.surface2, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg }}>
                {a.name.split(' ').map(x => x[0]).join('').slice(0,2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginTop: 1 }}>
                  {a.streak > 0 && (
                    <span style={{ fontFamily: T.mono, fontSize: 9, color: a.streak > 10 ? T.accent : T.fgDim }}>
                      🔥{a.streak}
                    </span>
                  )}
                  {a.note && <span style={{ fontFamily: T.mono, fontSize: 9, color: T.fgDim }}>{a.note}</span>}
                </div>
              </div>
              {a.tags && a.tags.map((t, j) => <Tag key={j} tone="cyan" style={{ fontSize: 8.5, padding: '2px 5px' }}>{t}</Tag>)}
              <div style={{
                padding: '4px 8px', borderRadius: 6,
                background: st.bg, color: st.fg, border: `1px solid ${st.bd}`,
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5,
              }}>
                {st.ic}{st.lbl}
              </div>
            </div>
          );
        })}
      </div>

      <TabBar active={0} items={[
        { icon: Icon.spark(T.accent), label: s.dashboard },
        { icon: Icon.clock(T.fgMuted), label: s.schedule },
        { icon: Icon.plus(T.fgMuted), label: s.templates },
        { icon: Icon.users(T.fgMuted), label: s.profile },
      ]} />
    </Device>
  );
}

Object.assign(window, { TrainerDashboard, TrainerTemplate, TrainerSchedule, TrainerAttendees });
