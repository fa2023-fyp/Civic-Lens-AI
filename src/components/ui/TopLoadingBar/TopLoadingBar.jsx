import { useI18n } from '../../../i18n/I18nContext.jsx';
import './TopLoadingBar.css';

export function TopLoadingBar({ active = false }) {
  const { t } = useI18n();
  if (!active) return null;
  return (
    <div className="ui-top-loading-bar" role="progressbar" aria-label={t('ui.pageLoading')}>
      <span />
    </div>
  );
}
