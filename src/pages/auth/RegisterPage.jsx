import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput/PasswordInput.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './AuthPages.css';

export default function RegisterPage() {
  const { t, setLanguage } = useI18n();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguageValue] = useState(document.documentElement.lang === 'ur' ? 'ur' : 'en');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const rules = [
    { id: 'length', met: password.length >= 8 },
    { id: 'case', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { id: 'number', met: /\d/.test(password) },
    { id: 'symbol', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const passwordValid = rules.every((rule) => rule.met);

  function triggerError() {
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
  }

  function validate() {
    const nextErrors = {};
    if (name.trim().length < 2) nextErrors.name = t('authPages.register.errors.name');
    if (!identifier.trim()) nextErrors.identifier = t('authPages.register.errors.identifier');
    if (!passwordValid) nextErrors.password = t('authPages.register.errors.password');
    if (!terms) nextErrors.terms = t('authPages.register.errors.terms');
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) {
      triggerError();
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: identifier.trim(),
        password,
        preferredLanguage: language,
      });
      navigate('/verify', { state: { identifier: identifier.trim() } });
    } catch (error) {
      setSubmitError(
        error?.code === 'AUTH_EMAIL_EXISTS'
          ? t('authPages.register.emailExists')
          : t('authPages.register.genericError'),
      );
      triggerError();
    } finally {
      setSubmitting(false);
    }
  }

  function changeLanguage(value) {
    setLanguageValue(value);
    setLanguage(value);
  }

  return (
    <div className={`auth-page${shake ? ' anim-shake' : ''}`}>
      <header className="auth-page__header">
        <p>{t('authPages.register.kicker')}</p>
        <h1>{t('authPages.register.title')}</h1>
        <p>{t('authPages.register.body')}</p>
      </header>

      {submitError ? <InlineAlert tone="danger">{submitError}</InlineAlert> : null}

      <form className="auth-page__form" onSubmit={submit} noValidate>
        <Input
          id="registerName"
          label={t('authPages.register.name')}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          required
          autoComplete="name"
        />
        <Input
          id="registerIdentifier"
          label={t('authPages.register.identifier')}
          placeholder={t('authPages.register.identifierPlaceholder')}
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          error={errors.identifier}
          required
          autoComplete="username"
        />
        <PasswordInput
          id="registerPassword"
          label={t('authPages.register.password')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
          autoComplete="new-password"
        />
        <ul className="auth-password-rules" aria-label={t('authPages.register.rulesLabel')}>
          {rules.map((rule) => (
            <li className={rule.met ? 'is-met' : ''} key={rule.id}>
              {t(`authPages.register.rules.${rule.id}`)}
            </li>
          ))}
        </ul>
        <Select
          id="registerLanguage"
          label={t('authPages.register.language')}
          value={language}
          onChange={(event) => changeLanguage(event.target.value)}
          options={[
            { value: 'en', label: t('authPages.languageEnglish') },
            { value: 'ur', label: t('authPages.languageUrdu') },
          ]}
        />
        <Checkbox
          id="registerTerms"
          label={t('authPages.register.terms')}
          checked={terms}
          onChange={(event) => setTerms(event.target.checked)}
          error={errors.terms}
          required
        />
        <Button type="submit" variant="cta" fullWidth loading={submitting}>
          {t('authPages.register.submit')}
        </Button>
      </form>

      <p className="auth-page__switch">
        {t('authPages.register.switch')}
        {' '}
        <Link to="/login">{t('authPages.register.switchAction')}</Link>
      </p>
    </div>
  );
}
