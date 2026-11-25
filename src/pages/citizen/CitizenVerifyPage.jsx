import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BeforeAfterViewer } from '../../components/complaint/BeforeAfterViewer.jsx';
import { ResolutionCard } from '../../components/complaint/ResolutionCard.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { StatusTimeline } from '../../components/complaint/StatusTimeline.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './CitizenVerifyPage.css';

const AWAITING_STATUSES = new Set(['Resolution Submitted', 'Citizen Verification']);
const TIMEOUT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

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

function buildTimelineSteps(complaint, t) {
  const history = complaint?.statusHistory ?? [];
  return history.map((entry, index) => ({
    id: `${entry.status}-${index}`,
    label: entry.status,
    actor: entry.actorId ? t('complaintTimeline.actor') : undefined,
    timestamp: entry.changedAt,
    complete: true,
    current: index === history.length - 1,
  }));
}

export default function CitizenVerifyPage() {
  const { complaintId, id } = useParams();
  const targetId = complaintId || id;
  const { state: authState } = useAuth();
  const { t, formatDate, formatNumber } = useI18n();
  const toast = useToast();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const fetchComplaint = useCallback(async () => {
    return api.complaints.get(targetId, { token: authState.token });
  }, [targetId, authState.token]);

  const { status, data: complaint, error, retry } = useAsync(fetchComplaint, {
    immediate: Boolean(targetId && authState.token),
  });

  // Poll lightly while awaiting verification so Demo clock timeouts reflect in the UI.
  useEffect(() => {
    if (!complaint || !AWAITING_STATUSES.has(complaint.status) || !authState.token) return undefined;
    const timer = window.setInterval(() => {
      retry();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [complaint, authState.token, retry]);

  async function handleAccept() {
    if (!complaint || submitting) return;
    setSubmitting(true);
    try {
      await api.verification.accept(complaint.id, {}, { token: authState.token });
      setJustAccepted(true);
      toast.success(t('citizenVerify.acceptedSuccess'));
      await retry();
    } catch (acceptErr) {
      toast.error(acceptErr?.message || t('citizenVerify.actionError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(reason) {
    if (!complaint || submitting) return;
    setRejectOpen(false);
    setSubmitting(true);
    try {
      const updated = await api.verification.reject(
        complaint.id,
        { reason },
        { token: authState.token },
      );
      if (updated?.status === 'Escalated') {
        toast.warning(t('citizenVerify.rejectedEscalated'));
      } else {
        toast.info(t('citizenVerify.rejectedReopened'));
      }
      await retry();
    } catch (rejectErr) {
      toast.error(rejectErr?.message || t('citizenVerify.actionError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveFeedback(event) {
    event.preventDefault();
    if (!complaint) return;
    if (feedback.trim()) {
      try {
        await api.complaints.addComment(
          complaint.id,
          { body: `Rating: ${rating || '—'}/5 — ${feedback.trim()}` },
          { token: authState.token },
        );
      } catch {
        // Optional feedback should not block acknowledgement.
      }
    }
    setFeedbackSaved(true);
    toast.success(t('citizenVerify.feedbackSaved'));
  }

  if (status === 'loading' && !complaint) {
    return (
      <div className="citizen-verify" aria-busy="true">
        <Skeleton width="40%" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (status === 'error' || !complaint) {
    return (
      <div className="citizen-verify">
        <ErrorState
          title={t('citizenVerify.errorTitle')}
          message={t('citizenVerify.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  const awaiting = AWAITING_STATUSES.has(complaint.status);
  const dueAtIso =
    complaint.resolution?.verificationDueAt ??
    new Date(Date.parse(complaint.updatedAt || complaint.createdAt) + TIMEOUT_WINDOW_MS).toISOString();
  const formattedDueDate = formatDate(dueAtIso, { dateStyle: 'medium' });

  const resolutionDescription =
    complaint.resolution?.note ||
    complaint.resolution?.description ||
    t('complaintGallery.sampleDescription');
  const resolutionActions = complaint.resolution?.actionsPerformed ?? [
    t('complaintGallery.sampleActionOne'),
    t('complaintGallery.sampleActionTwo'),
  ];
  const resolutionEvidence = complaint.resolution?.evidence ?? [];
  const beforePhoto = complaint.attachments?.[0]?.src || '';
  const afterPhoto = resolutionEvidence[0]?.src || '';

  return (
    <div className="citizen-verify">
      <div className="citizen-verify__top">
        <Link className="citizen-verify__back" to={`/citizen/complaints/${complaint.id}`}>
          <Icon name="arrow-left" size={16} flip />
          <span>{t('citizenVerify.backToDetail')}</span>
        </Link>
      </div>

      <header className="citizen-verify__header">
        <p className="citizen-verify__kicker">{t('citizenVerify.kicker')}</p>
        <div className="citizen-verify__title-row">
          <h1 className="citizen-verify__title">{t('citizenVerify.title')}</h1>
          <StatusBadge status={BADGE_MAP[complaint.status] || 'citizen-verification'} />
        </div>
        <p className="citizen-verify__subtitle">{t('citizenVerify.subtitle')}</p>
        <div className="citizen-verify__meta">
          <strong>{complaint.id}</strong>
          <Badge tone="neutral">
            {t('citizenVerify.rejectionCountLabel', {
              count: formatNumber(complaint.rejectionCount ?? 0),
            })}
          </Badge>
        </div>
      </header>

      {awaiting ? (
        <InlineAlert tone="info">
          {t('citizenVerify.timeoutNotice', { date: formattedDueDate })}
        </InlineAlert>
      ) : null}

      {complaint.status === 'Resolved (Unverified)' ? (
        <InlineAlert tone="warning" title={t('citizenVerify.unverifiedTitle')}>
          {t('citizenVerify.unverifiedBody')}
        </InlineAlert>
      ) : null}

      {justAccepted || complaint.status === 'Resolved' ? (
        <Card className="citizen-verify__success-card anim-fade-in">
          <div className="citizen-verify__check-wrap" aria-hidden="true">
            <svg className="citizen-verify__check-svg" viewBox="0 0 52 52">
              <circle className="citizen-verify__check-circle" cx="26" cy="26" r="23" />
              <path className="citizen-verify__check-mark" d="M15 27l7 7 15-15" />
            </svg>
          </div>
          <h2>{t('citizenVerify.resolvedSuccessTitle')}</h2>
          <p className="citizen-verify__muted">{t('citizenVerify.resolvedSuccessBody')}</p>

          {!feedbackSaved ? (
            <form className="citizen-verify__feedback-form" onSubmit={handleSaveFeedback}>
              <div className="citizen-verify__rating" role="group" aria-label={t('citizenVerify.ratingLabel')}>
                <span className="citizen-verify__rating-label">{t('citizenVerify.ratingLabel')}</span>
                <div className="citizen-verify__stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`citizen-verify__star${rating >= star ? ' is-active' : ''}`}
                      aria-label={t('citizenVerify.ratingStar', { value: star })}
                      aria-pressed={rating === star}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                id="verify-feedback"
                label={t('citizenVerify.feedbackLabel')}
                placeholder={t('citizenVerify.feedbackPlaceholder')}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                dir="auto"
                rows={2}
              />
              <Button type="submit" variant="secondary" size="sm">
                {t('citizenVerify.feedbackSubmit')}
              </Button>
            </form>
          ) : (
            <InlineAlert tone="success">{t('citizenVerify.feedbackSaved')}</InlineAlert>
          )}
        </Card>
      ) : null}

      {!awaiting && complaint.status !== 'Resolved' && complaint.status !== 'Resolved (Unverified)' ? (
        <InlineAlert tone="info">
          {t('citizenVerify.notAwaitingBody', { status: complaint.status })}
        </InlineAlert>
      ) : null}

      <ResolutionCard
        description={resolutionDescription}
        actionsPerformed={resolutionActions}
        evidence={resolutionEvidence}
        timestamp={complaint.resolution?.submittedAt || complaint.updatedAt}
      />

      {beforePhoto || afterPhoto ? (
        <Card className="citizen-verify__section-card">
          <h2 className="citizen-verify__section-title">{t('citizenVerify.beforeAfterTitle')}</h2>
          <BeforeAfterViewer beforeSrc={beforePhoto} afterSrc={afterPhoto} />
        </Card>
      ) : null}

      {awaiting ? (
        <div className="citizen-verify__actions">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            iconStart="check-circle"
            loading={submitting}
            onClick={handleAccept}
          >
            {t('citizenVerify.acceptButton')}
          </Button>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            iconStart="x-circle"
            disabled={submitting}
            onClick={() => setRejectOpen(true)}
          >
            {t('citizenVerify.rejectButton')}
          </Button>
        </div>
      ) : null}

      <Card className="citizen-verify__section-card">
        <h2 className="citizen-verify__section-title">{t('citizenVerify.timelineTitle')}</h2>
        <StatusTimeline
          steps={buildTimelineSteps(complaint, t)}
          escalated={complaint.status === 'Escalated'}
        />
      </Card>

      <ConfirmDialog
        open={rejectOpen}
        title={t('citizenVerify.rejectDialogTitle')}
        body={t('citizenVerify.rejectDialogBody')}
        confirmTone="danger"
        confirmLabel={t('citizenVerify.rejectButton')}
        requireReason
        minReasonLength={10}
        reasonLabel={t('citizenVerify.rejectReasonLabel')}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      />
    </div>
  );
}
