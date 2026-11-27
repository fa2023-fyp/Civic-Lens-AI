import { useState } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { VersionHistoryDrawer } from '../../components/ui/VersionHistoryDrawer/VersionHistoryDrawer.jsx';

export default function AdminTaxonomyPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const versions = [{ editor: 'admin', time: 'now', summary: 'Updated mapping' }];
  return (
    <div className="admin-taxonomy">
      <h1>Taxonomy <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card><p>Category mapping placeholder.</p></Card>
      <button type="button" onClick={() => setDrawerOpen(true)}>History</button>
      <VersionHistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} versions={versions} />
    </div>
  );
}
