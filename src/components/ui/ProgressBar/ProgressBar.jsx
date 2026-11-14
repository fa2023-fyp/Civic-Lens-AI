import { useI18n } from '../../../i18n/I18nContext.jsx';
import './ProgressBar.css';

export function ProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  showValue = false,
  className = '',
}) {
  const { t } = useI18n();
  const indeterminate = value == null;
  const safeMax = max > min ? max : min + 1;
  const boundedValue = indeterminate ? undefined : Math.max(min, Math.min(safeMax, value));
  const percentage = indeterminate ? null : ((boundedValue - min) / (safeMax - min)) * 100;

  return (
    <div className={`ui-progress${className ? ` ${className}` : ''}`}>
      {label ? (
        <div className="ui-progress__label">
          <span>{label}</span>
          {showValue && !indeterminate ? (
            <span>{t('ui.percent', { value: Math.round(percentage) })}</span>
          ) : null}
        </div>
      ) : null}
      <div
        className={`ui-progress__track${indeterminate ? ' is-indeterminate' : ''}`}
        role="progressbar"
        aria-label={label || t('ui.progress')}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={boundedValue}
        aria-valuetext={indeterminate ? t('ui.inProgress') : undefined}
      >
        <span
          className="ui-progress__fill"
          style={indeterminate ? undefined : { transform: `scaleX(${percentage / 100})` }}
        />
      </div>
    </div>
  );
}
