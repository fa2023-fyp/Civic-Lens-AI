import { useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { VersionHistoryDrawer } from '../../components/ui/VersionHistoryDrawer/VersionHistoryDrawer.jsx';

export default function AdminSlaPoliciesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="admin-sla">
      <h1>SLA policies <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card><p>Editable matrix placeholder. Applies to new events only.</p></Card>
      <button type="button" onClick={() => setDrawerOpen(true)}>History</button>
      <VersionHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} versions={[]} />
    </div>
  );
}
