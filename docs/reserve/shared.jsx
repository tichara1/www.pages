// shared.jsx — Design tokens, i18n, and shared primitives

// ─────────────────────────────────────────────────────────────
// Design tokens — tech/premium dark, monospace accents
// ─────────────────────────────────────────────────────────────
const T = {
  // Surfaces
  bg: '#0A0B0D',           // deep near-black
  surface: '#111214',       // cards
  surface2: '#17181B',      // elevated
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.14)',
  // Text
  fg: '#F4F4F5',
  fgMuted: '#A1A1AA',
  fgDim: '#71717A',
  // Accent — electric lime; same chroma/lightness, vary hue for secondaries
  accent: 'oklch(0.86 0.18 130)',         // lime
  accentInk: '#0A0B0D',
  accentSoft: 'oklch(0.86 0.18 130 / 0.14)',
  accentBorder: 'oklch(0.86 0.18 130 / 0.35)',
  // Warnings/status
  orange: 'oklch(0.76 0.16 55)',
  rose: 'oklch(0.70 0.18 15)',
  cyan: 'oklch(0.82 0.13 220)',
  // Font stacks
  sans: '"Inter", ui-sans-serif, -apple-system, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

// ─────────────────────────────────────────────────────────────
// i18n — CZ/EN string bundle
// ─────────────────────────────────────────────────────────────
const STR = {
  cz: {
    // global nav
    map: 'Mapa', list: 'Seznam', lessons: 'Lekce', profile: 'Profil',
    dashboard: 'Přehled', schedule: 'Rozvrh', templates: 'Šablony',
    users: 'Uživatelé', locations: 'Pobočky', reports: 'Reporty',
    // map/filter
    near_me: 'Blízko mě', travel_by: 'Jedu', walk: 'Pěšky', transit: 'MHD', car: 'Autem',
    can_make_it: 'Stihnu ještě dneska', free_spots: 'Volná místa', now: 'teď',
    starts_in: 'Začíná za', mins: 'min', hr: 'h',
    search: 'Hledat lekci, trenéra, cvik…',
    voice: 'Řekni co chceš — „HIIT do 20 min od mě"',
    // lesson
    book: 'Rezervovat', book_for_two: 'Rezervovat + kámoš', waitlist: 'Čekací listina',
    attend: 'Jdu', cancel: 'Zrušit', check_in: 'Check-in',
    capacity: 'Kapacita', level: 'Úroveň', equipment: 'Pomůcky',
    // trener
    new_lesson: 'Nová lekce', from_template: 'Ze šablony', this_week: 'Tento týden',
    attendees: 'Účastníci', repeat: 'Opakovat',
    // admin
    active_lessons: 'Aktivní lekce', occupancy: 'Obsazenost', revenue: 'Tržby',
    // compat
    compat: 'Shoda', style: 'Styl', energy: 'Energie', language: 'Jazyk',
  },
  en: {
    map: 'Map', list: 'List', lessons: 'Lessons', profile: 'Profile',
    dashboard: 'Overview', schedule: 'Schedule', templates: 'Templates',
    users: 'Users', locations: 'Locations', reports: 'Reports',
    near_me: 'Near me', travel_by: 'Travel', walk: 'Walk', transit: 'Transit', car: 'Drive',
    can_make_it: 'I can still make today', free_spots: 'Free spots', now: 'now',
    starts_in: 'Starts in', mins: 'min', hr: 'h',
    search: 'Search lessons, trainers, drills…',
    voice: "Tell it what you want — 'HIIT under 20 min from me'",
    book: 'Book', book_for_two: 'Book + friend', waitlist: 'Waitlist',
    attend: 'Attending', cancel: 'Cancel', check_in: 'Check in',
    capacity: 'Capacity', level: 'Level', equipment: 'Equipment',
    new_lesson: 'New lesson', from_template: 'From template', this_week: 'This week',
    attendees: 'Attendees', repeat: 'Repeat',
    active_lessons: 'Active lessons', occupancy: 'Occupancy', revenue: 'Revenue',
    compat: 'Match', style: 'Style', energy: 'Energy', language: 'Language',
  },
};

