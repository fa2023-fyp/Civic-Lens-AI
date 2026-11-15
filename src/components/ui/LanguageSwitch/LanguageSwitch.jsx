import { useI18n } from '../../../i18n/I18nContext.jsx';
import './LanguageSwitch.css';

export function LanguageSwitch() {
  const { language, changeLanguage, t } = useI18n();

  return (
    <div className="ui-language-switch" role="group" aria-label={t('app.language')}>
      <button
        className="ui-language-switch__option"
        type="button"
        aria-pressed={language === 'en'}
        onClick={() => changeLanguage('en')}
      >
        {t('app.englishShort')}
      </button>
      <span className="ui-language-switch__divider" aria-hidden="true">
        |
      </span>
      <button
        className="ui-language-switch__option"
        type="button"
        aria-pressed={language === 'ur'}
        onClick={() => changeLanguage('ur')}
      >
        {t('app.urdu')}
      </button>
    </div>
  );
}
