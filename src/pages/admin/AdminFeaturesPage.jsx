import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';

export default function AdminFeaturesPage() {
  return (
    <div className="admin-features">
      <h1>Features <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card><p>Optional feature switches (estimate, not proof).</p></Card>
    </div>
  );
}
