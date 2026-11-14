import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../IconButton/IconButton.jsx';
import './Toast.css';

const icons = {
  success: 'check-circle',
  info: 'info',
  warning: 'alert-triangle',
  error: 'alert-circle',
};

export function Toast({ item, onDismiss }) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(item.duration);
  const dismiss = useCallback(() => onDismiss(item.id), [item.id, onDismiss]);

  useEffect(() => {
    if (paused || item.duration <= 0) return undefined;
    const started = Date.now();
    const timer = window.setTimeout(dismiss, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started));
    };
  }, [dismiss, item.duration, paused]);

  return (
    <div
      className={`ui-toast ui-toast--${item.type} anim-slide-in-end`}
      role={item.type === 'error' ? 'alert' : 'status'}
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      style={{ '--toast-duration': `${item.duration}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Icon name={icons[item.type] || icons.info} />
      <span className="ui-toast__message">{item.message}</span>
      <IconButton
        className="ui-toast__close"
        icon="close"
        size={16}
        aria-label={t('common.close')}
        onClick={onDismiss}
      />
      {item.duration > 0 ? (
        <span
          className="ui-toast__progress"
          aria-hidden="true"
          style={{ animationPlayState: paused ? 'paused' : 'running' }}
        />
      ) : null}
    </div>
  );
}
