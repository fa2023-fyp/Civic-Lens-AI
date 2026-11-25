import { useI18n } from '../../i18n/I18nContext.jsx';
import { Badge } from '../ui/Badge/Badge.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import './SLARiskBadge.css';

const levelConfig = {
  low: { tone: 'info', icon: 'arrow-down' },
  medium: { tone: 'warning', icon: 'alert-circle' },
  high: { tone: 'danger', icon: 'alert-triangle' },
};

export function SLARiskBadge({
  level = 'low',
  factors = [],
  method = 'ml',
  loading = false,
  className = '',
}) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className={`sla-risk-badge sla-risk-badge--loading${className ? ` ${className}` : ''}`} aria-busy="true">
        <Skeleton width="18rem" height="6rem" />
      </div>
    );
  }

  const key = String(level).toLowerCase();
  const config = levelConfig[key] || levelConfig.low;
  const methodKey = method === 'rules' ? 'rules' : 'ml';

  return (
    <div className={`sla-risk-badge${className ? ` ${className}` : ''}`}>
      <Badge tone={config.tone} className="sla-risk-badge__level">
        <Icon name={config.icon} size={14} />
        <span>{t(`complaintSla.risk.${key}`)}</span>
      </Badge>

      <div className="sla-risk-badge__details">
        <strong>{t('complaintSla.risk.factors')}</strong>
        {factors.length ? (
          <ul>
            {factors.map((factor, index) => (
              <li key={`${factor}-${index}`}>{factor}</li>
            ))}
          </ul>
        ) : (
          <p>{t('complaintSla.risk.noFactors')}</p>
        )}
        <span className="sla-risk-badge__method">
          {t(`complaintSla.risk.method.${methodKey}`)}
        </span>
      </div>
    </div>
  );
}
