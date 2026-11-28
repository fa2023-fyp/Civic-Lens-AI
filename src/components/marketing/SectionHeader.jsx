import './marketing.css';

export function SectionHeader({
  kicker,
  headline,
  lead,
  onDark = false,
  as: Component = 'header',
  headingAs: Heading = 'h2',
  className = '',
}) {
  return (
    <Component
      className={`marketing-section-header${onDark ? ' marketing-section-header--dark' : ''}${className ? ` ${className}` : ''}`}
    >
      {kicker ? <p className="marketing-section-header__kicker">{kicker}</p> : null}
      <Heading className="marketing-section-header__headline">{headline}</Heading>
      {lead ? <p className="marketing-section-header__lead">{lead}</p> : null}
    </Component>
  );
}
