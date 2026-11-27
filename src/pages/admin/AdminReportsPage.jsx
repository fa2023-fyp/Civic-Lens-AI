import { useMemo } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';

export default function AdminReportsPage() {
  const rows = useMemo(() => ([
    { department: 'Sewerage', verified: 78, rejected: 6, reopened: 4 },
    { department: 'Roads', verified: 72, rejected: 8, reopened: 5 },
  ]), []);

  function exportCsv() {
    const header = ['Department', 'Verified %', 'Rejected %', 'Reopened %'];
    const csv = '\uFEFF' + [header, ...rows.map((r) => [r.department, r.verified, r.rejected, r.reopened])].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-reports">
      <h1>Reports <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <Button onClick={exportCsv}>Export CSV</Button>
      <Button variant="secondary" onClick={() => window.print()}>Print</Button>
      <Card>
        <table className="charts-table">
          <thead><tr><th>Department</th><th>Verified %</th><th>Rejected %</th><th>Reopened %</th></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}><td>{r.department}</td><td>{r.verified}</td><td>{r.rejected}</td><td>{r.reopened}</td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}
