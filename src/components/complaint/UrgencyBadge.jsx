import { Badge } from '../ui/Badge/Badge.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './ComplaintBadges.css';

const urgencyConfig = {
  low: { tone: 'info', icon: 'arrow-down' },
  medium: { tone: 'warning', icon: 'alert-circle' },
  high: { tone: 'danger', icon: 'alert-triangle' },
  critical: { tone: 'danger', icon: 'alarm' },
};

export function UrgencyBadge({ urgency = 'low', label, className = '' }) {
  const { t } = useI18n();
  const key = String(urgency).toLowerCase();
  const config = urgencyConfig[key] || urgencyConfig.low;

  return (
    <Badge tone={config.tone} className={`complaint-badge complaint-badge--urgency${className ? ` ${className}` : ''}`}>
      <Icon name={config.icon} size={14} />
      <span>{label || t(`complaintUrgency.${key}`)}</span>
    </Badge>
  );
}
