import { Reveal } from '../../components/marketing/Reveal.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './FeaturesWorkflowSection.css';

const workflowRows = [
  {
    id: 'typical',
    labelKey: 'publicPages.features.workflow.typical',
    steps: ['report', 'assign', 'track', 'resolve', 'feedback'],
  },
  {
    id: 'intelligence',
    labelKey: 'publicPages.features.workflow.intelligence',
    steps: [
      'understand',
      'extract',
      'classify',
      'prioritise',
      'route',
      'relatedIssues',
      'monitorSla',
      'escalate',
      'verify',
      'audit',
    ],
  },
];

export function FeaturesWorkflowSection() {
  const { t } = useI18n();

  return (
    <section className="features-workflow" aria-labelledby="features-workflow-title">
      <div className="features-workflow__inner">
        <Reveal as="header" className="features-workflow__heading">
          <p className="features-workflow__kicker">{t('publicPages.features.workflow.kicker')}</p>
          <h2 id="features-workflow-title">{t('publicPages.features.workflow.title')}</h2>
          <p>{t('publicPages.features.workflow.lead')}</p>
        </Reveal>

        <div className="features-workflow__rows">
          {workflowRows.map((row, index) => (
            <Reveal
              as="article"
              key={row.id}
              delay={(index + 1) * 80}
              className={`features-workflow__row features-workflow__row--${row.id}`}
            >
              <h3>{t(row.labelKey)}</h3>
              <ol aria-label={t(row.labelKey)} tabIndex={0}>
                {row.steps.map((step) => (
                  <li key={step}>{t(`publicPages.features.workflow.steps.${step}`)}</li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
        <p className="features-workflow__scroll-hint">
          {t('publicPages.features.workflow.scrollHint')}
        </p>
      </div>
    </section>
  );
}
