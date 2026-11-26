import { useCallback, useEffect, useMemo, useState } from 'react';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './ReviewQueuePage.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const HANDLED_ANIMATION_MS = 320;
const FIELDS = ['language', 'category', 'urgency', 'department'];

const STATUS_BADGE = {
  'Pending Human Review': 'review',
};

const LANGUAGE_LABEL_KEYS = {
  en: 'english',
  english: 'english',
  urdu: 'urdu',
  roman_urdu: 'romanUrdu',
  'roman-urdu': 'romanUrdu',
  mixed: 'mixed',
  unknown: 'unknown',
};

function formatAge(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function languageLabel(code) {
  return LANGUAGE_LABEL_KEYS[String(code || '').toLowerCase()] || 'unknown';
}

export default function ReviewQueuePage() {
  const { state: authState } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState(null);
  const [corrections, setCorrections] = useState({});
  const [dialog, setDialog] = useState(null);
  const [removingIds, setRemovingIds] = useState({});
  const [demoBusy, setDemoBusy] = useState(false);

  const fetchQueue = useCallback(async () => {
    return api.review.queue({ token: authState.token, page: 1, pageSize: 50 });
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchQueue, {
    immediate: Boolean(authState.token),
  });

  const rows = useMemo(() => data?.items ?? [], [data]);
  const nowMs = data?.now ? Date.parse(data.now) : Date.now();

  const categoryName = useCallback(
    (idOrLabel) =>
      api.referenceData?.categories?.find((cat) => cat.id === idOrLabel)?.name ?? idOrLabel ?? '—',
    [],
  );
  const departmentName = useCallback(
    (idOrLabel) =>
      api.referenceData?.departments?.find((dept) => dept.id === idOrLabel)?.name ??
      idOrLabel ??
      '—',
    [],
  );

  const options = useMemo(
    () => ({
      language: (api.referenceData?.languages ?? []).map((code) => ({
        value: code,
        label: t(`complaintText.language.${languageLabel(code)}`),
      })),
      category: (api.referenceData?.categories ?? []).map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
      urgency: ['low', 'medium', 'high', 'critical'].map((value) => ({
        value,
        label: t(`complaintUrgency.${value}`),
      })),
      department: (api.referenceData?.departments ?? []).map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    }),
    [t],
  );

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  const aiValues = useMemo(() => {
    if (!selected?.aiAnalysis) return null;
    const a = selected.aiAnalysis;
    return {
      language: a.language?.label ?? a.language ?? selected.language,
      category: a.category?.label ?? selected.categoryId,
      urgency: a.urgency?.label ?? 'medium',
      department: a.department?.label ?? selected.departmentId,
    };
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      setCorrections({});
      return;
    }
    if (!aiValues) return;
    setCorrections({ ...aiValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  useEffect(() => {
    if (rows.length && !rows.some((row) => row.id === selectedId)) {
      setSelectedId(rows[0].id);
    }
  }, [rows, selectedId]);

  const over24h = rows.filter((row) => (row.ageMs ?? Math.max(0, nowMs - Date.parse(row.queuedAt))) >= DAY_MS);

  function markRemoving(id) {
    setRemovingIds((prev) => ({ ...prev, [id]: true }));
    window.setTimeout(() => {
      retry();
    }, HANDLED_ANIMATION_MS);
  }

  async function handleConfirm(row) {
    try {
      await api.review.confirm(
        row.id,
        {
          categoryId: row.aiAnalysis?.category?.label ?? row.categoryId,
          departmentId: row.aiAnalysis?.department?.label ?? row.departmentId,
        },
        { token: authState.token },
      );
      toast(t('reviewQueue.confirmSuccess', { id: row.id }), 'success');
      markRemoving(row.id);
    } catch (confirmError) {
      toast(confirmError?.message || t('reviewQueue.handleError'), 'error');
    }
  }

  async function handleCorrectSubmit(reason) {
    if (!selected || !aiValues) return;
    const changed = FIELDS.filter((field) => corrections[field] != null && corrections[field] !== aiValues[field]);
    if (!changed.length) {
      setDialog(null);
      toast(t('reviewQueue.correctNoChanges'), 'info');
      return;
    }
    try {
      for (const field of changed) {
        await api.review.correct(
          selected.id,
          {
            field,
            aiValue: aiValues[field],
            humanValue: corrections[field],
            reason,
          },
          { token: authState.token },
        );
      }
      setDialog(null);
      toast(t('reviewQueue.correctSuccess', { id: selected.id }), 'success');
      markRemoving(selected.id);
    } catch (correctError) {
      toast(correctError?.message || t('reviewQueue.handleError'), 'error');
    }
  }

  async function handleInvalidSubmit(reason) {
    if (!selected) return;
    try {
      await api.review.markInvalid(selected.id, { reason }, { token: authState.token });
      setDialog(null);
      toast(t('reviewQueue.invalidSuccess', { id: selected.id }), 'success');
      markRemoving(selected.id);
    } catch (invalidError) {
      toast(invalidError?.message || t('reviewQueue.handleError'), 'error');
    }
  }

  async function handleAdvanceDemo() {
    setDemoBusy(true);
    try {
      await api.demo.advanceClock(25 * 60 * 60 * 1000);
      toast(t('reviewQueue.demoAdvanced'), 'info');
      retry();
    } catch (demoError) {
      toast(demoError?.message || t('reviewQueue.handleError'), 'error');
    } finally {
      setDemoBusy(false);
    }
  }

  if (status === 'error' || (status === 'success' && !data)) {
    return (
      <div className="review-queue">
        <ErrorState
          title={t('reviewQueue.errorTitle')}
          message={t('reviewQueue.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="review-queue" aria-busy="true">
        <Skeleton width="35%" />
        <div className="review-queue__skeletons">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="review-queue">
      <header className="review-queue__header">
        <div>
          <p className="review-queue__kicker">{t('reviewQueue.kicker')}</p>
          <h1 className="review-queue__title">{t('reviewQueue.title')}</h1>
          <p className="review-queue__subtitle">{t('reviewQueue.subtitle')}</p>
        </div>
        <div className="review-queue__demo">
          <span className="review-queue__demo-label">{t('reviewQueue.demoLabel')}</span>
          <Button variant="secondary" size="sm" iconStart="clock" loading={demoBusy} onClick={handleAdvanceDemo}>
            {t('reviewQueue.demoAdvance')}
          </Button>
        </div>
      </header>

      <InlineAlert tone="info" title={t('reviewQueue.noteTitle')}>
        {t('reviewQueue.slaNote')}
      </InlineAlert>

      {over24h.length ? (
        <InlineAlert tone="warning" title={t('reviewQueue.alertTitle')}>
          {t('reviewQueue.alertBody', { count: over24h.length })}
        </InlineAlert>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title={t('reviewQueue.queueClear')}
          text={t('reviewQueue.queueClearBody')}
        />
      ) : (
        <div className="review-queue__layout">
          <div className="review-queue__table-wrap">
            <table className="review-queue__table">
              <thead>
                <tr>
                  <th scope="col">{t('reviewQueue.colId')}</th>
                  <th scope="col">{t('reviewQueue.colReason')}</th>
                  <th scope="col">{t('reviewQueue.colAge')}</th>
                  <th scope="col">{t('reviewQueue.colStatus')}</th>
                  <th scope="col" className="review-queue__actions-col">
                    {t('reviewQueue.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const ageMs = row.ageMs ?? Math.max(0, nowMs - Date.parse(row.queuedAt));
                  const isOver = ageMs >= DAY_MS;
                  const isRemoving = Boolean(removingIds[row.id]);
                  const isSelected = row.id === selectedId;
                  const flag = row.flag ?? { field: 'category', confidence: 0, threshold: 0.7 };
                  return (
                    <tr
                      key={row.id}
                      className={`review-queue__row${isOver ? ' is-overdue' : ''}${isSelected ? ' is-selected' : ''}${isRemoving ? ' is-removing' : ''}`}
                      onClick={() => setSelectedId(row.id)}
                    >
                      <td>
                        <div className="review-queue__id-cell">
                          <strong>{row.id}</strong>
                          {row.isSynthetic ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
                        </div>
                      </td>
                      <td>
                        <span className="review-queue__flag">
                          {t('reviewQueue.flagReason', {
                            field: t(`reviewQueue.field${flag.field.charAt(0).toUpperCase()}${flag.field.slice(1)}`),
                            confidence: Number(flag.confidence).toFixed(2),
                            threshold: Number(flag.threshold).toFixed(2),
                          })}
                        </span>
                      </td>
                      <td>
                        <span className="review-queue__age tabular-nums">
                          {isOver ? (
                            <Badge tone="danger">
                              <Icon name="alarm" size={12} />
                              <span>{formatAge(ageMs)}</span>
                            </Badge>
                          ) : (
                            formatAge(ageMs)
                          )}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={STATUS_BADGE[row.status] || 'review'} />
                      </td>
                      <td className="review-queue__actions-col">
                        <div className="review-queue__row-actions">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleConfirm(row);
                            }}
                          >
                            {t('reviewQueue.confirm')}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(row.id);
                            }}
                          >
                            {t('reviewQueue.correct')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(row.id);
                              setDialog({ type: 'invalid', id: row.id });
                            }}
                          >
                            {t('reviewQueue.markInvalid')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Card className="review-queue__side">
            <h2 className="review-queue__side-title">{t('reviewQueue.sidePanelTitle')}</h2>
            {selected && aiValues ? (
              <>
                <div className="review-queue__side-head">
                  <span>{selected.id}</span>
                  <StatusBadge status={STATUS_BADGE[selected.status] || 'review'} />
                </div>
                <div className="review-queue__compare">
                  <div className="review-queue__compare-head">
                    <span>{t('reviewQueue.aiSuggestion')}</span>
                    <span>{t('reviewQueue.yourCorrection')}</span>
                  </div>
                  {FIELDS.map((field) => (
                    <div key={field} className="review-queue__compare-row">
                      <span className="review-queue__compare-label">
                        {t(`reviewQueue.field${field.charAt(0).toUpperCase()}${field.slice(1)}`)}
                      </span>
                      <span className="review-queue__compare-ai" dir="auto">
                        {field === 'category'
                          ? categoryName(aiValues.category)
                          : field === 'department'
                            ? departmentName(aiValues.department)
                            : field === 'language'
                              ? t(`complaintText.language.${languageLabel(aiValues.language)}`)
                              : t(`complaintUrgency.${aiValues.urgency}`)}
                      </span>
                      <Select
                        id={`review-correction-${field}`}
                        label=""
                        options={options[field]}
                        value={corrections[field] ?? aiValues[field]}
                        onChange={(event) =>
                          setCorrections((prev) => ({ ...prev, [field]: event.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="review-queue__side-actions">
                  <Button variant="cta" size="sm" iconStart="check" onClick={() => setDialog({ type: 'correct', id: selected.id })}>
                    {t('reviewQueue.correct')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDialog({ type: 'invalid', id: selected.id })}
                  >
                    {t('reviewQueue.markInvalid')}
                  </Button>
                </div>
                <p className="review-queue__side-note">{t('reviewQueue.slaNote')}</p>
              </>
            ) : (
              <p className="review-queue__side-empty">{t('reviewQueue.noSelection')}</p>
            )}
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={dialog?.type === 'correct'}
        title={t('reviewQueue.correctDialogTitle')}
        body={t('reviewQueue.correctDialogBody')}
        requireReason
        minReasonLength={10}
        reasonLabel={t('reviewQueue.reasonLabel')}
        confirmLabel={t('reviewQueue.correct')}
        onConfirm={handleCorrectSubmit}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        open={dialog?.type === 'invalid'}
        title={t('reviewQueue.invalidDialogTitle')}
        body={t('reviewQueue.invalidDialogBody')}
        requireReason
        minReasonLength={10}
        reasonLabel={t('reviewQueue.reasonLabel')}
        confirmLabel={t('reviewQueue.markInvalid')}
        onConfirm={handleInvalidSubmit}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}