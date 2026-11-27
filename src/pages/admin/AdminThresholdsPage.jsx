import { useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { VersionHistoryDrawer } from '../../components/ui/VersionHistoryDrawer/VersionHistoryDrawer.jsx';

export default function AdminThresholdsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="admin-thresholds">
      <h1>Thresholds <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card><p>Initial values, TBD after experiments. Reset to default available.</p></Card>
      <button type="button" onClick={() => setDrawerOpen(true)}>History</button>
      <VersionHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} versions={[]} />
    </div>
  );
}
