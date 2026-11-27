import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SkeletonChart } from '../ui/SkeletonChart/SkeletonChart.jsx';

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#4F46E5'];

export function DonutShare({ data = [], loading = false, height = 240, nameKey = 'name', valueKey = 'value' }) {
  const [showTable, setShowTable] = useState(false);
  if (loading) return <SkeletonChart height={height} />;
  if (!data || !data.length) return <div className="charts-empty" role="status">No data</div>;
  return (
    <div className="charts-donut-share">
      <button type="button" className="charts-toggle" onClick={() => setShowTable((v) => !v)}>{showTable ? 'Chart' : 'Table'}</button>
      {showTable ? (
        <table className="charts-table"><thead><tr><th>{nameKey}</th><th>{valueKey}</th></tr></thead><tbody>{data.map((d, i) => <tr key={i}><td>{d[nameKey]}</td><td>{d[valueKey]}</td></tr>)}</tbody></table>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius={60} outerRadius={90} isAnimationActive animationDuration={800}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
export default DonutShare;
