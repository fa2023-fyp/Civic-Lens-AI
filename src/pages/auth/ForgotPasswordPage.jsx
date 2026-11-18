import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { api } from '../../services/api.js';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState('citizen@civiclens.pk');
  const [submitting, setSubmitting] = useState(false);
  const [issuedToken, setIssuedToken] = useState(null);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function triggerShake() {
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!identifier.trim()) {
      setError(t('authPages.register.errors.identifier'));
      triggerShake();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await api.auth.forgot({ email: identifier.trim() });
      setIssuedToken(response?.resetToken || 'demo-reset-token-valid');
    } catch {
      setError(t('authPages.login.genericError'));
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`auth-page${shake ? ' anim-shake' : ''}`}>
      <header className="auth-page__header">
        <p>{t('authPages.forgotPassword.kicker')}</p>
        <h1>{t('authPages.forgotPassword.title')}</h1>
        <p>{t('authPages.forgotPassword.body')}</p>
      </header>

      {error ? <InlineAlert tone="danger">{error}</InlineAlert> : null}

      {issuedToken ? (
        <div className="auth-page__form">
          <InlineAlert tone="success" title={t('authPages.forgotPassword.successTitle')}>
            {t('authPages.forgotPassword.successBody')}
          </InlineAlert>

          <aside className="auth-demo" aria-labelledby="auth-demo-token-title">
            <div>
              <p>{t('authPages.login.demoLabel')}</p>
              <h2 id="auth-demo-token-title">
                {t('authPages.forgotPassword.demoLink')}
              </h2>
            </div>
            <div className="auth-demo-links">
              <div>
                <Link to={`/reset-password/${issuedToken}`}>
                  {t('authPages.forgotPassword.openResetLink')}
                </Link>
              </div>
              <div>
                <Link to="/reset-password/expired-token-demo">
                  {t('authPages.forgotPassword.testExpiredLink')}
                </Link>
              </div>
              <div>
                <Link to="/reset-password/used-token-demo">
                  {t('authPages.forgotPassword.testUsedLink')}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          <Input
            id="forgotIdentifier"
            label={t('authPages.forgotPassword.identifier')}
            placeholder={t('authPages.forgotPassword.identifierPlaceholder')}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            disabled={submitting}
          />

          <Button type="submit" variant="cta" fullWidth loading={submitting}>
            {t('authPages.forgotPassword.submit')}
          </Button>
        </form>
      )}

      <aside className="auth-demo" aria-labelledby="auth-demo-shortcuts-title">
        <div>
          <p>{t('authPages.login.demoLabel')}</p>
          <h2 id="auth-demo-shortcuts-title">
            {t('authPages.forgotPassword.testExpiredLink')} / {t('authPages.forgotPassword.testUsedLink')}
          </h2>
        </div>
        <div className="auth-demo-links">
          <div>
            <Link to="/reset-password/demo-reset-token-valid">
              {t('authPages.forgotPassword.openResetLink')} (Valid 30 min)
            </Link>
          </div>
          <div>
            <Link to="/reset-password/expired-token-demo">
              {t('authPages.forgotPassword.testExpiredLink')}
            </Link>
          </div>
          <div>
            <Link to="/reset-password/used-token-demo">
              {t('authPages.forgotPassword.testUsedLink')}
            </Link>
          </div>
        </div>
      </aside>

      <p className="auth-page__switch">
        <Link to="/login">{t('authPages.forgotPassword.backToLogin')}</Link>
      </p>
    </div>
  );
}
