/* Tab Hledat: lokalita → cvičení → prostor → trenéři, a odtud požadavek na trénink. */

const venueLabel = (id) => {
  const v = FitSpotData.VENUES.find((x) => x.id === id);
  return v ? v.label : id;
};

// ------------------------------------------------------------------ filtry
function Filters({ filters, actions, found }) {
  // Musí to být boolean — `venues.length` je 0 a React by tu nulu vykreslil.
  const dirty = filters.locality !== 'all' || !!filters.activity || filters.venues.length > 0;

  return (
    <div>
      <div style={{ padding: '20px 20px 14px' }}>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.05 }}>
          Najdi trenéra
        </h1>
        <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 14 }}>
          {found === 0
            ? 'Žádný trenér neodpovídá filtru'
            : `${found} ${found === 1 ? 'trenér vyhovuje' : found < 5 ? 'trenéři vyhovují' : 'trenérů vyhovuje'} tvému zadání`}
        </p>
      </div>

      <SectionTitle step={1}>Lokalita</SectionTitle>
      <ChipRow>
        {FitSpotData.LOCALITIES.map((l) => (
          <Chip key={l.id} label={l.label} active={filters.locality === l.id} onClick={() => actions.setLocality(l.id)} />
        ))}
      </ChipRow>

      <SectionTitle step={2}>Typ cvičení</SectionTitle>
      <ChipRow>
        {FitSpotData.ACTIVITIES.map((a) => (
          <Chip key={a} label={a} active={filters.activity === a} onClick={() => actions.toggleActivity(a)} />
        ))}
      </ChipRow>

      <SectionTitle step={3} hint="nepovinné">Prostor</SectionTitle>
      <ChipRow>
        {FitSpotData.VENUES.map((v) => (
          <Chip
            key={v.id} label={`${v.icon} ${v.label}`}
            active={filters.venues.includes(v.id)} onClick={() => actions.toggleVenue(v.id)}
          />
        ))}
        {dirty && <Chip label="× Zrušit filtry" onClick={actions.resetFilters} />}
      </ChipRow>
    </div>
  );
}

// ------------------------------------------------------------------ seznam
function TrainerCard({ trainer, lessons, active, onOpen }) {
  const activities = [...new Set(lessons.map((l) => l.activity))];
  const venues = [...new Set(lessons.map((l) => l.venue))];
  const from = lessons.reduce((min, l) => Math.min(min, l.price), Infinity);

  return (
    <Card onClick={onOpen} active={active}>
      <div style={{ display: 'flex', gap: 14 }}>
        <Avatar name={trainer.name} photo={trainer.photo} size={80} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {trainer.name}
            </div>
            <div className="mono" style={{ fontSize: 12, color: C.ac, whiteSpace: 'nowrap' }}>
              ★ {dec1(trainer.rating)}
            </div>
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {trainer.district} · {FitSpotData.LOCALITIES.find((l) => l.id === trainer.praha).label} · {trainer.reviews} hodnocení
          </div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>od {czk(from)} Kč / lekce</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {activities.map((a) => <Tag key={a} tone="accent">{a}</Tag>)}
            {venues.map((v) => <Tag key={v}>{venueLabel(v)}</Tag>)}
          </div>
        </div>
      </div>
    </Card>
  );
}

function TrainerList({ rows, activeId, onOpen, onReset }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: '0 20px' }}>
        <Empty
          title="Tady zatím nikdo netrénuje"
          hint="Zkus jinou městskou část, nebo pusť filtr prostoru — venkovní a oválové lekce nemá každý trenér."
          action={<Button variant="ghost" onClick={onReset}>Zrušit filtry</Button>}
        />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map(({ trainer, lessons }) => (
        <TrainerCard
          key={trainer.id} trainer={trainer} lessons={lessons}
          active={trainer.id === activeId} onOpen={() => onOpen(trainer.id)}
        />
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ detail
function LessonRow({ lesson, onRequest }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: 12,
      background: C.surface, border: `1px solid ${C.line}`, borderRadius: 12
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{lesson.title}</div>
        <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
          {lesson.slot} · {lesson.length} min
        </div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{lesson.place}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          <Tag tone="accent">{lesson.activity}</Tag>
          <Tag>{venueLabel(lesson.venue)}</Tag>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: C.ac }}>{czk(lesson.price)} Kč</div>
        <Button onClick={() => onRequest(lesson.id)}>Požádat</Button>
      </div>
    </div>
  );
}

function TrainerDetail({ trainer, lessons, onRequest }) {
  return (
    <Screen>
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Avatar name={trainer.name} photo={trainer.photo} size={92} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.15 }}>{trainer.name}</h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            {trainer.district} · {FitSpotData.LOCALITIES.find((l) => l.id === trainer.praha).label}
          </div>
          <div className="mono" style={{ fontSize: 13, color: C.ac, marginTop: 6 }}>
            ★ {dec1(trainer.rating)} <span style={{ color: C.muted }}>({trainer.reviews} hodnocení)</span>
          </div>
        </div>
      </div>

      <p style={{ padding: '16px 20px 0', margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>{trainer.bio}</p>

      <div style={{ padding: '20px 20px 0' }}>
        <Label>Nabízené lekce</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lessons.map((l) => <LessonRow key={l.id} lesson={l} onRequest={onRequest} />)}
        </div>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------------ požadavek
function HealthSection({ open, onToggle, flags, onToggleFlag, note, onNote }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, background: C.surface, overflow: 'hidden' }}>
      <button
        type="button" onClick={onToggle} aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          padding: '13px 14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: C.dim, fontSize: 12, transform: open ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform .15s' }}>▸</span>
          <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: C.dim }}>
            Zdravotní informace
          </span>
          <span style={{ fontSize: 11, color: C.dim, opacity: .8 }}>nepovinné</span>
        </span>
        {flags.length > 0 && <Tag tone="accent">{flags.length}</Tag>}
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
            Trenér uvidí jen to, co tu vyplníš. Pomáhá mu to upravit lekci — nic z toho není podmínka přijetí.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FitSpotData.HEALTH_FLAGS.map((f) => (
              <Chip key={f} label={f} active={flags.includes(f)} onClick={() => onToggleFlag(f)} />
            ))}
          </div>
          <textarea
            value={note} onChange={(e) => onNote(e.target.value)} rows={3}
            placeholder="Cokoliv dalšího — operace, léky, na co si dát pozor…"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 10, resize: 'vertical',
              border: `1px solid ${C.line2}`, background: C.bg, color: C.text, fontSize: 13.5, lineHeight: 1.5
            }}
          />
        </div>
      )}
    </div>
  );
}

