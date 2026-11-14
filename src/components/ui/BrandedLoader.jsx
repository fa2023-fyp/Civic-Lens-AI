import { useI18n } from '../../i18n/I18nContext.jsx';
import './BrandedLoader.css';

export function BrandedLoader({ label }) {
  const { t } = useI18n();
  return (
    <div className="branded-loader" role="status" aria-live="polite">
      <span className="route-loading-bar" aria-hidden="true">
        <span />
      </span>
      <span className="branded-loader__mark" aria-hidden="true">
        ◉
      </span>
      <span>{label || t('common.loading')}</span>
    </div>
  );
}
