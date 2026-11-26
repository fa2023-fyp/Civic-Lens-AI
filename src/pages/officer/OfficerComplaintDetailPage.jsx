import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard.jsx';
import { EntityChips } from '../../components/ai/EntityChips.jsx';
import { LowConfidenceReason } from '../../components/ai/LowConfidenceReason.jsx';
import { SimilarComplaints } from '../../components/ai/SimilarComplaints.jsx';
import { AttachmentGallery } from '../../components/complaint/AttachmentGallery.jsx';
import { ComplaintText } from '../../components/complaint/ComplaintText.jsx';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { LanguageBadge } from '../../components/complaint/LanguageBadge.jsx';
import { SLACountdown } from '../../components/complaint/SLACountdown.jsx';
import { SLARiskBadge } from '../../components/complaint/SLARiskBadge.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { StatusTimeline } from '../../components/complaint/StatusTimeline.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Modal } from '../../components/ui/Modal/Modal.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { ForbiddenPage } from '../../pages/shared/RouteStatusPage.jsx';
import { api } from '../../services/api.js';
import './OfficerComplaintDetailPage.css';

const LeafletMapPane = lazy(() => import('../../components/map/LeafletMapPane.jsx'));

const CATEGORY_THRESHOLD = 0.7;
const URGENCY_THRESHOLD = 0.7;
const DEPARTMENT_THRESHOLD = 0.75;

const TERMINAL_STATUSES = new Set([
  'Resolved',
  'Resolved (Unverified)',
  'Closed',
  'Rejected',
  'Invalid',
]);
const VERIFICATION_STATUSES = new Set(['Resolution Submitted', 'Citizen Verification']);
const RESOLVABLE_STATUSES = new Set(['Assigned', 'In Progress', 'Reopened', 'Escalated']);

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

const QUEUED_STATUSES = new Set(['Pending Human Review', 'Submitted', 'AI Processing']);

const SLA_STATE_MAP = {
  on_track: 'on-track',
  warning: 'warning',
  breached: 'overdue',
  escalated: 'escalated',
  completed: 'completed',
  not_started: 'paused',
  verification: 'paused',
};

const RISK_LEVEL_MAP = {
  low: 'low',
  moderate: 'medium',
  elevated: 'medium',
  high: 'high',
  not_applicable: 'low',
};

function mapLanguageKey(code) {
  const normalized = String(code || '').toLowerCase();
  if (normalized === 'en' || normalized === 'english') return 'english';
  if (normalized === 'urdu') return 'urdu';
  if (normalized === 'roman_urdu' || normalized === 'roman-urdu') return 'roman-urdu';
  if (normalized === 'mixed') return 'mixed';
  return 'unknown';
}

function normaliseArea(value) {
  return String(value || '').trim().toLocaleLowerCase();
}

function buildTimelineSteps(complaint) {
  const history = complaint?.statusHistory ?? [];
  return history.map((entry, index) => ({
    id: `${entry.status}-${index}`,
    label: entry.status,
    timestamp: entry.changedAt,
    complete: true,
    current: index === history.length - 1,
  }));
}

