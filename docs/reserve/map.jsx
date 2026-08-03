// map.jsx — Stylized Prague map + travel-time isochrones + lesson pins

// Simplified Prague geometry: Vltava river + major districts as subtle fills.
// All pts in 0-380 x 0-540 viewBox.
const RIVER_D = "M 70 20 C 100 80, 60 140, 110 200 C 170 260, 140 320, 180 360 C 220 400, 170 460, 210 520 L 250 540 L 280 540 C 240 480, 290 420, 250 360 C 210 300, 250 240, 200 190 C 150 140, 200 80, 170 20 Z";

// District blobs — simplified shapes suggesting Staré Město, Vinohrady, Smíchov, Karlín
const DISTRICTS = [
  { d: "M 40 40 L 150 60 L 160 140 L 50 160 Z", name: "LETNÁ" },
  { d: "M 180 30 L 300 50 L 310 150 L 200 160 Z", name: "KARLÍN" },
  { d: "M 40 180 L 160 180 L 170 300 L 50 320 Z", name: "SMÍCHOV" },
  { d: "M 200 180 L 320 170 L 340 320 L 220 330 Z", name: "VINOHRADY" },
  { d: "M 50 340 L 170 330 L 180 460 L 60 480 Z", name: "ANDĚL" },
  { d: "M 220 340 L 340 340 L 350 480 L 230 500 Z", name: "VRŠOVICE" },
];

// Streets — decorative thin lines
const STREETS = [
  "M 0 90 L 380 110", "M 0 200 L 380 220", "M 0 320 L 380 340", "M 0 430 L 380 440",
  "M 90 0 L 110 540", "M 200 0 L 220 540", "M 310 0 L 300 540",
  "M 40 60 L 320 480", "M 340 40 L 60 500",
];

// Points of interest / lessons
const LESSON_PINS = [
  { id: 'l1', x: 118, y: 120, studio: 'Letná Gym', title: 'HIIT 45', time: '07:30', etaWalk: 8, etaTransit: 6, etaCar: 4, lvl: 3, price: 320, cap: 18, taken: 11, tone: 'accent', hot: true },
  { id: 'l2', x: 240, y: 100, studio: 'Karlín Lab',  title: 'Vinyasa', time: '08:00', etaWalk: 22, etaTransit: 12, etaCar: 9, lvl: 2, price: 280, cap: 16, taken: 9,  tone: 'cyan' },
  { id: 'l3', x: 95,  y: 260, studio: 'Smíchov Box', title: 'Box 1:1', time: '09:15', etaWalk: 18, etaTransit: 11, etaCar: 7, lvl: 4, price: 900, cap: 1,  taken: 0,  tone: 'orange' },
  { id: 'l4', x: 260, y: 230, studio: 'Vinohrady',   title: 'Spinning',time: '18:00', etaWalk: 30, etaTransit: 14, etaCar: 10, lvl: 3, price: 260, cap: 22, taken: 22, tone: 'rose' },
  { id: 'l5', x: 280, y: 380, studio: 'Vršovice Run',title: 'Outdoor 10k', time: '18:30', etaWalk: 35, etaTransit: 22, etaCar: 14, lvl: 2, price: 0,   cap: 30, taken: 14, tone: 'accent' },
  { id: 'l6', x: 130, y: 410, studio: 'Anděl Studio', title: 'Mobility', time: '19:00', etaWalk: 28, etaTransit: 15, etaCar: 11, lvl: 1, price: 240, cap: 12, taken: 6,  tone: 'cyan' },
];

// "ME" marker position (user location)
const ME = { x: 180, y: 260 };

