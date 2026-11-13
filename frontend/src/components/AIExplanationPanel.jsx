import ConfidenceBar from './ConfidenceBar';
export default function AIExplanationPanel({ decision }) {
  if (!decision) return <p className="muted">AI analysis is not available.</p>;
  return <section className="panel"><h3>AI recommendations · officer decision required</h3>
    <p><b>Category:</b> {decision.category?.label || decision.predicted_category}</p>
    <ConfidenceBar value={decision.category?.confidence || decision.category_confidence || 0} />
    <p><b>Urgency recommendation:</b> {decision.urgency?.label || decision.predicted_urgency}</p>
    <p><b>Department recommendation:</b> {decision.department?.label || decision.predicted_department}</p>
    <p className="muted">Recommendations assist authorized staff and are not certainty.</p>
  </section>;
}
