import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AIRecommendationCard } from '../../components/ai/AIRecommendationCard.jsx';
import { EntityChips } from '../../components/ai/EntityChips.jsx';
import { LowConfidenceReason } from '../../components/ai/LowConfidenceReason.jsx';
import { AttachmentGallery } from '../../components/complaint/AttachmentGallery.jsx';
import { ComplaintText } from '../../components/complaint/ComplaintText.jsx';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { LanguageBadge } from '../../components/complaint/LanguageBadge.jsx';
import { StatusBadge } from '../../components/complaint/StatusBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { ForbiddenPage } from '../../pages/shared/RouteStatusPage.jsx';
import { api } from '../../services/api.js';
import './OfficerComplaintDetailPage.css';

const CATEGORY_THRESHOLD = 0.7;
const URGENCY_THRESHOLD = 0.7;
const DEPARTMENT_THRESHOLD = 0.75;

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

export default function OfficerComplaintDetailPage() {
  const { complaintId, id } = useParams();
  const targetId = complaintId || id;
  const { state: authState } = useAuth();
  const { t, formatDate } = useI18n();
  const { toast } = useToast();

  const [analysis, setAnalysis] = useState(null);
  const [confirmedFields, setConfirmedFields] = useState({});

  const fetchComplaint = useCallback(async () => {
    return api.complaints.get(targetId, { token: authState.token });
  }, [targetId, authState.token]);

  const { status, data: complaint, error, retry } = useAsync(fetchComplaint, {
    immediate: Boolean(targetId && authState.token),
  });

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
      await api.reviewComplaint(
        {
          complaintId: complaint.id,
          token: authState.token,
          field,
          aiValue: data.aiValue,
          humanValue: data.newValue,
          reason: data.reason,
        },
      );
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
        </div>
      </div>
    );
  }

  const languageKey = mapLanguageKey(analysis?.language?.label ?? complaint.language);
  const languageConfidence = analysis?.language?.confidence ?? analysis?.language_confidence ?? null;

  const categoryValue = categoryName(analysis?.category?.label ?? complaint.categoryId);
  const urgencyValue = t(`complaintUrgency.${analysis?.urgency?.label ?? 'medium'}`);
  const departmentValue = departmentName(
    analysis?.department?.label ?? complaint.departmentId,
  );

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

  const modelVersion = analysis?.model_versions?.classifier ?? complaint.aiAnalysis?.modelVersions?.classifier;
  const explanation = analysis?.explanation
    ? [analysis.explanation]
    : [t('officerComplaint.noIndicators')];

  const attachments = (complaint.attachments ?? complaint.media ?? []).map((att, index) => ({
    src: att.src || att.url || '',
    alt: att.name || t('complaintGallery.attachment', { number: index + 1 }),
  }));

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
      </div>
    </div>
  );
}