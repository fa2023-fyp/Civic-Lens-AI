import { useId } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { FormField } from '../FormField/FormField.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './Checkbox.css';

export function Checkbox({
  id: suppliedId,
  label,
  hint,
  error,
  required,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const { t } = useI18n();

  return (
    <FormField id={id} hint={hint} error={error}>
      {({ id: fieldId, descriptionId }) => (
        <label className={`ui-checkbox${className ? ` ${className}` : ''}`} htmlFor={fieldId}>
          <input
            id={fieldId}
            className="ui-checkbox__control"
            type="checkbox"
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error || hint ? descriptionId : undefined}
            {...props}
          />
          <span className="ui-checkbox__mark" aria-hidden="true">
            <Icon name="check" size={14} />
          </span>
          <span className="ui-checkbox__label">
            {label}
            {required ? (
              <span className="ui-checkbox__required" aria-hidden="true">
                {' '}
                *
              </span>
            ) : null}
          </span>
          {required ? <span className="sr-only">{t('ui.required')}</span> : null}
        </label>
      )}
    </FormField>
  );
}
