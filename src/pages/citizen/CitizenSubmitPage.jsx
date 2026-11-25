import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationPicker } from '../../components/map/LocationPicker.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox.jsx';
import { FileDrop } from '../../components/ui/FileDrop/FileDrop.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { EMERGENCY_NUMBERS } from '../../config/constants.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './CitizenSubmitPage.css';

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 2000;
const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const HOURLY_LIMIT = 10;
const ONE_HOUR_MS = 60 * 60 * 1000;

function rateLimitKey(userId) {
  return `civiclens-citizen-submissions:${userId || 'anon'}`;
}

function readRecentSubmissions(userId) {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(rateLimitKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - ONE_HOUR_MS;
    return Array.isArray(parsed) ? parsed.filter((ts) => Number.isFinite(ts) && ts > cutoff) : [];
  } catch {
    return [];
  }
}

function recordSubmission(userId) {
  if (typeof localStorage === 'undefined') return [];
  const next = [...readRecentSubmissions(userId), Date.now()];
  localStorage.setItem(rateLimitKey(userId), JSON.stringify(next));
  return next;
}

export default function CitizenSubmitPage() {
  const { user, state: authState } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [location, setLocation] = useState({
    mode: 'type',
    locality: '',
    lat: null,
    lng: null,
    accuracy: null,
    approximate: true,
  });
  const [extraInfo, setExtraInfo] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [files, setFiles] = useState([]);
  const [progressByFile, setProgressByFile] = useState({});
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recentSubmissions, setRecentSubmissions] = useState(() => readRecentSubmissions(user?.id));

  useEffect(() => {
    setRecentSubmissions(readRecentSubmissions(user?.id));
  }, [user?.id]);

  const emergencyText = useMemo(
    () =>
      EMERGENCY_NUMBERS.map((item) => `${t(item.labelKey)} ${item.number}`).join(' · '),
    [t],
  );

  const isRateLimited = recentSubmissions.length >= HOURLY_LIMIT;

  function handleFilesChange(nextFiles) {
    setFiles(nextFiles);
    setFileError('');
    setProgressByFile((prev) => {
      const next = {};
      for (const file of nextFiles) {
        next[file.name] = prev[file.name] ?? 25;
      }
      return next;
    });
    if (nextFiles.length > 0) {
      window.setTimeout(() => {
        setProgressByFile((prev) => {
          const completed = { ...prev };
          for (const file of nextFiles) {
            completed[file.name] = 100;
          }
          return completed;
        });
      }, 250);
    }
  }

  function validate() {
    const nextErrors = {};
    const trimmedText = text.trim();
    const trimmedLocation = (location.locality || '').trim();
    const hasCoords = Number.isFinite(location.lat) && Number.isFinite(location.lng);

    if (!trimmedText) {
      nextErrors.text = t('citizenSubmit.textRequiredError');
    } else if (trimmedText.length < MIN_TEXT_LENGTH) {
      nextErrors.text = t('citizenSubmit.textTooShortError');
    } else if (trimmedText.length > MAX_TEXT_LENGTH) {
      nextErrors.text = t('citizenSubmit.textTooLongError');
    }

    if (!trimmedLocation && !hasCoords) {
      nextErrors.location = t('citizenSubmit.locationRequiredError');
    }

    if (!acceptedTerms) {
      nextErrors.terms = t('citizenSubmit.termsRequiredError');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    if (isRateLimited) return;
    if (!validate()) return;

    const resolvedLocality =
      (location.locality || '').trim() ||
      (Number.isFinite(location.lat) && Number.isFinite(location.lng)
        ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
        : '');

    setSubmitting(true);
    try {
      const created = await api.complaints.create(
        {
          originalText: text.trim(),
          locality: resolvedLocality,
          location: {
            locality: resolvedLocality,
            lat: location.lat ?? null,
            lng: location.lng ?? null,
            accuracy: location.accuracy ?? null,
            approximate: Boolean(location.approximate),
            source: location.mode,
          },
          extraInfo: extraInfo.trim() || null,
          attachments: files.map((file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
          })),
        },
        { token: authState.token },
      );

      setRecentSubmissions(recordSubmission(user?.id));

      const isPendingAnalysis = created.status === 'Pending Analysis';
      if (isPendingAnalysis) {
        toast.info(t('citizenSubmit.pendingAnalysisNotice'));
      }

      navigate(`/citizen/submit/confirmation/${created.id}`, {
        state: {
          justSubmitted: true,
          pendingAnalysis: isPendingAnalysis,
          status: created.status,
          complaint: created,
        },
      });
    } catch (error) {
      setSubmitError({
        message: error?.message || t('citizenSubmit.submitErrorBody'),
        reference: error?.reference || '',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="citizen-submit">
      <header className="citizen-submit__header">
        <p className="citizen-submit__kicker">{t('citizenSubmit.kicker')}</p>
        <h1 className="citizen-submit__title">{t('citizenSubmit.title')}</h1>
        <p className="citizen-submit__subtitle">{t('citizenSubmit.subtitle')}</p>
      </header>

      <InlineAlert tone="danger" title={t('citizenSubmit.emergencyTitle')}>
        {t('citizenSubmit.emergencyBody', { numbers: emergencyText })}
      </InlineAlert>

      <div className="citizen-submit__ai-note">
        <Icon name="sparkles" size={18} />
        <span>{t('citizenSubmit.noCategoryNote')}</span>
      </div>

      {isRateLimited ? (
        <InlineAlert tone="warning" title={t('citizenSubmit.rateLimitTitle')}>
          {t('citizenSubmit.rateLimitBody')}
        </InlineAlert>
      ) : null}

      {submitError ? (
        <InlineAlert tone="danger" title={t('citizenSubmit.submitErrorTitle')}>
          <p className="citizen-submit__error-text">{submitError.message}</p>
          {submitError.reference ? (
            <p className="citizen-submit__error-ref">
              {t('ui.referenceCode')} <code>{submitError.reference}</code>
            </p>
          ) : null}
        </InlineAlert>
      ) : null}

      <Card className="citizen-submit__card">
        <form className="citizen-submit__form" onSubmit={handleSubmit} noValidate>
          <Textarea
            id="complaint-text"
            label={t('citizenSubmit.textLabel')}
            hint={t('citizenSubmit.textHint')}
            placeholder={t('citizenSubmit.textPlaceholder')}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (errors.text) setErrors((prev) => ({ ...prev, text: '' }));
            }}
            minLength={MIN_TEXT_LENGTH}
            maxLength={MAX_TEXT_LENGTH}
            showCount
            required
            dir="auto"
            rows={5}
            error={errors.text}
          />

          <LocationPicker
            id="complaint-location"
            label={t('citizenSubmit.locationLabel')}
            hint={t('citizenSubmit.locationHint')}
            value={location}
            onChange={(nextLocation) => {
              setLocation(nextLocation);
              if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
            }}
            required
            error={errors.location}
          />

          <FileDrop
            id="complaint-images"
            label={t('citizenSubmit.imagesLabel')}
            hint={t('citizenSubmit.imagesHint')}
            files={files}
            onFilesChange={handleFilesChange}
            onTypeError={() => setFileError(t('citizenSubmit.fileValidationError'))}
            onSizeError={() => setFileError(t('citizenSubmit.fileValidationError'))}
            acceptTypes={['image/jpeg', 'image/png']}
            maxFiles={MAX_FILES}
            maxSizeBytes={MAX_FILE_BYTES}
            progressByFile={progressByFile}
            error={fileError}
          />

          <Textarea
            id="complaint-extra"
            label={t('citizenSubmit.extraLabel')}
            hint={t('citizenSubmit.extraHint')}
            placeholder={t('citizenSubmit.extraPlaceholder')}
            value={extraInfo}
            onChange={(event) => setExtraInfo(event.target.value)}
            dir="auto"
            rows={3}
          />

          <Checkbox
            id="complaint-terms"
            label={t('citizenSubmit.termsLabel')}
            checked={acceptedTerms}
            onChange={(event) => {
              setAcceptedTerms(event.target.checked);
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
            }}
            required
            error={errors.terms}
          />

          <Button
            type="submit"
            variant="cta"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={isRateLimited}
            iconStart="plus"
          >
            {submitting ? t('citizenSubmit.submittingButton') : t('citizenSubmit.submitButton')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
