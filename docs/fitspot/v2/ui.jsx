/* Sdílené stavební prvky. Stejná paleta a typografie jako v1, aby verze
   vedle sebe dávaly smysl. */

const C = {
  bg: '#0B0C08',
  surface: '#14160E',
  surface2: '#191C11',
  line: '#22261A',
  line2: '#2A2E1E',
  text: '#F1F4E8',
  muted: '#9AA18A',
  dim: '#6B7259',
  ac: 'var(--ac)',
  warn: '#E4B73C',
  bad: '#D9694F'
};

const czk = (n) => Math.round(n).toLocaleString('cs-CZ');
// Jedno desetinné místo s českou čárkou.
const dec1 = (n) => n.toLocaleString('cs-CZ', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Iniciály pro dlaždici místo fotky.
const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

function Chip({ label, active, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={!!active}
      style={{
        flexShrink: 0, padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
        border: `1px solid ${active ? C.ac : C.line2}`,
        background: active ? 'color-mix(in srgb, var(--ac) 16%, transparent)' : 'transparent',
        color: active ? C.ac : C.muted,
        fontSize: 13, fontWeight: 600, transition: 'border-color .15s, color .15s'
      }}
    >{label}</button>
  );
}

function ChipRow({ children }) {
  return (
    <div className="noscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 20px 12px' }}>
      {children}
    </div>
  );
}

// Nadpis sekce. `step` vykreslí pořadové číslo — filtry v tabu Hledat se čtou
// shora dolů jako postup, ne jako hromada nezávislých přepínačů.
function SectionTitle({ children, step, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '0 20px 6px' }}>
      {step != null && (
        <span className="mono" style={{
          width: 18, height: 18, borderRadius: 5, display: 'grid', placeItems: 'center',
          background: C.line, color: C.ac, fontSize: 11, fontWeight: 600, flexShrink: 0
        }}>{step}</span>
      )}
      <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.dim }}>
        {children}
      </span>
      {hint && <span style={{ fontSize: 11, color: C.dim, opacity: .8 }}>{hint}</span>}
    </div>
  );
}

// Totéž co SectionTitle, ale bez vlastního odsazení — pro použití uvnitř
// bloku, který si horizontální padding už řeší sám.
function Label({ children, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.dim }}>
        {children}
      </span>
      {hint && <span style={{ fontSize: 11, color: C.dim, opacity: .8 }}>{hint}</span>}
    </div>
  );
}

function Card({ children, onClick, active, style }) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      style={{
        background: C.surface,
        border: `1px solid ${active ? C.ac : C.line}`,
        borderRadius: 16, padding: 12, cursor: clickable ? 'pointer' : 'default',
        transition: 'border-color .15s', ...style
      }}
    >{children}</div>
  );
}

function Avatar({ name, photo, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: size >= 72 ? 14 : 12,
      background: photo, display: 'grid', placeItems: 'center',
      fontWeight: 900, fontSize: size / 2.6, color: 'rgba(241,244,232,.85)'
    }}>{initials(name)}</div>
  );
}

function Button({ children, onClick, variant = 'primary', full, disabled, type = 'button' }) {
  const styles = {
    primary: { background: C.ac, color: C.bg, border: 'none' },
    ghost: { background: 'transparent', color: C.muted, border: `1px solid ${C.line2}` },
    danger: { background: 'transparent', color: C.bad, border: `1px solid ${C.line2}` }
  }[variant];
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        ...styles, width: full ? '100%' : undefined, padding: '12px 18px', borderRadius: 10,
        fontWeight: 800, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .45 : 1
      }}
    >{children}</button>
  );
}

function Tag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { color: C.muted, border: C.line2, bg: 'transparent' },
    accent: { color: C.ac, border: 'color-mix(in srgb, var(--ac) 40%, transparent)', bg: 'color-mix(in srgb, var(--ac) 12%, transparent)' },
    warn: { color: C.warn, border: 'rgba(228,183,60,.4)', bg: 'rgba(228,183,60,.1)' },
    bad: { color: C.bad, border: 'rgba(217,105,79,.4)', bg: 'rgba(217,105,79,.1)' }
  }[tone];
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
      color: tones.color, border: `1px solid ${tones.border}`, background: tones.bg, whiteSpace: 'nowrap'
    }}>{children}</span>
  );
}

