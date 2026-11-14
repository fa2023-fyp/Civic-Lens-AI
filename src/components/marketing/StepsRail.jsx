import { Reveal } from './Reveal.jsx';
import './marketing-showcase.css';

export function StepCard({ number, title, description }) {
  const formattedNumber = String(number).padStart(2, '0');

  return (
    <li className="marketing-step-card">
      <span className="marketing-step-card__number">{formattedNumber}</span>
      <div className="marketing-step-card__copy">
        <h3 className="marketing-step-card__title">{title}</h3>
        <p className="marketing-step-card__description">{description}</p>
      </div>
    </li>
  );
}

export function StepsRail({ steps = [], label, id, className = '' }) {
  return (
    <div
      id={id}
      className={`marketing-steps-rail${className ? ` ${className}` : ''}`}
    >
      <Reveal className="marketing-steps-rail__reveal">
        <ol className="marketing-steps-rail__list" aria-label={label}>
          {steps.map((step, index) => (
            <StepCard
              key={step.id ?? index}
              number={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </ol>
      </Reveal>
    </div>
  );
}
