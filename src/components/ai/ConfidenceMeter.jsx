import { Chip } from '../ui/Chip/Chip.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { Tooltip } from '../ui/Tooltip/Tooltip.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './ConfidenceMeter.css';

export function ConfidenceMeter({
  value = 0,
  threshold,
  label,
  showBand = true,
  showTooltip = true,
  className = '',
}) {
  const { t } = useI18n();

  const numValue = Number(value) || 0;
  const normalized = numValue > 1 ? numValue / 100 : numValue;
  const clamped = Math.min(1, Math.max(0, normalized));
  const percent = Math.round(clamped * 100);
  const formattedNum = clamped.toFixed(2);

  const hasThreshold = threshold != null && !Number.isNaN(Number(threshold));
  const thresholdNum = hasThreshold ? Number(threshold) : null;
  const isBelow = hasThreshold && clamped < thresholdNum;

  const bandKey =
    clamped >= 0.8
      ? 'ai.highConfidence'
      : clamped >= 0.6
        ? 'ai.mediumConfidence'
        : 'ai.lowConfidence';

  const bandTone = isBelow
    ? 'danger'
    : clamped >= 0.8
      ? 'success'
      : clamped >= 0.6
        ? 'warning'
        : 'danger';

  const tooltipText = t('ai.confidenceTooltip');

  return (
    <div className={`confidence-meter${className ? ` ${className}` : ''}`}>
      <div className="confidence-meter__header">
        <div className="confidence-meter__label-group">
          <span className="confidence-meter__label">
            {label || t('ai.confidenceLabel')}
          </span>
          {showTooltip ? (
            <Tooltip content={tooltipText}>
              <span
                className="confidence-meter__info-icon"
                tabIndex={0}
                role="button"
                aria-label={tooltipText}
              >
                <Icon name="info" size={13} />
              </span>
            </Tooltip>
          ) : null}
        </div>

        <div className="confidence-meter__status-group">
          <strong className="confidence-meter__value tabular-nums">
            {formattedNum}
          </strong>
          {showBand ? (
            <span
              className={`confidence-meter__band confidence-meter__band--${bandTone}`}
            >
              {t(bandKey)}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="confidence-meter__track"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuetext={`${formattedNum} · ${t(bandKey)}`}
      >
        <div
          className={`confidence-meter__fill confidence-meter__fill--${bandTone}`}
          style={{ width: `${percent}%` }}
        />
        {hasThreshold ? (
          <div
            className="confidence-meter__threshold-marker"
            style={{
              insetInlineStart: `${Math.min(100, Math.max(0, thresholdNum * 100))}%`,
            }}
            title={t('ai.belowThreshold', { threshold: thresholdNum.toFixed(2) })}
          />
        ) : null}
      </div>

      {isBelow ? (
        <div className="confidence-meter__chip-row">
          <Chip tone="warning" className="confidence-meter__threshold-chip">
            <Icon name="alert-triangle" size={12} />
            <span>
              {t('ai.belowThreshold', { threshold: thresholdNum.toFixed(2) })}
            </span>
          </Chip>
        </div>
      ) : null}
    </div>
  );
}
