import './Avatar.css';

function initialsFor(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toLocaleUpperCase();
}

export function Avatar({ src, name = '', initials, size = 'md', className = '' }) {
  const label = name || initials || '';
  return (
    <span
      className={`ui-avatar ui-avatar--${size}${className ? ` ${className}` : ''}`}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    >
      {src ? (
        <img src={src} alt="" />
      ) : (
        <span aria-hidden="true">{initials || initialsFor(name)}</span>
      )}
    </span>
  );
}