function RequestForm({ trainer, initialLessonId, onSend }) {
  const [lessonId, setLessonId] = React.useState(initialLessonId || trainer.lessons[0].id);
  const [message, setMessage] = React.useState('');
  const [healthOpen, setHealthOpen] = React.useState(false);
  const [flags, setFlags] = React.useState([]);
  const [note, setNote] = React.useState('');

  const lesson = trainer.lessons.find((l) => l.id === lessonId);
  const toggleFlag = (f) => setFlags((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : prev.concat(f)));

  return (
    <Screen>
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.15 }}>Požadavek na trénink</h1>
        <div style={{ fontSize: 13.5, color: C.muted, marginTop: 6 }}>
          {trainer.name} · {lesson.activity} · {venueLabel(lesson.venue)}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <Label>Termín</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {trainer.lessons.map((l) => (
              <Chip
                key={l.id} label={`${l.slot} · ${l.title}`}
                active={l.id === lessonId} onClick={() => setLessonId(l.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Zpráva trenérovi</Label>
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
            placeholder="Např. jsem začátečník, chci se připravit na první HYROX…"
            style={{
              width: '100%', padding: '11px 13px', borderRadius: 12, resize: 'vertical',
              border: `1px solid ${C.line2}`, background: C.surface, color: C.text, fontSize: 13.5, lineHeight: 1.5
            }}
          />
        </div>

        <HealthSection
          open={healthOpen} onToggle={() => setHealthOpen((o) => !o)}
          flags={flags} onToggleFlag={toggleFlag} note={note} onNote={setNote}
        />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: 14, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 12
        }}>
          <div style={{ fontSize: 13, color: C.muted }}>{lesson.slot} · {lesson.length} min · {lesson.place}</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: C.ac }}>{czk(lesson.price)} Kč</div>
        </div>

        <div>
          <Button full onClick={() => onSend({ trainerId: trainer.id, lessonId, message, health: { flags, note } })}>
            Odeslat požadavek
          </Button>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12.5, color: C.dim }}>
            Odeslat jde i bez vyplněného dotazníku — trenér pak o žádných omezeních neví.
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------------ obrazovka
// `view` drží App, aby mohl vykreslit tlačítko zpět v horní liště.
function SearchScreen({ state, actions, showToast, view, setView }) {
  const { filters } = state;
  const [activeId, setActiveId] = React.useState(null);

  const rows = React.useMemo(
    () => FitSpotLogic.filterTrainers(FitSpotData.TRAINERS, filters),
    [filters]
  );

  // Když filtr vyhodí právě zvýrazněného trenéra, zvýraznění zmizí s ním.
  React.useEffect(() => {
    if (activeId && !rows.some((r) => r.trainer.id === activeId)) setActiveId(null);
  }, [rows, activeId]);

  if (view.name !== 'list') {
    const trainer = FitSpotData.TRAINERS.find((t) => t.id === view.trainerId);
    if (view.name === 'detail') {
      const row = rows.find((r) => r.trainer.id === trainer.id);
      return (
        <TrainerDetail
          trainer={trainer}
          // Po otevření z mapy nebo seznamu ukazuj lekce, které prošly filtrem;
          // když trenér mezitím z filtru vypadl, ukaž radši všechny než nic.
          lessons={row ? row.lessons : trainer.lessons}
          onRequest={(lessonId) => setView({ name: 'request', trainerId: trainer.id, lessonId })}
        />
      );
    }
    return (
      <RequestForm
        trainer={trainer} initialLessonId={view.lessonId}
        onSend={(payload) => {
          actions.sendRequest(payload);
          setView({ name: 'list' });
          actions.goTab('lessons');
          showToast(`Požadavek odeslán — ${trainer.name}`);
        }}
      />
    );
  }

  return (
    <Screen>
      <Filters filters={filters} actions={actions} found={rows.length} />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: 16, padding: '4px 20px 24px'
      }}>
        <div style={{ order: -1 }}>
          <TrainerMap rows={rows} locality={filters.locality} activeId={activeId} onSelect={setActiveId} />
          <div style={{ marginTop: 8, fontSize: 12, color: C.dim, textAlign: 'center' }}>
            Cena v pinu je nejnižší z lekcí, které prošly filtrem. Klikni na pin pro zvýraznění v seznamu.
          </div>
        </div>
        <TrainerList
          rows={rows} activeId={activeId}
          onOpen={(id) => setView({ name: 'detail', trainerId: id })}
          onReset={actions.resetFilters}
        />
      </div>
    </Screen>
  );
}

window.SearchScreen = SearchScreen;
window.venueLabel = venueLabel;
