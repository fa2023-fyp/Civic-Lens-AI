import { useState } from 'react';
import { IconButton } from '../ui/IconButton/IconButton.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './PrototypeBanner.css';

const dismissedKey = 'civiclens-prototype-banner-dismissed';

export function PrototypeBanner() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(dismissedKey) === 'true',
  );

  if (dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(dismissedKey, 'true');
    setDismissed(true);
  }

  return (
    <div className="prototype-banner" role="note">
      <p>{t('app.notice')}</p>
      <IconButton
        icon="close"
        size={16}
        className="prototype-banner__dismiss"
        aria-label={t('publicLayout.dismissBanner')}
        onClick={dismiss}
      />
    </div>
  );
}
