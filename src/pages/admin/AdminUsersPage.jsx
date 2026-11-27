import { useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { VersionHistoryDrawer } from '../../components/ui/VersionHistoryDrawer/VersionHistoryDrawer.jsx';

export default function AdminUsersPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const versions = [{ editor: 'admin', time: 'now', summary: 'Created user' }];
  return (
    <div className="admin-users">
      <h1>Users <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card><p>User management placeholder.</p></Card>
      <button type="button" onClick={() => setDrawerOpen(true)}>History</button>
      <VersionHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} versions={versions} />
    </div>
  );
}
