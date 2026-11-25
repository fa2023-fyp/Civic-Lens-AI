import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { PipelineProgress } from '../../components/ai/PipelineProgress.jsx';
import { ComplaintText } from '../../components/complaint/ComplaintText.jsx';
import { LanguageBadge } from '../../components/complaint/LanguageBadge.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './CitizenConfirmationPage.css';

function mapLanguageKey(code) {
  const normalized = String(code || '').toLowerCase();
  if (normalized === 'en' || normalized === 'english') return 'english';
  if (normalized === 'urdu') return 'urdu';
  if (normalized === 'roman_urdu' || normalized === 'roman-urdu') return 'roman-urdu';
  if (normalized === 'mixed') return 'mixed';
  return 'unknown';
}

export default function CitizenConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const { state: authState } = useAuth();
  const { t } = useI18n();
  const { copied, copy } = useCopyToClipboard();

  const initialComplaint = location.state?.complaint ?? null;
  const [analysisResult, setAnalysisResult] = useState(initialComplaint?.aiAnalysis ?? null);
  const [pipelineSettled, setPipelineSettled] = useState(false);

  const fetchComplaint = useCallback(async () => {
    return api.complaints.get(id, { token: authState.token });
  }, [id, authState.token]);

  const { status, data, error, retry } = useAsync(fetchComplaint, {
    immediate: Boolean(id && authState.token),
    initialData: initialComplaint,
  });

  const complaint = data ?? initialComplaint;
  const isPendingAnalysis = complaint?.status === 'Pending Analysis';

  useEffect(() => {
    if (!complaint || isPendingAnalysis || analysisResult) return undefined;
    if (complaint.aiAnalysis) {
      setAnalysisResult(complaint.aiAnalysis);
      return undefined;
    }

    let cancelled = false;
    api.ai
      .analyze(complaint.originalText, { locality: complaint.locality })
      .then((result) => {
        if (!cancelled) setAnalysisResult(result);
      })
      .catch(() => {
        if (!cancelled) {
          setAnalysisResult({
            language: { label: complaint.language || 'unknown' },
            category: { label: complaint.category || 'other' },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [complaint, isPendingAnalysis, analysisResult]);

  useEffect(() => {
    if (!isPendingAnalysis || !id || !authState.token) return undefined;

    const interval = window.setInterval(async () => {
      try {
        const latest = await api.complaints.get(id, { token: authState.token });
        if (latest.status !== 'Pending Analysis') {
          if (latest.aiAnalysis) setAnalysisResult(latest.aiAnalysis);
          retry();
        }
      } catch {
        // Keep polling silently while awaiting AI recovery.
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isPendingAnalysis, id, authState.token, retry]);

  const isLoading = status === 'loading' && !complaint;

  if (status === 'error' && !complaint) {
    return (
      <div className="citizen-confirm">
        <ErrorState
          title={t('citizenConfirm.loadErrorTitle')}
          message={t('citizenConfirm.loadErrorBody')}
          referenceCode={error?.reference}
          onRetry={retry}
        />
      </div>
    );
  }

  const detectedLanguage = mapLanguageKey(
    analysisResult?.language?.label ?? analysisResult?.language ?? complaint?.language,
  );
  const languageConfidence = analysisResult?.language?.confidence;
  const suggestedCategory =
    analysisResult?.category?.label ??
    complaint?.category ??
    complaint?.categoryId ??
    'other';

  const showResults = !isPendingAnalysis && pipelineSettled && Boolean(analysisResult);

  return (
    <div className="citizen-confirm">
      <header className="citizen-confirm__hero">
        <div className="citizen-confirm__check-wrap" aria-hidden="true">
          <svg className="citizen-confirm__check-svg" viewBox="0 0 52 52">
            <circle className="citizen-confirm__check-circle" cx="26" cy="26" r="23" />
            <path className="citizen-confirm__check-mark" d="M15 27l7 7 15-15" />
          </svg>
        </div>
        <p className="citizen-confirm__kicker">{t('citizenConfirm.kicker')}</p>
        <h1 className="citizen-confirm__title">{t('citizenConfirm.title')}</h1>
        <p className="citizen-confirm__subtitle">{t('citizenConfirm.subtitle')}</p>
      </header>

      {isLoading ? (
        <SkeletonCard />
      ) : (
        <Card className="citizen-confirm__id-card">
          <div className="citizen-confirm__id-row">
            <div>
              <span className="citizen-confirm__id-label">{t('citizenConfirm.referenceLabel')}</span>
              <strong className="citizen-confirm__id-value">{complaint?.id || id}</strong>
            </div>
            <Button
              variant="secondary"
              size="sm"
              iconStart={copied ? 'check' : 'file'}
              onClick={() => copy(complaint?.id || id)}
            >
              {copied ? t('citizenConfirm.copiedId') : t('citizenConfirm.copyId')}
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card aria-busy="true">
          <Skeleton width="35%" />
          <Skeleton height="4rem" />
        </Card>
      ) : (
        <ComplaintText originalText={complaint?.originalText || ''} />
      )}

      <section className="citizen-confirm__analysis" aria-labelledby="confirm-analysis-heading">
        <h2 id="confirm-analysis-heading" className="citizen-confirm__section-title">
          {t('citizenConfirm.analysisTitle')}
        </h2>

        {isPendingAnalysis ? (
          <div className="citizen-confirm__pending">
            <InlineAlert tone="info" title={t('citizenConfirm.pendingTitle')}>
              {t('citizenConfirm.pendingBody')}
            </InlineAlert>
            <PipelineProgress status="pending" autoAnimate={false} />
          </div>
        ) : (
          <div className="citizen-confirm__pipeline">
            <PipelineProgress
              status={pipelineSettled ? 'settled' : 'running'}
              autoAnimate
              stepDuration={350}
              onComplete={() => setPipelineSettled(true)}
            />

            {showResults ? (
              <Card className="citizen-confirm__results anim-fade-in">
                <div className="citizen-confirm__result-row">
                  <span className="citizen-confirm__result-label">
                    {t('citizenConfirm.detectedLanguage')}
                  </span>
                  <LanguageBadge language={detectedLanguage} confidence={languageConfidence} />
                </div>

                <div className="citizen-confirm__result-row">
                  <div className="citizen-confirm__category-label">
                    <span className="citizen-confirm__result-label">
                      {t('citizenConfirm.suggestedCategory')}
                    </span>
                    <Badge tone="ai">{t('citizenConfirm.informationalLabel')}</Badge>
                  </div>
                  <strong className="citizen-confirm__category-value">{suggestedCategory}</strong>
                </div>

                <p className="citizen-confirm__info-hint">{t('citizenConfirm.informationalHint')}</p>
              </Card>
            ) : null}
          </div>
        )}
      </section>

      <Card className="citizen-confirm__steps-card">
        <h2 className="citizen-confirm__section-title">{t('citizenConfirm.nextStepsTitle')}</h2>
        <ol className="citizen-confirm__steps">
          <li>{t('citizenConfirm.step1')}</li>
          <li>{t('citizenConfirm.step2')}</li>
          <li>{t('citizenConfirm.step3')}</li>
        </ol>
      </Card>

      <div className="citizen-confirm__actions">
        <Button
          as={Link}
          to={`/citizen/complaints/${complaint?.id || id}`}
          variant="cta"
          size="lg"
          fullWidth
          iconEnd="chevron-right"
        >
          {t('citizenConfirm.trackButton')}
        </Button>
        <Button
          as={Link}
          to="/citizen"
          variant="secondary"
          size="md"
          fullWidth
          iconStart="arrow-left"
        >
          {t('citizenConfirm.backHome')}
        </Button>
      </div>
    </div>
  );
}
