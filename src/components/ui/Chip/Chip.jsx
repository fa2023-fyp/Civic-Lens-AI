import { IconButton } from '../IconButton/IconButton.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import './Chip.css';

export function Chip({ tone = 'neutral', children, onRemove, className = '' }) {
  const { t } = useI18n();
  return (
    <span className={`ui-chip ui-chip--${tone}${className ? ` ${className}` : ''}`}>
      <span>{children}</span>
      {onRemove ? (
        <IconButton
          className="ui-chip__remove"
          icon="close"
          size={14}
          aria-label={t('ui.removeItem', { item: String(children) })}
          onClick={onRemove}
        />
      ) : null}
    </span>
  );
}
