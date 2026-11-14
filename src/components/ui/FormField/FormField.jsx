import { useId } from 'react';
import './FormField.css';

export function FormField({
  id: suppliedId,
  label,
  hint,
  error,
  required = false,
  className = '',
  children,
}) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const descriptionId = `${id}-description`;

  return (
    <div className={`ui-field${error ? ' has-error' : ''}${className ? ` ${className}` : ''}`}>
      {label ? (
        <label className="ui-field__label" htmlFor={id}>
          {label}
          {required ? (
            <span className="ui-field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {typeof children === 'function' ? children({ id, descriptionId }) : children}
      {error || hint ? (
        <span
          className={`ui-field__description${error ? ' ui-field__error' : ''}`}
          id={descriptionId}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </span>
      ) : null}
    </div>
  );
}
