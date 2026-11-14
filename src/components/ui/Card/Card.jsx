import './Card.css';

export function Card({
  as: Component = 'article',
  variant = 'outlined',
  hoverLift = false,
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`ui-card ui-card--${variant}${hoverLift ? ' has-hover-lift' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {children}
    </Component>
  );
}
