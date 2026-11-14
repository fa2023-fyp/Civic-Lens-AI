import { Card } from '../Card/Card.jsx';
import { DemoDataBadge } from '../../marketing/DemoDataBadge.jsx';
import './KPITile.css';

function Sparkline({ values, label }) {
  const points = values.map(Number).filter(Number.isFinite);
  if (points.length === 0) return null;

  const minimum = Math.min(...points);
  const range = Math.max(...points) - minimum || 1;
  const coordinates = points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 33 - ((point - minimum) / range) * 28;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className="ui-kpi-tile__sparkline"
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      <polyline points={coordinates} />
    </svg>
  );
}

export function KPITile({
  label,
  value,
  delta,
  deltaTone = 'neutral',
  sparkline,
  sparklineLabel,
  demoDataLabel,
  onDark = false,
  className = '',
}) {
  return (
    <Card
      as="article"
      variant={onDark ? 'dark' : 'outlined'}
      className={`ui-kpi-tile${onDark ? ' ui-kpi-tile--dark' : ''}${className ? ` ${className}` : ''}`}
    >
      <p className="ui-kpi-tile__label">{label}</p>
      <strong className="ui-kpi-tile__value">{value}</strong>
      {delta !== undefined && delta !== null ? (
        <span className={`ui-kpi-tile__delta ui-kpi-tile__delta--${deltaTone}`}>{delta}</span>
      ) : null}
      {sparkline ? <Sparkline values={sparkline} label={sparklineLabel} /> : null}
      {demoDataLabel ? <DemoDataBadge>{demoDataLabel}</DemoDataBadge> : null}
    </Card>
  );
}
