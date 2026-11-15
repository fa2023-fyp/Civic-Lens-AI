import { Icon } from '../Icon/Icon.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import './ThemeToggle.css';

const themeOrder = ['light', 'dark', 'system'];

export function ThemeToggle() {
  const { preference, resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const nextTheme = themeOrder[(themeOrder.indexOf(preference) + 1) % themeOrder.length];

  return (
    <button
      className={`ui-theme-toggle${resolvedTheme === 'dark' ? ' is-dark' : ''}`}
      type="button"
      aria-label={t(`app.switchThemeTo${nextTheme[0].toUpperCase()}${nextTheme.slice(1)}`)}
      aria-pressed={resolvedTheme === 'dark'}
      onClick={() => setTheme(nextTheme)}
    >
      <span className="ui-theme-toggle__icons" aria-hidden="true">
        <Icon name="sun" className="ui-theme-toggle__sun" />
        <Icon name="moon" className="ui-theme-toggle__moon" />
      </span>
    </button>
  );
}
