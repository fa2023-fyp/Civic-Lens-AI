import { Card } from '../ui/Card/Card.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { Reveal } from './Reveal.jsx';
import './marketing.css';

function MarketingContentCard({
  kind,
  icon,
  title,
  text,
  label,
  href,
  linkText,
  onDark = false,
  delay = 0,
  className = '',
}) {
  return (
    <Reveal delay={delay} className="marketing-content-reveal">
      <Card
        as="article"
        variant={onDark ? 'dark' : 'outlined'}
        hoverLift
        className={`marketing-content-card marketing-content-card--${kind}${onDark ? ' marketing-content-card--dark' : ''}${className ? ` ${className}` : ''}`}
      >
        <span className="marketing-content-card__icon-tile">
          <Icon name={icon} size={24} />
        </span>
        {label ? <span className="marketing-content-card__label">{label}</span> : null}
        <h3 className="marketing-content-card__title">{title}</h3>
        <p className="marketing-content-card__text">{text}</p>
        {href && linkText ? (
          <a className="marketing-content-card__link" href={href}>
            {linkText}
          </a>
        ) : null}
      </Card>
    </Reveal>
  );
}

export function FeatureCard(props) {
  return <MarketingContentCard {...props} kind="feature" />;
}

export function PillarCard(props) {
  return <MarketingContentCard {...props} kind="pillar" />;
}

export function ServiceCard(props) {
  return <MarketingContentCard {...props} kind="service" />;
}

export function RecognitionCard(props) {
  return <MarketingContentCard {...props} kind="recognition" />;
}
