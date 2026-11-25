import { useI18n } from '../../i18n/I18nContext.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import './StatusTimeline.css';

const MAIN_STEPS = [
  'created',
  'assigned',
  'in-progress',
  'resolution-submitted',
  'citizen-verification',
  'resolved-or-reopened',
];

export function StatusTimeline({
  steps,
  escalated = false,
  escalatedStep,
  loading = false,
  className = '',
}) {
  const { t, formatDate } = useI18n();

  if (loading) {
    return (
      <div className={`status-timeline status-timeline--loading${className ? ` ${className}` : ''}`} aria-busy="true">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} height="5rem" />
        ))}
      </div>
    );
  }

  const items = Array.isArray(steps) && steps.length
    ? steps
    : MAIN_STEPS.map((id) => ({ id, status: id }));

  return (
    <ol
      className={`status-timeline${escalated ? ' has-escalation' : ''}${className ? ` ${className}` : ''}`}
      aria-label={t('complaintTimeline.label')}
    >
      {items.map((item, index) => {
        const complete = item.complete !== false;
        const isCurrent = item.current === true;
        return (
          <li
            key={item.id || index}
            className={`status-timeline__step${complete ? ' is-complete' : ''}${isCurrent ? ' is-current' : ''}`}
          >
            <span className="status-timeline__marker" aria-hidden="true">
              {complete ? <Icon name={isCurrent ? 'clock' : 'check'} size={14} /> : null}
            </span>
            <Card variant="outlined" className="status-timeline__entry">
              <h3>{item.label || t(`complaintTimeline.steps.${item.id || item.status}`)}</h3>
              {item.actor ? (
                <p className="status-timeline__actor">
                  {t('complaintTimeline.actor')}: {item.actor}
                </p>
              ) : null}
              {item.timestamp ? (
                <time dateTime={new Date(item.timestamp).toISOString()}>
                  {formatDate(item.timestamp, { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
              ) : (
                <span className="status-timeline__pending">{t('complaintTimeline.pending')}</span>
              )}
            </Card>
          </li>
        );
      })}

      {escalated ? (
        <li className="status-timeline__step status-timeline__step--escalated is-complete">
          <span className="status-timeline__marker" aria-hidden="true">
            <Icon name="arrow-up" size={14} />
          </span>
          <Card variant="outlined" className="status-timeline__entry">
            <h3>{t('complaintTimeline.escalated')}</h3>
            {escalatedStep?.actor ? (
              <p className="status-timeline__actor">
                {t('complaintTimeline.actor')}: {escalatedStep.actor}
              </p>
            ) : null}
            {escalatedStep?.timestamp ? (
              <time dateTime={new Date(escalatedStep.timestamp).toISOString()}>
                {formatDate(escalatedStep.timestamp, { dateStyle: 'medium', timeStyle: 'short' })}
              </time>
            ) : (
              <span className="status-timeline__pending">{t('complaintTimeline.pending')}</span>
            )}
          </Card>
        </li>
      ) : null}
    </ol>
  );
}
