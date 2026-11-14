import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Spinner } from '../Spinner/Spinner.jsx';
import './InlineLoader.css';

export function InlineLoader({ label, size = 'sm', className = '' }) {
  const { t } = useI18n();
  return (
    <span
      className={`ui-inline-loader${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} decorative />
      <span>{label || t('common.loading')}</span>
    </span>
  );
}
