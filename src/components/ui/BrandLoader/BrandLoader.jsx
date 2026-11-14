import { useI18n } from '../../../i18n/I18nContext.jsx';
import { TopLoadingBar } from '../TopLoadingBar/TopLoadingBar.jsx';
import './BrandLoader.css';

export function BrandLoader({ label }) {
  const { t } = useI18n();
  return (
    <div className="ui-brand-loader" role="status" aria-live="polite">
      <TopLoadingBar active />
      <svg className="ui-brand-loader__mark" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="20" cy="20" r="13" />
        <path d="m30 30 12 12" />
      </svg>
      <span>{label || t('common.loading')}</span>
    </div>
  );
}
