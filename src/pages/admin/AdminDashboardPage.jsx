import { lazy, Suspense, useMemo } from 'react';
import { DemoDataBadge } from '../../components/marketing/DemoDataBadge.jsx';
import { KPITile } from '../../components/ui/KPITile/KPITile.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';

const LineTrend = lazy(() => import('../../components/charts/LineTrend.jsx').then((m) => ({ default: m.LineTrend })));
const BarCompare = lazy(() => import('../../components/charts/BarCompare.jsx').then((m) => ({ default: m.BarCompare })));
const DonutShare = lazy(() => import('../../components/charts/DonutShare.jsx').then((m) => ({ default: m.DonutShare })));
const Histogram = lazy(() => import('../../components/charts/Histogram.jsx').then((m) => ({ default: m.Histogram })));

export default function AdminDashboardPage() {
  const volume = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ label: `M${i + 1}`, value: 40 + i * 7 })), []);
  const categories = useMemo(() => ([
    { name: 'Sewerage', value: 34 },
    { name: 'Roads', value: 22 },
    { name: 'Waste', value: 18 },
    { name: 'Water', value: 14 },
    { name: 'Other', value: 12 },
  ]), []);
  const resolution = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ bin: `${i * 5}-${i * 5 + 4}h`, count: 10 + (i % 4) * 5 })), []);
  return (
    <div className="admin-dashboard">
      <h1>Admin dashboard <DemoDataBadge>Demo data</DemoDataBadge></h1>
      <div className="admin-dashboard__kpis">
        <KPITile label="Total complaints" value={1240} />
        <KPITile label="Verified resolution" value={78} suffix="%" />
        <KPITile label="Rejection rate" value={6} suffix="%" />
        <KPITile label="Reopened rate" value={4} suffix="%" />
      </div>
      <Card><Suspense fallback={<div>Loading chart…</div>}><LineTrend data={volume} /></Suspense></Card>
      <Card><Suspense fallback={<div>Loading chart…</div>}><DonutShare data={categories} /></Suspense></Card>
      <Card><Suspense fallback={<div>Loading chart…</div>}><Histogram data={resolution} /></Suspense></Card>
      <Card><Suspense fallback={<div>Loading chart…</div>}><BarCompare data={categories} /></Suspense></Card>
    </div>
  );
}
