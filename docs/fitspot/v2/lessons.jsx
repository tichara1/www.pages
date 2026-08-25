/* Tab Lekce: co jsem poslal za požadavky a jak dopadly. */

const STATUS_META = {
  pending: { label: 'Čeká na trenéra', tone: 'warn' },
  accepted: { label: '✓ Potvrzeno', tone: 'accent' },
  declined: { label: 'Odmítnuto', tone: 'bad' }
};

// Spojí požadavek s trenérem a lekcí, na které se odkazuje.
function expandRequest(request) {
  const trainer = FitSpotData.TRAINERS.find((t) => t.id === request.trainerId);
  const lesson = trainer && trainer.lessons.find((l) => l.id === request.lessonId);
  return trainer && lesson ? { request, trainer, lesson } : null;
}

function HealthSummary({ request }) {
  if (!FitSpotLogic.hasHealthInfo(request)) {
    return (
      <div style={{ fontSize: 12.5, color: C.dim }}>
        Zdravotní dotazník jsi nevyplnil — trenér o žádných omezeních neví.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.dim }}>
        Zdravotní informace
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
  );
}

function RequestCard({ request, trainer, lesson }) {
  const meta = STATUS_META[request.status];
  return (
    <Card>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={trainer.name} photo={trainer.photo} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{lesson.title}</div>
            <div className="mono" style={{ fontSize: 13, color: C.ac, whiteSpace: 'nowrap' }}>{czk(lesson.price)} Kč</div>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>{trainer.name}</div>
          <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
            {lesson.slot} · {lesson.length} min · {lesson.place}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <Tag tone={meta.tone}>{meta.label}</Tag>
            <Tag tone="accent">{lesson.activity}</Tag>
            <Tag>{venueLabel(lesson.venue)}</Tag>
          </div>
        </div>
      </div>

      {request.message && (
        <div style={{
          marginTop: 12, padding: '10px 12px', background: C.bg, borderRadius: 10,
          fontSize: 13, color: C.muted, lineHeight: 1.5
        }}>„{request.message}"</div>
      )}

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${C.line2}` }}>
        <HealthSummary request={request} />
      </div>
    </Card>
  );
}

function LessonsScreen({ state, actions }) {
  const rows = state.requests.map(expandRequest).filter(Boolean);
  const pending = rows.filter((r) => r.request.status === 'pending').length;

  return (
    <Screen>
      <div style={{ padding: '20px 20px 14px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4.6vw, 32px)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05 }}>
          Moje lekce
        </h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>
          {rows.length === 0
            ? 'Zatím jsi o žádný trénink nepožádal'
            : `${rows.length} ${rows.length === 1 ? 'požadavek' : rows.length < 5 ? 'požadavky' : 'požadavků'}${pending ? `, ${pending} čeká na vyřízení` : ''}`}
        </p>
      </div>

      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.length === 0 ? (
          <Empty
            title="Tady se objeví tvoje tréninky"
            hint="Najdi trenéra podle lokality a typu cvičení a pošli mu požadavek. Uvidíš tu, jestli ho přijal."
            action={<Button onClick={() => actions.goTab('search')}>Najít trenéra</Button>}
          />
        ) : (
          rows.map(({ request, trainer, lesson }) => (
            <RequestCard key={request.id} request={request} trainer={trainer} lesson={lesson} />
          ))
        )}
      </div>
    </Screen>
  );
}

window.LessonsScreen = LessonsScreen;
window.expandRequest = expandRequest;
window.STATUS_META = STATUS_META;
