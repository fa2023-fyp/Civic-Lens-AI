import { useEffect, useState } from 'react';
import api from '../api/client';
import Heatmap from '../components/Heatmap';
export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [points, setPoints] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([api.get('/admin/analytics'), api.get('/admin/heatmap')])
      .then(([metrics, map]) => { setSummary(metrics.data); setPoints(map.data); })
      .catch(err => setError(err.response?.data?.error || err.message));
  }, []);
  return <section><h1>Admin analytics</h1>{error && <p className="error">{error}</p>}
    {summary && <div className="cards"><article className="card"><b>AI decisions</b><p>{summary.ai_decisions}</p></article>
      <article className="card"><b>Override rate</b><p>{summary.override_rate == null ? 'No decisions yet' : `${(summary.override_rate * 100).toFixed(1)}%`}</p></article>
      <article className="card"><b>Low-confidence routing rate</b><p>{summary.low_confidence_routing_rate == null ? 'No decisions yet' : `${(summary.low_confidence_routing_rate * 100).toFixed(1)}%`}</p></article></div>}
    <h2>Privacy-coarsened reports</h2><p className="muted">Areas with fewer than three non-synthetic reports are suppressed; points are coarsened and do not show citizen details.</p>
    <Heatmap points={points}/><h2>Category counts</h2>{summary?.category_distribution.map(row => <p key={row.category}>{row.category}: {row.count}</p>)}
    <a href="/api/admin/audit?format=csv">Download AI audit CSV</a>
  </section>;
}
