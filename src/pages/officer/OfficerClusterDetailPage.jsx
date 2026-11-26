import { Component, lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SimilarComplaints } from '../../components/ai/SimilarComplaints.jsx';
import { StatusTimeline } from '../../components/complaint/StatusTimeline.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { Modal } from '../../components/ui/Modal/Modal.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './OfficerClustersPage.css';

const LeafletMapPane = lazy(() => import('../../components/map/LeafletMapPane.jsx'));

class MapBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export default function OfficerClusterDetailPage() {
  const { clusterId, id } = useParams();
  const targetId = clusterId || id;
  const { state: authState } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeIds, setMergeIds] = useState([]);
  const [mergeReason, setMergeReason] = useState('');
  const [mergeError, setMergeError] = useState('');
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitGroups, setSplitGroups] = useState({});
  const [splitReason, setSplitReason] = useState('');
  const [splitError, setSplitError] = useState('');
  const [mapDown, setMapDown] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchCluster = useCallback(async () => {
    return api.clusters.get(targetId, { token: authState.token });
  }, [targetId, authState.token]);

  const {
    status,
    data: cluster,
    error,
    retry,
  } = useAsync(fetchCluster, { immediate: Boolean(targetId && authState.token) });

  const fetchMembers = useCallback(async () => {
    const [complaints, points] = await Promise.all([
      api.complaints.list({ token: authState.token, page: 1, pageSize: 100 }),
      api.geo.points({ token: authState.token, categoryId: undefined, page: 1, pageSize: 5000 }),
    ]);
    return { complaints, points };
  }, [authState.token]);

  const {
    data: reference,
  } = useAsync(fetchMembers, { immediate: Boolean(targetId && authState.token) });

  const fetchClusters = useCallback(async () => {
    return api.clusters.list({ token: authState.token, page: 1, pageSize: 100 });
  }, [authState.token]);

  const { data: clusterList } = useAsync(fetchClusters, {
    immediate: Boolean(targetId && authState.token),
  });

  const fetchDuplicates = useCallback(async () => {
    return api.duplicates.list({ token: authState.token, page: 1, pageSize: 100 });
  }, [authState.token]);

  const { data: duplicateData, retry: retryDuplicates } = useAsync(fetchDuplicates, {
    immediate: Boolean(targetId && authState.token),
  });

  const members = useMemo(() => {
    if (!cluster || !reference?.complaints) return [];
    const ids = new Set(cluster.complaintIds);
    return reference.complaints.items.filter((complaint) => ids.has(complaint.id));
  }, [cluster, reference]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.id)), [members]);

  const coords = useMemo(() => {
    if (!reference?.points) return [];
    const points = reference.points.items ?? [];
    return points
      .filter((point) => memberIds.has(point.complaintId))
      .map((point) => ({ lat: point.latitude, lng: point.longitude }))
      .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng));
  }, [reference, memberIds]);

  const centroid = useMemo(() => {
    if (!coords.length) return null;
    const lat = coords.reduce((sum, p) => sum + p.lat, 0) / coords.length;
    const lng = coords.reduce((sum, p) => sum + p.lng, 0) / coords.length;
    return { lat, lng };
  }, [coords]);

  const duplicateItems = useMemo(() => {
    const candidates = duplicateData?.items ?? [];
    return candidates
      .filter((c) => memberIds.has(c.complaintId) && memberIds.has(c.candidateComplaintId))
      .map((c) => ({
        id: c.id,
        complaintId: c.complaintId,
        similarity: c.score,
        status: c.state === 'confirmed' ? t('clusters.duplicateConfirmed') : undefined,
      }));
  }, [duplicateData, memberIds, t]);

  const otherClusters = useMemo(
    () => (clusterList?.items ?? []).filter((item) => item.id !== targetId),
    [clusterList, targetId],
  );

  function openMerge() {
    setMergeIds([]);
    setMergeReason('');
    setMergeError('');
    setMergeOpen(true);
  }

  function openSplit() {
    const initial = {};
    members.forEach((m) => {
      initial[m.id] = 'a';
    });
    setSplitGroups(initial);
    setSplitReason('');
    setSplitError('');
    setSplitOpen(true);
  }

  async function submitMerge() {
    if (mergeIds.length < 1) {
      setMergeError(t('clusters.mergeSelectError'));
      return;
    }
    if (mergeReason.trim().length < 10) {
      setMergeError(t('clusters.reasonError'));
      return;
    }
    setBusy(true);
    try {
      await api.clusters.merge(
        { clusterIds: [targetId, ...mergeIds], reason: mergeReason.trim(), token: authState.token },
      );
      setMergeOpen(false);
      toast(t('clusters.mergeSuccess'), 'success');
      retry();
    } catch (mergeErr) {
      setMergeError(mergeErr?.message || t('clusters.actionError'));
    } finally {
      setBusy(false);
    }
  }

  async function submitSplit() {
    const groupA = members.filter((m) => splitGroups[m.id] !== 'b').map((m) => m.id);
    const groupB = members.filter((m) => splitGroups[m.id] === 'b').map((m) => m.id);
    if (!groupA.length || !groupB.length) {
      setSplitError(t('clusters.splitPartitionError'));
      return;
    }
    if (splitReason.trim().length < 10) {
      setSplitError(t('clusters.reasonError'));
      return;
    }
    setBusy(true);
    try {
      await api.clusters.split(
        { id: targetId, groups: [groupA, groupB], reason: splitReason.trim(), token: authState.token },
      );
      setSplitOpen(false);
      toast(t('clusters.splitSuccess'), 'success');
      retry();
    } catch (splitErr) {
      setSplitError(splitErr?.message || t('clusters.actionError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleDuplicateConfirm(item) {
    try {
      await api.duplicates.confirm(item.complaintId, { candidateId: item.id, token: authState.token });
      toast(t('clusters.duplicateConfirmedToast'), 'success');
      retryDuplicates();
    } catch (dupErr) {
      toast(dupErr?.message || t('clusters.actionError'), 'error');
    }
  }

  async function handleDuplicateReject(item) {
    try {
      await api.duplicates.reject(
        item.complaintId,
        { candidateId: item.id, reason: t('clusters.duplicateRejectReason'), token: authState.token },
      );
      toast(t('clusters.duplicateRejectedToast'), 'info');
      retryDuplicates();
    } catch (dupErr) {
      toast(dupErr?.message || t('clusters.actionError'), 'error');
    }
  }

  if (status === 'error' || (status === 'success' && !cluster)) {
    if (error?.status === 403 || error?.statusCode === 403) {
      return (
        <div className="officer-clusters">
          <ErrorState title={t('clusters.forbiddenTitle')} message={t('clusters.forbiddenBody')} />
        </div>
      );
    }
    return (
      <div className="officer-clusters">
        <ErrorState
          title={t('clusters.errorTitle')}
          message={t('clusters.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === 'loading' || status === 'idle' || !cluster) {
    return (
      <div className="officer-clusters" aria-busy="true">
        <Skeleton width="40%" />
        <div className="officer-clusters__detail-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const timelineSteps = [
    { id: 'created', label: t('clusters.timelineCreated'), timestamp: cluster.createdAt, complete: true },
    ...(cluster.mergedClusterIds?.length
      ? [
          {
            id: 'merged',
            label: t('clusters.timelineMerged', { count: cluster.mergedClusterIds.length }),
            timestamp: cluster.updatedAt,
            complete: true,
          },
        ]
      : []),
    {
      id: 'updated',
      label: t('clusters.timelineUpdated'),
      timestamp: cluster.updatedAt,
      complete: true,
      current: true,
    },
  ];

  const mapFallback = (
    <div className="officer-clusters__map-fallback">
      <Icon name="map-pin" size={20} />
      <p>{t('clusters.mapFallback', { area: cluster.area || cluster.locality || '—' })}</p>
    </div>
  );

  return (
    <div className="officer-clusters">
      <div className="officer-clusters__top">
        <Link className="officer-clusters__back" to="/officer/clusters">
          <Icon name="arrow-left" size={16} flip />
          <span>{t('clusters.backToList')}</span>
        </Link>
      </div>

      <header className="officer-clusters__detail-header">
        <div className="officer-clusters__title-row">
          <h1 className="officer-clusters__detail-title">{cluster.title}</h1>
          <Badge tone="ai">
            <Icon name="sparkles" size={12} />
            <span>{t('ai.cluster.aiProposed')}</span>
          </Badge>
          {cluster.status ? <Badge tone="info">{cluster.status}</Badge> : null}
        </div>
        <p className="officer-clusters__detail-subtitle">
          {t('clusters.detailSubtitle', {
            title: cluster.title,
            area: cluster.area || cluster.locality || '—',
            count: cluster.reportCount ?? members.length,
          })}
        </p>
      </header>

      <div className="officer-clusters__detail-grid">
        <div className="officer-clusters__detail-main">
          <Card className="officer-clusters__members-card">
            <h2 className="officer-clusters__section-title">{t('clusters.membersTitle')}</h2>
            {members.length === 0 ? (
              <p className="officer-clusters__muted">{t('clusters.membersEmpty')}</p>
            ) : (
              <ul className="officer-clusters__member-list">
                {members.map((member) => (
                  <li key={member.id} className="officer-clusters__member">
                    <Link to={`/officer/complaints/${member.id}`} className="officer-clusters__member-link">
                      <strong>{member.id}</strong>
                      <span dir="auto">{member.originalText?.slice(0, 80) || member.category}</span>
                    </Link>
                    <Badge tone="neutral">{member.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="officer-clusters__duplicates-card">
            <SimilarComplaints
              items={duplicateItems}
              title={t('clusters.duplicatesTitle')}
              onConfirmDuplicate={handleDuplicateConfirm}
              onRejectDuplicate={handleDuplicateReject}
            />
          </Card>
        </div>

        <div className="officer-clusters__detail-aside">
          <Card className="officer-clusters__map-card">
            <h2 className="officer-clusters__section-title">{t('clusters.extentTitle')}</h2>
            {centroid && !mapDown ? (
              <MapBoundary fallback={mapFallback}>
                <Suspense fallback={<Skeleton height="12rem" />}>
                  <LeafletMapPane
                    lat={centroid.lat}
                    lng={centroid.lng}
                    onTileError={() => setMapDown(true)}
                    ariaLabel={t('clusters.extentTitle')}
                  />
                </Suspense>
              </MapBoundary>
            ) : (
              mapFallback
            )}
            <p className="officer-clusters__muted">
              {t('clusters.extentMeta', { count: coords.length, area: cluster.area || cluster.locality || '—' })}
            </p>
          </Card>

          <Card className="officer-clusters__timeline-card">
            <h2 className="officer-clusters__section-title">{t('clusters.timelineTitle')}</h2>
            <StatusTimeline steps={timelineSteps} />
          </Card>

          <Card className="officer-clusters__actions-card">
            <h2 className="officer-clusters__section-title">{t('clusters.actionsTitle')}</h2>
            <p className="officer-clusters__muted">{t('clusters.humanActionsNote')}</p>
            <div className="officer-clusters__action-buttons">
              <Button variant="secondary" size="sm" iconStart="layers" onClick={openMerge}>
                {t('clusters.merge')}
              </Button>
              <Button variant="secondary" size="sm" iconStart="layers" onClick={openSplit}>
                {t('clusters.split')}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={mergeOpen}
        onClose={() => setMergeOpen(false)}
        title={t('clusters.mergeTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMergeOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="cta" loading={busy} onClick={submitMerge}>
              {t('clusters.merge')}
            </Button>
          </>
        }
      >
        <div className="officer-clusters__modal-body">
          <p className="officer-clusters__muted">{t('clusters.mergeBody')}</p>
          <div className="officer-clusters__merge-list">
            {otherClusters.length === 0 ? (
              <p className="officer-clusters__muted">{t('clusters.mergeNone')}</p>
            ) : (
              otherClusters.map((item) => (
                <Checkbox
                  key={item.id}
                  id={`merge-${item.id}`}
                  label={`${item.title} · ${item.area || item.locality || ''} · ${item.reportCount ?? 0}`}
                  checked={mergeIds.includes(item.id)}
                  onChange={(event) =>
                    setMergeIds((prev) =>
                      event.target.checked
                        ? [...prev, item.id]
                        : prev.filter((cid) => cid !== item.id),
                    )
                  }
                />
              ))
            )}
          </div>
          <Textarea
            id="merge-reason"
            label={t('clusters.reasonLabel')}
            value={mergeReason}
            onChange={(event) => {
              setMergeReason(event.target.value);
              if (mergeError) setMergeError('');
            }}
            error={mergeError}
            rows={3}
            required
          />
        </div>
      </Modal>

      <Modal
        open={splitOpen}
        onClose={() => setSplitOpen(false)}
        title={t('clusters.splitTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSplitOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="cta" loading={busy} onClick={submitSplit}>
              {t('clusters.split')}
            </Button>
          </>
        }
      >
        <div className="officer-clusters__modal-body">
          <p className="officer-clusters__muted">{t('clusters.splitBody')}</p>
          <div className="officer-clusters__split-list">
            {members.map((member) => (
              <div key={member.id} className="officer-clusters__split-row">
                <span className="officer-clusters__split-id">{member.id}</span>
                <div className="officer-clusters__split-toggle">
                  <Checkbox
                    id={`split-a-${member.id}`}
                    label={t('clusters.groupA')}
                    checked={splitGroups[member.id] !== 'b'}
                    onChange={() => setSplitGroups((prev) => ({ ...prev, [member.id]: 'a' }))}
                  />
                  <Checkbox
                    id={`split-b-${member.id}`}
                    label={t('clusters.groupB')}
                    checked={splitGroups[member.id] === 'b'}
                    onChange={() => setSplitGroups((prev) => ({ ...prev, [member.id]: 'b' }))}
                  />
                </div>
              </div>
            ))}
          </div>
          <Textarea
            id="split-reason"
            label={t('clusters.reasonLabel')}
            value={splitReason}
            onChange={(event) => {
              setSplitReason(event.target.value);
              if (splitError) setSplitError('');
            }}
            error={splitError}
            rows={3}
            required
          />
        </div>
      </Modal>
    </div>
  );
}