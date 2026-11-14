import { FormField } from '../FormField/FormField.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './Input.css';

function slot(value) {
  return typeof value === 'string' ? <Icon name={value} /> : value;
}

export function Input({
  id,
  label,
  hint,
  error,
  required = false,
  leadingIcon,
  trailingIcon,
  className = '',
  ...props
}) {
  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required}>
      {({ id: fieldId, descriptionId }) => (
        <span className={`ui-input-wrap${className ? ` ${className}` : ''}`}>
          {leadingIcon ? <span className="ui-input__slot">{slot(leadingIcon)}</span> : null}
          <input
            id={fieldId}
            className="ui-input"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error || hint ? descriptionId : undefined}
            required={required}
            {...props}
          />
          {trailingIcon ? <span className="ui-input__slot">{slot(trailingIcon)}</span> : null}
        </span>
      )}
    </FormField>
  );
}
