import { useId, useRef } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { FormField } from '../FormField/FormField.jsx';
import './OtpInput.css';

export function OtpInput({
  id: suppliedId,
  label,
  hint,
  error,
  value = '',
  onChange,
  length = 6,
  disabled = false,
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const refs = useRef([]);
  const { t } = useI18n();
  const digits = String(value).slice(0, length).split('');

  function updateAt(index, input) {
    const nextChar = input.replace(/\D/g, '').slice(-1);
    const next = Array.from({ length }, (_, digitIndex) => digits[digitIndex] || '');
    next[index] = nextChar;
    onChange?.(next.join(''));
    if (nextChar && index < length - 1) refs.current[index + 1]?.focus();
  }

  function paste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange?.(pasted);
    refs.current[Math.min(pasted.length, length) - 1]?.focus();
  }

  function keyDown(event, index) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  }

  return (
    <FormField id={`${id}-0`} label={label || t('ui.verificationCode')} hint={hint} error={error}>
      {({ descriptionId }) => (
        <div
          className="ui-otp"
          role="group"
          aria-describedby={error || hint ? descriptionId : undefined}
        >
          {Array.from({ length }, (_, index) => (
            <input
              key={index}
              ref={(element) => {
                refs.current[index] = element;
              }}
              id={`${id}-${index}`}
              className="ui-otp__digit"
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digits[index] || ''}
              disabled={disabled}
              aria-label={t('ui.otpDigit', { index: index + 1, total: length })}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error || hint ? descriptionId : undefined}
              onChange={(event) => updateAt(index, event.target.value)}
              onPaste={paste}
              onKeyDown={(event) => keyDown(event, index)}
            />
          ))}
        </div>
      )}
    </FormField>
  );
}
