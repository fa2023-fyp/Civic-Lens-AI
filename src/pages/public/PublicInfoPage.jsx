import { useI18n } from '../../i18n/I18nContext.jsx';
import { PageHero } from '../../components/marketing/PageHero.jsx';

export default function PublicInfoPage({ pageKey }) {
  const { t } = useI18n();
  const pageTranslationKey = `publicPages.${pageKey}`;

  return (
    <div className="public-info-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t(`${pageTranslationKey}.title`)}
        kicker={t(`${pageTranslationKey}.kicker`)}
        title={t(`${pageTranslationKey}.title`)}
        lead={t(`${pageTranslationKey}.lead`)}
      />
    </div>
  );
}
