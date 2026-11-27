import { useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';

export default function AdminModelsPage() {
  const rows = [
    { task: 'language-id', version: 'v1', training: 'td-1', metrics: null, status: 'Active' },
    { task: 'classifier', version: 'v1', training: 'td-1', metrics: null, status: 'Active' },
  ];
  const [reason, setReason] = useState('');
  return (
    <div className="admin-models">
      <h1>Models <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card>
        <table className="charts-table">
          <thead><tr><th>Task</th><th>Version</th><th>Training</th><th>Metrics</th><th>Status</th></tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i}><td>{r.task}</td><td>{r.version}</td><td>{r.training}</td><td>{r.metrics ?? 'TBD after evaluation'}</td><td>{r.status}</td></tr>
          ))}</tbody>
        </table>
      </Card>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
    </div>
  );
}
