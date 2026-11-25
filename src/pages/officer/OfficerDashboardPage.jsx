import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { SLACountdown } from '../../components/complaint/SLACountdown.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { UrgencyBadge } from '../../components/complaint/UrgencyBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox.jsx';
import { DataTable } from '../../components/ui/DataTable/DataTable.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { KPITile } from '../../components/ui/KPITile/KPITile.jsx';
import { Pagination } from '../../components/ui/Pagination/Pagination.jsx';
import { SearchInput } from '../../components/ui/SearchInput/SearchInput.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useHotkeys } from '../../hooks/useHotkeys.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './OfficerDashboardPage.css';

const PAGE_SIZE = 20;
const DEFAULT_SLA_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

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

function deriveRowMeta(complaint, nowMs) {
  const startedAt = complaint.sla?.startedAt || complaint.createdAt;
  const dueAt =
    complaint.sla?.dueAt ||
    new Date(Date.parse(startedAt) + DEFAULT_SLA_MS).toISOString();
  const dueMs = Date.parse(dueAt);
  const completed = TERMINAL_STATUSES.has(complaint.status);
  const paused = VERIFICATION_STATUSES.has(complaint.status);
  const overdue =
    !completed &&
    !paused &&
    (complaint.sla?.state === 'breached' ||
      complaint.status === 'Escalated' ||
      (Number.isFinite(dueMs) && dueMs < nowMs));
  const dueToday =
    !completed &&
    !paused &&
    !overdue &&
    Number.isFinite(dueMs) &&
    dueMs - nowMs <= DAY_MS;

  const urgency = (
    complaint.aiAnalysis?.urgency?.label ||
    complaint.urgency ||
    (overdue ? 'high' : 'medium')
  ).toLowerCase();

  const aiCategory =
    complaint.aiAnalysis?.category?.label || complaint.category || '—';
  const aiConfidence =
    complaint.aiAnalysis?.category?.confidence ??
    complaint.aiAnalysis?.department?.confidence ??
    null;

  return {
    ...complaint,
    startedAt,
    dueAt,
    completed,
    paused,
    overdue,
    dueToday,
    urgency,
    aiCategory,
    aiConfidence,
  };
}

