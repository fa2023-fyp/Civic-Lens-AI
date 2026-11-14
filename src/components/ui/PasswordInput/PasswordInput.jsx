import { useId, useMemo, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { FormField } from '../FormField/FormField.jsx';
import './PasswordInput.css';

function strengthOf(value) {
  if (!value) return 0;
  return Math.min(
    4,
    Number(value.length >= 8) +
      Number(/[a-z]/.test(value) && /[A-Z]/.test(value)) +
      Number(/\d/.test(value)) +
      Number(/[^A-Za-z0-9]/.test(value)),
  );
}

export function PasswordInput({
  id: suppliedId,
  label,
  hint,
  error,
  value = '',
  onChange,
  showStrength = true,
  required = false,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const strength = useMemo(() => strengthOf(value), [value]);
  const strengthLabels = [
    'ui.strengthEmpty',
    'ui.strengthWeak',
    'ui.strengthFair',
    'ui.strengthGood',
    'ui.strengthStrong',
  ];

  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required}>
      {({ id: fieldId, descriptionId }) => (
        <div className={`ui-password${className ? ` ${className}` : ''}`}>
          <span className="ui-password__input-wrap">
            <input
              {...props}
              id={fieldId}
              className="ui-password__input"
              type={visible ? 'text' : 'password'}
              value={value}
              onChange={onChange}
              required={required}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={
                [
                  error || hint ? descriptionId : null,
                  showStrength ? `${descriptionId}-strength` : null,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
            />
            <button
              type="button"
              className="ui-password__toggle"
              aria-label={t(visible ? 'ui.hidePassword' : 'ui.showPassword')}
              aria-pressed={visible}
              onClick={() => setVisible((current) => !current)}
            >
              <Icon name={visible ? 'eye-off' : 'eye'} />
            </button>
          </span>
          {showStrength ? (
            <div
              className="ui-password__strength"
              id={`${descriptionId}-strength`}
              aria-live="polite"
            >
              <span className="ui-password__meter" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <span className={index < strength ? 'is-filled' : ''} key={index} />
                ))}
              </span>
              <span>{t('ui.passwordStrength', { strength: t(strengthLabels[strength]) })}</span>
            </div>
          ) : null}
        </div>
      )}
    </FormField>
  );
}
