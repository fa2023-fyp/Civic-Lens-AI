export default function ConfidenceBar({ value = 0 }) {
  const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
  return <div className="confidence"><span>Model confidence: {percent}%</span><div className="bar"><i style={{ width: `${percent}%` }} /></div></div>;
}
