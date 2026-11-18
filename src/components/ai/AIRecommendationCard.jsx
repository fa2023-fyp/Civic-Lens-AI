import { AIBadge } from './AIBadge.jsx';
import { ConfidenceMeter } from './ConfidenceMeter.jsx';
import { ExplanationList } from './ExplanationList.jsx';
import { LowConfidenceReason } from './LowConfidenceReason.jsx';
import { ModelVersionTag } from './ModelVersionTag.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './AIRecommendationCard.css';

export function AIRecommendationCard({
  field,
  value,
  confidence,
  threshold,
  reasons = [],
  safetyRule,
  alternatives = [],
  modelVersion,
  onConfirm,
  onChange,
  confirmLabel,
  changeLabel,
  isConfirmed = false,
  className = '',
}) {
  const { t } = useI18n();

  const numConfidence = Number(confidence) || 0;
  const normalizedConfidence = numConfidence > 1 ? numConfidence / 100 : numConfidence;
  const isBelowThreshold =
    threshold != null && normalizedConfidence < Number(threshold);

  return (
    <article
      className={`ai-recommendation-card${className ? ` ${className}` : ''}`}
      aria-label={`${field ? `${field}: ` : ''}${value}`}
    >
      <header className="ai-recommendation-card__header">
        <AIBadge />
        {modelVersion ? <ModelVersionTag version={modelVersion} /> : null}
      </header>

      <div className="ai-recommendation-card__target">
        {field ? (
          <p className="ai-recommendation-card__field">{field}</p>
        ) : null}
        <h3 className="ai-recommendation-card__value" dir="auto">
          {value}
        </h3>
      </div>

      <div className="ai-recommendation-card__confidence">
        <ConfidenceMeter value={confidence} threshold={threshold} />
      </div>

      {isBelowThreshold ? (
        <div className="ai-recommendation-card__below-reason">
          <LowConfidenceReason
            field={field}
            value={confidence}
            threshold={threshold}
          />
        </div>
      ) : null}

      <div className="ai-recommendation-card__explanations">
        <ExplanationList items={reasons} safetyRule={safetyRule} />
      </div>

      {alternatives && alternatives.length > 0 ? (
        <section
          className="ai-recommendation-card__alternatives"
          aria-label={t('ai.alternatives')}
        >
          <h4 className="ai-recommendation-card__alternatives-title">
            {t('ai.alternatives')}
          </h4>
          <ul className="ai-recommendation-card__alternatives-list">
            {alternatives.map((alt, index) => {
              const altConf = Number(alt.confidence) || 0;
              const formattedAltConf = (altConf > 1 ? altConf / 100 : altConf).toFixed(2);
              return (
                <li key={index} className="ai-recommendation-card__alternative-item">
                  <span className="ai-recommendation-card__alt-label" dir="auto">
                    {alt.label}
                  </span>
                  <span className="ai-recommendation-card__alt-score tabular-nums">
                    {formattedAltConf}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <footer className="ai-recommendation-card__actions">
        <Button
          type="button"
          variant={isConfirmed ? 'secondary' : 'cta'}
          size="sm"
          onClick={onConfirm}
        >
          <Icon name="check" size={14} />
          <span>{confirmLabel || t('ai.confirm')}</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onChange}
        >
          <Icon name="edit" size={14} />
          <span>{changeLabel || t('ai.change')}</span>
        </Button>
      </footer>
    </article>
  );
}
