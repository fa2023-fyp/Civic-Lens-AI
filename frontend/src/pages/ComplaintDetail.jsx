import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { complaintsApi } from '../api/complaints';
import AIExplanationPanel from '../components/AIExplanationPanel';
import Timeline from '../components/Timeline';
import SLATimer from '../components/SLATimer';
import { useAuth } from '../context/AuthContext';
export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { complaintsApi.get(id).then(setItem).catch(err => setError(err.response?.data?.error || err.message)); }, [id]);
  async function verify(accepted) {
    try { await complaintsApi.verify(id, { accepted, feedback: accepted ? 'Accepted by citizen' : 'Please review the submitted resolution' }); setItem(await complaintsApi.get(id)); }
    catch (err) { setError(err.response?.data?.error || err.message); }
  }
  async function submitResolution(event) {
    event.preventDefault();
    try {
      await complaintsApi.resolve(id, new FormData(event.currentTarget));
      setItem(await complaintsApi.get(id));
    } catch (err) { setError(err.response?.data?.error || err.message); }
  }
  async function acceptRecommendation(event) {
    event.preventDefault();
    try {
      await complaintsApi.review(id, {
        category: event.target.category.value,
        urgency: event.target.urgency.value,
        reason: event.target.reason.value
      });
      setItem(await complaintsApi.get(id));
    } catch (err) { setError(err.response?.data?.error || err.message); }
  }
  async function startWork() {
    try {
      await complaintsApi.start(id);
      setItem(await complaintsApi.get(id));
    } catch (err) { setError(err.response?.data?.error || err.message); }
  }
  if (error) return <p className="error">{error}</p>;
  if (!item) return <p>Loading complaint…</p>;
  return <section><Link to="/complaints">← Complaints</Link><div className="heading"><h1>Complaint details</h1><span className="status">{item.status}</span></div>
    <div className="grid"><article className="panel"><h2>Submitted text</h2><p>{item.original_text}</p><p><b>Language:</b> {item.detected_language}</p><p><b>Recommended category:</b> {item.category}</p><p><b>Urgency recommendation:</b> {item.urgency}</p><SLATimer deadline={item.deadline_at}/></article>
    <AIExplanationPanel decision={item.ai_decision?.explanation} /></div>
    {user.role === 'citizen' && item.status === 'Citizen Verification' && <section className="panel"><h2>Verify submitted resolution</h2><button className="button" onClick={() => verify(true)}>Accept resolution</button> <button className="button secondary" onClick={() => verify(false)}>Reject and reopen</button></section>}
    {user.role === 'officer' && ['Created','Human Review'].includes(item.status) && <section className="panel"><h2>Review and assign</h2><form onSubmit={acceptRecommendation} className="review-form">
      <label>Category<input name="category" defaultValue={item.category} required/></label>
      <label>Urgency<select name="urgency" defaultValue={item.urgency}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
      <label>Reason (required)<input name="reason" required minLength="3"/></label><button className="button">Accept / override and assign</button>
    </form></section>}
    {user.role === 'officer' && item.status === 'Assigned' && <section className="panel"><h2>Work status</h2><button className="button" onClick={startWork}>Start work</button></section>}
    {user.role === 'officer' && ['Assigned','In Progress'].includes(item.status) && <section className="panel"><h2>Submit proposed resolution</h2><p className="muted">Submitting a resolution requests citizen verification; it does not close the case.</p><form onSubmit={submitResolution} className="stack"><label>Description<textarea name="description" required minLength="3"/></label>    <label>Action taken<input name="action_taken" required minLength="2"/></label>
    <label>Before image<input name="before_image" type="file" accept="image/jpeg,image/png,image/webp"/></label>
    <label>After image<input name="after_image" type="file" accept="image/jpeg,image/png,image/webp"/></label>
    <label>Latitude (optional)<input name="latitude" type="number" step="any" min="-90" max="90"/></label>
    <label>Longitude (optional)<input name="longitude" type="number" step="any" min="-180" max="180"/></label>
    <button className="button">Request citizen verification</button></form></section>}
    <h2>Status timeline</h2><Timeline entries={item.timeline || []}/></section>;
}
