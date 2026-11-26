import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClusterCard } from '../../components/ai/ClusterCard.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './OfficerClustersPage.css';

export default function OfficerClustersPage() {
  const { state: authState } = useAuth();
  const { t, formatDate } = useI18n();
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchClusters = useCallback(async () => {
    return api.clusters.list({ token: authState.token, page: 1, pageSize: 100 });
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchClusters, {
    immediate: Boolean(authState.token),
  });

  const categoryName = useCallback(
    (idOrLabel) =>
      api.referenceData?.categories?.find((cat) => cat.id === idOrLabel)?.name ?? idOrLabel ?? '—',
    [],
  );

  const categoryOptions = useMemo(
    () => [
      { value: '', label: t('clusters.allCategories') },
      ...(api.referenceData?.categories ?? []).map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [t],
  );

  const clusters = useMemo(() => data?.items ?? [], [data]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return clusters.filter((cluster) => {
      if (category && cluster.categoryId !== category) return false;
      if (!query) return true;
      return (
        String(cluster.title || '').toLocaleLowerCase().includes(query) ||
        String(cluster.locality || '').toLocaleLowerCase().includes(query)
      );
    });
  }, [clusters, search, category]);

  if (status === 'error' || (status === 'success' && !data)) {
    return (
      <div className="officer-clusters">
        <ErrorState
          title={t('clusters.errorTitle')}
          message={t('clusters.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="officer-clusters">
      <header className="officer-clusters__header">
        <div>
          <p className="officer-clusters__kicker">{t('clusters.kicker')}</p>
          <h1 className="officer-clusters__title">{t('clusters.title')}</h1>
          <p className="officer-clusters__subtitle">{t('clusters.subtitle')}</p>
        </div>
        <div className="officer-clusters__view-toggle" role="group" aria-label={t('clusters.viewLabel')}>
          <Button
            variant={view === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('grid')}
          >
            {t('clusters.gridView')}
          </Button>
          <Button
            variant={view === 'table' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setView('table')}
          >
            {t('clusters.tableView')}
          </Button>
        </div>
      </header>

      <Card className="officer-clusters__filters">
        <Input
          id="clusters-search"
          leadingIcon="search"
          label={t('clusters.searchLabel')}
          placeholder={t('clusters.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          id="clusters-category"
          label={t('clusters.categoryLabel')}
          options={categoryOptions}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </Card>

      {status === 'loading' || status === 'idle' ? (
        <div className="officer-clusters__grid" aria-busy="true">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title={t('clusters.emptyTitle')} text={t('clusters.emptyBody')} />
      ) : view === 'grid' ? (
        <div className="officer-clusters__grid">
          {filtered.map((cluster) => (
            <Link
              key={cluster.id}
              to={`/officer/clusters/${cluster.id}`}
              className="officer-clusters__grid-link"
            >
              <ClusterCard
                title={cluster.title}
                category={categoryName(cluster.categoryId)}
                area={cluster.area || cluster.locality}
                reportCount={cluster.reportCount}
                affectedStreets={cluster.affectedStreets}
                firstReport={cluster.firstReport}
                latestReport={cluster.latestReport}
                status={cluster.status}
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="officer-clusters__table-wrap">
          <table className="officer-clusters__table">
            <thead>
              <tr>
                <th scope="col">{t('clusters.colTitle')}</th>
                <th scope="col">{t('clusters.colCategory')}</th>
                <th scope="col">{t('clusters.colArea')}</th>
                <th scope="col">{t('clusters.colCount')}</th>
                <th scope="col">{t('clusters.colStatus')}</th>
                <th scope="col">{t('clusters.colFirst')}</th>
                <th scope="col">{t('clusters.colLatest')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cluster) => (
                <tr key={cluster.id} className="officer-clusters__row">
                  <td>
                    <Link to={`/officer/clusters/${cluster.id}`} className="officer-clusters__row-link">
                      {cluster.title}
                    </Link>
                    <span className="officer-clusters__ai-label">{t('ai.cluster.aiProposed')}</span>
                  </td>
                  <td>{categoryName(cluster.categoryId)}</td>
                  <td>{cluster.area || cluster.locality || '—'}</td>
                  <td className="tabular-nums">{cluster.reportCount ?? '—'}</td>
                  <td>
                    <Badge tone="info">{cluster.status}</Badge>
                  </td>
                  <td>{cluster.firstReport ? formatDate(cluster.firstReport, { dateStyle: 'medium' }) : '—'}</td>
                  <td>{cluster.latestReport ? formatDate(cluster.latestReport, { dateStyle: 'medium' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}