import { useId } from 'react';
import './RadioGroup.css';

export function RadioGroup({
  id: suppliedId,
  label,
  hint,
  error,
  required = false,
  options = [],
  name: suppliedName,
  value,
  onChange,
  className = '',
  ...props
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const name = suppliedName || id;

  const descriptionId = `${id}-description`;
  return (
    <fieldset
      className={`ui-radio-field${className ? ` ${className}` : ''}`}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error || hint ? descriptionId : undefined}
      disabled={props.disabled}
    >
      <legend className="ui-radio-field__legend">
        {label}
        {required ? (
          <span className="ui-radio-field__required" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </legend>
      <div className="ui-radio-group">
        {options.map((option, index) => {
          const optionId = `${id}-${index}`;
          return (
            <label className="ui-radio" htmlFor={optionId} key={option.value}>
              <input
                {...props}
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                required={required}
                disabled={option.disabled || props.disabled}
                onChange={onChange}
              />
              <span className="ui-radio__mark" aria-hidden="true" />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {error || hint ? (
        <span
          className={`ui-radio-field__description${error ? ' is-error' : ''}`}
          id={descriptionId}
        >
          {error || hint}
        </span>
      ) : null}
    </fieldset>
  );
}
