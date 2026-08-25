/* Leaflet mapa s piny trenérů. Dlaždice CartoDB dark — stejný zdroj, jaký
   používá prototyp Počasí ČR, jen v tmavé variantě. */

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Nejnižší cena z lekcí, které trenérovi zbyly po filtru — pin ukazuje,
// od kolika se u něj dá začít.
function fromPrice(lessons) {
  return lessons.reduce((min, l) => Math.min(min, l.price), Infinity);
}

function TrainerMap({ rows, locality, activeId, onSelect }) {
  const holder = React.useRef(null);
  const map = React.useRef(null);
  const layer = React.useRef(null);
  // Přes ref, aby se posluchač na markeru nemusel překreslovat kvůli změně callbacku.
  const select = React.useRef(onSelect);
  select.current = onSelect;

  React.useEffect(() => {
    const instance = L.map(holder.current, { zoomControl: true, attributionControl: true });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19, subdomains: 'abcd' }).addTo(instance);
    layer.current = L.layerGroup().addTo(instance);
    map.current = instance;

    // Kontejner dostane finální rozměr až po prvním layoutu.
    const t = setTimeout(() => instance.invalidateSize(), 0);
    return () => { clearTimeout(t); instance.remove(); map.current = null; };
  }, []);

  React.useEffect(() => {
    if (!map.current) return;
    const loc = FitSpotData.LOCALITIES.find((l) => l.id === locality) || FitSpotData.LOCALITIES[0];
    map.current.setView(loc.center, loc.zoom);
  }, [locality]);

  React.useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();

    rows.forEach(({ trainer, lessons }) => {
      const active = trainer.id === activeId;
      const icon = L.divIcon({
        className: '',
        html: `<div class="fs-pin" data-active="${active}">${fromPrice(lessons)}</div>`,
        iconSize: [52, 26],
        iconAnchor: [26, 13]
      });
      L.marker([trainer.lat, trainer.lon], { icon, title: trainer.name, zIndexOffset: active ? 1000 : 0 })
        .on('click', () => select.current && select.current(trainer.id))
        .addTo(layer.current);
    });
  }, [rows, activeId]);

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.line}` }}>
      <div ref={holder} style={{ height: 340, background: C.bg }} />
      {rows.length === 0 && (
        <div style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none',
          background: 'rgba(11,12,8,.72)', color: C.muted, fontSize: 13, fontWeight: 600, zIndex: 500
        }}>Pro tenhle filtr tu nikdo není</div>
      )}
    </div>
  );
}

window.TrainerMap = TrainerMap;
