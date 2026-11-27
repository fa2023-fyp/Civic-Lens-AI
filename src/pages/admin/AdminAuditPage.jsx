import { useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Drawer } from '../../components/ui/Drawer/Drawer.jsx';

export default function AdminAuditPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rows = [{ id: 'a1', complaintId: 'C1', actor: 'officer', event: 'override', model: 'v1', language: 'ur', overridden: true }];
  return (
    <div className="admin-audit">
      <h1>Audit <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <p>Append-only. No edit or delete controls.</p>
      <Card>
        <table className="charts-table">
          <thead><tr><th>ID</th><th>Complaint</th><th>Actor</th><th>Event</th><th>Model</th><th>Language</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id} onClick={() => setDrawerOpen(true)}><td>{r.id}</td><td>{r.complaintId}</td><td>{r.actor}</td><td>{r.event}</td><td>{r.model}</td><td>{r.language}</td></tr>
          ))}</tbody>
        </table>
      </Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Audit detail">
        <p>Original text, predictions, AI vs human values, reason, decision. No names/contacts exported.</p>
      </Drawer>
    </div>
  );
}
