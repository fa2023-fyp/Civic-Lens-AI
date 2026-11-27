import { useCallback, useMemo, useState } from 'react';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { ReassignDialog } from '../../components/complaint/ReassignDialog.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Modal } from '../../components/ui/Modal/Modal.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './EscalationsPage.css';

const TERMINAL_STATUSES = new Set([
  'Resolved',
  'Closed',
  'Rejected',
  'Invalid',
  'Resolved (Unverified)',
]);

function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function EscalationsPage() {
  const { state: authState } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [clockNow, setClockNow] = useState(() => Date.now());
  const [demoBusy, setDemoBusy] = useState(false);
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [reassignTarget, setReassignTarget] = useState(null);
  const [reassignBusy, setReassignBusy] = useState(false);
  const [instructTarget, setInstructTarget] = useState(null);
  const [instructBody, setInstructBody] = useState('');
  const [instructBusy, setInstructBusy] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null);

  const fetchEscalations = useCallback(async () => {
    const [complaintsPage, policies] = await Promise.all([
      api.complaints.list({ token: authState.token, page: 1, pageSize: 100 }),
      api.sla.policies({ token: authState.token }),
    ]);
    return { complaints: complaintsPage.items ?? [], policies: policies ?? [] };
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchEscalations, {
    immediate: Boolean(authState.token),
  });

  const departments = api.referenceData?.departments ?? [];
  const demoUsers = api.demoUsers ?? [];

  const departmentName = useCallback(
    (id) => departments.find((dept) => dept.id === id)?.name ?? id ?? '—',
    [],
  );

  const supervisorName = useCallback(
    (id) => {
      const dept = departments.find((item) => item.id === id);
      const supervisor = demoUsers.find((user) => user.id === dept?.supervisorId);
      return supervisor?.name ?? null;
    },
    [departments, demoUsers],
  );

  const officersByDepartment = useMemo(() => {
    const map = new Map();
    for (const officer of demoUsers.filter((user) => user.role === 'officer')) {
      const list = map.get(officer.departmentId) ?? [];
      list.push({ id: officer.id, name: officer.name });
      map.set(officer.departmentId, list);
    }
    return map;
  }, [demoUsers]);

  const policyByDepartment = useMemo(() => {
    const map = new Map();
    for (const policy of data?.policies ?? []) map.set(policy.departmentId, policy);
    return map;
  }, [data]);

  const escalations = useMemo(() => {
    const rows = (data?.complaints ?? []).filter(
      (complaint) =>
        complaint.status === 'Escalated' ||
        (complaint.escalationLevel ?? 0) > 0 || complaint.sla?.state === 'escalated',
    );
    return rows
      .filter((complaint) => !TERMINAL_STATUSES.has(complaint.status))
      .map((complaint) => {
        const currentLevel = complaint.escalationLevel ?? 0;
        const policy = policyByDepartment.get(complaint.departmentId);
        const thresholds = policy?.escalationAfterMs ?? [];
        const startedAt = complaint.sla?.startedAt || complaint.createdAt;
        const elapsed = Math.max(0, clockNow - Date.parse(startedAt));
        const nextThreshold =
          currentLevel < thresholds.length ? Number(thresholds[currentLevel]) : null;
        const remaining = nextThreshold != null ? nextThreshold - elapsed : null;
        return {
          ...complaint,
          currentLevel,
          nextRemaining: remaining,
          atMaxLevel: nextThreshold == null,
          notifiedName: supervisorName(complaint.departmentId),
          departmentLabel: departmentName(complaint.departmentId),
          officers: officersByDepartment.get(complaint.departmentId) ?? [],
        };
      })
      .sort((a, b) => (b.currentLevel ?? 0) - (a.currentLevel ?? 0));
  }, [data, policyByDepartment, clockNow, supervisorName, departmentName, officersByDepartment]);

  const levelOptions = useMemo(() => {
    const levels = [...new Set(escalations.map((row) => row.currentLevel))].sort((a, b) => a - b);
    return [
      { value: '', label: t('escalations.allLevels') },
      ...levels.map((value) => ({ value: String(value), label: t('escalations.level', { level: value }) })),
    ];
  }, [escalations, t]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return escalations.filter((row) => {
      if (level !== '' && String(row.currentLevel) !== level) return false;
      if (!query) return true;
      return (
        String(row.id).toLocaleLowerCase().includes(query) ||
        String(row.departmentLabel).toLocaleLowerCase().includes(query)
      );
    });
  }, [escalations, level, search]);

  async function handleAdvanceDemo() {
    setDemoBusy(true);
    try {
      const result = await api.demo.advanceClock(25 * 60 * 60 * 1000);
      if (result?.now) setClockNow(Date.parse(result.now));
      toast(t('escalations.demoAdvanced'), 'info');
      retry();
    } catch (demoError) {
      toast(demoError?.message || t('escalations.actionError'), 'error');
    } finally {
      setDemoBusy(false);
    }
  }

  async function handleReassign({ complaintId, officerId, reason }) {
    setReassignBusy(true);
    try {
      const updated = await api.complaints.reassign(
        complaintId,
        { officerId, reason },
        { token: authState.token },
      );
      const officer = (officersByDepartment.get(updated.departmentId) ?? []).find(
        (item) => item.id === officerId,
      );
      toast(t('escalations.reassignSuccess', { id: complaintId, officer: officer?.name ?? officerId }), 'success');
      setReassignTarget(null);
      retry();
    } catch (reassignError) {
      toast(reassignError?.message || t('escalations.actionError'), 'error');
    } finally {
      setReassignBusy(false);
    }
  }

  function openInstruct(complaint) {
    setInstructTarget(complaint);
    setInstructBody('');
  }

  async function handleInstruct() {
    const body = instructBody.trim();
    if (!body || !instructTarget) return;
    setInstructBusy(true);
    try {
      await api.complaints.addComment(instructTarget.id, { body }, { token: authState.token });
      toast(t('escalations.instructSuccess', { id: instructTarget.id }), 'success');
      setInstructTarget(null);
      setInstructBody('');
      retry();
    } catch (instructError) {
      toast(instructError?.message || t('escalations.actionError'), 'error');
    } finally {
      setInstructBusy(false);
    }
  }

  async function handleReturn() {
    if (!returnTarget) return;
    try {
      await api.complaints.updateProgress(
        returnTarget.id,
        { status: 'In Progress' },
        { token: authState.token },
      );
      toast(t('escalations.returnSuccess', { id: returnTarget.id }), 'success');
      setReturnTarget(null);
      retry();
    } catch (returnError) {
      toast(returnError?.message || t('escalations.actionError'), 'error');
    }
  }

  const isLoading = status === 'loading' || status === 'idle';
  const demoLabel = t('preview.demoBadge');

  if (status === 'error' || (status === 'success' && !data)) {
    return (
      <div className="escalations">
        <ErrorState
          title={t('escalations.errorTitle')}
          message={t('escalations.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="escalations">
      <header className="escalations__header">
        <div>
          <p className="escalations__kicker">{t('escalations.kicker')}</p>
          <h1 className="escalations__title">{t('escalations.title')}</h1>
          <p className="escalations__subtitle">{t('escalations.subtitle')}</p>
        </div>
        <div className="escalations__demo">
          <span className="escalations__demo-label">{t('escalations.demoLabel')}</span>
          <Button variant="secondary" size="sm" iconStart="clock" loading={demoBusy} onClick={handleAdvanceDemo}>
            {t('escalations.demoAdvance')}
          </Button>
        </div>
      </header>

      <Card className="escalations__filters">
        <Select
          label={t('escalations.levelFilter')}
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          options={levelOptions}
        />
        <input
          type="search"
          className="escalations__search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('escalations.searchPlaceholder')}
          aria-label={t('escalations.searchLabel')}
        />
      </Card>

      {isLoading ? (
        <div className="escalations__skeleton">
          <Skeleton height="4rem" />
          <Skeleton height="4rem" />
          <Skeleton height="4rem" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('escalations.emptyTitle')}
          text={t('escalations.emptyBody')}
        />
      ) : (
        <ul className="escalations__list">
          {filtered.map((row) => (
            <li key={row.id} className="escalations__item">
              <div className="escalations__item-head">
                <div className="escalations__item-id">
                  <strong>{row.id}</strong>
                  <StatusBadge status="escalated" />
                  {row.isSynthetic ? <DemoDataBadge>{demoLabel}</DemoDataBadge> : null}
                </div>
                <Badge tone="danger">{t('escalations.level', { level: row.currentLevel })}</Badge>
              </div>

              <dl className="escalations__meta">
                <div className="escalations__meta-item">
                  <dt>{t('escalations.colDepartment')}</dt>
                  <dd>{row.departmentLabel}</dd>
                </div>
                <div className="escalations__meta-item">
                  <dt>{t('escalations.colNotified')}</dt>
                  <dd>
                    {row.notifiedName
                      ? t('escalations.notifiedBy', { name: row.notifiedName })
                      : t('escalations.noNotified')}
                  </dd>
                </div>
                <div className="escalations__meta-item">
                  <dt>{t('escalations.colNext')}</dt>
                  <dd>
                    {row.atMaxLevel
                      ? t('escalations.maxLevel')
                      : row.nextRemaining != null && row.nextRemaining > 0
                        ? t('escalations.nextIn', { time: formatDuration(row.nextRemaining) })
                        : t('escalations.nextDue')}
                  </dd>
                </div>
              </dl>

              {row.nextRemaining != null && row.nextRemaining <= 0 && !row.atMaxLevel ? (
                <InlineAlert tone="warning" title={t('escalations.nextDueTitle')}>
                  {t('escalations.nextDueBody')}
                </InlineAlert>
              ) : null}

              <div className="escalations__actions">
                <Button
                  variant="primary"
                  size="sm"
                  iconStart="refresh"
                  onClick={() => setReassignTarget(row)}
                >
                  {t('escalations.reassign')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openInstruct(row)}>
                  {t('escalations.instruct')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setReturnTarget(row)}>
                  {t('escalations.returnToProgress')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReassignDialog
        open={Boolean(reassignTarget)}
        onClose={() => setReassignTarget(null)}
        complaints={reassignTarget ? [reassignTarget] : []}
        officers={reassignTarget?.officers ?? []}
        onConfirm={handleReassign}
        loading={reassignBusy}
      />

      <Modal
        open={Boolean(instructTarget)}
        onClose={() => setInstructTarget(null)}
        title={t('escalations.instructTitle')}
        description={t('escalations.instructBody', { id: instructTarget?.id ?? '' })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInstructTarget(null)} disabled={instructBusy}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleInstruct}
              loading={instructBusy}
              disabled={!instructBody.trim()}
            >
              {t('escalations.instructSave')}
            </Button>
          </>
        }
      >
        <Textarea
          label={t('escalations.instructLabel')}
          placeholder={t('escalations.instructPlaceholder')}
          value={instructBody}
          onChange={(event) => setInstructBody(event.target.value)}
          maxLength={280}
          showCount
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(returnTarget)}
        title={t('escalations.returnTitle')}
        body={t('escalations.returnBody', { id: returnTarget?.id ?? '' })}
        confirmLabel={t('escalations.returnConfirm')}
        confirmTone="primary"
        onCancel={() => setReturnTarget(null)}
        onConfirm={handleReturn}
      />
    </div>
  );
}