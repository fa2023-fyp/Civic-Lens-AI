import './marketing.css';

export function SectionHeader({
  kicker,
  headline,
  lead,
  align = 'start',
  onDark = false,
  as: Component = 'header',
  headingAs: Heading = 'h2',
  className = '',
}) {
  if (align !== 'start' && align !== 'center') {
    throw new RangeError(`Unsupported section header alignment: ${align}`);
  }

  return (
    <Component
      className={`marketing-section-header marketing-section-header--${align}${onDark ? ' marketing-section-header--dark' : ''}${className ? ` ${className}` : ''}`}
    >
      {kicker ? <p className="marketing-section-header__kicker">{kicker}</p> : null}
      <Heading className="marketing-section-header__headline">{headline}</Heading>
      {lead ? <p className="marketing-section-header__lead">{lead}</p> : null}
    </Component>
  );
}
