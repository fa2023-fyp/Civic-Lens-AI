import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { SLARiskBadge } from '../../components/complaint/SLARiskBadge.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { DataTable } from '../../components/ui/DataTable/DataTable.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { KPITile } from '../../components/ui/KPITile/KPITile.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { Tabs } from '../../components/ui/Tabs/Tabs.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './SupervisorDashboardPage.css';

const DepartmentWorkloadChart = lazy(() =>
  import('../../components/charts/DepartmentWorkloadChart.jsx').then((module) => ({
    default: module.DepartmentWorkloadChart,
  })),
);

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_SLA_MS = 8 * 60 * 60 * 1000;

const TERMINAL_STATUSES = new Set([
  'Resolved',
  'Closed',
  'Rejected',
  'Invalid',
  'Resolved (Unverified)',
]);
const VERIFICATION_STATUSES = new Set(['Resolution Submitted', 'Citizen Verification']);

const BADGE_MAP = {
  Submitted: 'submitted',
  'AI Processing': 'processing',
  'Pending Analysis': 'processing',
  'Pending Human Review': 'review',
  Assigned: 'assigned',
  'In Progress': 'in-progress',
  'Resolution Submitted': 'resolution-submitted',
  'Citizen Verification': 'citizen-verification',
  Resolved: 'resolved',
  Reopened: 'reopened',
  Escalated: 'escalated',
  Closed: 'closed',
  Rejected: 'rejected',
  Invalid: 'rejected',
  'Resolved (Unverified)': 'resolved',
};

const RISK_LEVEL_MAP = {
  low: 'low',
  moderate: 'medium',
  elevated: 'medium',
  high: 'high',
  not_applicable: 'low',
};

function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function rejectionCount(complaint) {
  if (typeof complaint.rejectionCount === 'number') return complaint.rejectionCount;
  return (complaint.statusHistory ?? []).filter((entry) => entry.status === 'Reopened').length;
}

