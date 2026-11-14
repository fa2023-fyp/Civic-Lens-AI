import { Icon } from '../Icon/Icon.jsx';
import './InlineAlert.css';

const icons = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-circle',
};

export function InlineAlert({ tone = 'info', title, children, className = '' }) {
  return (
    <div
      className={`ui-inline-alert ui-inline-alert--${tone}${className ? ` ${className}` : ''}`}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <Icon name={icons[tone] || icons.info} />
      <div>
        {title ? <strong>{title}</strong> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
