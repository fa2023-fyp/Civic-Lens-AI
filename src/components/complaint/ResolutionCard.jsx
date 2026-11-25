import { useI18n } from '../../i18n/I18nContext.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import './ResolutionCard.css';

export function ResolutionCard({
  description,
  actionsPerformed = [],
  evidence = [],
  timestamp,
  loading = false,
  className = '',
}) {
  const { t, formatDate } = useI18n();

  if (loading) {
    return (
      <Card className={`complaint-resolution-card${className ? ` ${className}` : ''}`} aria-busy="true">
        <Skeleton width="30%" />
        <Skeleton height="3rem" />
        <Skeleton width="60%" />
      </Card>
    );
  }

  return (
    <Card className={`complaint-resolution-card${className ? ` ${className}` : ''}`}>
      <h3>{t('complaintGallery.resolutionTitle')}</h3>
      {description ? <p className="complaint-resolution-card__description">{description}</p> : null}

      {actionsPerformed.length ? (
        <section>
          <h4>{t('complaintGallery.actionsPerformed')}</h4>
          <ul>
            {actionsPerformed.map((action, index) => (
              <li key={`${action}-${index}`}>
                <Icon name="check-circle" size={18} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {evidence.length ? (
        <section>
          <h4>{t('complaintGallery.evidence')}</h4>
          <div className="complaint-resolution-card__evidence">
            {evidence.map((item, index) => (
              <Card
                as="div"
                key={`${item.title || item.src || index}-${index}`}
                className="complaint-resolution-card__evidence-item"
              >
                {item.src ? <img src={item.src} alt={item.alt || ''} /> : <Icon name="file" size={24} />}
                <span>{item.title || t('complaintGallery.evidenceItem', { number: index + 1 })}</span>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {timestamp ? (
        <time dateTime={new Date(timestamp).toISOString()} className="complaint-resolution-card__timestamp">
          {t('complaintGallery.resolutionTimestamp')}: {formatDate(timestamp, { dateStyle: 'medium', timeStyle: 'short' })}
        </time>
      ) : null}
    </Card>
  );
}
