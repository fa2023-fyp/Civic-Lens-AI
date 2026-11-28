import { Link } from 'react-router-dom';
import { Button } from '../ui/Button/Button.jsx';
import { Chip } from '../ui/Chip/Chip.jsx';
import './marketing-showcase.css';

export function FloatingOrbs({ className = '' }) {
  return <div className={`marketing-floating-orbs${className ? ` ${className}` : ''}`} aria-hidden="true" />;
}

export function CTABanner({
  eyebrow,
  headline,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  onDark = false,
  className = '',
}) {
  return (
    <section
      className={`marketing-cta-banner${onDark ? ' marketing-cta-banner--dark' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="marketing-cta-banner__copy">
        {eyebrow ? <p className="marketing-cta-banner__eyebrow">{eyebrow}</p> : null}
        <h2 className="marketing-cta-banner__headline">{headline}</h2>
        {body ? <p className="marketing-cta-banner__body">{body}</p> : null}
      </div>
      <div className="marketing-cta-banner__actions">
        {primaryLabel && primaryHref ? (
          <Button as={Link} to={primaryHref} variant="cta" iconEnd="arrow-right">
            {primaryLabel}
          </Button>
        ) : null}
        {secondaryLabel && secondaryHref ? (
          <Button as={Link} to={secondaryHref} variant="secondary">
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function PhoneMockup({ children, className = '' }) {
  return <div className={`marketing-phone-mockup${className ? ` ${className}` : ''}`}>{children}</div>;
}
export function ImageBand({ kicker, headline, body, className = '' }) {
  return (
    <section className={`marketing-image-band${className ? ` ${className}` : ''}`}>
      <div className="marketing-image-band__content">
        {kicker ? <p className="marketing-image-band__kicker">{kicker}</p> : null}
        <h2 className="marketing-image-band__headline">{headline}</h2>
        {body ? <p className="marketing-image-band__body">{body}</p> : null}
      </div>
    </section>
  );
}