function StatTile({ label, value, unit, accent }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px' }}>
      <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.dim }}>{label}</div>
      <div className="mono" style={{ marginTop: 6, fontSize: 22, fontWeight: 600, color: accent ? C.ac : C.text, lineHeight: 1.1 }}>
        {value}{unit && <span style={{ fontSize: 13, color: C.muted, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 3, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 10 }}>
      {options.map((o) => (
        <button
          key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          style={{
            flex: 1, padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: value === o.value ? C.ac : 'transparent',
            color: value === o.value ? C.bg : C.muted, fontSize: 12.5, fontWeight: 800
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

function Empty({ title, hint, action }) {
  return (
    <div style={{
      padding: '34px 20px', textAlign: 'center', border: `1px dashed ${C.line2}`,
      borderRadius: 16, background: 'rgba(20,22,14,.5)'
    }}>
      <div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div>
      {hint && <div style={{ marginTop: 6, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{hint}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

function TopBar({ onBack, right }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, padding: '14px 20px',
      background: 'rgba(11,12,8,.92)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.line}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Zpět" style={{
            width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.line2}`,
            background: 'transparent', color: C.text, cursor: 'pointer', fontSize: 15
          }}>‹</button>
        ) : (
          <div style={{
            width: 30, height: 30, background: C.ac, color: C.bg, display: 'grid', placeItems: 'center',
            fontWeight: 900, fontSize: 17, borderRadius: 8
          }}>F</div>
        )}
        <div style={{ fontWeight: 900, fontSize: 19, letterSpacing: '.02em' }}>FITSPOT</div>
        <span className="mono" style={{ fontSize: 10, color: C.bg, background: C.ac, padding: '2px 5px', borderRadius: 4, fontWeight: 600 }}>v2</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {right}
        <div className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: '.06em' }}>PRAHA</div>
      </div>
    </header>
  );
}

const NAV_ITEMS = [
  { id: 'search', icon: '⌕', label: 'Hledat' },
  { id: 'lessons', icon: '✦', label: 'Lekce' },
  { id: 'trainer', icon: '▤', label: 'Trenér' },
  { id: 'admin', icon: '◫', label: 'Super admin' }
];

function BottomNav({ tab, onTab, badges }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      display: 'grid', gridTemplateColumns: `repeat(${NAV_ITEMS.length}, 1fr)`,
      maxWidth: 1200, margin: '0 auto',
      background: 'rgba(17,19,12,.96)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${C.line}`
    }}>
      {NAV_ITEMS.map((item) => {
        const active = tab === item.id;
        const badge = badges && badges[item.id];
        return (
          <button
            key={item.id} type="button" onClick={() => onTab(item.id)} aria-current={active ? 'page' : undefined}
            style={{
              padding: '12px 0 14px', border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? C.ac : C.dim
            }}
          >
            <div style={{ position: 'relative', fontSize: 16, fontWeight: 900 }}>
              {item.icon}
              {badge > 0 && (
                <span className="mono" style={{
                  position: 'absolute', top: -5, left: '100%', marginLeft: 1,
                  minWidth: 15, height: 15, padding: '0 3px', borderRadius: 999,
                  background: C.ac, color: C.bg, fontSize: 9.5, fontWeight: 600,
                  display: 'grid', placeItems: 'center'
                }}>{badge}</span>
              )}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em' }}>{item.label}</div>
          </button>
        );
      })}
    </nav>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div role="status" style={{
      position: 'fixed', bottom: 78, left: '50%', zIndex: 60, transform: 'translateX(-50%)',
      padding: '12px 20px', background: C.ac, color: C.bg, borderRadius: 12,
      fontWeight: 700, fontSize: 14, boxShadow: '0 8px 30px rgba(0,0,0,.5)',
      animation: 'fsToastIn .25s ease', whiteSpace: 'nowrap', maxWidth: '90vw', overflow: 'hidden', textOverflow: 'ellipsis'
    }}>{message}</div>
  );
}

function Screen({ children }) {
  return <div style={{ animation: 'fsFadeUp .3s ease' }}>{children}</div>;
}

Object.assign(window, {
  C, czk, dec1, initials, Chip, ChipRow, SectionTitle, Label, Card, Avatar, Button, Tag,
  StatTile, Segmented, Empty, TopBar, BottomNav, Toast, Screen
});
