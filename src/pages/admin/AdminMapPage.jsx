import { useEffect, useRef, useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';

export default function AdminMapPage() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [heat, setHeat] = useState(false);
  const [points] = useState(() => Array.from({ length: 5000 }, (_, i) => ({
    id: i + 1,
    lat: 31.5 + (Math.random() - 0.5) * 0.2,
    lng: 74.35 + (Math.random() - 0.5) * 0.2,
    category: 'Sewerage',
    urgency: 'High',
    status: 'Submitted',
    department: 'Sewerage',
  })));

  useEffect(() => {
    let map;
    (async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet.markercluster');
        if (!containerRef.current) return;
        map = L.map(containerRef.current).setView([31.52, 74.36], 12);
        const tile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        tile.on('tileerror', () => setStatus('down'));
        const cluster = L.markerClusterGroup();
        points.forEach((p) => {
          cluster.addLayer(L.marker([p.lat, p.lng]).bindPopup(`#${p.id}`));
        });
        map.addLayer(cluster);
        setStatus('ready');
      } catch (e) {
        setStatus('down');
      }
    })();
    return () => { if (map) map.remove(); };
  }, [points]);

  return (
    <div className="admin-map">
      <h1>Admin map <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <button type="button" onClick={() => setHeat((v) => !v)}>{heat ? 'Markers' : 'Heatmap'}</button>
      {status === 'loading' && <div className="skeleton-map" style={{ blockSize: 400 }} />}
      <div ref={containerRef} style={{ blockSize: 400, display: status === 'down' ? 'none' : 'block' }} />
      {status === 'down' && (
        <table className="charts-table">
          <thead><tr><th>ID</th><th>Lat</th><th>Lng</th></tr></thead>
          <tbody>{points.slice(0, 50).map((p) => <tr key={p.id}><td>{p.id}</td><td>{p.lat.toFixed(4)}</td><td>{p.lng.toFixed(4)}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
