import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput/PasswordInput.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useCountdown } from '../../hooks/useCountdown.js';
import { api } from '../../services/api.js';
import './AuthPages.css';

const dashboardByRole = {
  citizen: '/citizen/dashboard',
  officer: '/officer/dashboard',
  supervisor: '/supervisor/dashboard',
  admin: '/admin/dashboard',
};

export default function LoginPage() {
  const { t, setLanguage } = useI18n();
  const { login, expireSession } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguageValue] = useState(document.documentElement.lang === 'ur' ? 'ur' : 'en');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const countdown = useCountdown(lockUntil ?? new Date(Date.now() + 24 * 60 * 60 * 1000));

  useEffect(() => {
    if (lockUntil && countdown.isComplete) {
      setLockUntil(null);
      setFailedAttempts(0);
    }
  }, [countdown.isComplete, lockUntil]);

  function triggerError(message) {
    setError(message);
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
  }

  async function submit(event) {
    event.preventDefault();
    if (lockUntil) return;
    setSubmitting(true);
    setError('');
    try {
      const user = await login({ email: identifier.trim(), password });
      setFailedAttempts(0);
      navigate(dashboardByRole[user.role], { replace: true });
    } catch {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockUntil(Date.now() + 15 * 60 * 1000);
        setError('');
      } else {
        triggerError(t('authPages.login.genericError'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function demoSignIn(account) {
    if (lockUntil) return;
    setSubmitting(true);
    setError('');
    try {
      await login({ email: account.email, password: account.password });
      navigate(dashboardByRole[account.role], { replace: true });
    } catch {
      triggerError(t('authPages.login.genericError'));
    } finally {
      setSubmitting(false);
    }
  }

  function changeLanguage(value) {
    setLanguageValue(value);
    setLanguage(value);
  }

  const demoRoles = ['citizen', 'officer', 'supervisor', 'admin'];
  const demoAccounts = demoRoles.map((role) => ({
    role,
    account: api.demoUsers.find((user) => user.role === role),
  })).filter(({ account }) => Boolean(account));

  return (
    <div className={`auth-page${shake ? ' anim-shake' : ''}`}>
      <header className="auth-page__header">
        <p>{t('authPages.login.kicker')}</p>
        <h1>{t('authPages.login.title')}</h1>
        <p>{t('authPages.login.body')}</p>
      </header>

      {lockUntil ? (
        <InlineAlert tone="warning" title={t('authPages.login.lockoutTitle')}>
          {t('authPages.login.lockoutBody', {
            minutes: String(countdown.minutes).padStart(2, '0'),
            seconds: String(countdown.seconds).padStart(2, '0'),
          })}
        </InlineAlert>
      ) : error ? (
        <InlineAlert tone="danger">{error}</InlineAlert>
      ) : null}

      <form className="auth-page__form" onSubmit={submit} noValidate>
        <Input
          id="loginIdentifier"
          label={t('authPages.login.identifier')}
          placeholder={t('authPages.login.identifierPlaceholder')}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
          autoComplete="username"
          disabled={Boolean(lockUntil)}
        />
        <PasswordInput
          id="loginPassword"
          label={t('authPages.login.password')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          showStrength={false}
          required
          autoComplete="current-password"
          disabled={Boolean(lockUntil)}
        />
        <Select
          id="loginLanguage"
          label={t('authPages.login.language')}
          value={language}
          onChange={(event) => changeLanguage(event.target.value)}
          options={[
            { value: 'en', label: t('authPages.languageEnglish') },
            { value: 'ur', label: t('authPages.languageUrdu') },
          ]}
        />
        <div className="auth-page__forgot">
          <Link to="/forgot-password">{t('authPages.login.forgot')}</Link>
        </div>
        <Button
          type="submit"
          variant="cta"
          fullWidth
          loading={submitting}
          disabled={Boolean(lockUntil)}
        >
          {t('authPages.login.submit')}
        </Button>
      </form>

      <aside className="auth-demo" aria-labelledby="auth-demo-title">
        <div>
          <p>{t('authPages.login.demoLabel')}</p>
          <h2 id="auth-demo-title">{t('authPages.login.demoTitle')}</h2>
        </div>
        <div className="auth-demo__accounts">
          {demoAccounts.map(({ role, account }) => (
            <Button
              key={role}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => demoSignIn(account)}
              disabled={Boolean(lockUntil) || submitting}
            >
              {t(`authPages.roles.${role}`)}
            </Button>
          ))}
        </div>
        <div style={{ marginBlockStart: 'var(--space-2)' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => expireSession()}
          >
            {t('authPages.login.simulateSessionExpired')}
          </Button>
        </div>
      </aside>

      <p className="auth-page__switch">
        {t('authPages.login.switch')}
        {' '}
        <Link to="/register">{t('authPages.login.switchAction')}</Link>
      </p>
    </div>
  );
}
