/* Tab Super admin: kolik si appka vydělá na provizích a kde. */

const ADMIN_VIEWS = [
  { value: 'trainer', label: 'Trenéři' },
  { value: 'activity', label: 'Cvičení' },
  { value: 'client', label: 'Klienti' }
];

// Sloupcový graf provizí po týdnech. Inline SVG — na tohle nemá smysl tahat knihovnu.
function WeeklyBars({ weeks }) {
  const max = weeks.reduce((m, w) => Math.max(m, w.commission), 0) || 1;
  const W = 100, H = 34, gap = 1.4;
  const barW = (W - gap * (weeks.length - 1)) / weeks.length;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.dim }}>
          Provize po týdnech
        </span>
        <span className="mono" style={{ fontSize: 11, color: C.dim }}>max {czk(max)} Kč</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
           aria-label={`Provize po týdnech, maximum ${czk(max)} korun`}
           style={{ width: '100%', height: 56, display: 'block' }}>
        {weeks.map((w, i) => {
          const h = Math.max((w.commission / max) * H, 0.8);
          // Týdny se od sebe liší jen o pár procent, takže samotná výška je
          // špatně čitelná — nejsilnější týden se odliší plnou sytostí.
          return (
            <rect
              key={w.week} x={i * (barW + gap)} y={H - h} width={barW} height={h} rx={0.8}
              fill="var(--ac)" opacity={w.commission === max ? 1 : 0.42}
            >
              <title>{`${w.week}. týden — ${czk(w.commission)} Kč`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.dim, marginTop: 6 }}>
        <span>1. týden</span><span>{weeks.length}. týden</span>
      </div>
    </div>
  );
}

function RankRow({ row, index, max }) {
  const share = row.gmv / max;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.line}` }}>
      <div className="mono" style={{ width: 20, flexShrink: 0, fontSize: 12, color: C.dim, textAlign: 'right' }}>{index + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.label}
        </div>
        <div style={{ marginTop: 5, height: 4, borderRadius: 999, background: C.line, overflow: 'hidden' }}>
          <div style={{ width: `${Math.max(share * 100, 2)}%`, height: '100%', background: C.ac, borderRadius: 999 }} />
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: C.ac }}>{czk(row.commission)} Kč</div>
        <div className="mono" style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
          {czk(row.sessions)} × · {czk(row.gmv)} Kč
        </div>
      </div>
    </div>
  );
}

function AdminScreen({ state, actions }) {
  const rate = FitSpotData.COMMISSION_RATE;

  // Přijaté požadavky z téhle relace se počítají jako běžná účast, aby bylo
  // vidět, že tři taby jsou jeden systém a ne tři nezávislé obrazovky.
  const fresh = React.useMemo(
    () => FitSpotLogic.requestsToLedger(state.requests, FitSpotData.TRAINERS, FitSpotData.WEEKS),
    [state.requests]
  );
  const ledger = React.useMemo(() => FitSpotData.LEDGER.concat(fresh), [fresh]);

  const totals = React.useMemo(() => FitSpotLogic.totals(ledger, rate), [ledger, rate]);
  const weeks = React.useMemo(() => FitSpotLogic.weekly(ledger, rate, FitSpotData.WEEKS), [ledger, rate]);
  const ranking = React.useMemo(
    () => FitSpotLogic.aggregate(ledger, state.adminView, rate, FitSpotData.TRAINERS),
    [ledger, state.adminView, rate]
  );

  const shown = ranking.slice(0, 10);
  const max = shown.length ? shown[0].gmv : 1;

  return (
    <Screen>
      <div style={{ padding: '20px 20px 14px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4.6vw, 32px)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05 }}>
          Super admin
        </h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>
          Provize vlastníka aplikace · {FitSpotData.PERIOD}
        </p>
      </div>

      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <StatTile label="Obrat platformy" value={czk(totals.gmv)} unit="Kč" />
        <StatTile label="Provize appky" value={czk(totals.commission)} unit="Kč" accent />
        <StatTile label="Sazba" value={Math.round(rate * 100)} unit="%" />
        <StatTile label="Odtrénováno" value={czk(totals.sessions)} unit="účastí" />
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        <WeeklyBars weeks={weeks} />
      </div>

      {fresh.length > 0 && (
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{
            padding: '10px 13px', borderRadius: 10, fontSize: 12.5, lineHeight: 1.5,
            background: 'color-mix(in srgb, var(--ac) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ac) 30%, transparent)', color: C.text
          }}>
            Z toho {fresh.length} {fresh.length === 1 ? 'trénink přijatý' : 'tréninků přijatých'} v téhle relaci —
            <span className="mono" style={{ color: C.ac }}> +{czk(fresh.reduce((s, r) => s + r.price * rate, 0))} Kč</span> na provizi.
          </div>
        </div>
      )}

      <div style={{ padding: '20px 20px 0' }}>
        <Label hint={shown.length < ranking.length ? `top ${shown.length} z ${ranking.length}` : null}>
          Rozpad provize
        </Label>
        <Segmented options={ADMIN_VIEWS} value={state.adminView} onChange={actions.setAdminView} />
      </div>

      <div style={{ padding: '10px 20px 24px' }}>
        {shown.map((row, i) => <RankRow key={row.key} row={row} index={i} max={max} />)}
        <div style={{ marginTop: 12, fontSize: 12, color: C.dim, lineHeight: 1.5 }}>
          Všechny tři pohledy počítají ze stejných tréninků, jen je řežou jinak — součet obratu je v každém z nich stejný.
        </div>
      </div>
    </Screen>
  );
}

window.AdminScreen = AdminScreen;
