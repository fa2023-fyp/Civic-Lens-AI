import './Badge.css';

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={`ui-badge ui-badge--${tone}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
