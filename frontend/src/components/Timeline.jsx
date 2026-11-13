export default function Timeline({ entries = [] }) {
  return <ol className="timeline">{entries.map((entry, index) => <li key={entry.id || index}><b>{entry.status}</b><span>{entry.note || ''}</span><small>{entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}</small></li>)}</ol>;
}
