import { useI18n } from '../../i18n/I18nContext.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import { useCountdown } from '../../hooks/useCountdown.js';
import './SLACountdown.css';

const allowedStates = new Set([
  'on-track',
  'warning',
  'at-risk',
  'overdue',
  'escalated',
  'paused',
  'completed',
]);

const stateConfig = {
  'on-track': { tone: 'info', icon: 'clock' },
  warning: { tone: 'warning', icon: 'alert-circle' },
  'at-risk': { tone: 'warning', icon: 'alert-triangle' },
  overdue: { tone: 'danger', icon: 'alarm' },
  escalated: { tone: 'danger', icon: 'arrow-up' },
  paused: { tone: 'neutral', icon: 'minus' },
  completed: { tone: 'success', icon: 'check-circle' },
};

export function SLACountdown({
  dueDate,
  startedAt,
  state,
  paused = false,
  completed = false,
  escalated = false,
  loading = false,
  className = '',
}) {
  const { t } = useI18n();
  const safeDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const remaining = useCountdown(safeDueDate);

  if (loading) {
    return (
      <div className={`sla-countdown sla-countdown--loading${className ? ` ${className}` : ''}`} aria-busy="true">
        <Skeleton width="42%" height="var(--space-8)" />
      </div>
    );
  }

  let resolvedState = allowedStates.has(state) ? state : 'on-track';
  if (completed) resolvedState = 'completed';
  else if (paused) resolvedState = 'paused';
  else if (escalated) resolvedState = 'escalated';
  else if (!allowedStates.has(state)) {
    if (remaining.isComplete) resolvedState = 'overdue';
    else if (startedAt && dueDate) {
      const startTime = new Date(startedAt).getTime();
      const dueTime = new Date(dueDate).getTime();
      const duration = dueTime - startTime;
      if (Number.isFinite(duration) && duration > 0) {
        const elapsed = duration - remaining.total;
        const ratio = Math.max(0, Math.min(1, elapsed / duration));
        if (ratio >= 0.9) resolvedState = 'at-risk';
        else if (ratio >= 0.75) resolvedState = 'warning';
      }
    }
  }

  const config = stateConfig[resolvedState];
  const overdue = resolvedState === 'overdue';
  const timeParts = [
    remaining.days ? t('complaintSla.daysShort', { value: remaining.days }) : null,
    remaining.hours ? t('complaintSla.hoursShort', { value: remaining.hours }) : null,
    remaining.minutes ? t('complaintSla.minutesShort', { value: remaining.minutes }) : null,
    overdue ? null : t('complaintSla.secondsShort', { value: remaining.seconds }),
  ].filter(Boolean);

  return (
    <div
      className={`sla-countdown sla-countdown--${resolvedState}${className ? ` ${className}` : ''}`}
      role="timer"
      aria-live="polite"
    >
      <Icon name={config.icon} size={18} />
      <div className="sla-countdown__copy">
        <strong>{t(`complaintSla.states.${resolvedState}`)}</strong>
        <span className="sla-countdown__time">
          {overdue
            ? t('complaintSla.overdueBy')
            : timeParts.join(' ')}
        </span>
      </div>
    </div>
  );
}
