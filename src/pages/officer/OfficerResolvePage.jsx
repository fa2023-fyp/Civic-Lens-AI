import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DemoDataBadge } from '../../components/complaint/DemoDataBadge.jsx';
import { ResolutionCard } from '../../components/complaint/ResolutionCard.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { FileDrop } from '../../components/ui/FileDrop/FileDrop.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { ForbiddenPage } from '../../pages/shared/RouteStatusPage.jsx';
import { api } from '../../services/api.js';
import './OfficerResolvePage.css';

const LeafletMapPane = lazy(() => import('../../components/map/LeafletMapPane.jsx'));

const MIN_DESCRIPTION = 10;
const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const RESOLVABLE_STATUSES = new Set(['Assigned', 'In Progress', 'Reopened', 'Escalated']);
const RELEVANCE_ESTIMATE = 0.4;

function toLocalInputValue(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function OfficerResolvePage() {
  const { complaintId, id } = useParams();
  const targetId = complaintId || id;
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { t, formatNumber } = useI18n();
  const { toast } = useToast();

  const [description, setDescription] = useState('');
  const [actionPerformed, setActionPerformed] = useState('');
  const [completionAt, setCompletionAt] = useState(() => toLocalInputValue(new Date()));
  const [beforeFiles, setBeforeFiles] = useState([]);
  const [afterFiles, setAfterFiles] = useState([]);
  const [relevanceEnabled, setRelevanceEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaint = useCallback(async () => {
    return api.complaints.get(targetId, { token: authState.token });
  }, [targetId, authState.token]);

  const { status, data: complaint, error, retry } = useAsync(fetchComplaint, {
    immediate: Boolean(targetId && authState.token),
  });

  const evidenceCount = beforeFiles.length + afterFiles.length;

  const previewEvidence = useMemo(
    () =>
      [...beforeFiles, ...afterFiles].map((file) => ({
        title: file.name,
      })),
    [beforeFiles, afterFiles],
  );

  function validate() {
    const nextErrors = {};
    if (description.trim().length < MIN_DESCRIPTION) {
      nextErrors.description = t('officerResolve.descriptionError');
    }
    if (evidenceCount === 0) {
      nextErrors.evidence = t('officerResolve.evidenceError');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.submitResolution(
        {
          complaintId: complaint.id,
          description: description.trim(),
          actionTaken: actionPerformed.trim(),
          beforeMedia: beforeFiles.map((file) => ({ name: file.name, type: file.type, size: file.size })),
          afterMedia: afterFiles.map((file) => ({ name: file.name, type: file.type, size: file.size })),
        },
        { token: authState.token },
      );
      toast(t('officerResolve.submitSuccess'), 'success');
      navigate(`/officer/complaints/${complaint.id}`);
    } catch (submitErr) {
      setSubmitError({
        message: submitErr?.message || t('officerResolve.submitErrorBody'),
        reference: submitErr?.reference || '',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (status === 'error' || (status === 'success' && !complaint)) {
    if (error?.status === 403 || error?.statusCode === 403) {
      return <ForbiddenPage />;
    }
    return (
      <div className="officer-resolve">
        <ErrorState
          title={t('officerResolve.errorTitle')}
          message={t('officerResolve.errorText')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  if (status === 'loading' || status === 'idle' || !complaint) {
    return (
      <div className="officer-resolve" aria-busy="true">
        <Skeleton width="40%" />
        <Card aria-busy="true">
          <Skeleton height="3rem" />
          <Skeleton height="6rem" />
          <Skeleton height="8rem" />
        </Card>
      </div>
    );
  }

  const hasCoords =
    Number.isFinite(complaint.location?.lat) && Number.isFinite(complaint.location?.lng);
  const locationText =
    complaint.location?.locality || complaint.locality || t('officerResolve.locationUnknown');
  const canSubmit = RESOLVABLE_STATUSES.has(complaint.status);

  return (
    <div className="officer-resolve">
      <div className="officer-resolve__top">
        <Link className="officer-resolve__back" to={`/officer/complaints/${complaint.id}`}>
          <Icon name="arrow-left" size={16} flip />
          <span>{t('officerResolve.backToComplaint')}</span>
        </Link>
      </div>

      <header className="officer-resolve__header">
        <p className="officer-resolve__kicker">{t('officerResolve.kicker')}</p>
        <h1 className="officer-resolve__title">{t('officerResolve.title')}</h1>
        <p className="officer-resolve__subtitle">
          {t('officerResolve.subtitle', { id: complaint.id })}
        </p>
      </header>

      {!canSubmit ? (
        <InlineAlert tone="warning" title={t('officerResolve.notReadyTitle')}>
          {t('officerResolve.notReadyBody')}
        </InlineAlert>
      ) : null}

      {submitError ? (
        <InlineAlert tone="danger" title={t('officerResolve.submitErrorTitle')}>
          <p className="officer-resolve__error-text">{submitError.message}</p>
          {submitError.reference ? (
            <p className="officer-resolve__error-ref">
              {t('ui.referenceCode')} <code>{submitError.reference}</code>
            </p>
          ) : null}
        </InlineAlert>
      ) : null}

      <div className="officer-resolve__grid">
        <Card className="officer-resolve__form-card">
          <form className="officer-resolve__form" onSubmit={handleSubmit} noValidate>
            <Textarea
              id="resolve-description"
              label={t('officerResolve.descriptionLabel')}
              hint={t('officerResolve.descriptionHint')}
              placeholder={t('officerResolve.descriptionPlaceholder')}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              minLength={MIN_DESCRIPTION}
              showCount
              required
              dir="auto"
              rows={4}
              error={errors.description}
            />

            <Textarea
              id="resolve-action"
              label={t('officerResolve.actionLabel')}
              placeholder={t('officerResolve.actionPlaceholder')}
              value={actionPerformed}
              onChange={(event) => setActionPerformed(event.target.value)}
              dir="auto"
              rows={2}
            />

            <Input
              id="resolve-completion"
              type="datetime-local"
              label={t('officerResolve.completionLabel')}
              value={completionAt}
              onChange={(event) => setCompletionAt(event.target.value)}
            />

            <fieldset className="officer-resolve__evidence">
              <legend className="officer-resolve__evidence-legend">
                {t('officerResolve.evidenceLegend')}
              </legend>
              <p className="officer-resolve__evidence-hint">{t('officerResolve.evidenceHint')}</p>
              <FileDrop
                id="resolve-before"
                label={t('officerResolve.beforeLabel')}
                files={beforeFiles}
                onFilesChange={setBeforeFiles}
                acceptTypes={['image/jpeg', 'image/png']}
                maxFiles={MAX_FILES}
                maxSizeBytes={MAX_FILE_BYTES}
              />
              <FileDrop
                id="resolve-after"
                label={t('officerResolve.afterLabel')}
                files={afterFiles}
                onFilesChange={setAfterFiles}
                acceptTypes={['image/jpeg', 'image/png']}
                maxFiles={MAX_FILES}
                maxSizeBytes={MAX_FILE_BYTES}
              />
              {errors.evidence ? (
                <p className="officer-resolve__field-error" role="alert">
                  {errors.evidence}
                </p>
              ) : null}
            </fieldset>

            <Checkbox
              id="resolve-relevance"
              label={t('officerResolve.relevanceToggle')}
              checked={relevanceEnabled}
              onChange={(event) => setRelevanceEnabled(event.target.checked)}
            />

            {relevanceEnabled ? (
              <InlineAlert tone="info" title={t('officerResolve.relevanceTitle')}>
                <div className="officer-resolve__relevance">
                  <DemoDataBadge>{t('preview.demoBadge')}</DemoDataBadge>
                  <span>
                    {t('officerResolve.relevanceEstimate', {
                      value: formatNumber(RELEVANCE_ESTIMATE, {
                        style: 'percent',
                        maximumFractionDigits: 0,
                      }),
                    })}
                  </span>
                </div>
                <p className="officer-resolve__relevance-caveat">
                  {t('officerResolve.relevanceCaveat')}
                </p>
              </InlineAlert>
            ) : null}

            <div className="officer-resolve__actions">
              <Button
                as={Link}
                to={`/officer/complaints/${complaint.id}`}
                variant="secondary"
                size="md"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="cta"
                size="lg"
                loading={submitting}
                disabled={!canSubmit}
                iconStart="check"
              >
                {t('officerResolve.submitButton')}
              </Button>
            </div>
          </form>
        </Card>

        <div className="officer-resolve__aside">
          <Card className="officer-resolve__location-card">
            <h2 className="officer-resolve__section-title">{t('officerResolve.locationLabel')}</h2>
            <p className="officer-resolve__location-text" dir="auto">
              {locationText}
            </p>
            {hasCoords ? (
              <Suspense fallback={<Skeleton height="10rem" />}>
                <LeafletMapPane
                  lat={complaint.location.lat}
                  lng={complaint.location.lng}
                  ariaLabel={t('officerResolve.locationLabel')}
                />
              </Suspense>
            ) : null}
          </Card>

          <Card className="officer-resolve__preview-card">
            <h2 className="officer-resolve__section-title">{t('officerResolve.previewTitle')}</h2>
            <p className="officer-resolve__preview-subtitle">{t('officerResolve.previewSubtitle')}</p>
            {description.trim() || previewEvidence.length || actionPerformed.trim() ? (
              <ResolutionCard
                description={description.trim()}
                actionsPerformed={actionPerformed.trim() ? [actionPerformed.trim()] : []}
                evidence={previewEvidence}
                timestamp={completionAt ? new Date(completionAt).toISOString() : null}
              />
            ) : (
              <p className="officer-resolve__preview-empty">{t('officerResolve.previewEmpty')}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}