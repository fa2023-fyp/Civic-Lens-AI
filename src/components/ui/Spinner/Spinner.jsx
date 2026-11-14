import { useI18n } from '../../../i18n/I18nContext.jsx';
import './Spinner.css';

export function Spinner({ size = 'md', label, decorative = false, className = '' }) {
  const { t } = useI18n();
  return (
    <span
      className={`ui-spinner ui-spinner--${size}${className ? ` ${className}` : ''}`}
      role={decorative ? undefined : 'status'}
      aria-label={decorative ? undefined : label || t('common.loading')}
      aria-hidden={decorative || undefined}
    />
  );
}
