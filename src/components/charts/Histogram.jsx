import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SkeletonChart } from '../ui/SkeletonChart/SkeletonChart.jsx';

export function Histogram({ data = [], loading = false, height = 240, xKey = 'bin', yKey = 'count' }) {
  const [showTable, setShowTable] = useState(false);
  if (loading) return <SkeletonChart height={height} />;
  if (!data || !data.length) return <div className="charts-empty" role="status">No data</div>;
  return (
    <div className="charts-histogram">
      <button type="button" className="charts-toggle" onClick={() => setShowTable((v) => !v)}>{showTable ? 'Chart' : 'Table'}</button>
      {showTable ? (
        <table className="charts-table"><thead><tr><th>{xKey}</th><th>{yKey}</th></tr></thead><tbody>{data.map((d, i) => <tr key={i}><td>{d[xKey]}</td><td>{d[yKey]}</td></tr>)}</tbody></table>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} stroke="var(--border)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} stroke="var(--border)" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            <Bar dataKey={yKey} fill="var(--ai-500, #4F46E5)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
export default Histogram;
