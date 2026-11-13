export default function SLATimer({ deadline }) {
  if (!deadline) return <span className="muted">SLA deadline unavailable</span>;
  const remaining = new Date(deadline).getTime() - Date.now();
  return <span className={remaining < 0 ? 'status overdue' : 'status'}>{remaining < 0 ? 'Overdue' : `${Math.ceil(remaining / 3600000)} hours remaining`}</span>;
}
