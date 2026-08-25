/* Tab Trenér: druhá strana požadavku a přehled vlastního výdělku. */

// Kolik lidí trenérovi na jednotlivé lekce reálně chodí — spočítané z účetní
// knihy, aby čísla seděla s tím, co vidí super admin.
function lessonStats(trainerId) {
  const rows = FitSpotData.LEDGER.filter((r) => r.trainerId === trainerId);
  const byLesson = {};
  rows.forEach((r) => {
    if (!byLesson[r.lessonId]) byLesson[r.lessonId] = { participants: 0, instances: new Set() };
    byLesson[r.lessonId].participants += 1;
    byLesson[r.lessonId].instances.add(r.week + ':' + r.lessonId);
  });
  const out = {};
  Object.keys(byLesson).forEach((id) => {
    const b = byLesson[id];
    out[id] = { participants: b.participants, avg: b.participants / b.instances.size };
  });
  return out;
}

function IncomingRequest({ request, lesson, actions }) {
  const meta = STATUS_META[request.status];
  const pending = request.status === 'pending';

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{lesson.title}</div>
        <div className="mono" style={{ fontSize: 13, color: C.ac, whiteSpace: 'nowrap' }}>{czk(lesson.price)} Kč</div>
      </div>
      <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
        {lesson.slot} · {lesson.length} min · {lesson.place}
      </div>

      {request.message && (
        <div style={{
          marginTop: 10, padding: '10px 12px', background: C.bg, borderRadius: 10,
          fontSize: 13, color: C.muted, lineHeight: 1.5
        }}>„{request.message}"</div>
      )}

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.line2}` }}>
        {FitSpotLogic.hasHealthInfo(request) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.warn }}>
              Zdravotní omezení
            </div>
            {request.health.flags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {request.health.flags.map((f) => <Tag key={f} tone="warn">{f}</Tag>)}
              </div>
            )}
            {request.health.note && (
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{request.health.note}</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: C.dim }}>Klient dotazník nevyplnil.</div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        {pending ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Button full onClick={() => actions.resolveRequest(request.id, 'accepted')}>Přijmout</Button>
            </div>
            <div style={{ flex: 1 }}>
              <Button full variant="ghost" onClick={() => actions.resolveRequest(request.id, 'declined')}>Odmítnout</Button>
            </div>
          </div>
        ) : (
          <Tag tone={meta.tone}>{meta.label}</Tag>
        )}
      </div>
    </Card>
  );
}

function TrainerScreen({ state, actions }) {
  const trainer = FitSpotData.TRAINERS.find((t) => t.id === state.persona) || FitSpotData.TRAINERS[0];

  const incoming = state.requests
    .map(expandRequest)
    .filter(Boolean)
    .filter((r) => r.trainer.id === trainer.id)
    // Nevyřízené nahoru, jinak pořadí odeslání (nejnovější první).
    .sort((a, b) => Number(b.request.status === 'pending') - Number(a.request.status === 'pending'));

  const pending = incoming.filter((r) => r.request.status === 'pending').length;

  const stats = React.useMemo(() => lessonStats(trainer.id), [trainer.id]);
  const mine = React.useMemo(
    () => FitSpotData.LEDGER.filter((r) => r.trainerId === trainer.id),
    [trainer.id]
  );
  const totals = FitSpotLogic.totals(mine, FitSpotData.COMMISSION_RATE);

  return (
    <Screen>
      <div style={{ padding: '20px 20px 14px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4.6vw, 32px)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05 }}>
          Přehled trenéra
        </h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>
          Vystupuješ jako {trainer.name}
          {pending > 0 && ` · ${pending} ${pending === 1 ? 'nový požadavek' : pending < 5 ? 'nové požadavky' : 'nových požadavků'}`}
        </p>
      </div>

      <SectionTitle hint="přepni si personu">Trenér</SectionTitle>
      <ChipRow>
        {FitSpotData.TRAINERS.map((t) => (
          <Chip key={t.id} label={t.name} active={t.id === trainer.id} onClick={() => actions.setPersona(t.id)} />
        ))}
      </ChipRow>

      <div style={{ padding: '6px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <StatTile label={`Lekcí · ${FitSpotData.PERIOD}`} value={czk(totals.sessions)} unit="účastí" />
        <StatTile label="Hrubý obrat" value={czk(totals.gmv)} unit="Kč" />
        <StatTile label="Po provizi appky" value={czk(totals.gmv - totals.commission)} unit="Kč" accent />
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <Label>Příchozí požadavky</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {incoming.length === 0 ? (
            <Empty
              title="Zatím žádné požadavky"
              hint="Až přijde požadavek z tabu Hledat, objeví se tady i se zdravotním dotazníkem, který klient vyplnil."
              action={<Button variant="ghost" onClick={() => actions.goTab('search')}>Přejít na hledání</Button>}
            />
          ) : (
            incoming.map(({ request, lesson }) => (
              <IncomingRequest key={request.id} request={request} lesson={lesson} actions={actions} />
            ))
          )}
        </div>
      </div>

      <div style={{ padding: '22px 20px 24px' }}>
        <Label hint={`průměrná účast za ${FitSpotData.PERIOD}`}>Moje lekce</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {trainer.lessons.map((l) => {
            const s = stats[l.id];
            return (
              <div key={l.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</div>
                  <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                    {l.slot} · {l.length} min · {l.place}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                    <Tag tone="accent">{l.activity}</Tag>
                    <Tag>{venueLabel(l.venue)}</Tag>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 600, color: s ? C.text : C.dim }}>
                    {s ? `⌀ ${dec1(s.avg)}` : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>lidí na lekci</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

window.TrainerScreen = TrainerScreen;
