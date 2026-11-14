import { useId } from 'react';
import { FormField } from '../FormField/FormField.jsx';
import './Switch.css';

export function Switch({
  id: suppliedId,
  label,
  hint,
  checked = false,
  onChange,
  disabled = false,
  className = '',
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;

  return (
    <FormField id={id} hint={hint}>
      {({ id: fieldId, descriptionId }) => (
        <button
          id={fieldId}
          type="button"
          className={`ui-switch${className ? ` ${className}` : ''}`}
          role="switch"
          aria-checked={checked}
          aria-describedby={hint ? descriptionId : undefined}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
        >
          <span className="ui-switch__track" aria-hidden="true">
            <span className="ui-switch__thumb" />
          </span>
          <span>{label}</span>
        </button>
      )}
    </FormField>
  );
}
