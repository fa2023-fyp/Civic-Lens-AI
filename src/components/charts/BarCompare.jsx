import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SkeletonChart } from '../ui/SkeletonChart/SkeletonChart.jsx';

function isRtl() { return typeof document !== 'undefined' && document.documentElement.dir === 'rtl'; }

export function BarCompare({ data = [], loading = false, height = 240, xKey = 'name', yKey = 'value' }) {
  const [showTable, setShowTable] = useState(false);
  if (loading) return <SkeletonChart height={height} />;
  if (!data || !data.length) return <div className="charts-empty" role="status">No data</div>;
  const rtl = isRtl();
  return (
    <div className="charts-bar-compare">
      <button type="button" className="charts-toggle" onClick={() => setShowTable((v) => !v)}>{showTable ? 'Chart' : 'Table'}</button>
      {showTable ? (
        <table className="charts-table"><thead><tr><th>{xKey}</th><th>{yKey}</th></tr></thead><tbody>{data.map((d, i) => <tr key={i}><td>{d[xKey]}</td><td>{d[yKey]}</td></tr>)}</tbody></table>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey={xKey} reversed={rtl} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} stroke="var(--border)" />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} stroke="var(--border)" orientation={rtl ? 'right' : 'left'} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            <Bar dataKey={yKey} fill="var(--brand-600)" radius={[8, 8, 0, 0]} maxBarSize={48} isAnimationActive animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
export default BarCompare;
