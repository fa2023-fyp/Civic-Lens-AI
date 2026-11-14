import { FormField } from '../FormField/FormField.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './Select.css';

export function Select({
  id,
  label,
  hint,
  error,
  required = false,
  options = [],
  placeholder,
  children,
  className = '',
  ...props
}) {
  return (
    <FormField id={id} label={label} hint={hint} error={error} required={required}>
      {({ id: fieldId, descriptionId }) => (
        <span className={`ui-select-wrap${className ? ` ${className}` : ''}`}>
          <select
            id={fieldId}
            className="ui-select"
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error || hint ? descriptionId : undefined}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {children ||
              options.map((option) => (
                <option key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
          </select>
          <Icon name="chevron-down" className="ui-select__chevron" />
        </span>
      )}
    </FormField>
  );
}
