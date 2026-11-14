import { useId } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './ErrorState.css';

export function ErrorState({ title, message, referenceCode, onRetry, className = '' }) {
  const { t } = useI18n();
  const id = useId().replace(/:/g, '').slice(-6).toUpperCase();
  const reference = referenceCode || `UI-${id}`;
  return (
    <section className={`ui-error-state${className ? ` ${className}` : ''}`} role="alert">
      <Icon name="alert-circle" size={32} />
      <h2>{title || t('common.errorTitle')}</h2>
      <p>{message || t('ui.errorMessage')}</p>
      <p className="ui-error-state__reference">
        {t('ui.referenceCode')} <code>{reference}</code>
      </p>
      {onRetry ? (
        <Button variant="secondary" iconStart="refresh" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      ) : null}
    </section>
  );
}
