import { useI18n } from '../../i18n/I18nContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { RevealObserver } from '../../components/layout/RevealObserver.jsx';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber.jsx';
import {
  ANIMATION_TOKENS,
  COLOR_SWATCHES,
  SHADOW_TOKENS,
  SPACING_TOKENS,
} from '../../config/constants.js';
import './TokenPreview.css';

function ColorSwatches({ title, tokens }) {
  return (
    <div className="token-group">
      <h3 className="token-group__title">{title}</h3>
      <div className="swatch-grid">
        {tokens.map(([name, variable]) => (
          <div className="swatch" key={name}>
            <span className="swatch__color" style={{ backgroundColor: `var(${variable})` }} />
            <span className="swatch__name">{name}</span>
            <code>{variable}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TokenPreview() {
  const { t, language, direction, changeLanguage, changeDirection } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const swatches = Object.entries(COLOR_SWATCHES);

  function toggleDirection() {
    const next = direction === 'rtl' ? 'ltr' : 'rtl';
    changeDirection(next);
    toast(t('preview.directionChanged', { direction: next.toUpperCase() }));
  }

  function toggleColorTheme() {
    toggleTheme();
    toast(t('preview.themeChanged', { theme: theme === 'dark' ? t('app.light') : t('app.dark') }));
  }

  return (
    <RevealObserver className="token-preview">
      <section className="preview-hero section">
        <div className="container">
          <div className="preview-controls cluster">
            <button className="button button--quiet" type="button" onClick={toggleColorTheme}>
              {theme === 'dark' ? t('preview.switchLight') : t('preview.switchDark')}
            </button>
            <button className="button button--quiet" type="button" onClick={toggleDirection}>
              {direction === 'rtl' ? t('preview.ltr') : t('preview.rtl')}
            </button>
            <label className="language-control">
              <span>{t('app.language')}</span>
              <select
                aria-label={t('app.language')}
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
              >
                <option value="en">{t('app.english')}</option>
                <option value="ur">{t('app.urdu')}</option>
              </select>
            </label>
          </div>
          <div className="hero-copy reveal">
            <p className="eyebrow">{t('preview.kicker')}</p>
            <h1 className="hero-title">{t('preview.title')}</h1>
            <p className="hero-lead">{t('preview.lead')}</p>
            <div className="hero-stat">
              <AnimatedNumber value={1248} className="hero-stat__number tabular-nums" />
              <span className="demo-badge">{t('preview.demoBadge')}</span>
              <span className="hero-stat__caption">{t('preview.sampleNumberCaption')}</span>
            </div>
          </div>
          <div className="hero-orb hero-orb--one" aria-hidden="true" />
          <div className="hero-orb hero-orb--two" aria-hidden="true" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading reveal">
            <p className="eyebrow">{t('preview.positioning')}</p>
            <h2>{t('preview.positioning')}</h2>
            <p className="lead">{t('preview.positioningBody')}</p>
          </div>
          <div className="workflow-card reveal">
            <p className="eyebrow">{t('preview.journeyLabel')}</p>
            <p className="workflow-card__line">{t('preview.journey')}</p>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container intelligence-panel reveal">
          <p className="eyebrow">{t('preview.intelligenceLabel')}</p>
          <h2>{t('preview.intelligenceLabel')}</h2>
          <p className="intelligence-panel__flow">{t('preview.intelligence')}</p>
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section-heading reveal">
            <p className="eyebrow">{t('preview.principlesKicker')}</p>
            <h2>{t('preview.principlesTitle')}</h2>
          </div>
          <div className="principle-grid grid-auto">
            {['aiRecommends', 'originalSacred', 'citizenVerification', 'auditable'].map(
              (key, index) => (
                <article className="principle-card reveal" key={key} style={{ '--i': index }}>
                  <span className="principle-card__index">0{index + 1}</span>
                  <h3>{t(`preview.${key}`)}</h3>
                  <p>{t(`preview.${key}Body`)}</p>
                </article>
              ),
            )}
          </div>
          <div className="sample-row">
            <article className="sample-card">
              <p className="eyebrow">{t('preview.sampleCard')}</p>
              <h3>{t('preview.sampleCard')}</h3>
              <p>{t('preview.sampleCardBody')}</p>
              <button
                className="button button--cta"
                type="button"
                onClick={() => toast(t('preview.sampleButton'))}
              >
                {t('preview.sampleButton')}
              </button>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading reveal">
            <p className="eyebrow">{t('preview.tokensKicker')}</p>
            <h2>{t('preview.tokensTitle')}</h2>
            <p className="lead">{t('preview.tokensBody')}</p>
          </div>
          <div className="palette-pair">
            <div className="palette-surface" data-theme="light">
              <ColorSwatches title={t('preview.lightSwatches')} tokens={swatches} />
            </div>
            <div className="palette-surface" data-theme="dark">
              <ColorSwatches title={t('preview.darkSwatches')} tokens={swatches} />
            </div>
          </div>

          <div className="token-demo-grid">
            <section className="token-demo">
              <h3>{t('preview.typeScale')}</h3>
              <h1 className="type-xl">{t('preview.typeDisplay')}</h1>
              <h2 className="type-lg">{t('preview.typeHeading')}</h2>
              <p className="type-md">
                {t('preview.typeLatin')}: {t('preview.typeLatinBody')}
              </p>
              <p lang="ur" dir="rtl" className="type-urdu">
                {t('preview.typeUrdu')}: {t('preview.typeUrduBody')}
              </p>
              <p dir="ltr" className="type-roman">
                {t('preview.typeRoman')}: {t('preview.typeRomanBody')}
              </p>
              <small>{t('preview.typeRomanNote')}</small>
            </section>
            <section className="token-demo">
              <h3>{t('preview.spacing')}</h3>
              <div className="spacing-list">
                {SPACING_TOKENS.map((token) => (
                  <div className="spacing-sample" key={token.label}>
                    <span>{token.label}</span>
                    <i style={{ inlineSize: `var(--space-${token.name})` }} />
                  </div>
                ))}
              </div>
            </section>
            <section className="token-demo">
              <h3>{t('preview.shadows')}</h3>
              <div className="shadow-list">
                {SHADOW_TOKENS.map((token) => (
                  <div
                    className="shadow-sample"
                    style={{ boxShadow: `var(--shadow-${token})` }}
                    key={token}
                  >
                    {token}
                  </div>
                ))}
              </div>
            </section>
            <section className="token-demo token-demo--wide">
              <h3>{t('preview.motion')}</h3>
              <p>{t('preview.motionHint')}</p>
              <div className="motion-grid">
                {ANIMATION_TOKENS.map((name) => (
                  <div className="motion-sample" key={name.name}>
                    <span className={`motion-sample__shape ${name.className}`} />
                    <code>{name.name}</code>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </RevealObserver>
  );
}
