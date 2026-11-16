import { ImageBand } from '../../../components/marketing/Showcase.jsx';
import { useI18n } from '../../../i18n/I18nContext.jsx';

export function LandingImageBandSection() {
  const { t } = useI18n();

  return (
    <div
      id="image-band"
      className="landing-anchor landing-image-band-wrapper reveal-section"
      style={{ '--i': 8 }}
    >
      <ImageBand
        kicker={t('landing.imageBand.kicker')}
        headline={t('landing.imageBand.title')}
        body={t('landing.imageBand.body')}
      />
    </div>
  );
}
