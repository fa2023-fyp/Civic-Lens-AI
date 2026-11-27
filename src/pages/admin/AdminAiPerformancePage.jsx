import { useMemo } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Histogram } from '../../components/charts/Histogram.jsx';

export default function AdminAiPerformancePage() {
  const conf = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ bin: `${i * 10}-${i * 10 + 9}%`, count: 5 + (i % 4) * 3 })), []);
  const pairs = useMemo(() => ([
    { ai: 'Sewerage', human: 'Water', count: 4 },
    { ai: 'Roads', human: 'Waste', count: 3 },
  ]), []);
  return (
    <div className="admin-ai-performance">
      <h1>AI performance <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <div className="admin-banner" role="alert">Placeholder values for UI demonstration. Real results come from offline evaluation.</div>
      <Card><Histogram data={conf} /></Card>
      <Card>
        <h2>Top correction pairs</h2>
        <table className="charts-table"><thead><tr><th>AI</th><th>Human</th><th>Count</th></tr></thead><tbody>{pairs.map((p, i) => <tr key={i}><td>{p.ai}</td><td>{p.human}</td><td>{p.count}</td></tr>)}</tbody></table>
      </Card>
    </div>
  );
}
