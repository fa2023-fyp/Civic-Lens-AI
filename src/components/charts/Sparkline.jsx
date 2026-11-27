import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { SkeletonChart } from '../ui/SkeletonChart/SkeletonChart.jsx';

export function Sparkline({ data = [], loading = false, height = 40, dataKey = 'value' }) {
  if (loading) return <SkeletonChart height={height} />;
  if (!data || !data.length) return <div className="charts-empty" role="status">No data</div>;
  return (
    <div className="charts-sparkline" style={{ blockSize: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line type="monotone" dataKey={dataKey} stroke="var(--brand-600)" strokeWidth={1.5} dot={false} isAnimationActive animationDuration={600} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default Sparkline;