export default function OfficerComplaintDetailPage() {
  const { complaintId, id } = useParams();
  const targetId = complaintId || id;
  const { state: authState } = useAuth();
  const { t, formatDate } = useI18n();
  const { toast } = useToast();
  const centreRef = useRef(null);

  const [analysis, setAnalysis] = useState(null);
  const [confirmedFields, setConfirmedFields] = useState({});
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressComment, setProgressComment] = useState('');
  const [progressStatus, setProgressStatus] = useState('In Progress');
  const [progressError, setProgressError] = useState('');
  const [progressSaving, setProgressSaving] = useState(false);

  const fetchComplaint = useCallback(async () => {
    return api.complaints.get(targetId, { token: authState.token });
  }, [targetId, authState.token]);

  const { status, data: complaint, error, retry } = useAsync(fetchComplaint, {
    immediate: Boolean(targetId && authState.token),
  });

  const fetchWorkspace = useCallback(async () => {
    const [sla, risk, clusterPage] = await Promise.all([
      api.sla.get(targetId, { token: authState.token }),
      api.sla.riskFor(targetId, { token: authState.token }),
      api.clusters.list({ token: authState.token, pageSize: 100 }),
    ]);
    const cluster =
      (clusterPage?.items ?? []).find((item) => item.complaintIds?.includes(targetId)) ?? null;
    return { sla, risk, cluster };
  }, [targetId, authState.token]);

  const {
    data: workspace,
    retry: retryWorkspace,
  } = useAsync(fetchWorkspace, { immediate: Boolean(targetId && authState.token) });

  useEffect(() => {
    if (!complaint) return undefined;
    if (complaint.aiAnalysis) {
      setAnalysis(complaint.aiAnalysis);
      return undefined;
    }
    let cancelled = false;
    api.ai
      .analyze(complaint.originalText, { locality: complaint.locality })
      .then((result) => {
        if (!cancelled) setAnalysis(result);
      })
      .catch(() => {
        if (!cancelled) setAnalysis(null);
      });
    return () => {
      cancelled = true;
    };
  }, [complaint]);

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

  const categoryOptions = useMemo(
    () =>
      (api.referenceData?.categories ?? []).map((cat) => ({ value: cat.id, label: cat.name })),
    [],
  );
  const departmentOptions = useMemo(
    () =>
      (api.referenceData?.departments ?? []).map((dept) => ({ value: dept.id, label: dept.name })),
    [],
  );
  const urgencyOptions = useMemo(
    () =>
      ['low', 'medium', 'high', 'critical'].map((value) => ({
        value,
        label: t(`complaintUrgency.${value}`),
      })),
    [t],
  );
  const progressOptions = useMemo(
    () => [
      { value: 'In Progress', label: t('complaintStatus.in-progress') },
      { value: 'Escalated', label: t('complaintStatus.escalated') },
    ],
    [t],
  );

  const entities = useMemo(() => {
    const map = {};
    (analysis?.entities ?? []).forEach((entity) => {
      if (entity && entity.type) {
        map[entity.type] = {
          value: entity.value,
          span: entity.span,
          confidence: entity.confidence,
        };
      }
    });
    return map;
  }, [analysis]);

  const textArea = entities.area?.value ?? null;
  const gpsArea = complaint?.location?.locality ?? complaint?.locality ?? null;
  const locationConflict =
    Boolean(textArea && gpsArea) && normaliseArea(textArea) !== normaliseArea(gpsArea);

  const isQueued = complaint ? QUEUED_STATUSES.has(complaint.status) : false;

  async function handleOverride(field, data) {
    if (!complaint) return;
    try {
      await api.reviewComplaint({
        complaintId: complaint.id,
        token: authState.token,
        field,
        aiValue: data.aiValue,
        humanValue: data.newValue,
        reason: data.reason,
      });
      toast(t('officerComplaint.overrideSuccess', { field: t(`officerComplaint.${field}Field`) }), 'success');
      retry();
    } catch (overrideError) {
      const message =
        overrideError?.status === 403
          ? t('officerComplaint.overrideForbidden')
          : t('officerComplaint.overrideError');
      toast(message, 'error');
    }
  }

  function handleConfirm(field) {
    setConfirmedFields((prev) => ({ ...prev, [field]: true }));
    toast(t('officerComplaint.confirmSuccess', { field: t(`officerComplaint.${field}Field`) }), 'success');
  }

  async function handleAccept() {
    if (!complaint) return;
    try {
      await api.complaints.updateProgress(complaint.id, { status: 'In Progress' }, { token: authState.token });
      toast(t('officerWorkspace.acceptSuccess'), 'success');
      retry();
      retryWorkspace();
    } catch (acceptError) {
      toast(acceptError?.message || t('officerWorkspace.acceptError'), 'error');
    }
  }

  function openProgress() {
    setProgressComment('');
    setProgressStatus('In Progress');
    setProgressError('');
    setProgressOpen(true);
  }

  async function handleUpdateProgress() {
    if (!complaint) return;
    const trimmed = progressComment.trim();
    if (trimmed.length < 5) {
      setProgressError(t('officerWorkspace.progressCommentError'));
      return;
    }
    setProgressSaving(true);
    try {
      await api.complaints.updateProgress(
        complaint.id,
        { status: progressStatus },
        { token: authState.token },
      );
      await api.complaints.addComment(complaint.id, { body: trimmed }, { token: authState.token });
      setProgressOpen(false);
      toast(t('officerWorkspace.progressSuccess'), 'success');
      retry();
      retryWorkspace();
    } catch (progressErr) {
      setProgressError(progressErr?.message || t('officerWorkspace.progressError'));
    } finally {
      setProgressSaving(false);
    }
  }

  function handleOverrideShortcut() {
    centreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (status === 'error' || (status === 'success' && !complaint)) {
    if (error?.status === 403 || error?.statusCode === 403) {
      return <ForbiddenPage />;
    }
    return (
      <div className="officer-complaint">
        <ErrorState
          title={t('officerComplaint.errorTitle')}
          message={t('officerComplaint.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === 'loading' || status === 'idle' || !complaint) {
    return (
      <div className="officer-complaint" aria-busy="true">
        <Skeleton width="30%" />
        <div className="officer-complaint__zones officer-complaint__zones--loading">
          <div className="officer-complaint__zone">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="officer-complaint__zone">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="officer-complaint__zone">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const languageKey = mapLanguageKey(analysis?.language?.label ?? complaint.language);
  const languageConfidence = analysis?.language?.confidence ?? analysis?.language_confidence ?? null;

  const categoryValue = categoryName(analysis?.category?.label ?? complaint.categoryId);
  const urgencyValue = t(`complaintUrgency.${analysis?.urgency?.label ?? 'medium'}`);
  const departmentValue = departmentName(analysis?.department?.label ?? complaint.departmentId);

  const categoryAlternatives = (analysis?.category?.top3 ?? [])
    .slice(1)
    .map(([altId, altConfidence]) => ({
      label: categoryName(altId),
      confidence: altConfidence,
    }));
  const departmentAlternatives = (analysis?.department?.alternatives ?? [])
    .slice(0, 2)
    .map(([altId, altConfidence]) => ({
      label: departmentName(altId),
      confidence: altConfidence,
    }));

  const modelVersion =
    analysis?.model_versions?.classifier ?? complaint.aiAnalysis?.modelVersions?.classifier;
  const explanation = analysis?.explanation
    ? [analysis.explanation]
    : [t('officerComplaint.noIndicators')];

  const attachments = (complaint.attachments ?? complaint.media ?? []).map((att, index) => ({
    src: att.src || att.url || '',
    alt: att.name || t('complaintGallery.attachment', { number: index + 1 }),
  }));

  const trackerState = workspace?.sla?.state;
  const slaCompleted =
    TERMINAL_STATUSES.has(complaint.status) || trackerState === 'completed';
  const slaPaused =
    VERIFICATION_STATUSES.has(complaint.status) ||
    isQueued ||
    trackerState === 'not_started' ||
    trackerState === 'verification';
  const slaEscalated = complaint.status === 'Escalated' || trackerState === 'escalated';
  const slaState = SLA_STATE_MAP[trackerState] || 'on-track';

  const riskLevel = RISK_LEVEL_MAP[workspace?.risk?.risk] || 'low';
  const riskFactors = [];
  if (workspace?.risk && Number.isFinite(workspace.risk.elapsedPercent)) {
    riskFactors.push(t('officerWorkspace.slaFactorElapsed', { percent: workspace.risk.elapsedPercent }));
  }
  if (slaEscalated) {
    riskFactors.push(t('officerWorkspace.slaFactorEscalated'));
  }
  const riskMethod = trackerState === 'not_started' ? 'rules' : 'ml';

  const similarItems = (analysis?.similar ?? []).map((item) => ({
    id: item.complaint_id,
    similarity: item.score,
    languages: item.cross_language
      ? { source: t('ai.similar.english'), target: t('ai.similar.romanUrdu') }
      : null,
    distance: item.distance_m,
    daysApart: item.days_apart,
  }));

  const cluster = workspace?.cluster ?? null;
  const clusterLead = cluster
    ? (cluster.complaintIds.find((cid) => cid !== targetId) ?? cluster.complaintIds[0])
    : null;

  const hasCoords =
    Number.isFinite(complaint.location?.lat) && Number.isFinite(complaint.location?.lng);
  const canAccept = complaint.status === 'Assigned';
  const canProgress = !TERMINAL_STATUSES.has(complaint.status) && !VERIFICATION_STATUSES.has(complaint.status);
  const canResolve = RESOLVABLE_STATUSES.has(complaint.status);

  const stagger = (index) => ({ '--delay': `${index * 80}ms` });

  return (
    <div className="officer-complaint">
      <div className="officer-complaint__top">
        <Link className="officer-complaint__back" to="/officer/dashboard">
          <Icon name="arrow-left" size={16} flip />
          <span>{t('officerComplaint.backToDashboard')}</span>
        </Link>
      </div>

      <header className="officer-complaint__header">
        <div className="officer-complaint__id-row">
          <h1 className="officer-complaint__title">{complaint.id}</h1>
          {complaint.isSynthetic ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
        </div>
        <div className="officer-complaint__badges">
          <StatusBadge status={BADGE_MAP[complaint.status] || 'submitted'} />
          <LanguageBadge language={languageKey} confidence={languageConfidence} />
          {complaint.category ? <Badge tone="neutral">{complaint.category}</Badge> : null}
        </div>
        <p className="officer-complaint__date">
          {t('officerComplaint.submittedAt')}:{' '}
          <time dateTime={new Date(complaint.createdAt).toISOString()}>
            {formatDate(complaint.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
          </time>
        </p>
      </header>

      {isQueued ? (
        <div className="officer-complaint__banner anim-fade-up" style={stagger(0)}>
          <InlineAlert tone="warning" title={t('officerComplaint.queuedTitle')}>
            <p className="officer-complaint__banner-body">{t('officerComplaint.queuedBody')}</p>
            <LowConfidenceReason reason={t('officerComplaint.lowConfidenceReason')} />
          </InlineAlert>
        </div>
      ) : null}

      {locationConflict ? (
        <div className="officer-complaint__banner anim-fade-up" style={stagger(1)}>
          <InlineAlert tone="warning" title={t('officerComplaint.locationConflictTitle')}>
            <p className="officer-complaint__banner-body">
              {t('officerComplaint.locationConflictBody', { text: textArea, gps: gpsArea })}
            </p>
            <dl className="officer-complaint__conflict-values">
              <div>
                <dt>{t('officerComplaint.locationTextLabel')}</dt>
                <dd dir="auto">{textArea}</dd>
              </div>
              <div>
                <dt>{t('officerComplaint.locationGpsLabel')}</dt>
                <dd dir="auto">{gpsArea}</dd>
              </div>
            </dl>
          </InlineAlert>
        </div>
      ) : null}

      <div className="officer-complaint__zones">
        <section
          className="officer-complaint__zone officer-complaint__zone--left"
          aria-label={t('officerComplaint.originalZoneTitle')}
        >
          <div className="officer-complaint__panel anim-fade-up" style={stagger(2)}>
            <ComplaintText
              originalText={complaint.originalText}
              normalisedText={complaint.normalizedText || analysis?.normalised_text || ''}
            />
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(3)}>
            <Card className="officer-complaint__entity-card">
              <EntityChips
                originalText={complaint.originalText}
                entities={entities}
                title={t('officerComplaint.entitiesTitle')}
              />
            </Card>
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(4)}>
            <Card className="officer-complaint__attachments-card">
              <h2 className="officer-complaint__section-title">
                {t('officerComplaint.attachmentsTitle')}
              </h2>
              <AttachmentGallery attachments={attachments} />
            </Card>
          </div>
        </section>

        <section
          ref={centreRef}
          className="officer-complaint__zone officer-complaint__zone--centre"
          aria-label={t('officerComplaint.recommendationsTitle')}
        >
          <div className="officer-complaint__centre-header anim-fade-up" style={stagger(2)}>
            <h2 className="officer-complaint__section-title">
              {t('officerComplaint.recommendationsTitle')}
            </h2>
            <p className="officer-complaint__section-subtitle">
              {t('officerComplaint.recommendationsSubtitle')}
            </p>
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(3)}>
            <AIRecommendationCard
              field={t('officerComplaint.categoryField')}
              value={categoryValue}
              confidence={analysis?.category?.confidence ?? null}
              threshold={CATEGORY_THRESHOLD}
              reasons={explanation}
              alternatives={categoryAlternatives}
              modelVersion={modelVersion}
              overrideOptions={categoryOptions}
              isConfirmed={Boolean(confirmedFields.category)}
              onConfirm={() => handleConfirm('category')}
              onOverride={(data) => handleOverride('category', data)}
            />
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(4)}>
            <AIRecommendationCard
              field={t('officerComplaint.urgencyField')}
              value={urgencyValue}
              confidence={analysis?.urgency?.confidence ?? null}
              threshold={URGENCY_THRESHOLD}
              reasons={analysis?.urgency?.reasons ?? []}
              safetyRule={analysis?.urgency?.safety_rule ?? null}
              modelVersion={modelVersion}
              overrideOptions={urgencyOptions}
              isConfirmed={Boolean(confirmedFields.urgency)}
              onConfirm={() => handleConfirm('urgency')}
              onOverride={(data) => handleOverride('urgency', data)}
            />
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(5)}>
            <AIRecommendationCard
              field={t('officerComplaint.departmentField')}
              value={departmentValue}
              confidence={analysis?.department?.confidence ?? null}
              threshold={DEPARTMENT_THRESHOLD}
              reasons={explanation}
              alternatives={departmentAlternatives}
              modelVersion={modelVersion}
              overrideOptions={departmentOptions}
              isConfirmed={Boolean(confirmedFields.department)}
              onConfirm={() => handleConfirm('department')}
              onOverride={(data) => handleOverride('department', data)}
            />
          </div>
        </section>

        <section
          className="officer-complaint__zone officer-complaint__zone--right"
          aria-label={t('officerWorkspace.rightZoneTitle')}
        >
          <div className="officer-complaint__panel anim-fade-up" style={stagger(3)}>
            <Card className="officer-complaint__map-card">
              <h2 className="officer-complaint__section-title">{t('officerWorkspace.mapTitle')}</h2>
              {hasCoords ? (
                <Suspense fallback={<Skeleton height="12rem" />}>
                  <LeafletMapPane
                    lat={complaint.location.lat}
                    lng={complaint.location.lng}
                    ariaLabel={t('officerWorkspace.mapTitle')}
                  />
                </Suspense>
              ) : (
                <p className="officer-complaint__muted">
                  {complaint.locality || complaint.location?.locality || t('officerWorkspace.mapNoPin')}
                </p>
              )}
            </Card>
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(4)}>
            <Card className="officer-complaint__sla-card">
              <h2 className="officer-complaint__section-title">{t('officerWorkspace.slaTitle')}</h2>
              <SLACountdown
                dueDate={workspace?.sla?.dueAt}
                startedAt={workspace?.sla?.startedAt}
                state={slaState}
                completed={slaCompleted}
                paused={slaPaused}
                escalated={slaEscalated}
                loading={!workspace}
              />
              <SLARiskBadge
                level={riskLevel}
                factors={riskFactors}
                method={riskMethod}
                loading={!workspace}
              />
            </Card>
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(5)}>
            <Card className="officer-complaint__similar-card">
              <SimilarComplaints
                items={similarItems}
                title={t('ai.similar.title')}
                onConfirmDuplicate={() => toast(t('officerWorkspace.duplicateConfirmed'), 'success')}
                onRejectDuplicate={() => toast(t('officerWorkspace.duplicateRejected'), 'info')}
              />
              {cluster ? (
                <div className="officer-complaint__cluster-link">
                  <span className="officer-complaint__cluster-label">
                    {t('officerWorkspace.parentCluster')}: <strong>{cluster.title}</strong>
                  </span>
                  <Link
                    className="officer-complaint__cluster-open"
                    to={`/officer/complaints/${clusterLead}`}
                  >
                    {t('officerWorkspace.viewCluster')}
                    <Icon name="chevron-right" size={14} />
                  </Link>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="officer-complaint__panel anim-fade-up" style={stagger(6)}>
            <Card className="officer-complaint__timeline-card">
              <h2 className="officer-complaint__section-title">
                {t('officerWorkspace.activityTitle')}
              </h2>
              <StatusTimeline
                steps={buildTimelineSteps(complaint)}
                escalated={complaint.status === 'Escalated'}
              />
              <div className="officer-complaint__comments">
                <h3 className="officer-complaint__comments-title">
                  {t('officerWorkspace.commentsTitle')}
                </h3>
                {(complaint.comments ?? []).length === 0 ? (
                  <p className="officer-complaint__muted">{t('officerWorkspace.noComments')}</p>
                ) : (
                  <ul className="officer-complaint__comment-list">
                    {(complaint.comments ?? []).map((comment) => (
                      <li key={comment.id} className="officer-complaint__comment">
                        <div className="officer-complaint__comment-meta">
                          <Badge tone="neutral">{comment.authorRole}</Badge>
                          <time dateTime={new Date(comment.createdAt).toISOString()}>
                            {formatDate(comment.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                          </time>
                        </div>
                        <p dir="auto">{comment.body}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        </section>
      </div>

      <div className="officer-action-bar" role="region" aria-label={t('officerWorkspace.actionBarLabel')}>
        <p className="officer-action-bar__note">{t('officerWorkspace.noResolveNote')}</p>
        <div className="officer-action-bar__actions">
          {canAccept ? (
            <Button variant="secondary" size="sm" iconStart="check" onClick={handleAccept}>
              {t('officerWorkspace.accept')}
            </Button>
          ) : null}
          {canProgress ? (
            <Button variant="secondary" size="sm" iconStart="edit" onClick={openProgress}>
              {t('officerWorkspace.updateProgress')}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" iconStart="sparkles" onClick={handleOverrideShortcut}>
            {t('officerWorkspace.overrideAi')}
          </Button>
          {canResolve ? (
            <Button
              as={Link}
              to={`/officer/complaints/${complaint.id}/resolve`}
              variant="cta"
              size="sm"
              iconEnd="chevron-right"
            >
              {t('officerWorkspace.submitResolution')}
            </Button>
          ) : null}
        </div>
      </div>

      <Modal
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        title={t('officerWorkspace.progressDialogTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setProgressOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="cta" loading={progressSaving} onClick={handleUpdateProgress}>
              {t('officerWorkspace.progressConfirm')}
            </Button>
          </>
        }
      >
        <div className="officer-progress-form">
          <Select
            id="officer-progress-status"
            label={t('officerWorkspace.progressStatusLabel')}
            options={progressOptions}
            value={progressStatus}
            onChange={(event) => setProgressStatus(event.target.value)}
          />
          <Textarea
            id="officer-progress-comment"
            label={t('officerWorkspace.progressCommentLabel')}
            placeholder={t('officerWorkspace.progressCommentPlaceholder')}
            value={progressComment}
            onChange={(event) => {
              setProgressComment(event.target.value);
              if (progressError) setProgressError('');
            }}
            error={progressError}
            rows={3}
            required
          />
        </div>
      </Modal>
    </div>
  );
}