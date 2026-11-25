import { useState } from 'react';
import { Badge } from '../ui/Badge/Badge.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { Chip } from '../ui/Chip/Chip.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { SkeletonCard } from '../ui/SkeletonCard/SkeletonCard.jsx';
import { ErrorState } from '../ui/ErrorState/ErrorState.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './SimilarComplaints.css';

export function SimilarComplaints({
  items = [],
  onConfirmDuplicate,
  onRejectDuplicate,
  title,
  loading = false,
  error = false,
  errorMessage,
  onRetry,
  className = '',
}) {
  const { t } = useI18n();
  const [decisions, setDecisions] = useState({});

  function handleConfirm(item) {
    setDecisions((prev) => ({ ...prev, [item.id]: 'confirmed' }));
    onConfirmDuplicate?.(item);
  }

  function handleReject(item) {
    setDecisions((prev) => ({ ...prev, [item.id]: 'rejected' }));
    onRejectDuplicate?.(item);
  }

  return (
    <div className={`similar-complaints${className ? ` ${className}` : ''}`}>
      <div className="similar-complaints__header">
        <h4 className="similar-complaints__title">
          {title || t('ai.similar.title')}
        </h4>
        <span className="similar-complaints__count">
          {items.length} {t('ai.similar.potentialDuplicate')}
        </span>
      </div>

      <p className="similar-complaints__notice">
        <Icon name="info" size={14} className="similar-complaints__notice-icon" />
        <span>{t('ai.similar.duplicateNotice')}</span>
      </p>

      {loading ? (
        <div className="similar-complaints__loading" aria-busy="true">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          message={errorMessage || t('ai.similar.error')}
          referenceCode="CL-SIM-1"
          onRetry={onRetry}
        />
      ) : items.length === 0 ? (
        <Card variant="outlined" className="similar-complaints__empty">
          <p>{t('ai.similar.empty')}</p>
        </Card>
      ) : (
        <ul className="similar-complaints__list">
          {items.map((item) => {
            const similarityNum = Number(item.similarity) || 0;
            const normalizedSim = similarityNum > 1 ? similarityNum / 100 : similarityNum;
            const formattedSim = normalizedSim.toFixed(2);
            const decision = decisions[item.id];

            const crossLang =
              typeof item.languages === 'string'
                ? item.languages
                : item.languages
                  ? `${item.languages.source || t('ai.similar.english')} ↔ ${item.languages.target || t('ai.similar.romanUrdu')}`
                  : null;

            const distanceText =
              typeof item.distance === 'number'
                ? `${item.distance} m`
                : item.distance || '—';

            const daysText =
              item.daysApart === 0
                ? t('ai.similar.sameDay')
                : Number.isFinite(item.daysApart)
                  ? t('ai.similar.daysApart', { days: item.daysApart })
                  : '—';

            return (
              <li key={item.id} className="similar-complaints__item">
                <Card variant="outlined" className={`similar-complaint-card${decision ? ` is-${decision}` : ''}`}>
                  <header className="similar-complaint-card__header">
                    <div className="similar-complaint-card__badge-row">
                      <Badge tone="ai">
                        <Icon name="sparkles" size={12} />
                        <span>{t('ai.similar.potentialDuplicateBadge')}</span>
                      </Badge>

                      <span className="similar-complaint-card__id">
                        {item.id}
                      </span>
                    </div>

                    <div className="similar-complaint-card__sim-score">
                      <strong className="tabular-nums">{formattedSim}</strong>
                      <span className="similar-complaint-card__sim-pct">
                        ({Math.round(normalizedSim * 100)}%)
                      </span>
                    </div>
                  </header>

                  <div className="similar-complaint-card__meta">
                    {crossLang ? (
                      <Chip tone="info" className="similar-complaint-card__lang-chip">
                        <Icon name="language" size={12} />
                        <span>{crossLang}</span>
                      </Chip>
                    ) : null}

                    <span className="similar-complaint-card__meta-tag">
                      <Icon name="map-pin" size={12} />
                      <span>{t('ai.similar.distanceApart', { distance: distanceText })}</span>
                    </span>

                    <span className="similar-complaint-card__meta-tag">
                      <Icon name="clock" size={12} />
                      <span>{daysText}</span>
                    </span>

                    {item.status ? (
                      <Badge tone="neutral">{item.status}</Badge>
                    ) : null}
                  </div>

                  <p className="similar-complaint-card__text" dir="auto">
                    {item.text || item.description}
                  </p>

                  <footer className="similar-complaint-card__actions">
                    <Button
                      type="button"
                      variant={decision === 'confirmed' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleConfirm(item)}
                    >
                      <Icon name="check" size={14} />
                      <span>{t('ai.similar.confirmDuplicate')}</span>
                    </Button>

                    <Button
                      type="button"
                      variant={decision === 'rejected' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleReject(item)}
                    >
                      <Icon name="close" size={14} />
                      <span>{t('ai.similar.notDuplicate')}</span>
                    </Button>
                  </footer>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
