import { Icon } from '../Icon/Icon.jsx';
import { Spinner } from '../Spinner/Spinner.jsx';
import './Button.css';

function renderIcon(value) {
  return typeof value === 'string' ? <Icon name={value} /> : value;
}

export function Button({
  as: Component = 'button',
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  className = '',
  children,
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    loading ? 'is-loading' : '',
    fullWidth ? 'is-full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  function handleClick(event) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return (
    <Component
      className={classes}
      type={Component === 'button' ? type : undefined}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={Component !== 'button' && isDisabled ? 'true' : undefined}
      aria-busy={loading || undefined}
      tabIndex={Component !== 'button' && isDisabled ? -1 : props.tabIndex}
      onClick={handleClick}
      {...props}
    >
      {iconStart ? <span className="ui-button__icon">{renderIcon(iconStart)}</span> : null}
      <span className="ui-button__label">{children}</span>
      {iconEnd ? <span className="ui-button__icon">{renderIcon(iconEnd)}</span> : null}
      {loading ? <Spinner size="sm" decorative className="ui-button__spinner" /> : null}
    </Component>
  );
}
