import './Divider.css';

export function Divider({ orientation = 'horizontal', label, className = '' }) {
  if (label) {
    return (
      <div className={`ui-divider-label${className ? ` ${className}` : ''}`} role="separator">
        <span>{label}</span>
      </div>
    );
  }
  return (
    <hr
      className={`ui-divider${orientation === 'vertical' ? ' is-vertical' : ''}${className ? ` ${className}` : ''}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
