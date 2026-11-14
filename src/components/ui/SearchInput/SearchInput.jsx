import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { IconButton } from '../IconButton/IconButton.jsx';
import { Input } from '../Input/Input.jsx';

export function SearchInput({ label, placeholder, value = '', onChange, onClear, ...props }) {
  const { t } = useI18n();
  const trailingIcon =
    value && onClear ? (
      <IconButton
        icon="close"
        aria-label={t('ui.clearSearch')}
        onClick={onClear}
        className="ui-search-input__clear"
      />
    ) : null;

  return (
    <Input
      {...props}
      type="search"
      label={label || t('ui.search')}
      placeholder={placeholder || t('ui.searchPlaceholder')}
      value={value}
      onChange={onChange}
      leadingIcon={<Icon name="search" />}
      trailingIcon={trailingIcon}
      className="ui-search-input"
    />
  );
}