// ─────────────────────────────────────────────────────────────
// Chrome — custom status bar + home indicator for our dark theme
// (we want monospace clock to match our brand)
// ─────────────────────────────────────────────────────────────
function StatusBar({ time = '07:42' }) {
  return (
    <div style={{
      height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '0 28px 12px', color: T.fg, position: 'relative', zIndex: 20,
    }}>
      <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 500, letterSpacing: 0.2 }}>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: 0.9 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.7"/><rect x="4.5" y="4.5" width="3" height="6.5" rx="0.7"/><rect x="9" y="2" width="3" height="9" rx="0.7"/><rect x="13.5" y="0" width="3" height="11" rx="0.7"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" opacity="0.95"><path d="M8 2.9c2.1 0 4 .8 5.4 2.2l1-1A8.9 8.9 0 0 0 8 1.4c-2.4 0-4.6 1-6.3 2.7l1 1A7.6 7.6 0 0 1 8 2.9Zm0 3.3c1.2 0 2.4.5 3.3 1.3l1-1A6 6 0 0 0 8 4.7a6 6 0 0 0-4.2 1.8l1 1A4.7 4.7 0 0 1 8 6.2Zm0 3c.5 0 1 .2 1.4.6l-1.4 1.4-1.4-1.4c.4-.4.9-.6 1.4-.6Z"/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke="currentColor" strokeOpacity="0.55" fill="none"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill="currentColor"/><path d="M22 3.5v4c.7-.3 1.2-1 1.2-2s-.5-1.7-1.2-2Z" fill="currentColor" opacity="0.55"/></svg>
      </div>
    </div>
  );
}

function HomeBar({ light = true }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 34,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      paddingBottom: 8, pointerEvents: 'none', zIndex: 60,
    }}>
      <div style={{ width: 134, height: 5, borderRadius: 5, background: light ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.35)' }} />
    </div>
  );
}

// Device shell tuned to our theme
function Device({ children, tint = T.bg }) {
  return (
    <div style={{
      width: 402, height: 874, borderRadius: 48, overflow: 'hidden',
      position: 'relative', background: tint,
      fontFamily: T.sans, color: T.fg,
      boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06) inset',
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 126, height: 37, borderRadius: 24, background: '#000', zIndex: 50,
      }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <StatusBar />
      </div>
      <div style={{ height: '100%', paddingTop: 54, boxSizing: 'border-box' }}>
        {children}
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────
function Tag({ children, tone = 'default', style = {} }) {
  const tones = {
    default: { bg: 'rgba(255,255,255,0.06)', fg: T.fgMuted, bd: T.line },
    accent:  { bg: T.accentSoft, fg: T.accent, bd: T.accentBorder },
    orange:  { bg: 'oklch(0.76 0.16 55 / 0.14)', fg: T.orange, bd: 'oklch(0.76 0.16 55 / 0.3)' },
    rose:    { bg: 'oklch(0.70 0.18 15 / 0.14)', fg: T.rose, bd: 'oklch(0.70 0.18 15 / 0.3)' },
    cyan:    { bg: 'oklch(0.82 0.13 220 / 0.14)', fg: T.cyan, bd: 'oklch(0.82 0.13 220 / 0.3)' },
  };
  const c = tones[tone] || tones.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 4,
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      fontFamily: T.mono, fontSize: 10.5, fontWeight: 500,
      letterSpacing: 0.3, textTransform: 'uppercase',
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, tone = 'accent', size = 'md', style = {}, onClick }) {
  const sizes = {
    sm: { padV: 8, padH: 12, fs: 13, r: 8 },
    md: { padV: 12, padH: 16, fs: 14, r: 10 },
    lg: { padV: 15, padH: 20, fs: 15, r: 12 },
  };
  const s = sizes[size];
  const tones = {
    accent: { bg: T.accent, fg: T.accentInk, bd: 'transparent' },
    dark:   { bg: T.surface2, fg: T.fg, bd: T.lineStrong },
    ghost:  { bg: 'transparent', fg: T.fg, bd: T.lineStrong },
  };
  const c = tones[tone];
  return (
    <button onClick={onClick} style={{
      padding: `${s.padV}px ${s.padH}px`, borderRadius: s.r,
      background: c.bg, color: c.fg, border: `1px solid ${c.bd}`,
      fontFamily: T.sans, fontSize: s.fs, fontWeight: 600, letterSpacing: -0.1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      cursor: 'pointer', ...style,
    }}>{children}</button>
  );
}

function Card({ children, pad = 14, style = {} }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.line}`, borderRadius: 14,
      padding: pad, ...style,
    }}>{children}</div>
  );
}

function Divider({ style = {} }) {
  return <div style={{ height: 1, background: T.line, ...style }} />;
}

// ─────────────────────────────────────────────────────────────
// Sparkline / meter — JetBrains-mono flavored
// ─────────────────────────────────────────────────────────────
function Meter({ value = 0.5, color = T.accent, height = 4 }) {
  return (
    <div style={{ height, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.round(value * 100)}%`, height: '100%', background: color }} />
    </div>
  );
}

