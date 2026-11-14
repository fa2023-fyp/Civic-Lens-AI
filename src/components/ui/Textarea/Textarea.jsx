import { useId } from 'react';
import { FormField } from '../FormField/FormField.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import './Textarea.css';

export function Textarea({
  id: suppliedId,
  label,
  hint,
  error,
  required = false,
  showCount = false,
  minLength,
  maxLength,
  value,
  defaultValue,
  onChange,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const { t } = useI18n();
  const count = String(value ?? defaultValue ?? '').length;
  const warning =
    (typeof maxLength === 'number' && count > maxLength) ||
    (typeof minLength === 'number' && count > 0 && count < minLength);

  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required}>
      {({ id: fieldId, descriptionId }) => (
        <>
          <textarea
            id={fieldId}
            className={`ui-textarea${className ? ` ${className}` : ''}`}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            minLength={minLength}
            maxLength={maxLength}
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              [error || hint ? descriptionId : null, showCount ? `${descriptionId}-count` : null]
                .filter(Boolean)
                .join(' ') || undefined
            }
            {...props}
          />
          {showCount ? (
            <span
              className={`ui-textarea__count${warning ? ' is-warning' : ''}`}
              id={`${descriptionId}-count`}
              aria-live="polite"
            >
              {t('ui.characterCount', { count, max: maxLength ?? '—' })}
              {warning ? <span className="sr-only"> {t('ui.characterLimitWarning')}</span> : null}
            </span>
          ) : null}
        </>
      )}
    </FormField>
  );
}
