import { Chip } from '../ui/Chip/Chip.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './LowConfidenceReason.css';

export function LowConfidenceReason({
  field,
  value,
  threshold,
  reason,
  className = '',
}) {
  const { t } = useI18n();

  const formattedValue =
    typeof value === 'number'
      ? (value > 1 ? value / 100 : value).toFixed(2)
      : String(value ?? '');

  const formattedThreshold =
    typeof threshold === 'number'
      ? (threshold > 1 ? threshold / 100 : threshold).toFixed(2)
      : String(threshold ?? '');

  const defaultReason = t('ai.lowConfidenceNotice', {
    field: field || t('ai.fieldLabel'),
    value: formattedValue,
    threshold: formattedThreshold,
  });

  return (
    <div
      className={`low-confidence-reason${className ? ` ${className}` : ''}`}
      role="note"
    >
      <div className="low-confidence-reason__content">
        <Icon
          name="alert-triangle"
          size={16}
          className="low-confidence-reason__icon"
        />
        <span className="low-confidence-reason__text">
          {reason || defaultReason}
        </span>
      </div>
      <Chip tone="warning" className="low-confidence-reason__chip">
        {t('ai.humanReviewRequired')}
      </Chip>
    </div>
  );
}