function Dots({ filled = 3, total = 5, color = T.accent }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: 1,
          background: i < filled ? color : 'rgba(255,255,255,0.12)',
        }} />
      ))}
    </div>
  );
}

// Inline SVG icon set — minimal stroke
const Icon = {
  pin:   (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><path d="M7 12.5s-4-4-4-7a4 4 0 118 0c0 3-4 7-4 7z"/><circle cx="7" cy="5.5" r="1.2"/></svg>,
  clock: (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><circle cx="7" cy="7" r="5.3"/><path d="M7 4v3l2 1.5"/></svg>,
  walk:  (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><circle cx="8.5" cy="2.5" r="1.1"/><path d="M7 4.5L5 8l2 1v3.5M7 9l2.5 2.5M5 6l-2 .5"/></svg>,
  tram:  (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><rect x="3" y="2" width="8" height="8" rx="1.5"/><circle cx="5.5" cy="10.5" r=".8"/><circle cx="8.5" cy="10.5" r=".8"/><path d="M3 6h8M6 2v2"/></svg>,
  car:   (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><path d="M2.5 8l1-3h7l1 3v3h-9V8z"/><circle cx="4.5" cy="10.5" r=".8"/><circle cx="9.5" cy="10.5" r=".8"/></svg>,
  users: (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><circle cx="5" cy="5" r="2"/><path d="M1.5 12c.5-2 2-3 3.5-3s3 1 3.5 3"/><circle cx="10" cy="5.5" r="1.5"/><path d="M9 9c1.5 0 3 .8 3.5 2.5"/></svg>,
  spark: (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5L11 11M3 11l1.5-1.5M9.5 4.5L11 3"/></svg>,
  qr:    (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><rect x="1" y="1" width="4" height="4"/><rect x="9" y="1" width="4" height="4"/><rect x="1" y="9" width="4" height="4"/><path d="M9 7h1v1M7 1v3M7 7h3M7 11h1v2M11 9v2h2"/></svg>,
  mic:   (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><rect x="5" y="1.5" width="4" height="7" rx="2"/><path d="M2.5 7.5a4.5 4.5 0 009 0M7 12v1.5"/></svg>,
  search:(c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.6"><circle cx="6" cy="6" r="4"/><path d="M9 9l3.5 3.5"/></svg>,
  plus:  (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.6"><path d="M7 2v10M2 7h10"/></svg>,
  flame: (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4"><path d="M7 12.5c2.5 0 4-1.8 4-4 0-2-1-3-2-4 0 1.5-1 2-1 2s-.5-2-1-3.5c-1.5 1-3 2.5-3 5.5 0 2.2 1.5 4 3 4z"/></svg>,
  bolt:  (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.4" strokeLinejoin="round"><path d="M8 1L3 8h3l-1 5 5-7H7l1-5z"/></svg>,
  check: (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.8"><path d="M3 7l3 3 5-6"/></svg>,
  x:     (c=T.fg) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={c} strokeWidth="1.6"><path d="M3 3l8 8M11 3l-8 8"/></svg>,
  chev:  (c=T.fg) => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={c} strokeWidth="1.8"><path d="M4 2l4 4-4 4"/></svg>,
  wave:  (c=T.fg) => <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke={c} strokeWidth="1.4"><path d="M1 6 Q 3 1 5 6 T 9 6 T 13 6 T 17 6 T 21 6 T 24 6"/></svg>,
};

// Tab bar shown at bottom of screens
function TabBar({ items, active = 0 }) {
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 10, zIndex: 40,
      background: 'rgba(20,20,23,0.78)',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      border: `1px solid ${T.line}`,
      borderRadius: 20,
      padding: '10px 6px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {items.map((it, i) => {
        const act = i === active;
        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 14px', borderRadius: 12,
            color: act ? T.accent : T.fgMuted,
            background: act ? T.accentSoft : 'transparent',
            fontFamily: T.mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            {it.icon}
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Section header in-page
function PageHeader({ eyebrow, title, right }) {
  return (
    <div style={{ padding: '8px 20px 16px' }}>
      {eyebrow && (
        <div style={{
          fontFamily: T.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase',
          color: T.fgDim, marginBottom: 6,
        }}>{eyebrow}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.05 }}>{title}</div>
        {right}
      </div>
    </div>
  );
}

Object.assign(window, {
  T, STR, StatusBar, HomeBar, Device, Tag, Btn, Card, Divider, Meter, Dots, Icon, TabBar, PageHeader,
});
