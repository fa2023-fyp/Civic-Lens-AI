import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function DepartmentWorkloadChart({ data = [], height = 260, valueLabel }) {
  return (
    <div className="charts-department-workload" style={{ inlineSize: '100%', blockSize: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            stroke="var(--border)"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
            stroke="var(--border)"
          />
          <Tooltip
            formatter={(value) => [value, valueLabel]}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid var(--border)',
              fontSize: 13,
              background: 'var(--surface)',
              color: 'var(--text)',
            }}
          />
          <Bar dataKey="value" fill="var(--brand-600)" radius={[8, 8, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}