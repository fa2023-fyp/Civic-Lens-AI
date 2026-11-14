import { useCountUp } from '../../hooks/useCountUp.js';
import { Card } from '../ui/Card/Card.jsx';
import { DemoDataBadge } from './DemoDataBadge.jsx';
import { Reveal, stagger } from './Reveal.jsx';
import './marketing.css';

export function StatNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1400,
  className = '',
}) {
  const { ref, formattedValue } = useCountUp(value, {
    duration,
    decimals,
    prefix,
    suffix,
  });

  return (
    <strong ref={ref} className={`marketing-stat-number${className ? ` ${className}` : ''}`}>
      {formattedValue}
    </strong>
  );
}

export function StatCard({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  caption,
  demoDataLabel,
  onDark = false,
  delay = 0,
  className = '',
}) {
  return (
    <Reveal delay={delay} className="marketing-stat-reveal">
      <Card
        as="article"
        variant={onDark ? 'dark' : 'outlined'}
        hoverLift
        className={`marketing-stat-card${onDark ? ' marketing-stat-card--dark' : ''}${className ? ` ${className}` : ''}`}
      >
        <StatNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        <p className="marketing-stat-card__caption">{caption}</p>
        {demoDataLabel ? <DemoDataBadge>{demoDataLabel}</DemoDataBadge> : null}
      </Card>
    </Reveal>
  );
}

function StatCollection({ items = [], demoDataLabel, onDark = false, className = '', id }) {
  return (
    <div id={id} className={className}>
      {stagger(items, (item, index, delay) => (
        <StatCard
          key={item.id ?? index}
          {...item}
          onDark={onDark}
          delay={delay}
          demoDataLabel={item.demoDataLabel ?? demoDataLabel}
        />
      ))}
    </div>
  );
}

export function StatStrip({ items = [], demoDataLabel, onDark = false, className = '', id }) {
  return (
    <StatCollection
      items={items}
      demoDataLabel={demoDataLabel}
      onDark={onDark}
      className={`marketing-stat-strip${onDark ? ' marketing-stat-strip--dark' : ''}${className ? ` ${className}` : ''}`}
      id={id}
    />
  );
}

export function StatGrid({ items = [], demoDataLabel, onDark = false, className = '', id }) {
  return (
    <StatCollection
      items={items}
      demoDataLabel={demoDataLabel}
      onDark={onDark}
      className={`marketing-stat-grid${onDark ? ' marketing-stat-grid--dark' : ''}${className ? ` ${className}` : ''}`}
      id={id}
    />
  );
}
