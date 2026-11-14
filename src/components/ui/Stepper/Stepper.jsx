import { Icon } from '../Icon/Icon.jsx';
import './Stepper.css';

export function Stepper({
  steps = [],
  activeStep = 0,
  label,
  orientation = 'horizontal',
  className = '',
}) {
  if (orientation !== 'horizontal' && orientation !== 'vertical') {
    throw new RangeError(`Unsupported stepper orientation: ${orientation}`);
  }

  return (
    <ol
      className={`ui-stepper ui-stepper--${orientation}${className ? ` ${className}` : ''}`}
      aria-label={label}
    >
      {steps.map((step, index) => {
        const complete = index < activeStep;
        const current = index === activeStep;

        return (
          <li
            className={`ui-stepper__step${complete ? ' is-complete' : ''}${current ? ' is-current' : ''}`}
            key={step.id ?? index}
            aria-current={current ? 'step' : undefined}
          >
            <span className="ui-stepper__marker" aria-hidden="true">
              {complete ? <Icon name="check" size={16} /> : String(index + 1).padStart(2, '0')}
            </span>
            <span className="ui-stepper__copy">
              <span className="ui-stepper__title">{step.title}</span>
              {step.description ? (
                <span className="ui-stepper__description">{step.description}</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