function StyledMap({
  mode = 'walk',          // walk | transit | car
  minutes = 20,           // reachable within N minutes
  showIso = true,
  highlightId = null,
  onPinClick,
  compact = false,
}) {
  // Isochrone "radius" in svg units for 20-min circle (stylized)
  const radius = { walk: 50, transit: 120, car: 180 }[mode] * (minutes / 20);

  const unreachable = (p) => {
    const eta = mode === 'walk' ? p.etaWalk : mode === 'transit' ? p.etaTransit : p.etaCar;
    return eta > minutes;
  };

  return (
    <svg viewBox="0 0 380 540" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="isoGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.86 0.18 130)" stopOpacity="0.35" />
          <stop offset="65%" stopColor="oklch(0.86 0.18 130)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="oklch(0.86 0.18 130)" stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5"/>
        </pattern>
        <filter id="blur1"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      {/* base */}
      <rect width="380" height="540" fill="#0A0B0D"/>
      <rect width="380" height="540" fill="url(#grid)"/>
      {/* district blobs */}
      {DISTRICTS.map((d, i) => (
        <g key={i}>
          <path d={d.d} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
        </g>
      ))}
      {/* streets */}
      {STREETS.map((s, i) => (
        <path key={i} d={s} stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" fill="none"/>
      ))}
      {/* river */}
      <path d={RIVER_D} fill="oklch(0.30 0.04 240 / 0.55)" stroke="oklch(0.50 0.08 240 / 0.4)" strokeWidth="1"/>

      {/* district labels */}
      {!compact && DISTRICTS.map((d, i) => {
        const mx = parseFloat(d.d.split(' ')[1]) + 40;
        const my = parseFloat(d.d.split(' ')[2]) + 60;
        return (
          <text key={i} x={mx} y={my} fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="1.5">{d.name}</text>
        );
      })}

      {/* isochrone */}
      {showIso && (
        <g>
          <circle cx={ME.x} cy={ME.y} r={radius} fill="url(#isoGrad)"/>
          <circle cx={ME.x} cy={ME.y} r={radius} fill="none" stroke="oklch(0.86 0.18 130 / 0.5)" strokeWidth="1" strokeDasharray="3 3"/>
        </g>
      )}

      {/* Pins */}
      {LESSON_PINS.map((p) => {
        const dim = showIso && unreachable(p);
        const isHi = highlightId === p.id;
        const toneColor = {
          accent: 'oklch(0.86 0.18 130)', cyan: 'oklch(0.82 0.13 220)',
          orange: 'oklch(0.76 0.16 55)', rose: 'oklch(0.70 0.18 15)',
        }[p.tone] || 'oklch(0.86 0.18 130)';
        return (
          <g key={p.id} opacity={dim ? 0.25 : 1} onClick={() => onPinClick && onPinClick(p)} style={{ cursor: 'pointer' }}>
            {isHi && <circle cx={p.x} cy={p.y} r="16" fill="none" stroke={toneColor} strokeWidth="1.5" opacity="0.6"/>}
            <circle cx={p.x} cy={p.y} r="10" fill="#0A0B0D" stroke={toneColor} strokeWidth="1.6"/>
            <circle cx={p.x} cy={p.y} r="3.5" fill={toneColor}/>
            {p.hot && (
              <circle cx={p.x + 8} cy={p.y - 8} r="3" fill="oklch(0.76 0.16 55)" stroke="#0A0B0D" strokeWidth="1"/>
            )}
          </g>
        );
      })}

      {/* ME marker */}
      <g>
        <circle cx={ME.x} cy={ME.y} r="18" fill="oklch(0.86 0.18 130 / 0.15)"/>
        <circle cx={ME.x} cy={ME.y} r="7" fill="#0A0B0D" stroke="oklch(0.86 0.18 130)" strokeWidth="2"/>
        <circle cx={ME.x} cy={ME.y} r="2.5" fill="oklch(0.86 0.18 130)"/>
      </g>
    </svg>
  );
}

// Small static location thumbnail used in detail screens
function LocationThumb({ x = 180, y = 260, pinId = 'l1' }) {
  const pin = LESSON_PINS.find(p => p.id === pinId) || LESSON_PINS[0];
  return (
    <svg viewBox="0 0 380 200" width="100%" height="100%" style={{ display: 'block' }}>
      <rect width="380" height="200" fill="#0A0B0D"/>
      <path d="M 100 0 L 120 200 M 220 0 L 240 200 M 0 80 L 380 100 M 0 160 L 380 150" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" fill="none"/>
      <path d="M 40 0 C 100 80, 60 140, 110 200" fill="none" stroke="oklch(0.50 0.08 240 / 0.5)" strokeWidth="14" opacity="0.4"/>
      {/* route line */}
      <path d={`M ${ME.x} ${ME.y} Q ${(ME.x + pin.x) / 2 - 20} ${(ME.y + pin.y) / 2} ${pin.x} ${pin.y}`} stroke="oklch(0.86 0.18 130)" strokeWidth="2" fill="none" strokeDasharray="4 3"/>
      {/* me */}
      <circle cx={ME.x} cy={ME.y} r="6" fill="#0A0B0D" stroke="oklch(0.86 0.18 130)" strokeWidth="2"/>
      <circle cx={ME.x} cy={ME.y} r="2" fill="oklch(0.86 0.18 130)"/>
      {/* pin */}
      <circle cx={pin.x} cy={pin.y} r="10" fill="oklch(0.86 0.18 130)" stroke="#0A0B0D" strokeWidth="2"/>
      <circle cx={pin.x} cy={pin.y} r="3" fill="#0A0B0D"/>
    </svg>
  );
}

Object.assign(window, { StyledMap, LocationThumb, LESSON_PINS, ME });