export default function SupervisorDashboardPage() {
  const { user, state: authState } = useAuth();
  const { t, formatNumber } = useI18n();
  const { toast } = useToast();

  const [clockNow, setClockNow] = useState(() => Date.now());
  const [demoBusy, setDemoBusy] = useState(false);

  const departmentIds = useMemo(() => {
    if (!user) return [];
    return user.departmentIds?.length ? user.departmentIds : [user.departmentId].filter(Boolean);
  }, [user]);

  const fetchDashboard = useCallback(async () => {
    const [complaintsPage, queuePage] = await Promise.all([
      api.complaints.list({ token: authState.token, page: 1, pageSize: 100 }),
      api.review.queue({ token: authState.token, page: 1, pageSize: 100 }),
    ]);
    const complaints = complaintsPage.items ?? [];
    const realNow = Date.now();
    const candidateIds = complaints
      .filter((complaint) => {
        if (TERMINAL_STATUSES.has(complaint.status)) return false;
        const dueMs = Date.parse(complaint.sla?.dueAt ?? complaint.createdAt);
        return (
          complaint.sla?.state === 'breached' ||
          complaint.sla?.state === 'escalated' ||
          complaint.sla?.state === 'warning' ||
          complaint.status === 'Escalated' ||
          (Number.isFinite(dueMs) && dueMs < realNow)
        );
      })
      .map((complaint) => complaint.id);
    const riskEntries = await Promise.all(
      candidateIds.map((id) =>
        api.sla
          .riskFor(id, { token: authState.token })
          .then((risk) => [id, risk])
          .catch(() => [id, null]),
      ),
    );
    return {
      complaints,
      queue: queuePage,
      risks: Object.fromEntries(riskEntries),
    };
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchDashboard, {
    immediate: Boolean(authState.token),
  });

  const complaints = useMemo(() => data?.complaints ?? [], [data]);
  const queueItems = useMemo(() => data?.queue?.items ?? [], [data]);
  const risks = useMemo(() => data?.risks ?? {}, [data]);

  const rows = useMemo(
    () =>
      complaints.map((complaint) => {
        const completed = TERMINAL_STATUSES.has(complaint.status);
        const paused = VERIFICATION_STATUSES.has(complaint.status);
        const startedAt = complaint.sla?.startedAt || complaint.createdAt;
        const dueAt =
          complaint.sla?.dueAt || new Date(Date.parse(startedAt) + DEFAULT_SLA_MS).toISOString();
        const dueMs = Date.parse(dueAt);
        const risk = risks[complaint.id] ?? null;
        const overdue =
          !completed &&
          !paused &&
          (complaint.sla?.state === 'breached' ||
            complaint.status === 'Escalated' ||
            (Number.isFinite(dueMs) && dueMs < clockNow));
        const riskLevel = risk?.risk ?? 'low';
        const atRisk =
          !completed &&
          !paused &&
          !overdue &&
          (['moderate', 'elevated', 'high'].includes(riskLevel) ||
            complaint.sla?.state === 'warning');
        return { ...complaint, completed, paused, startedAt, dueAt, dueMs, risk, overdue, atRisk };
      }),
    [complaints, risks, clockNow],
  );

  const kpis = useMemo(() => {
    let open = 0;
    let atRisk = 0;
    let overdue = 0;
    let escalated = 0;
    let reopened = 0;
    for (const row of rows) {
      if (!row.completed) open += 1;
      if (row.atRisk) atRisk += 1;
      if (row.overdue) overdue += 1;
      if (row.status === 'Escalated') escalated += 1;
      if (row.status === 'Reopened') reopened += 1;
    }
    const oldestWait = queueItems.reduce(
      (max, item) => Math.max(max, item.ageMs ?? 0),
      0,
    );
    return {
      open,
      atRisk,
      overdue,
      escalated,
      reopened,
      queueSize: data?.queue?.total ?? queueItems.length,
      oldestWait,
    };
  }, [rows, queueItems, data]);

  const departmentWorkload = useMemo(() => {
    const counts = new Map();
    for (const row of rows) {
      if (row.completed) continue;
      counts.set(row.departmentId, (counts.get(row.departmentId) ?? 0) + 1);
    }
    return (api.referenceData?.departments ?? [])
      .filter((dept) => departmentIds.includes(dept.id))
      .map((dept) => ({ name: dept.name, value: counts.get(dept.id) ?? 0 }));
  }, [rows, departmentIds]);

  const officers = useMemo(() => {
    return (api.demoUsers ?? [])
      .filter((candidate) => candidate.role === 'officer' && departmentIds.includes(candidate.departmentId))
      .map((officer) => {
        const assigned = rows.filter(
          (row) => row.assignedOfficerId === officer.id && !row.completed,
        );
        return {
          id: officer.id,
          name: officer.name,
          open: assigned.length,
          overdue: assigned.filter((row) => row.overdue).length,
        };
      });
  }, [rows, departmentIds]);

  const slaList = useMemo(
    () => rows.filter((row) => row.overdue || row.atRisk),
    [rows],
  );
  const reopenedList = useMemo(
    () => rows.filter((row) => row.status === 'Reopened'),
    [rows],
  );
  const over24h = queueItems.filter(
    (item) => (item.ageMs ?? Math.max(0, clockNow - Date.parse(item.queuedAt))) >= DAY_MS,
  );

  async function handleAdvanceDemo() {
    setDemoBusy(true);
    try {
      const result = await api.demo.advanceClock(25 * 60 * 60 * 1000);
      if (result?.now) setClockNow(Date.parse(result.now));
      toast(t('supervisorDashboard.demoAdvanced'), 'info');
      retry();
    } catch (demoError) {
      toast(demoError?.message || t('supervisorDashboard.actionError'), 'error');
    } finally {
      setDemoBusy(false);
    }
  }

  const isLoading = status === 'loading' || status === 'idle';
  const demoLabel = t('preview.demoBadge');

  const officerColumns = [
    { key: 'name', label: t('supervisorDashboard.colOfficer'), render: (row) => <strong>{row.name}</strong> },
    { key: 'open', label: t('supervisorDashboard.colOpen'), render: (row) => formatNumber(row.open) },
    {
      key: 'overdue',
      label: t('supervisorDashboard.colOverdue'),
      render: (row) =>
        row.overdue ? (
          <Badge tone="danger">{formatNumber(row.overdue)}</Badge>
        ) : (
          <span className="supervisor-dashboard__muted">0</span>
        ),
    },
  ];

  const tabs = [
    {
      id: 'overview',
      label: t('supervisorDashboard.tabOverview'),
      content: (
        <div className="supervisor-dashboard__tab-grid">
          <Card className="supervisor-dashboard__chart-card">
            <div className="supervisor-dashboard__card-head">
              <h2 className="supervisor-dashboard__section-title">
                {t('supervisorDashboard.workloadTitle')}
              </h2>
              <DemoDataBadge>{demoLabel}</DemoDataBadge>
            </div>
            {isLoading ? (
              <Skeleton height="16rem" />
            ) : (
              <Suspense fallback={<Skeleton height="16rem" />}>
                <DepartmentWorkloadChart
                  data={departmentWorkload}
                  valueLabel={t('supervisorDashboard.workloadValue')}
                />
              </Suspense>
            )}
          </Card>

          <Card className="supervisor-dashboard__officer-card">
            <div className="supervisor-dashboard__card-head">
              <h2 className="supervisor-dashboard__section-title">
                {t('supervisorDashboard.officerWorkloadTitle')}
              </h2>
              <DemoDataBadge>{demoLabel}</DemoDataBadge>
            </div>
            {isLoading ? (
              <div className="supervisor-dashboard__skeleton-rows">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : officers.length === 0 ? (
              <p className="supervisor-dashboard__muted">{t('supervisorDashboard.officersEmpty')}</p>
            ) : (
              <DataTable
                rows={officers}
                columns={officerColumns}
                label={t('supervisorDashboard.officerWorkloadTitle')}
                labels={{
                  columns: t('supervisorDashboard.columns'),
                  loading: t('common.loading'),
                  error: t('supervisorDashboard.errorText'),
                  retry: t('common.retry'),
                  empty: t('supervisorDashboard.officersEmpty'),
                }}
              />
            )}
          </Card>
        </div>
      ),
    },
    {
      id: 'sla',
      label: t('supervisorDashboard.tabSla'),
      content: (
        <Card className="supervisor-dashboard__list-card">
          <div className="supervisor-dashboard__card-head">
            <h2 className="supervisor-dashboard__section-title">
              {t('supervisorDashboard.slaTitle')}
            </h2>
            <DemoDataBadge>{demoLabel}</DemoDataBadge>
          </div>
          {isLoading ? (
            <div className="supervisor-dashboard__skeleton-rows">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : slaList.length === 0 ? (
            <p className="supervisor-dashboard__muted">{t('supervisorDashboard.slaEmpty')}</p>
          ) : (
            <ul className="supervisor-dashboard__sla-list">
              {slaList.map((row) => {
                const level = RISK_LEVEL_MAP[row.risk?.risk ?? 'low'] ?? 'low';
                const factors = [];
                if (row.risk && Number.isFinite(row.risk.elapsedPercent)) {
                  factors.push(
                    t('supervisorDashboard.slaFactorElapsed', { percent: row.risk.elapsedPercent }),
                  );
                }
                if (row.status === 'Escalated') {
                  factors.push(t('supervisorDashboard.slaFactorEscalated'));
                }
                return (
                  <li key={row.id} className="supervisor-dashboard__sla-item">
                    <div className="supervisor-dashboard__sla-head">
                      <Link to={`/supervisor/complaints/${row.id}`} className="supervisor-dashboard__link">
                        {row.id}
                      </Link>
                      {row.overdue ? (
                        <Badge tone="danger">
                          <Icon name="alarm" size={12} />
                          <span>{t('supervisorDashboard.overdueLabel')}</span>
                        </Badge>
                      ) : (
                        <Badge tone="warning">{t('supervisorDashboard.atRiskLabel')}</Badge>
                      )}
                      {row.isSynthetic ? <DemoDataBadge>{demoLabel}</DemoDataBadge> : null}
                    </div>
                    <SLARiskBadge
                      level={level}
                      factors={factors}
                      method={row.risk?.state === 'not_started' ? 'rules' : 'ml'}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ),
    },
    {
      id: 'reopened',
      label: t('supervisorDashboard.tabReopened'),
      content: (
        <Card className="supervisor-dashboard__list-card">
          <div className="supervisor-dashboard__card-head">
            <h2 className="supervisor-dashboard__section-title">
              {t('supervisorDashboard.reopenedTitle')}
            </h2>
            <DemoDataBadge>{demoLabel}</DemoDataBadge>
          </div>
          {isLoading ? (
            <div className="supervisor-dashboard__skeleton-rows">
              <SkeletonCard />
            </div>
          ) : reopenedList.length === 0 ? (
            <p className="supervisor-dashboard__muted">{t('supervisorDashboard.reopenedEmpty')}</p>
          ) : (
            <ul className="supervisor-dashboard__simple-list">
              {reopenedList.map((row) => (
                <li key={row.id} className="supervisor-dashboard__simple-item">
                  <Link to={`/supervisor/complaints/${row.id}`} className="supervisor-dashboard__link">
                    {row.id}
                  </Link>
                  <StatusBadge status={BADGE_MAP[row.status] || 'reopened'} />
                  <span className="supervisor-dashboard__muted">
                    {t('supervisorDashboard.rejectionCount', { count: rejectionCount(row) })}
                  </span>
                  {row.isSynthetic ? <DemoDataBadge>{demoLabel}</DemoDataBadge> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ),
    },
    {
      id: 'queue',
      label: t('supervisorDashboard.tabQueue'),
      content: (
        <Card className="supervisor-dashboard__list-card">
          <div className="supervisor-dashboard__card-head">
            <h2 className="supervisor-dashboard__section-title">
              {t('supervisorDashboard.queueTitle')}
            </h2>
            <div className="supervisor-dashboard__head-actions">
              <DemoDataBadge>{demoLabel}</DemoDataBadge>
              <Button as={Link} to="/supervisor/review-queue" variant="secondary" size="sm">
                {t('supervisorDashboard.openQueue')}
              </Button>
            </div>
          </div>
          {over24h.length ? (
            <InlineAlert tone="warning" title={t('supervisorDashboard.queueAlertTitle')}>
              {t('supervisorDashboard.queueAlertBody', { count: over24h.length })}
            </InlineAlert>
          ) : null}
          {isLoading ? (
            <div className="supervisor-dashboard__skeleton-rows">
              <SkeletonCard />
            </div>
          ) : queueItems.length === 0 ? (
            <p className="supervisor-dashboard__muted">{t('supervisorDashboard.queueEmpty')}</p>
          ) : (
            <ul className="supervisor-dashboard__simple-list">
              {queueItems.map((item) => {
                const ageMs = item.ageMs ?? Math.max(0, clockNow - Date.parse(item.queuedAt));
                return (
                  <li key={item.id} className="supervisor-dashboard__simple-item">
                    <Link to={`/supervisor/complaints/${item.id}`} className="supervisor-dashboard__link">
                      {item.id}
                    </Link>
                    <Badge tone={ageMs >= DAY_MS ? 'danger' : 'neutral'}>
                      {formatDuration(ageMs)}
                    </Badge>
                    {item.isSynthetic ? <DemoDataBadge>{demoLabel}</DemoDataBadge> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      ),
    },
  ];

  if (status === 'error' || (status === 'success' && !data)) {
    return (
      <div className="supervisor-dashboard">
        <ErrorState
          title={t('supervisorDashboard.errorTitle')}
          message={t('supervisorDashboard.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="supervisor-dashboard">
      <header className="supervisor-dashboard__header">
        <div>
          <p className="supervisor-dashboard__kicker">{t('supervisorDashboard.kicker')}</p>
          <h1 className="supervisor-dashboard__title">{t('supervisorDashboard.title')}</h1>
          <p className="supervisor-dashboard__subtitle">{t('supervisorDashboard.subtitle')}</p>
        </div>
        <div className="supervisor-dashboard__demo">
          <span className="supervisor-dashboard__demo-label">{t('supervisorDashboard.demoLabel')}</span>
          <Button variant="secondary" size="sm" iconStart="clock" loading={demoBusy} onClick={handleAdvanceDemo}>
            {t('supervisorDashboard.demoAdvance')}
          </Button>
        </div>
      </header>

      <section className="supervisor-dashboard__kpis" aria-label={t('supervisorDashboard.title')}>
        <KPITile
          label={t('supervisorDashboard.kpiOpen')}
          value={isLoading ? '—' : <AnimatedNumber value={kpis.open} />}
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('supervisorDashboard.kpiAtRisk')}
          value={isLoading ? '—' : <AnimatedNumber value={kpis.atRisk} />}
          deltaTone="warning"
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('supervisorDashboard.kpiOverdue')}
          value={isLoading ? '—' : <AnimatedNumber value={kpis.overdue} />}
          deltaTone="danger"
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('supervisorDashboard.kpiEscalated')}
          value={isLoading ? '—' : <AnimatedNumber value={kpis.escalated} />}
          deltaTone="danger"
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('supervisorDashboard.kpiReopened')}
          value={isLoading ? '—' : <AnimatedNumber value={kpis.reopened} />}
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('supervisorDashboard.kpiQueue')}
          value={isLoading ? '—' : <AnimatedNumber value={kpis.queueSize} />}
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('supervisorDashboard.kpiOldestWait')}
          value={
            isLoading
              ? '—'
              : kpis.oldestWait
                ? formatDuration(kpis.oldestWait)
                : t('supervisorDashboard.noWait')
          }
          deltaTone={kpis.oldestWait >= DAY_MS ? 'danger' : 'neutral'}
          demoDataLabel={demoLabel}
        />
      </section>

      <Tabs tabs={tabs} label={t('supervisorDashboard.tabsLabel')} />
    </div>
  );
}