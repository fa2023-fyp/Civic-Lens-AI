import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { SkeletonRow } from '../../components/ui/SkeletonRow/SkeletonRow.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './CitizenNotificationsPage.css';

export default function CitizenNotificationsPage() {
  const { state: authState } = useAuth();
  const { t, formatRelativeTime, formatNumber } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();

  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    return api.notifications.list({ token: authState.token, page: 1, pageSize: 30 });
  }, [authState.token]);

  const { status, data, error, retry } = useAsync(fetchNotifications, {
    immediate: Boolean(authState.token),
  });

  const items = data?.items ?? [];
  const unreadItems = items.filter((item) => item.readAt === null);

  async function handleMarkAllRead() {
    if (!unreadItems.length || markingAll) return;
    setMarkingAll(true);
    try {
      await Promise.all(
        unreadItems.map((item) =>
          api.notifications.markRead(item.id, { token: authState.token }),
        ),
      );
      toast.success(t('citizenNotifications.markedAllRead'));
      await retry();
    } catch {
      toast.error(t('citizenNotifications.errorText'));
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleOpen(notification) {
    if (notification.readAt === null && authState.token) {
      try {
        await api.notifications.markRead(notification.id, { token: authState.token });
      } catch {
        // Proceed to complaint detail even if markRead fails silently.
      }
    }
    navigate(`/citizen/complaints/${notification.complaintId}`);
  }

  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className="citizen-notifications">
      <header className="citizen-notifications__header">
        <div>
          <p className="citizen-notifications__kicker">{t('citizenNotifications.kicker')}</p>
          <h1 className="citizen-notifications__title">{t('citizenNotifications.title')}</h1>
          <p className="citizen-notifications__subtitle">{t('citizenNotifications.subtitle')}</p>
        </div>

        <div className="citizen-notifications__actions">
          <Badge tone={unreadItems.length > 0 ? 'info' : 'neutral'}>
            {unreadItems.length > 0
              ? t('citizenNotifications.unreadCount', { count: formatNumber(unreadItems.length) })
              : t('citizenNotifications.allCaughtUp')}
          </Badge>
          {unreadItems.length > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              iconStart="check"
              loading={markingAll}
              onClick={handleMarkAllRead}
            >
              {t('citizenNotifications.markAllRead')}
            </Button>
          ) : null}
        </div>
      </header>

      {status === 'error' ? (
        <ErrorState
          title={t('citizenNotifications.errorTitle')}
          message={t('citizenNotifications.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      ) : isLoading ? (
        <Card className="citizen-notifications__skeletons" aria-busy="true">
          <SkeletonRow columns={2} />
          <SkeletonRow columns={2} />
          <SkeletonRow columns={2} />
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title={t('citizenNotifications.emptyTitle')}
          text={t('citizenNotifications.emptyText')}
        />
      ) : (
        <ul className="citizen-notifications__list">
          {items.map((item) => {
            const unread = item.readAt === null;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`citizen-notifications__item${unread ? ' is-unread' : ''}`}
                  onClick={() => handleOpen(item)}
                >
                  <span className="citizen-notifications__icon" aria-hidden="true">
                    <Icon name="bell" size={18} />
                  </span>
                  <span className="citizen-notifications__body">
                    <span className="citizen-notifications__item-title">
                      {t('citizenNotifications.itemTitle', { id: item.complaintId })}
                    </span>
                    <span className="citizen-notifications__meta">
                      <Badge tone="neutral">{item.complaintId}</Badge>
                      <time dateTime={new Date(item.createdAt).toISOString()}>
                        {formatRelativeTime(item.createdAt)}
                      </time>
                      {item.isSynthetic ? (
                        <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge>
                      ) : null}
                    </span>
                  </span>
                  {unread ? (
                    <Badge tone="info">{t('citizenNotifications.unreadBadge')}</Badge>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
