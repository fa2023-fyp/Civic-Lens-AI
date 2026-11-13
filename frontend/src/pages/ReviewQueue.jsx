import { useEffect, useState } from 'react';
import { complaintsApi } from '../api/complaints';
export default function ReviewQueue() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  useEffect(() => { complaintsApi.list().then(rows => setItems(rows.filter(row => row.needs_human_review))); }, []);
  async function review(item, event) {
    event.preventDefault();
    try {
      await complaintsApi.review(item.id, { category: event.target.category.value || undefined, urgency: event.target.urgency.value, reason: event.target.reason.value });
      setItems(items.filter(row => row.id !== item.id));
      setMessage('Review saved to the AI audit trail.');
    } catch (error) { setMessage(error.response?.data?.error || error.message); }
  }
  return <section><h1>Human review queue</h1><p className="muted">AI confidence below threshold. Send to human verification queue. Staff must provide a reason for every review.</p>{message && <p>{message}</p>}
    {items.map(item => <article className="card" key={item.id}><p>{item.original_text}</p><form className="review-form" onSubmit={event => review(item,event)}>
      <label>Category<input name="category" defaultValue={item.category}/></label>
      <label>Urgency<select name="urgency" defaultValue={item.urgency}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
      <label>Reason (required)<input name="reason" required minLength="3"/></label><button className="button">Confirm / override</button>
    </form></article>)}
  </section>;
}
