import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { InlineLoader } from '../../components/ui/InlineLoader/InlineLoader.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput/PasswordInput.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './AuthPages.css';

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = params.token || searchParams.get('token') || '';

  const [tokenStatus, setTokenStatus] = useState('checking'); // 'checking' | 'valid' | 'expired' | 'already-used' | 'invalid'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const rules = [
    { id: 'length', met: newPassword.length >= 8 },
    { id: 'case', met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { id: 'number', met: /\d/.test(newPassword) },
    { id: 'symbol', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];
  const passwordValid = rules.every((rule) => rule.met);

  useEffect(() => {
    let active = true;

    async function checkToken() {
      if (!token) {
        if (active) setTokenStatus('invalid');
        return;
      }

      setTokenStatus('checking');
      try {
        const result = await api.auth.verifyResetToken(token);
        if (!active) return;
        if (result.status === 'valid') {
          setTokenStatus('valid');
        } else if (result.status === 'already-used') {
          setTokenStatus('already-used');
        } else if (result.status === 'expired') {
          setTokenStatus('expired');
        } else {
          setTokenStatus('invalid');
        }
      } catch {
        if (active) setTokenStatus('invalid');
      }
    }

    checkToken();
    return () => {
      active = false;
    };
  }, [token]);

  function triggerShake() {
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
  }

  function validate() {
    const nextErrors = {};
    if (!passwordValid) {
      nextErrors.password = t('authPages.register.errors.password');
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = t('authPages.resetPassword.passwordMismatch');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    if (!validate()) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    try {
      await api.auth.reset({ token, password: newPassword });
      setSuccess(true);
      // Mark token status to prevent reuse on back/re-submission
      setTokenStatus('already-used');
    } catch (err) {
      if (err?.code === 'AUTH_RESET_TOKEN_ALREADY_USED') {
        setTokenStatus('already-used');
      } else if (err?.code === 'AUTH_RESET_TOKEN_EXPIRED') {
        setTokenStatus('expired');
      } else {
        setSubmitError(t('authPages.login.genericError'));
        triggerShake();
      }
    } finally {
      setSubmitting(false);
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
          <h1 className="auth-success__title">{t('authPages.resetPassword.successTitle')}</h1>
          <p className="auth-success__body">{t('authPages.resetPassword.successBody')}</p>
          <Button
            type="button"
            variant="cta"
            onClick={() => navigate('/login', { replace: true })}
          >
            {t('authPages.resetPassword.goToLogin')}
          </Button>
        </div>
      </div>
    );
  }

  if (tokenStatus === 'checking') {
    return (
      <div className="auth-page" style={{ textAlign: 'center', paddingBlock: 'var(--space-8)' }}>
        <InlineLoader />
      </div>
    );
  }

  if (tokenStatus === 'expired') {
    return (
      <div className="auth-page">
        <header className="auth-page__header">
          <p>{t('authPages.resetPassword.kicker')}</p>
          <h1>{t('authPages.resetPassword.expiredTitle')}</h1>
        </header>

        <InlineAlert tone="warning" title={t('authPages.resetPassword.expiredTitle')}>
          {t('authPages.resetPassword.expiredBody')}
        </InlineAlert>

        <div className="auth-page__form">
          <Button
            type="button"
            variant="cta"
            fullWidth
            onClick={() => navigate('/forgot-password')}
          >
            {t('authPages.resetPassword.requestNew')}
          </Button>
        </div>

        <p className="auth-page__switch">
          <Link to="/login">{t('authPages.forgotPassword.backToLogin')}</Link>
        </p>
      </div>
    );
  }

  if (tokenStatus === 'already-used') {
    return (
      <div className="auth-page">
        <header className="auth-page__header">
          <p>{t('authPages.resetPassword.kicker')}</p>
          <h1>{t('authPages.resetPassword.alreadyUsedTitle')}</h1>
        </header>

        <InlineAlert tone="warning" title={t('authPages.resetPassword.alreadyUsedTitle')}>
          {t('authPages.resetPassword.alreadyUsedBody')}
        </InlineAlert>

        <div className="auth-page__form">
          <Button
            type="button"
            variant="cta"
            fullWidth
            onClick={() => navigate('/forgot-password')}
          >
            {t('authPages.resetPassword.requestNew')}
          </Button>
        </div>

        <p className="auth-page__switch">
          <Link to="/login">{t('authPages.forgotPassword.backToLogin')}</Link>
        </p>
      </div>
    );
  }

  if (tokenStatus === 'invalid') {
    return (
      <div className="auth-page">
        <header className="auth-page__header">
          <p>{t('authPages.resetPassword.kicker')}</p>
          <h1>{t('authPages.resetPassword.invalidTitle')}</h1>
        </header>

        <InlineAlert tone="danger" title={t('authPages.resetPassword.invalidTitle')}>
          {t('authPages.resetPassword.invalidBody')}
        </InlineAlert>

        <div className="auth-page__form">
          <Button
            type="button"
            variant="cta"
            fullWidth
            onClick={() => navigate('/forgot-password')}
          >
            {t('authPages.resetPassword.requestNew')}
          </Button>
        </div>

        <p className="auth-page__switch">
          <Link to="/login">{t('authPages.forgotPassword.backToLogin')}</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={`auth-page${shake ? ' anim-shake' : ''}`}>
      <header className="auth-page__header">
        <p>{t('authPages.resetPassword.kicker')}</p>
        <h1>{t('authPages.resetPassword.title')}</h1>
        <p>{t('authPages.resetPassword.body')}</p>
      </header>

      <div className="auth-token-notice">
        <span>⏱</span>
        <span>{t('authPages.resetPassword.tokenNotice')}</span>
      </div>

      {submitError ? <InlineAlert tone="danger">{submitError}</InlineAlert> : null}

      <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
        <PasswordInput
          id="newPassword"
          label={t('authPages.resetPassword.password')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.password}
          required
          autoComplete="new-password"
          disabled={submitting}
        />

        <ul className="auth-password-rules" aria-label={t('authPages.resetPassword.rulesLabel')}>
          {rules.map((rule) => (
            <li className={rule.met ? 'is-met' : ''} key={rule.id}>
              {t(`authPages.resetPassword.rules.${rule.id}`)}
            </li>
          ))}
        </ul>

        <PasswordInput
          id="confirmPassword"
          label={t('authPages.resetPassword.confirmPassword')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          showStrength={false}
          required
          autoComplete="new-password"
          disabled={submitting}
        />

        <Button type="submit" variant="cta" fullWidth loading={submitting}>
          {t('authPages.resetPassword.submit')}
        </Button>
      </form>

      <p className="auth-page__switch">
        <Link to="/login">{t('authPages.forgotPassword.backToLogin')}</Link>
      </p>
    </div>
  );
}
