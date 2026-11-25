import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ComplaintCard } from '../../components/complaint/ComplaintCard.jsx';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Chip } from '../../components/ui/Chip/Chip.jsx';
import { DataTable } from '../../components/ui/DataTable/DataTable.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Pagination } from '../../components/ui/Pagination/Pagination.jsx';
import { SearchInput } from '../../components/ui/SearchInput/SearchInput.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './CitizenComplaintsPage.css';

const PAGE_SIZE = 8;

const STATUS_META = {
  Submitted: { badge: 'submitted', card: 'submitted', labelKey: 'complaintStatus.submitted', progress: 15 },
  'AI Processing': { badge: 'processing', card: 'processing', labelKey: 'complaintStatus.processing', progress: 25 },
  'Pending Analysis': { badge: 'processing', card: 'processing', labelKey: 'complaintStatus.processing', progress: 20 },
  'Pending Human Review': { badge: 'review', card: 'review', labelKey: 'complaintStatus.review', progress: 35 },
  Assigned: { badge: 'assigned', card: 'assigned', labelKey: 'complaintStatus.assigned', progress: 45 },
  'In Progress': { badge: 'in-progress', card: 'progress', labelKey: 'complaintStatus.in-progress', progress: 65 },
  'Resolution Submitted': { badge: 'resolution-submitted', card: 'resolution', labelKey: 'complaintStatus.resolution-submitted', progress: 85 },
  'Citizen Verification': { badge: 'citizen-verification', card: 'verification', labelKey: 'complaintStatus.citizen-verification', progress: 90 },
  Resolved: { badge: 'resolved', card: 'resolved', labelKey: 'complaintStatus.resolved', progress: 100 },
  Reopened: { badge: 'reopened', card: 'reopened', labelKey: 'complaintStatus.reopened', progress: 50 },
  Escalated: { badge: 'escalated', card: 'escalated', labelKey: 'complaintStatus.escalated', progress: 70 },
  Closed: { badge: 'closed', card: 'closed', labelKey: 'complaintStatus.closed', progress: 100 },
  Rejected: { badge: 'rejected', card: 'rejected', labelKey: 'complaintStatus.rejected', progress: 100 },
  Invalid: { badge: 'rejected', card: 'rejected', labelKey: 'complaintStatus.rejected', progress: 100 },
  'Resolved (Unverified)': { badge: 'resolved', card: 'resolved', labelKey: 'complaintStatus.resolved', progress: 100 },
};

const TERMINAL_STATUSES = new Set(['Resolved', 'Closed', 'Rejected', 'Invalid', 'Resolved (Unverified)']);
const VERIFICATION_STATUSES = new Set(['Resolution Submitted', 'Citizen Verification']);
const ESCALATED_STATUSES = new Set(['Escalated', 'Reopened']);

function getStatusMeta(status) {
  return STATUS_META[status] ?? STATUS_META.Submitted;
}

