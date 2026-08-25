/* Skládá taby dohromady a mountuje aplikaci. */

function App() {
  const { state, actions, toast, showToast } = useStore();

  // Stav navigace uvnitř tabu Hledat drží App, aby mohl v horní liště
  // vykreslit tlačítko zpět.
  const [searchView, setSearchView] = React.useState({ name: 'list' });

  // Otevřený detail dává smysl jen v tabu Hledat.
  React.useEffect(() => {
    if (state.tab !== 'search' && searchView.name !== 'list') setSearchView({ name: 'list' });
  }, [state.tab, searchView.name]);

  const back = React.useMemo(() => {
    if (state.tab !== 'search') return null;
    if (searchView.name === 'request') return () => setSearchView({ name: 'detail', trainerId: searchView.trainerId });
    if (searchView.name === 'detail') return () => setSearchView({ name: 'list' });
    return null;
  }, [state.tab, searchView]);

  const pending = state.requests.filter((r) => r.status === 'pending');
  const badges = {
    lessons: pending.length,
    trainer: pending.filter((r) => r.trainerId === state.persona).length
  };

  const screen = {
    search: <SearchScreen state={state} actions={actions} showToast={showToast} view={searchView} setView={setSearchView} />,
    lessons: <LessonsScreen state={state} actions={actions} />,
    trainer: <TrainerScreen state={state} actions={actions} />,
    admin: <AdminScreen state={state} actions={actions} />
  }[state.tab];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 84, maxWidth: 1200, margin: '0 auto' }}>
      <TopBar onBack={back} />
      {screen}
      <BottomNav tab={state.tab} onTab={actions.goTab} badges={badges} />
      <Toast message={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
