import { useEffect, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { api } from '../../../services/api.js';
import { landingContent } from './landing.content.js';
import { AnimatedNumber } from './landing.shared.jsx';

export function LandingSnapshotSection() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(landingContent.snapshotFallback);

  useEffect(() => {
    let ignore = false;

    async function loadSnapshot() {
      try {
        const session = await api.auth.login({
          email: 'admin@demo.civiclens.test',
          password: 'Demo123!',
        });
        const overview = await api.analytics.overview({ token: session.token });
        const nextStats = [
          { key: 'received', label: 'landing.snapshot.received', value: overview.totalComplaints ?? 1248 },
          { key: 'verified', label: 'landing.snapshot.verified', value: overview.resolved ?? 842 },
          { key: 'unverified', label: 'landing.snapshot.unverified', value: 132 },
          { key: 'reopened', label: 'landing.snapshot.reopened', value: 19, suffix: '%' },
          { key: 'medianHours', label: 'landing.snapshot.medianHours', value: 18 },
          { key: 'clusters', label: 'landing.snapshot.clusters', value: overview.activeClusters ?? 8 },
          { key: 'onTrack', label: 'landing.snapshot.onTrack', value: 76, suffix: '%' },
          { key: 'languages', label: 'landing.snapshot.languages', value: 4 },
        ];
        if (!ignore) setStats(nextStats);
      } catch {
        if (!ignore) setStats(landingContent.snapshotFallback);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSnapshot();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="landing-section landing-section--tint reveal-section" style={{ '--i': 1 }}>
      <div className="landing-section__inner">
        <div className="landing-section__heading">
          <p className="landing-section__kicker">{t('landing.snapshot.kicker')}</p>
          <h2>{t('landing.snapshot.title')}</h2>
          <p>{t('landing.snapshot.body')}</p>
        </div>
        <div className="landing-snapshot-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={`snapshot-skeleton-${index}`} className="landing-snapshot-card is-loading">
                  <span className="skeleton-line skeleton-line--lg" />
                  <span className="skeleton-line skeleton-line--sm" />
                </div>
              ))
            : stats.map((metric) => (
                <div key={metric.key} className="landing-snapshot-card">
                  <span className="demo-badge">{t('landing.common.demoData')}</span>
                  <strong className="landing-snapshot-card__value">
                    <AnimatedNumber value={metric.value} suffix={metric.suffix ?? ''} />
                  </strong>
                  <span className="landing-snapshot-card__label">{t(metric.label)}</span>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