export default function CitizenComplaintsPage() {
  const { state: authState } = useAuth();
  const { t, formatDate } = useI18n();
  const navigate = useNavigate();

  const [chipFilter, setChipFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchComplaints = useCallback(async () => {
    return api.complaints.list({ token: authState.token, page: 1, pageSize: 100 });
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchComplaints, {
    immediate: Boolean(authState.token),
  });

  const allItems = data?.items ?? [];

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();
    const cutoff =
      dateFilter === '7d'
        ? now - 7 * 24 * 60 * 60 * 1000
        : dateFilter === '30d'
          ? now - 30 * 24 * 60 * 60 * 1000
          : null;

    return allItems.filter((item) => {
      if (chipFilter === 'active' && TERMINAL_STATUSES.has(item.status)) return false;
      if (chipFilter === 'verification' && !VERIFICATION_STATUSES.has(item.status)) return false;
      if (chipFilter === 'resolved' && item.status !== 'Resolved' && item.status !== 'Resolved (Unverified)') {
        return false;
      }
      if (chipFilter === 'escalated' && !ESCALATED_STATUSES.has(item.status)) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (cutoff && Date.parse(item.createdAt) < cutoff) return false;
      if (query) {
        const haystack = `${item.id} ${item.originalText} ${item.category ?? ''} ${item.locality ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [allItems, chipFilter, statusFilter, dateFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const statusChips = [
    { id: 'all', label: t('citizenComplaints.chipAll') },
    { id: 'active', label: t('citizenComplaints.chipActive') },
    { id: 'verification', label: t('citizenComplaints.chipVerification') },
    { id: 'resolved', label: t('citizenComplaints.chipResolved') },
    { id: 'escalated', label: t('citizenComplaints.chipEscalated') },
  ];

  const statusOptions = [
    { value: '', label: t('citizenComplaints.allStatuses') },
    ...(api.referenceData?.lifecycleStates ?? []).map((stateName) => ({
      value: stateName,
      label: t(getStatusMeta(stateName).labelKey),
    })),
  ];

  const dateOptions = [
    { value: 'all', label: t('citizenComplaints.dateAll') },
    { value: '7d', label: t('citizenComplaints.date7d') },
    { value: '30d', label: t('citizenComplaints.date30d') },
  ];

  const columns = [
    {
      key: 'id',
      label: t('citizenComplaints.colId'),
      render: (row) => (
        <span className="citizen-complaints__id-cell">
          <strong>{row.id}</strong>
          {row.isSynthetic ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
        </span>
      ),
    },
    {
      key: 'originalText',
      label: t('citizenComplaints.colSummary'),
      render: (row) => (
        <span className="citizen-complaints__text-cell" dir="auto">
          {row.originalText}
        </span>
      ),
    },
    {
      key: 'category',
      label: t('citizenComplaints.colCategory'),
      render: (row) => row.category || '—',
    },
    {
      key: 'status',
      label: t('citizenComplaints.colStatus'),
      render: (row) => <StatusBadge status={getStatusMeta(row.status).badge} />,
    },
    {
      key: 'updatedAt',
      label: t('citizenComplaints.colUpdated'),
      render: (row) => formatDate(row.updatedAt || row.createdAt, { dateStyle: 'medium' }),
    },
    {
      key: 'action',
      label: t('citizenComplaints.colAction'),
      sortable: false,
      render: (row) => (
        <Button as={Link} to={`/citizen/complaints/${row.id}`} variant="secondary" size="sm">
          {t('citizenComplaints.viewDetails')}
        </Button>
      ),
    },
  ];

  function resetFilters() {
    setChipFilter('all');
    setStatusFilter('');
    setDateFilter('all');
    setSearch('');
    setPage(1);
  }

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className="citizen-complaints">
      <header className="citizen-complaints__header">
        <div>
          <p className="citizen-complaints__kicker">{t('citizenComplaints.kicker')}</p>
          <h1 className="citizen-complaints__title">{t('citizenComplaints.title')}</h1>
          <p className="citizen-complaints__subtitle">{t('citizenComplaints.subtitle')}</p>
        </div>
        <Button as={Link} to="/citizen/submit" variant="cta" size="md" iconStart="plus">
          {t('citizenComplaints.submitNew')}
        </Button>
      </header>

      <div className="citizen-complaints__chips" role="group" aria-label={t('citizenComplaints.statusFilterLabel')}>
        {statusChips.map((chip) => (
          <Chip
            key={chip.id}
            selected={chipFilter === chip.id}
            onClick={() => {
              setChipFilter(chip.id);
              setPage(1);
            }}
          >
            {chip.label}
          </Chip>
        ))}
      </div>

      <div className="citizen-complaints__filters">
        <SearchInput
          id="citizen-complaints-search"
          label={t('citizenComplaints.searchLabel')}
          placeholder={t('citizenComplaints.searchPlaceholder')}
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
          id="citizen-complaints-status"
          label={t('citizenComplaints.statusFilterLabel')}
          options={statusOptions}
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        />
        <Select
          id="citizen-complaints-date"
          label={t('citizenComplaints.dateFilterLabel')}
          options={dateOptions}
          value={dateFilter}
          onChange={(event) => {
            setDateFilter(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {status === 'error' ? (
        <ErrorState
          title={t('citizenComplaints.errorTitle')}
          message={t('citizenComplaints.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      ) : isLoading ? (
        <div className="citizen-complaints__skeletons" aria-busy="true">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={t('citizenComplaints.emptyTitle')}
          text={t('citizenComplaints.emptyText')}
          action={
            allItems.length > 0 ? (
              <Button variant="secondary" onClick={resetFilters}>
                {t('citizenComplaints.clearFilters')}
              </Button>
            ) : (
              <Button as={Link} to="/citizen/submit" variant="cta" iconStart="plus">
                {t('citizenComplaints.submitNew')}
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="citizen-complaints__mobile-list">
            {pageItems.map((complaint) => {
              const meta = getStatusMeta(complaint.status);
              return (
                <ComplaintCard
                  key={complaint.id}
                  id={complaint.id}
                  title={complaint.originalText}
                  status={meta.card}
                  statusLabel={t(meta.labelKey)}
                  category={complaint.category}
                  timestamp={complaint.updatedAt || complaint.createdAt}
                  progress={meta.progress}
                  isDemo={Boolean(complaint.isSynthetic)}
                  onOpen={() => navigate(`/citizen/complaints/${complaint.id}`)}
                />
              );
            })}
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
              label={t('citizenComplaints.paginationLabel')}
              previousLabel={t('citizenComplaints.previousPage')}
              nextLabel={t('citizenComplaints.nextPage')}
              getPageLabel={(p) => t('citizenComplaints.pageNumber', { page: p })}
            />
          </div>

          <div className="citizen-complaints__desktop-table">
            <DataTable
              rows={filteredItems}
              columns={columns}
              label={t('citizenComplaints.tableLabel')}
              labels={{
                columns: t('citizenComplaints.columns'),
                loading: t('common.loading'),
                error: t('citizenComplaints.errorText'),
                retry: t('common.retry'),
                empty: t('citizenComplaints.emptyText'),
                pagination: t('citizenComplaints.paginationLabel'),
                previousPage: t('citizenComplaints.previousPage'),
                nextPage: t('citizenComplaints.nextPage'),
                pageLabel: (p) => t('citizenComplaints.pageNumber', { page: p }),
                selectAllRows: t('citizenComplaints.selectAllRows'),
                selectRow: t('citizenComplaints.selectRow'),
                selectColumn: t('citizenComplaints.selectColumn'),
                selectedCount: (count) => t('citizenComplaints.selectedCount', { count }),
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
