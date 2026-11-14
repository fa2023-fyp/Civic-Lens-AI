import { Icon } from '../Icon/Icon.jsx';
import './IconButton.css';

export function IconButton({ icon, size = 20, tooltip, className = '', ...props }) {
  const { 'aria-label': ariaLabel, ...buttonProps } = props;
  if (!ariaLabel) throw new Error('IconButton requires an aria-label.');

  return (
    <button
      type="button"
      className={`ui-icon-button${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      {...buttonProps}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
