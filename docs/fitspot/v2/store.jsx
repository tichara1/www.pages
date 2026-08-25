/* Jediný zdroj stavu aplikace + jeho uložení do localStorage. */

const FS_KEY = 'fitspot.v2';

const FS_INITIAL = {
  tab: 'search',
  filters: { locality: 'all', activity: null, venues: [] },
  requests: [],
  persona: 1,          // trenér, za kterého vystupuju v tabu Trenér
  adminView: 'trainer'
};

function fsLoad() {
  try {
    const raw = localStorage.getItem(FS_KEY);
    if (!raw) return FS_INITIAL;
    const saved = JSON.parse(raw);
    // Mělké sloučení stačí — filters je jediný vnořený objekt a chceme, aby
    // starší uložený stav bez nového pole nepřepsal výchozí hodnotu na undefined.
    return {
      ...FS_INITIAL,
      ...saved,
      filters: { ...FS_INITIAL.filters, ...(saved.filters || {}) }
    };
  } catch (e) {
    return FS_INITIAL;
  }
}

function fsSave(state) {
  try {
    localStorage.setItem(FS_KEY, JSON.stringify(state));
  } catch (e) {
    /* anonymní okno nebo plná kvóta — prototyp poběží dál, jen si nic nezapamatuje */
  }
}

function useStore() {
  const [state, setState] = React.useState(fsLoad);
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  React.useEffect(() => { fsSave(state); }, [state]);
  React.useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = React.useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const actions = React.useMemo(() => ({
    goTab: (tab) => setState((s) => ({ ...s, tab })),

    setLocality: (locality) => setState((s) => ({ ...s, filters: { ...s.filters, locality } })),

    // Druhý klik na už vybranou aktivitu ji zase pustí.
    toggleActivity: (activity) => setState((s) => ({
      ...s,
      filters: { ...s.filters, activity: s.filters.activity === activity ? null : activity }
    })),

    toggleVenue: (venue) => setState((s) => {
      const venues = s.filters.venues.includes(venue)
        ? s.filters.venues.filter((v) => v !== venue)
        : s.filters.venues.concat(venue);
      return { ...s, filters: { ...s.filters, venues } };
    }),

    resetFilters: () => setState((s) => ({ ...s, filters: { ...FS_INITIAL.filters } })),

    // Po odeslání se persona v tabu Trenér přepne na adresáta, aby byl
    // požadavek na dvě kliknutí vidět z druhé strany.
    sendRequest: (input) => setState((s) => ({
      ...s,
      requests: [FitSpotLogic.createRequest({ ...input, id: 'r' + Date.now(), createdAt: Date.now() })].concat(s.requests),
      persona: input.trainerId
    })),

    resolveRequest: (id, status) => setState((s) => ({
      ...s,
      requests: FitSpotLogic.resolveRequest(s.requests, id, status)
    })),

    setPersona: (persona) => setState((s) => ({ ...s, persona })),
    setAdminView: (adminView) => setState((s) => ({ ...s, adminView }))
  }), []);

  return { state, actions, toast, showToast };
}

window.useStore = useStore;
