import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { OtpInput } from '../../components/ui/OtpInput/OtpInput.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './AuthPages.css';

export default function VerifyPage() {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const target =
    location.state?.identifier ||
    location.state?.email ||
    'citizen@civiclens.pk';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(null);
  const [resendNotice, setResendNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);

  const timerRef = useRef(null);

  useEffect(() => {
    if (resendSeconds > 0) {
      timerRef.current = window.setTimeout(() => {
        setResendSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [resendSeconds]);

  function triggerShake() {
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault();
    if (code.length < 6 || submitting || success) return;

    setSubmitting(true);
    setError('');
    setErrorType(null);
    setResendNotice('');

    try {
      await api.auth.verifyCode({ email: target, code });
      setSuccess(true);
      window.setTimeout(() => {
        navigate('/citizen/dashboard', { replace: true });
      }, 1600);
    } catch (err) {
      const isExpired =
        err?.code === 'AUTH_CODE_EXPIRED' ||
        code === '000000' ||
        String(err?.message || '').toLowerCase().includes('expired');

      setErrorType(isExpired ? 'expired' : 'wrong');
      setError(
        isExpired
          ? t('authPages.verify.expiredCode')
          : t('authPages.verify.wrongCode'),
      );
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendSeconds > 0 || submitting || success) return;
    setError('');
    setErrorType(null);
    try {
      const result = await api.auth.resend({ email: target });
      const demoCode = result?.demoCode || '246810';
      setResendNotice(t('authPages.verify.resendSuccess', { code: demoCode }));
      setResendSeconds(60);
      setCode('');
    } catch {
      setError(t('authPages.verify.wrongCode'));
      triggerShake();
    }
  }

  async function handleSimulateExpired() {
    setError('');
    setErrorType(null);
    setResendNotice('');
    try {
      await api.auth.expireVerificationCode(target);
      setCode('000000');
    } catch {
      // ignore
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-success" role="status" aria-live="polite">
          <svg className="auth-checkmark" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="auth-checkmark__circle" cx="26" cy="26" r="23" />
            <path className="auth-checkmark__check" d="M14 27l7 7 17-17" />
          </svg>
          <h1 className="auth-success__title">{t('authPages.verify.successTitle')}</h1>
          <p className="auth-success__body">{t('authPages.verify.successBody')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`auth-page${shake ? ' anim-shake' : ''}`}>
      <header className="auth-page__header">
        <p>{t('authPages.verify.kicker')}</p>
        <h1>{t('authPages.verify.title')}</h1>
        <p>{t('authPages.verify.body', { target })}</p>
      </header>

      {error ? (
        <InlineAlert tone={errorType === 'expired' ? 'warning' : 'danger'}>
          {error}
        </InlineAlert>
      ) : null}

      {resendNotice ? (
        <InlineAlert tone="success">{resendNotice}</InlineAlert>
      ) : null}

      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <div className="auth-otp-wrap">
          <OtpInput
            id="verifyOtp"
            label={t('authPages.verify.codeLabel')}
            value={code}
            onChange={(val) => {
              setCode(val);
              if (error) {
                setError('');
                setErrorType(null);
              }
            }}
            length={6}
            disabled={submitting}
            error={error ? error : undefined}
          />
        </div>

        <div className="auth-resend-row">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendSeconds > 0 || submitting}
          >
            {resendSeconds > 0
              ? t('authPages.verify.resendIn', { seconds: String(resendSeconds) })
              : t('authPages.verify.resend')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSimulateExpired}
            disabled={submitting}
          >
            {t('authPages.verify.simulateExpired')}
          </Button>
        </div>

        <Button
          type="submit"
          variant="cta"
          fullWidth
          loading={submitting}
          disabled={code.length < 6}
        >
          {t('authPages.verify.submit')}
        </Button>
      </form>

      <aside className="auth-demo" aria-labelledby="auth-demo-otp-title">
        <div>
          <p>{t('authPages.login.demoLabel')}</p>
          <h2 id="auth-demo-otp-title">
            {t('authPages.verify.demoCodeHint', { code: '246810' })}
          </h2>
        </div>
      </aside>

      <p className="auth-page__switch">
        <Link to="/login">{t('authPages.verify.backToLogin')}</Link>
      </p>
    </div>
  );
}
