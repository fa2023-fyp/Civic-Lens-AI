import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';

export default function AdminAutomationPage() {
  return (
    <div className="admin-automation">
      <h1>Automation <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Card><p>n8n status, workflows, queue, delivery log, templates placeholder.</p></Card>
    </div>
  );
}
