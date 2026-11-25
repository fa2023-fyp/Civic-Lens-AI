import { lazy, Suspense, useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AttachmentGallery } from '../../components/complaint/AttachmentGallery.jsx';
import { ComplaintText } from '../../components/complaint/ComplaintText.jsx';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { LanguageBadge } from '../../components/complaint/LanguageBadge.jsx';
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
import './CitizenComplaintDetailPage.css';

const LeafletMapPane = lazy(() => import('../../components/map/LeafletMapPane.jsx'));

const REOPEN_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const VERIFICATION_STATUSES = new Set(['Resolution Submitted', 'Citizen Verification']);
const REOPENABLE_STATUSES = new Set(['Resolved', 'Resolved (Unverified)', 'Closed']);

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

function mapLanguageKey(code) {
  const normalized = String(code || '').toLowerCase();
  if (normalized === 'en' || normalized === 'english') return 'english';
  if (normalized === 'urdu') return 'urdu';
  if (normalized === 'roman_urdu' || normalized === 'roman-urdu') return 'roman-urdu';
  if (normalized === 'mixed') return 'mixed';
  return 'unknown';
}

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

export default function CitizenComplaintDetailPage() {
  const { complaintId, id } = useParams();
  const targetId = complaintId || id;
  const { state: authState } = useAuth();
  const { t, formatDate, formatNumber } = useI18n();
  const toast = useToast();

  const [commentBody, setCommentBody] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);

  const fetchComplaint = useCallback(async () => {
    return api.complaints.get(targetId, { token: authState.token });
  }, [targetId, authState.token]);

  const { status, data: complaint, error, retry } = useAsync(fetchComplaint, {
    immediate: Boolean(targetId && authState.token),
  });

  const departmentName =
    api.referenceData?.departments?.find((dept) => dept.id === complaint?.departmentId)?.name ??
    null;

  const relatedCount =
    complaint?.relatedCount ??
    complaint?.clusterCount ??
    complaint?.aiAnalysis?.similar_count ??
    0;

  const canVerify = complaint ? VERIFICATION_STATUSES.has(complaint.status) : false;
  const isReopenableStatus = complaint ? REOPENABLE_STATUSES.has(complaint.status) : false;
  const acceptedTimestamp = complaint
    ? Date.parse(complaint.acceptedAt ?? complaint.updatedAt ?? complaint.createdAt)
    : 0;
  const withinReopenWindow =
    isReopenableStatus && Number.isFinite(acceptedTimestamp) && Date.now() - acceptedTimestamp <= REOPEN_WINDOW_MS;

  async function handlePostComment(event) {
    event.preventDefault();
    const trimmed = commentBody.trim();
    if (!trimmed || !complaint) return;

    setCommentSubmitting(true);
    try {
      await api.complaints.addComment(complaint.id, { body: trimmed }, { token: authState.token });
      setCommentBody('');
      toast.success(t('citizenDetail.commentPosted'));
      retry();
    } catch {
      toast.error(t('citizenDetail.commentError'));
    } finally {
      setCommentSubmitting(false);
    }
  }

  async function handleConfirmReopen(reason) {
    if (!complaint) return;
    setReopenOpen(false);
    try {
      await api.verification.reopen(complaint.id, { reason }, { token: authState.token });
      toast.success(t('citizenDetail.reopenSuccess'));
      retry();
    } catch (reopenErr) {
      toast.error(reopenErr?.message || t('citizenDetail.reopenError'));
    }
  }

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="citizen-detail" aria-busy="true">
        <Skeleton width="35%" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (status === 'error' || !complaint) {
    return (
      <div className="citizen-detail">
        <ErrorState
          title={t('citizenDetail.errorTitle')}
          message={t('citizenDetail.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  const hasCoords =
    Number.isFinite(complaint.location?.lat) && Number.isFinite(complaint.location?.lng);
  const attachments = (complaint.attachments ?? []).map((att, index) => ({
    src: att.src || att.url || '',
    alt: att.name || t('complaintGallery.attachment', { number: index + 1 }),
  }));

  return (
    <div className="citizen-detail">
      <div className="citizen-detail__top">
        <Link className="citizen-detail__back" to="/citizen/complaints">
          <Icon name="arrow-left" size={16} flip />
          <span>{t('citizenDetail.backToList')}</span>
        </Link>
      </div>

      <header className="citizen-detail__header">
        <div className="citizen-detail__id-row">
          <h1 className="citizen-detail__title">{complaint.id}</h1>
          {complaint.isSynthetic ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
        </div>
        <div className="citizen-detail__badges">
          <StatusBadge status={BADGE_MAP[complaint.status] || 'submitted'} />
          <LanguageBadge language={mapLanguageKey(complaint.language)} />
          {complaint.category ? <Badge tone="neutral">{complaint.category}</Badge> : null}
        </div>
        <p className="citizen-detail__date">
          {t('citizenDetail.submittedAt')}:{' '}
          <time dateTime={new Date(complaint.createdAt).toISOString()}>
            {formatDate(complaint.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
          </time>
        </p>
      </header>

      {canVerify ? (
        <InlineAlert tone="warning" title={t('citizenDetail.verifyTitle')}>
          <div className="citizen-detail__verify-banner">
            <p>{t('citizenDetail.verifyBody')}</p>
            <Button
              as={Link}
              to={`/citizen/complaints/${complaint.id}/verify`}
              variant="primary"
              size="sm"
              iconEnd="chevron-right"
            >
              {t('citizenDetail.verifyButton')}
            </Button>
          </div>
        </InlineAlert>
      ) : null}

      {relatedCount > 0 ? (
        <InlineAlert
          tone="info"
          title={t('citizenDetail.relatedTitle', { count: formatNumber(relatedCount) })}
        >
          <div className="citizen-detail__related">
            <span>{t('citizenDetail.relatedBody')}</span>
            {complaint.isSynthetic ? <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge> : null}
          </div>
        </InlineAlert>
      ) : null}

      <ComplaintText
        originalText={complaint.originalText}
        normalisedText={complaint.normalizedText || ''}
      />

      <div className="citizen-detail__grid">
        <Card className="citizen-detail__info-card">
          <div className="citizen-detail__kv">
            <span className="citizen-detail__kv-label">{t('citizenDetail.departmentLabel')}</span>
            <strong>{departmentName || t('citizenDetail.departmentPending')}</strong>
          </div>
          <div className="citizen-detail__kv">
            <span className="citizen-detail__kv-label">{t('citizenDetail.localityLabel')}</span>
            <div className="citizen-detail__locality">
              <strong dir="auto">{complaint.locality || complaint.location?.locality || '—'}</strong>
              {complaint.location?.approximate ? (
                <Badge tone="warning">{t('citizenDetail.approximateBadge')}</Badge>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="citizen-detail__map-card">
          <h2 className="citizen-detail__section-title">{t('citizenDetail.mapTitle')}</h2>
          {hasCoords ? (
            <Suspense fallback={<Skeleton height="12rem" />}>
              <LeafletMapPane
                lat={complaint.location.lat}
                lng={complaint.location.lng}
                ariaLabel={t('citizenDetail.mapTitle')}
              />
            </Suspense>
          ) : (
            <p className="citizen-detail__muted">{t('citizenDetail.mapNoPin')}</p>
          )}
        </Card>
      </div>

      <Card className="citizen-detail__section-card">
        <h2 className="citizen-detail__section-title">{t('citizenDetail.timelineTitle')}</h2>
        <StatusTimeline
          steps={buildTimelineSteps(complaint, t)}
          escalated={complaint.status === 'Escalated'}
        />
      </Card>

      <Card className="citizen-detail__section-card">
        <h2 className="citizen-detail__section-title">{t('citizenDetail.attachmentsTitle')}</h2>
        <AttachmentGallery attachments={attachments} />
      </Card>

      <Card className="citizen-detail__section-card">
        <h2 className="citizen-detail__section-title">{t('citizenDetail.updatesTitle')}</h2>
        {(complaint.comments ?? []).length === 0 ? (
          <p className="citizen-detail__muted">{t('citizenDetail.noComments')}</p>
        ) : (
          <ul className="citizen-detail__comments">
            {complaint.comments.map((comment) => (
              <li key={comment.id} className="citizen-detail__comment">
                <div className="citizen-detail__comment-meta">
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

        <form className="citizen-detail__comment-form" onSubmit={handlePostComment}>
          <Textarea
            id="citizen-detail-comment"
            label={t('citizenDetail.addCommentLabel')}
            placeholder={t('citizenDetail.addCommentPlaceholder')}
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            dir="auto"
            rows={2}
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={commentSubmitting}
            disabled={!commentBody.trim()}
          >
            {t('citizenDetail.addCommentButton')}
          </Button>
        </form>
      </Card>

      {isReopenableStatus ? (
        <Card className="citizen-detail__reopen-card">
          <div className="citizen-detail__reopen-row">
            <Button
              variant="secondary"
              disabled={!withinReopenWindow}
              onClick={() => setReopenOpen(true)}
            >
              {t('citizenDetail.reopenButton')}
            </Button>
            {!withinReopenWindow ? (
              <p className="citizen-detail__muted">{t('citizenDetail.reopenWindowExpired')}</p>
            ) : null}
          </div>
        </Card>
      ) : null}

      <ConfirmDialog
        open={reopenOpen}
        title={t('citizenDetail.reopenDialogTitle')}
        body={t('citizenDetail.reopenDialogBody')}
        requireReason
        minReasonLength={10}
        reasonLabel={t('citizenDetail.reopenReasonLabel')}
        confirmLabel={t('citizenDetail.reopenButton')}
        onConfirm={handleConfirmReopen}
        onCancel={() => setReopenOpen(false)}
      />
    </div>
  );
}
