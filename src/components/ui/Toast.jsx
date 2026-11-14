import { useI18n } from '../../i18n/I18nContext.jsx';
import './Toast.css';

export function Toast({ message }) {
  const { t } = useI18n();
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {message ? (
        <div className="toast anim-fade-up" role="status">
          {message}
          <span className="sr-only">{t('common.close')}</span>
        </div>
      ) : null}
    </div>
  );
}
