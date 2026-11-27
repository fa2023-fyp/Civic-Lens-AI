import { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SkeletonChart } from '../ui/SkeletonChart/SkeletonChart.jsx';

function isRtl() { return typeof document !== 'undefined' && document.documentElement.dir === 'rtl'; }

export function LineTrend({ data = [], loading = false, height = 240, valueLabel, xKey = 'label', yKey = 'value' }) {
  const [showTable, setShowTable] = useState(false);
  if (loading) return <SkeletonChart height={height} />;
  if (!data || !data.length) return <div className="charts-empty" role="status">No data</div>;
  const rtl = isRtl();
  return (
    <div className="charts-line-trend">
      <button type="button" className="charts-toggle" onClick={() => setShowTable((v) => !v)}>
        {showTable ? 'Chart' : 'Table'}
      </button>
      {showTable ? (
        <table className="charts-table">
          <thead><tr><th>{xKey}</th><th>{yKey}</th></tr></thead>
          <tbody>{data.map((d, i) => <tr key={i}><td>{d[xKey]}</td><td>{d[yKey]}</td></tr>)}</tbody>
        </table>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey={xKey} reversed={rtl} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} stroke="var(--border)" />
            <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} stroke="var(--border)" orientation={rtl ? 'right' : 'left'} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            <Line type="monotone" dataKey={yKey} stroke="var(--brand-600)" strokeWidth={2} dot={false} isAnimationActive animationDuration={800} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
export default LineTrend;