export default function OfficerDashboardPage() {
  const { state: authState } = useAuth();
  const { t, formatNumber, formatRelativeTime } = useI18n();
  const searchInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sort, setSort] = useState({ key: 'createdAt', direction: 'descending' });
  const [page, setPage] = useState(1);

  useHotkeys('/', (event) => {
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable) {
      return;
    }
    event.preventDefault();
    searchInputRef.current?.focus();
  });

  const fetchAssignments = useCallback(async () => {
    return api.complaints.list({ token: authState.token, page: 1, pageSize: 100 });
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchAssignments, {
    immediate: Boolean(authState.token),
  });

  const enrichedRows = useMemo(() => {
    const nowMs = Date.now();
    return (data?.items ?? []).map((item) => deriveRowMeta(item, nowMs));
  }, [data]);

  const kpis = useMemo(() => {
    let assigned = 0;
    let dueToday = 0;
    let overdue = 0;
    let awaitingVerification = 0;
    for (const row of enrichedRows) {
      if (!row.completed) assigned += 1;
      if (row.dueToday) dueToday += 1;
      if (row.overdue) overdue += 1;
      if (VERIFICATION_STATUSES.has(row.status)) awaitingVerification += 1;
    }
    return { assigned, dueToday, overdue, awaitingVerification };
  }, [enrichedRows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedRows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (categoryFilter && row.categoryId !== categoryFilter && row.aiCategory !== categoryFilter) {
        return false;
      }
      if (urgencyFilter && row.urgency !== urgencyFilter) return false;
      if (areaFilter && row.locality !== areaFilter) return false;
      if (overdueOnly && !row.overdue) return false;
      if (query) {
        const haystack = `${row.id} ${row.originalText} ${row.aiCategory} ${row.locality ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [enrichedRows, search, statusFilter, categoryFilter, urgencyFilter, areaFilter, overdueOnly]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const mobilePageItems = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const statusOptions = [
    { value: '', label: t('officerDashboard.allOption') },
    ...(api.referenceData?.lifecycleStates ?? []).map((stateName) => ({
      value: stateName,
      label: stateName,
    })),
  ];

  const categoryOptions = [
    { value: '', label: t('officerDashboard.allOption') },
    ...(api.referenceData?.categories ?? []).map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  const urgencyOptions = [
    { value: '', label: t('officerDashboard.allOption') },
    { value: 'low', label: t('complaintUrgency.low') },
    { value: 'medium', label: t('complaintUrgency.medium') },
    { value: 'high', label: t('complaintUrgency.high') },
    { value: 'critical', label: t('complaintUrgency.critical') },
  ];

  const areaOptions = [
    { value: '', label: t('officerDashboard.allOption') },
    ...(api.referenceData?.localities ?? []).map((loc) => ({
      value: loc,
      label: loc,
    })),
  ];

  const columns = [
    {
      key: 'urgency',
      label: t('officerDashboard.colUrgency'),
      render: (row) => <UrgencyBadge urgency={row.urgency} />,
    },
    {
      key: 'id',
      label: t('officerDashboard.colId'),
      render: (row) => (
        <div className={`officer-dashboard__id-cell${row.overdue ? ' is-overdue' : ''}`}>
          <strong>{row.id}</strong>
          {row.overdue ? (
            <Badge tone="danger">
              <Icon name="alarm" size={12} />
              <span>{t('officerDashboard.overdueLabel')}</span>
            </Badge>
          ) : null}
          {row.isSynthetic ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
        </div>
      ),
    },
    {
      key: 'dueAt',
      label: t('officerDashboard.colSla'),
      render: (row) => (
        <SLACountdown
          dueDate={row.dueAt}
          startedAt={row.startedAt}
          state={row.overdue ? 'overdue' : undefined}
          completed={row.completed}
          paused={row.paused}
          escalated={row.status === 'Escalated'}
        />
      ),
    },
    {
      key: 'status',
      label: t('officerDashboard.colStatus'),
      render: (row) => <StatusBadge status={BADGE_MAP[row.status] || 'assigned'} />,
    },
    {
      key: 'aiCategory',
      label: t('officerDashboard.colAi'),
      render: (row) => (
        <div className="officer-dashboard__ai-cell">
          <span>{row.aiCategory}</span>
          {typeof row.aiConfidence === 'number' ? (
            <Badge tone="ai">
              {formatNumber(row.aiConfidence, { style: 'percent', maximumFractionDigits: 0 })}
            </Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: t('officerDashboard.colAreaAge'),
      render: (row) => (
        <div className="officer-dashboard__area-cell">
          <span>{row.locality || '—'}</span>
          <time dateTime={new Date(row.createdAt).toISOString()}>
            {formatRelativeTime(row.createdAt)}
          </time>
        </div>
      ),
    },
    {
      key: 'action',
      label: t('officerDashboard.colAction'),
      sortable: false,
      render: (row) => (
        <Button as={Link} to={`/officer/complaints/${row.id}`} variant="secondary" size="sm">
          {t('officerDashboard.openButton')}
        </Button>
      ),
    },
  ];

  function resetFilters() {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setUrgencyFilter('');
    setAreaFilter('');
    setOverdueOnly(false);
    setPage(1);
  }

  const isLoading = status === 'loading' || status === 'idle';
  const hasDemoData = enrichedRows.some((row) => row.isSynthetic);
  const demoLabel = hasDemoData ? t('preview.demoBadge') : undefined;

  return (
    <div className="officer-dashboard">
      <header className="officer-dashboard__header">
        <p className="officer-dashboard__kicker">{t('officerDashboard.kicker')}</p>
        <h1 className="officer-dashboard__title">{t('officerDashboard.title')}</h1>
        <p className="officer-dashboard__subtitle">{t('officerDashboard.subtitle')}</p>
      </header>

      <section className="officer-dashboard__kpis" aria-label={t('officerDashboard.title')}>
        <KPITile
          label={t('officerDashboard.kpiAssigned')}
          value={isLoading ? '—' : formatNumber(kpis.assigned)}
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('officerDashboard.kpiDueToday')}
          value={isLoading ? '—' : formatNumber(kpis.dueToday)}
          deltaTone="warning"
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('officerDashboard.kpiOverdue')}
          value={isLoading ? '—' : formatNumber(kpis.overdue)}
          deltaTone="danger"
          demoDataLabel={demoLabel}
        />
        <KPITile
          label={t('officerDashboard.kpiAwaitingVerification')}
          value={isLoading ? '—' : formatNumber(kpis.awaitingVerification)}
          demoDataLabel={demoLabel}
        />
      </section>

      <Card className="officer-dashboard__toolbar">
        <div className="officer-dashboard__filters">
          <SearchInput
            ref={searchInputRef}
            id="officer-search"
            label={t('officerDashboard.searchLabel')}
            placeholder={t('officerDashboard.searchPlaceholder')}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
          />
          <Select
            id="officer-filter-status"
            label={t('officerDashboard.filterStatus')}
            options={statusOptions}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          />
          <Select
            id="officer-filter-category"
            label={t('officerDashboard.filterCategory')}
            options={categoryOptions}
            value={categoryFilter}
            onChange={(event) => {
              setCategoryFilter(event.target.value);
              setPage(1);
            }}
          />
          <Select
            id="officer-filter-urgency"
            label={t('officerDashboard.filterUrgency')}
            options={urgencyOptions}
            value={urgencyFilter}
            onChange={(event) => {
              setUrgencyFilter(event.target.value);
              setPage(1);
            }}
          />
          <Select
            id="officer-filter-area"
            label={t('officerDashboard.filterArea')}
            options={areaOptions}
            value={areaFilter}
            onChange={(event) => {
              setAreaFilter(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="officer-dashboard__toolbar-row">
          <Checkbox
            id="officer-filter-overdue"
            label={t('officerDashboard.filterOverdue')}
            checked={overdueOnly}
            onChange={(event) => {
              setOverdueOnly(event.target.checked);
              setPage(1);
            }}
          />
          {search || statusFilter || categoryFilter || urgencyFilter || areaFilter || overdueOnly ? (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t('officerDashboard.clearFilters')}
            </Button>
          ) : null}
        </div>
      </Card>

      {status === 'error' ? (
        <ErrorState
          title={t('officerDashboard.errorTitle')}
          message={t('officerDashboard.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      ) : isLoading ? (
        <div className="officer-dashboard__skeletons" aria-busy="true">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title={t('officerDashboard.emptyTitle')}
          text={t('officerDashboard.emptyText')}
          action={
            <Button variant="secondary" onClick={resetFilters}>
              {t('officerDashboard.clearFilters')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="officer-dashboard__mobile-list">
            {mobilePageItems.map((row) => (
              <Card
                key={row.id}
                className={`officer-dashboard__mobile-card${row.overdue ? ' is-overdue' : ''}`}
              >
                <div className="officer-dashboard__mobile-top">
                  <div className="officer-dashboard__id-cell">
                    <strong>{row.id}</strong>
                    {row.overdue ? (
                      <Badge tone="danger">
                        <Icon name="alarm" size={12} />
                        <span>{t('officerDashboard.overdueLabel')}</span>
                      </Badge>
                    ) : null}
                  </div>
                  <UrgencyBadge urgency={row.urgency} />
                </div>
                <p className="officer-dashboard__mobile-text" dir="auto">
                  {row.originalText}
                </p>
                <div className="officer-dashboard__mobile-meta">
                  <StatusBadge status={BADGE_MAP[row.status] || 'assigned'} />
                  <span>{row.aiCategory}</span>
                  <span>{row.locality || '—'}</span>
                </div>
                <SLACountdown
                  dueDate={row.dueAt}
                  startedAt={row.startedAt}
                  state={row.overdue ? 'overdue' : undefined}
                  completed={row.completed}
                  paused={row.paused}
                  escalated={row.status === 'Escalated'}
                />
                <Button as={Link} to={`/officer/complaints/${row.id}`} variant="secondary" size="sm" fullWidth>
                  {t('officerDashboard.openButton')}
                </Button>
              </Card>
            ))}
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
              label={t('officerDashboard.paginationLabel')}
              previousLabel={t('officerDashboard.previousPage')}
              nextLabel={t('officerDashboard.nextPage')}
              getPageLabel={(p) => t('officerDashboard.pageNumber', { page: p })}
            />
          </div>

          <div className="officer-dashboard__desktop-table">
            <DataTable
              rows={filteredRows}
              columns={columns}
              label={t('officerDashboard.tableLabel')}
              sort={sort}
              onSortChange={setSort}
              labels={{
                columns: t('officerDashboard.columns'),
                loading: t('common.loading'),
                error: t('officerDashboard.errorText'),
                retry: t('common.retry'),
                empty: t('officerDashboard.emptyText'),
                pagination: t('officerDashboard.paginationLabel'),
                previousPage: t('officerDashboard.previousPage'),
                nextPage: t('officerDashboard.nextPage'),
                pageLabel: (p) => t('officerDashboard.pageNumber', { page: p }),
                selectAllRows: t('officerDashboard.selectAllRows'),
                selectRow: t('officerDashboard.selectRow'),
                selectColumn: t('officerDashboard.selectColumn'),
                selectedCount: (count) => t('officerDashboard.selectedCount', { count }),
              }}
              pagination={{
                page: currentPage,
                pageSize: PAGE_SIZE,
                onPageChange: setPage,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
