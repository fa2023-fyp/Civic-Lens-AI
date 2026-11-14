import { Button } from '../ui/Button/Button.jsx';
import { Chip } from '../ui/Chip/Chip.jsx';
import './marketing-showcase.css';

export function CTABanner({
  eyebrow,
  headline,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  onDark = true,
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
          <Button as="a" href={primaryHref} variant="cta" iconEnd="arrow-right">
            {primaryLabel}
          </Button>
        ) : null}
        {secondaryLabel && secondaryHref ? (
          <Button as="a" href={secondaryHref} variant="secondary">
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function ImageBand({ kicker, headline, body, className = '' }) {
  return (
    <section className={`marketing-image-band${className ? ` ${className}` : ''}`}>
      <svg
        className="marketing-image-band__art"
        viewBox="0 0 1600 420"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 420V300h92v-68h80v92h70V190h74v73h73V145h96v111h82v-71h76v120h73V204h94v91h70V171h92v91h73v-58h86v91h78V202h98v82h75v-50h96v94h73v-68h93v160Z"
          fill="currentColor"
          opacity=".16"
        />
        <path
          d="M0 328h1600M46 0v420m122-420v420m116-420v420m146-420v420m122-420v420m132-420v420m154-420v420m138-420v420m134-420v420m144-420v420m120-420v420"
          fill="none"
          stroke="currentColor"
          strokeDasharray="2 12"
          strokeWidth="2"
          opacity=".18"
        />
      </svg>
      <div className="marketing-image-band__content">
        {kicker ? <p className="marketing-image-band__kicker">{kicker}</p> : null}
        <h2 className="marketing-image-band__headline">{headline}</h2>
        {body ? <p className="marketing-image-band__body">{body}</p> : null}
      </div>
    </section>
  );
}

export function PhoneMockup({ children, label, className = '' }) {
  return (
    <div
      className={`marketing-phone${className ? ` ${className}` : ''}`}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      <span className="marketing-phone__speaker" aria-hidden="true" />
      <div className="marketing-phone__screen">{children}</div>
    </div>
  );
}

export function FloatingOrbs({ children, className = '' }) {
  return (
    <div className={`marketing-orbs${className ? ` ${className}` : ''}`}>
      <div className="marketing-orbs__decor" aria-hidden="true">
        <span className="marketing-orbs__orb marketing-orbs__orb--one" />
        <span className="marketing-orbs__orb marketing-orbs__orb--two" />
        <span className="marketing-orbs__orb marketing-orbs__orb--three" />
      </div>
      <div className="marketing-orbs__content">{children}</div>
    </div>
  );
}

export function Marquee({ items = [], label, duration = 32, tone = 'brand', className = '' }) {
  const animationStyle = { '--marketing-marquee-duration': `${duration}s` };

  return (
    <div
      className={`marketing-marquee${className ? ` ${className}` : ''}`}
      role="region"
      aria-label={label}
      style={animationStyle}
    >
      <div className="marketing-marquee__track">
        {[0, 1].map((repeat) => (
          <div
            className="marketing-marquee__group"
            key={repeat}
            aria-hidden={repeat === 1 ? 'true' : undefined}
          >
            {items.map((item, index) => (
              <Chip tone={tone} key={`${repeat}-${item.id ?? index}`}>
                {item.label ?? item}
              </Chip>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
