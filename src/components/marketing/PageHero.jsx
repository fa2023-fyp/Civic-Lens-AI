import { Link } from 'react-router-dom';
import { Reveal } from './Reveal.jsx';
import { FloatingOrbs } from './Showcase.jsx';
import { Button } from '../ui/Button/Button.jsx';
import './PageHero.css';

function PageAction({ action }) {
  const linkProps = action.to
    ? { as: Link, to: action.to }
    : { as: 'a', href: action.href };

  return (
    <Button
      key={`${action.label}-${action.to ?? action.href}`}
      {...linkProps}
      variant={action.variant ?? 'cta'}
    >
      {action.label}
    </Button>
  );
}

export function PageHero({
  breadcrumbsLabel,
  homeLabel,
  pageLabel,
  kicker,
  title,
  lead,
  actions = [],
}) {
  return (
    <section className="marketing-page-hero" aria-labelledby="marketing-page-hero-title">
      <FloatingOrbs className="marketing-page-hero__orbs">
        <div className="marketing-page-hero__inner">
          <Reveal className="marketing-page-hero__content">
            <nav className="marketing-page-hero__breadcrumbs" aria-label={breadcrumbsLabel}>
              <Link to="/">{homeLabel}</Link>
              <span className="marketing-page-hero__separator" aria-hidden="true">›</span>
              <span aria-current="page">{pageLabel}</span>
            </nav>
            <p className="marketing-page-hero__kicker">{kicker}</p>
            <h1 id="marketing-page-hero-title" className="marketing-page-hero__title">
              {title}
            </h1>
            <p className="marketing-page-hero__lead">{lead}</p>
            {actions.length ? (
              <div className="marketing-page-hero__actions">
                {actions.map((action) => (
                  <PageAction action={action} key={`${action.label}-${action.to ?? action.href}`} />
                ))}
              </div>
            ) : null}
          </Reveal>
        </div>
      </FloatingOrbs>
    </section>
  );
}
