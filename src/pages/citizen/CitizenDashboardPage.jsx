import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ComplaintCard } from '../../components/complaint/ComplaintCard.jsx';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { SkeletonRow } from '../../components/ui/SkeletonRow/SkeletonRow.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './CitizenDashboardPage.css';

const TERMINAL_STATUSES = new Set([
  'Resolved',
  'Closed',
  'Rejected',
  'Invalid',
  'Resolved (Unverified)',
]);

const VERIFICATION_STATUSES = new Set(['Resolution Submitted', 'Citizen Verification']);

const STATUS_META = {
  Submitted: { cardStatus: 'submitted', labelKey: 'complaintStatus.submitted', progress: 15 },
  'AI Processing': { cardStatus: 'processing', labelKey: 'complaintStatus.processing', progress: 25 },
  'Pending Analysis': { cardStatus: 'processing', labelKey: 'complaintStatus.processing', progress: 20 },
  'Pending Human Review': { cardStatus: 'review', labelKey: 'complaintStatus.review', progress: 35 },
  Assigned: { cardStatus: 'assigned', labelKey: 'complaintStatus.assigned', progress: 45 },
  'In Progress': { cardStatus: 'progress', labelKey: 'complaintStatus.in-progress', progress: 65 },
  'Resolution Submitted': {
    cardStatus: 'resolution',
    labelKey: 'complaintStatus.resolution-submitted',
    progress: 85,
  },
  'Citizen Verification': {
    cardStatus: 'verification',
    labelKey: 'complaintStatus.citizen-verification',
    progress: 90,
  },
  Reopened: { cardStatus: 'reopened', labelKey: 'complaintStatus.reopened', progress: 50 },
  Escalated: { cardStatus: 'escalated', labelKey: 'complaintStatus.escalated', progress: 70 },
  Resolved: { cardStatus: 'resolved', labelKey: 'complaintStatus.resolved', progress: 100 },
  Closed: { cardStatus: 'closed', labelKey: 'complaintStatus.closed', progress: 100 },
  Rejected: { cardStatus: 'rejected', labelKey: 'complaintStatus.rejected', progress: 100 },
  Invalid: { cardStatus: 'rejected', labelKey: 'complaintStatus.rejected', progress: 100 },
  'Resolved (Unverified)': { cardStatus: 'resolved', labelKey: 'complaintStatus.resolved', progress: 100 },
};

function getStatusMeta(status) {
  return (
    STATUS_META[status] ?? {
      cardStatus: 'submitted',
      labelKey: 'complaintStatus.submitted',
      progress: 20,
    }
  );
}

