import { useEffect, useState } from 'react';
import { Badge } from '../ui/Badge/Badge.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { TypingDots } from '../ui/TypingDots/TypingDots.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './PipelineProgress.css';

export const PIPELINE_STEPS = [
  { id: 'language', icon: 'globe' },
  { id: 'normalise', icon: 'edit' },
  { id: 'classify', icon: 'layers' },
  { id: 'extract', icon: 'sparkles' },
  { id: 'urgency', icon: 'alarm' },
  { id: 'department', icon: 'users' },
  { id: 'similarity', icon: 'search' },
];

export function PipelineProgress({
  status = 'running', // 'pending' | 'running' | 'settled'
  currentStep: controlledStep,
  autoAnimate = true,
  stepDuration = 550,
  onComplete,
  showControls = false,
  title,
  className = '',
}) {
  const { t } = useI18n();

  const isInitiallySettled = status === 'settled';
  const [internalStep, setInternalStep] = useState(isInitiallySettled ? PIPELINE_STEPS.length : 0);
  const [isSettled, setIsSettled] = useState(isInitiallySettled);

  const activeStepIndex =
    typeof controlledStep === 'number' ? controlledStep : internalStep;

  useEffect(() => {
    if (!autoAnimate || isSettled) return undefined;

    const timer = window.setTimeout(() => {
      setInternalStep((prev) => {
        const next = prev + 1;
        if (next >= PIPELINE_STEPS.length) {
          setIsSettled(true);
          onComplete?.();
          return PIPELINE_STEPS.length;
        }
        return next;
      });
    }, stepDuration);

    return () => window.clearTimeout(timer);
  }, [autoAnimate, internalStep, isSettled, stepDuration, onComplete]);

  function restart() {
    setIsSettled(false);
    setInternalStep(0);
  }

  const completedCount = isSettled
    ? PIPELINE_STEPS.length
    : Math.min(activeStepIndex, PIPELINE_STEPS.length);

  return (
    <div
      className={`pipeline-progress${isSettled ? ' is-settled' : ' is-running'}${className ? ` ${className}` : ''}`}
      role="region"
      aria-label={title || t('ai.pipeline.title')}
    >
      <div className="pipeline-progress__header">
        <div className="pipeline-progress__title-group">
          <Icon name="sparkles" size={16} className="pipeline-progress__sparkle" />
          <h4 className="pipeline-progress__title">
            {title || t('ai.pipeline.title')}
          </h4>
        </div>

        <div className="pipeline-progress__status-badge">
          {isSettled ? (
            <Badge tone="success">
              <Icon name="check" size={12} />
              <span>{t('ai.pipeline.complete')}</span>
            </Badge>
          ) : (
            <Badge tone="ai">
              <span>{`${completedCount}/${PIPELINE_STEPS.length}`}</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="pipeline-progress__bar" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={PIPELINE_STEPS.length}>
        <div
          className="pipeline-progress__bar-fill"
          style={{ width: `${(completedCount / PIPELINE_STEPS.length) * 100}%` }}
        />
      </div>

      <ol className="pipeline-progress__steps">
        {PIPELINE_STEPS.map((step, index) => {
          const isDone = isSettled || index < activeStepIndex;
          const isRunning = !isSettled && index === activeStepIndex;
          const isPending = !isSettled && index > activeStepIndex;

          const stepClass = isDone
            ? 'is-done'
            : isRunning
              ? 'is-running'
              : 'is-pending';

          return (
            <li key={step.id} className={`pipeline-progress__step pipeline-progress__step--${stepClass}`}>
              <div className="pipeline-progress__step-icon-wrap">
                {isDone ? (
                  <Icon name="check" size={14} className="pipeline-progress__check-icon" />
                ) : (
                  <Icon name={step.icon} size={14} className="pipeline-progress__step-icon" />
                )}
              </div>

              <div className="pipeline-progress__step-info">
                <span className="pipeline-progress__step-name">
                  {t(`ai.pipeline.steps.${step.id}`)}
                </span>
                <span className="pipeline-progress__step-state">
                  {isRunning ? (
                    <TypingDots label={t('ai.pipeline.stepStatusRunning')} />
                  ) : isDone ? (
                    t('ai.pipeline.stepStatusDone')
                  ) : (
                    t('ai.pipeline.stepStatusPending')
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {showControls ? (
        <div className="pipeline-progress__controls">
          <Button type="button" variant="ghost" size="sm" onClick={restart}>
            <Icon name="refresh" size={14} />
            <span>Restart analysis</span>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
