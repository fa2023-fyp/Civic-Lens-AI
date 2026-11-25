import { useI18n } from '../../i18n/I18nContext.jsx';
import { Badge } from '../ui/Badge/Badge.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { SkeletonCard } from '../ui/SkeletonCard/SkeletonCard.jsx';
import './ClusterCard.css';

export function ClusterCard({
  title,
  category,
  area,
  reportCount,
  affectedStreets = [],
  firstReport,
  latestReport,
  status,
  loading = false,
  className = '',
}) {
  const { t, formatDate } = useI18n();

  if (loading) {
    return <SkeletonCard className={className} />;
  }

  const formatReportDate = (value) =>
    value ? formatDate(value, { dateStyle: 'medium' }) : '—';

  return (
    <Card hoverLift className={`ai-cluster-card${className ? ` ${className}` : ''}`}>
      <header className="ai-cluster-card__header">
        <div>
          <span className="ai-cluster-card__label">{t('ai.cluster.aiProposed')}</span>
          <h3 className="ai-cluster-card__title">{title}</h3>
        </div>
        {status ? <Badge tone="info">{status}</Badge> : null}
      </header>

      <dl className="ai-cluster-card__details">
        {category ? (
          <div>
            <dt>{t('ai.cluster.category')}</dt>
            <dd>{category}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t('ai.cluster.area')}</dt>
          <dd>{area || '—'}</dd>
        </div>
        <div>
          <dt>{t('ai.cluster.reportCount')}</dt>
          <dd className="tabular-nums">{Number.isFinite(reportCount) ? reportCount : '—'}</dd>
        </div>
        <div>
          <dt>{t('ai.cluster.affectedStreets')}</dt>
          <dd>{affectedStreets.length ? affectedStreets.join(', ') : '—'}</dd>
        </div>
        <div>
          <dt>{t('ai.cluster.firstReport')}</dt>
          <dd>{formatReportDate(firstReport)}</dd>
        </div>
        <div>
          <dt>{t('ai.cluster.latestReport')}</dt>
          <dd>{formatReportDate(latestReport)}</dd>
        </div>
      </dl>
    </Card>
  );
}