export default function CitizenDashboardPage() {
  const { user, state: authState } = useAuth();
  const { t, formatRelativeTime, formatNumber } = useI18n();
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine === false : false,
  );

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    const token = authState.token;
    const [complaintsResult, notificationsResult] = await Promise.all([
      api.complaints.list({ token, page: 1, pageSize: 20 }),
      api.notifications.list({ token, page: 1, pageSize: 5 }),
    ]);
    return {
      complaints: complaintsResult.items ?? [],
      notifications: notificationsResult.items ?? [],
    };
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchDashboard, {
    immediate: !isOffline && Boolean(authState.token),
  });

  useEffect(() => {
    if (!isOffline && authState.token && status === 'idle') {
      retry();
    }
  }, [isOffline, authState.token, status, retry]);

  const complaints = data?.complaints ?? [];
  const notifications = data?.notifications ?? [];
  const verificationQueue = complaints.filter((item) => VERIFICATION_STATUSES.has(item.status));
  const activeComplaints = complaints
    .filter((item) => !TERMINAL_STATUSES.has(item.status))
    .slice(0, 5);
  const isLoading = !isOffline && (status === 'loading' || status === 'idle');
  const displayName = user?.name || t('routes.roles.citizen');

  async function handleOpenNotification(notification) {
    if (!notification.readAt && authState.token) {
      try {
        await api.notifications.markRead(notification.id, { token: authState.token });
      } catch {
        // Navigate even if markRead fails silently.
      }
    }
    navigate(`/citizen/complaints/${notification.complaintId}`);
  }

  return (
    <div className="citizen-home">
      <header className="citizen-home__hero">
        <div className="citizen-home__greeting">
          <h1 className="citizen-home__title">{t('citizenHome.greeting', { name: displayName })}</h1>
          <p className="citizen-home__subtitle">{t('citizenHome.subtitle')}</p>
        </div>
        <div className="citizen-home__cta-wrap">
          <Button
            as={Link}
            to="/citizen/complaints/new"
            variant="cta"
            size="lg"
            iconStart="plus"
            fullWidth
            className="citizen-home__submit-btn"
          >
            {t('citizenHome.submitCta')}
          </Button>
          <p className="citizen-home__cta-hint">{t('citizenHome.submitHint')}</p>
        </div>
      </header>

      {isOffline ? (
        <Card className="citizen-home__offline" role="status" aria-live="polite">
          <EmptyState
            title={t('citizenHome.offlineTitle')}
            text={t('citizenHome.offlineText')}
            illustration={<Icon name="alert-triangle" size={32} />}
            action={
              <Button variant="secondary" iconStart="refresh" onClick={retry}>
                {t('common.retry')}
              </Button>
            }
          />
        </Card>
      ) : null}

      {!isOffline && status === 'error' ? (
        <ErrorState
          title={t('citizenHome.errorTitle')}
          message={t('citizenHome.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      ) : null}

      {!isOffline && status !== 'error' ? (
        <>
          {!isLoading && verificationQueue.length > 0 ? (
            <section
              className="citizen-home__action-banner anim-slide-in-start"
              aria-label={t('citizenHome.actionNeededTitle')}
            >
              <InlineAlert tone="warning" title={t('citizenHome.actionNeededTitle')}>
                <div className="citizen-home__banner-body">
                  <p>
                    {verificationQueue.length === 1
                      ? t('citizenHome.actionNeededSingle', { id: verificationQueue[0].id })
                      : t('citizenHome.actionNeededMultiple', {
                          count: formatNumber(verificationQueue.length),
                        })}
                  </p>
                  <Button
                    as={Link}
                    to={`/citizen/complaints/${verificationQueue[0].id}/verify`}
                    variant="primary"
                    size="sm"
                    iconEnd="chevron-right"
                  >
                    {t('citizenHome.verifyNow')}
                  </Button>
                </div>
              </InlineAlert>
            </section>
          ) : null}

          <section className="citizen-home__section" aria-labelledby="citizen-active-heading">
            <div className="citizen-home__section-header">
              <h2 id="citizen-active-heading">{t('citizenHome.activeTitle')}</h2>
              <Link className="citizen-home__section-link" to="/citizen/complaints">
                {t('citizenHome.viewAll')}
              </Link>
            </div>

            {isLoading ? (
              <div className="citizen-home__cards" aria-busy="true">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : activeComplaints.length === 0 ? (
              <EmptyState
                title={t('citizenHome.activeEmptyTitle')}
                text={t('citizenHome.activeEmptyText')}
                action={
                  <Button as={Link} to="/citizen/complaints/new" variant="primary" iconStart="plus">
                    {t('citizenHome.submitCta')}
                  </Button>
                }
              />
            ) : (
              <div className="citizen-home__cards">
                {activeComplaints.map((complaint) => {
                  const meta = getStatusMeta(complaint.status);
                  return (
                    <ComplaintCard
                      key={complaint.id}
                      id={complaint.id}
                      title={complaint.originalText}
                      status={meta.cardStatus}
                      statusLabel={t(meta.labelKey)}
                      category={complaint.category}
                      timestamp={complaint.updatedAt || complaint.createdAt}
                      progress={meta.progress}
                      isDemo={Boolean(complaint.isSynthetic)}
                      onOpen={() => navigate(`/citizen/complaints/${complaint.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section className="citizen-home__section" aria-labelledby="citizen-notifications-heading">
            <div className="citizen-home__section-header">
              <h2 id="citizen-notifications-heading">{t('citizenHome.notificationsTitle')}</h2>
              <Link className="citizen-home__section-link" to="/citizen/alerts">
                {t('citizenHome.viewAll')}
              </Link>
            </div>

            {isLoading ? (
              <Card className="citizen-home__notifications-card" aria-busy="true">
                <Skeleton width="35%" />
                <SkeletonRow columns={2} />
                <SkeletonRow columns={2} />
              </Card>
            ) : notifications.length === 0 ? (
              <EmptyState
                title={t('citizenHome.notificationsEmptyTitle')}
                text={t('citizenHome.notificationsEmptyText')}
              />
            ) : (
              <ul className="citizen-home__notifications">
                {notifications.map((notification) => {
                  const unread = notification.readAt === null;
                  return (
                    <li key={notification.id}>
                      <button
                        type="button"
                        className={`citizen-home__notification-item${unread ? ' is-unread' : ''}`}
                        onClick={() => handleOpenNotification(notification)}
                      >
                        <span className="citizen-home__notification-icon" aria-hidden="true">
                          <Icon name="bell" size={18} />
                        </span>
                        <span className="citizen-home__notification-content">
                          <span className="citizen-home__notification-title">
                            {t('citizenHome.notificationStatus', { id: notification.complaintId })}
                          </span>
                          <span className="citizen-home__notification-meta">
                            <time dateTime={new Date(notification.createdAt).toISOString()}>
                              {formatRelativeTime(notification.createdAt)}
                            </time>
                            {notification.isSynthetic ? (
                              <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge>
                            ) : null}
                          </span>
                        </span>
                        {unread ? <Badge tone="info">{t('citizenHome.unread')}</Badge> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
