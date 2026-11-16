import { useEffect, useRef, useState } from 'react';
import { PageHero } from '../../components/marketing/PageHero.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Icon } from '../../components/ui/Icon/Icon.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { EMERGENCY_NUMBERS } from '../../config/constants.js';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './ContactPage.css';

const initialForm = {
  name: '',
  email: '',
  message: '',
  preferredLanguage: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitted(false);
    };
  }

  function validateForm() {
    const nextErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (name.length < 2) nextErrors.name = t('publicPages.contact.form.errors.name');
    if (!emailPattern.test(email)) nextErrors.email = t('publicPages.contact.form.errors.email');
    if (message.length < 10) nextErrors.message = t('publicPages.contact.form.errors.message');
    if (!form.preferredLanguage) {
      nextErrors.preferredLanguage = t('publicPages.contact.form.errors.preferredLanguage');
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm(initialForm);
      setErrors({});
      toast(t('publicPages.contact.form.successToast'), 'success');
    }, 650);
  }

  return (
    <div className="contact-page">
      <PageHero
        breadcrumbsLabel={t('publicPages.breadcrumbs')}
        homeLabel={t('common.navigation.home')}
        pageLabel={t('publicPages.contact.title')}
        kicker={t('publicPages.contact.kicker')}
        title={t('publicPages.contact.title')}
        lead={t('publicPages.contact.lead')}
      />

      <section className="contact-page__content" aria-label={t('publicPages.contact.contentLabel')}>
        <div className="contact-page__form-column">
          <div className="contact-card">
            <div className="contact-card__heading">
              <h2>{t('publicPages.contact.form.title')}</h2>
              <p>{t('publicPages.contact.form.description')}</p>
            </div>
            <p className="contact-demo-note">{t('publicPages.contact.form.demoNotice')}</p>

            {submitted ? (
              <div className="contact-success" role="status" aria-live="polite">
                <Icon
                  name="check-circle"
                  size={34}
                  className="contact-success__icon anim-scale-in"
                />
                <p>{t('publicPages.contact.form.success')}</p>
              </div>
            ) : null}

            <form className="contact-form" noValidate onSubmit={handleSubmit}>
              <Input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                label={t('publicPages.contact.form.name')}
                value={form.name}
                onChange={updateField('name')}
                error={errors.name}
                required
              />
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                label={t('publicPages.contact.form.email')}
                value={form.email}
                onChange={updateField('email')}
                error={errors.email}
                required
              />
              <Textarea
                id="contact-message"
                name="message"
                label={t('publicPages.contact.form.message')}
                value={form.message}
                onChange={updateField('message')}
                error={errors.message}
                rows={5}
                maxLength={2000}
                required
              />
              <Select
                id="contact-preferred-language"
                name="preferredLanguage"
                label={t('publicPages.contact.form.preferredLanguage')}
                error={errors.preferredLanguage}
                value={form.preferredLanguage}
                onChange={updateField('preferredLanguage')}
                placeholder={t('publicPages.contact.form.chooseLanguage')}
                options={['english', 'urdu', 'romanUrdu'].map((language) => ({
                  value: language,
                  label: t(`publicPages.contact.form.languages.${language}`),
                }))}
                required
              />
              <Button type="submit" variant="cta" loading={submitting} fullWidth>
                {t('publicPages.contact.form.submit')}
              </Button>
            </form>
          </div>
        </div>

        <aside className="contact-side-card" aria-labelledby="contact-side-title">
          <h2 id="contact-side-title">{t('publicPages.contact.sideTitle')}</h2>
          <div className="contact-side-card__emergency">
            <h3>{t('landing.emergency.title')}</h3>
            <p>{t('landing.emergency.note')}</p>
            <ul>
              {EMERGENCY_NUMBERS.map((item) => (
                <li key={item.number}>
                  <span>{t(item.labelKey)}</span>
                  <a href={`tel:${item.number}`}>{item.number}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="contact-side-card__email">
            <span>{t('publicPages.contact.projectEmailLabel')}</span>
            <strong>{t('publicPages.contact.projectEmailPlaceholder')}</strong>
          </div>
        </aside>
      </section>
    </div>
  );
}
