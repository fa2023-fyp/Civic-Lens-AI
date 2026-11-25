import { useI18n } from '../../i18n/I18nContext.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { Badge } from '../ui/Badge/Badge.jsx';
import { ProgressBar } from '../ui/ProgressBar/ProgressBar.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import { DemoDataBadge } from './DemoDataBadge.jsx';
import './ComplaintCard.css';

const statusTones = {
  submitted: 'info',
  processing: 'info',
  review: 'warning',
  assigned: 'brand',
  progress: 'warning',
  resolution: 'info',
  verification: 'warning',
  resolved: 'success',
  reopened: 'danger',
  escalated: 'danger',
  closed: 'neutral',
  rejected: 'danger',
};

export function ComplaintCard({
  id,
  title,
  status,
  statusLabel,
  category,
  timestamp,
  progress = 0,
  isDemo = false,
  loading = false,
  onOpen,
  className = '',
}) {
  const { t, formatRelativeTime } = useI18n();

  if (loading) {
    return (
      <Card className={`complaint-card${className ? ` ${className}` : ''}`} aria-busy="true">
        <Skeleton width="28%" />
        <Skeleton width="80%" height="var(--space-6)" />
        <Skeleton width="55%" />
        <Skeleton height="var(--space-2)" />
      </Card>
    );
  }

  const content = (
    <>
      <header className="complaint-card__header">
        <span className="complaint-card__id">{id}</span>
        {isDemo ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
      </header>
      <h3 className="complaint-card__title">{title}</h3>
      <div className="complaint-card__meta">
        {category ? <span>{category}</span> : null}
        {timestamp ? (
          <time dateTime={new Date(timestamp).toISOString()}>{formatRelativeTime(timestamp)}</time>
        ) : null}
      </div>
      <div className="complaint-card__status">
        <Badge tone={statusTones[status] || 'neutral'}>{statusLabel}</Badge>
      </div>
      <ProgressBar
        value={progress}
        min={0}
        max={100}
        label={t('complaintGallery.progress')}
        showValue
        className="complaint-card__progress"
      />
    </>
  );

  return onOpen ? (
    <Card
      as="button"
      type="button"
      hoverLift
      onClick={onOpen}
      className={`complaint-card complaint-card--button${className ? ` ${className}` : ''}`}
      aria-label={t('complaintGallery.openComplaint', { id })}
    >
      {content}
    </Card>
  ) : (
    <Card hoverLift className={`complaint-card${className ? ` ${className}` : ''}`}>
      {content}
    </Card>
  );
}
