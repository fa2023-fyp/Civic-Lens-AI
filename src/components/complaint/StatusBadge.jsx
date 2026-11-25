import { Badge } from '../ui/Badge/Badge.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './ComplaintBadges.css';

const statusConfig = {
  created: { tone: 'neutral', icon: 'clipboard' },
  submitted: { tone: 'info', icon: 'upload' },
  processing: { tone: 'info', icon: 'activity' },
  review: { tone: 'warning', icon: 'help' },
  assigned: { tone: 'brand', icon: 'users' },
  'in-progress': { tone: 'warning', icon: 'clock' },
  'resolution-submitted': { tone: 'info', icon: 'check-circle' },
  'citizen-verification': { tone: 'warning', icon: 'eye' },
  resolved: { tone: 'success', icon: 'check-circle' },
  reopened: { tone: 'danger', icon: 'refresh' },
  escalated: { tone: 'danger', icon: 'arrow-up' },
  closed: { tone: 'neutral', icon: 'lock' },
  rejected: { tone: 'danger', icon: 'x-circle' },
};

export function StatusBadge({ status = 'created', label, className = '' }) {
  const { t } = useI18n();
  const key = String(status).toLowerCase();
  const config = statusConfig[key] || statusConfig.created;

  return (
    <Badge tone={config.tone} className={`complaint-badge${className ? ` ${className}` : ''}`}>
      <Icon name={config.icon} size={14} />
      <span>{label || t(`complaintStatus.${key}`)}</span>
    </Badge>
  );
}
