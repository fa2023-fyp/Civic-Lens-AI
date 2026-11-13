import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintsApi } from '../api/complaints';
import SLATimer from '../components/SLATimer';
export default function Complaints() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { complaintsApi.list().then(setItems).catch(err => setError(err.response?.data?.error || err.message)); }, []);
  return <section><div className="heading"><div><p className="eyebrow">WORK QUEUE</p><h1>Complaints</h1></div><Link className="button" to="/submit">New complaint</Link></div>
    {error && <p className="error">{error}</p>}<div className="cards">{items.map(item => <article className="card" key={item.id}>
      <div className="heading"><b>{item.category}</b><span className="status">{item.status}</span></div>
      <p>{item.original_text}</p><p className="muted">{item.area || 'Area not extracted'} · {item.urgency} recommendation</p>
      {item.needs_human_review && <p className="review">AI confidence below threshold. Send to human verification queue.</p>}
      <SLATimer deadline={item.deadline_at} /><Link to={`/complaints/${item.id}`}>Open details →</Link>
    </article>)}</div>{!items.length && !error && <p>No complaints found.</p>}</section>;
}
