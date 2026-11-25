import { useState } from 'react';
import { Button } from '../../components/ui/Button/Button.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput/PasswordInput.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './CitizenProfilePage.css';

function profileStorageKey(userId) {
  return `civiclens-citizen-profile:${userId || 'anon'}`;
}

function loadSavedProfile(user) {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(profileStorageKey(user?.id));
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore malformed stored profile.
    }
  }
  return {
    name: user?.name || '',
    contact: user?.email || '',
  };
}

export default function CitizenProfilePage() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const toast = useToast();

  const initial = loadSavedProfile(user);
  const [name, setName] = useState(initial.name);
  const [contact, setContact] = useState(initial.contact);
  const [profileErrors, setProfileErrors] = useState({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [requestType, setRequestType] = useState('correction');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestRef, setRequestRef] = useState('');

  function handleSaveDetails(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = t('citizenProfile.nameError');
    if (!contact.trim() || contact.trim().length < 5) {
      nextErrors.contact = t('citizenProfile.contactError');
    }
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        profileStorageKey(user?.id),
        JSON.stringify({ name: name.trim(), contact: contact.trim() }),
      );
    }
    toast.success(t('citizenProfile.detailsSaved'));
  }

  function handleLanguageChange(event) {
    const nextLang = event.target.value;
    setLanguage(nextLang);
    toast.success(t('citizenProfile.languageSaved'));
  }

  function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordSuccess(false);
    const nextErrors = {};
    if (!currentPassword) {
      nextErrors.current = t('citizenProfile.currentPasswordRequired');
    }
    if (newPassword.length < 8) {
      nextErrors.next = t('citizenProfile.newPasswordLength');
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirm = t('citizenProfile.passwordMismatch');
    }
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSuccess(true);
    toast.success(t('citizenProfile.passwordSuccess'));
  }

  function handleDataRequest(event) {
    event.preventDefault();
    if (requestDetails.trim().length < 10) {
      setRequestError(t('citizenProfile.requestDetailsError'));
      return;
    }
    setRequestError('');
    const ref = `DR-${Date.now().toString(36).toUpperCase()}`;
    setRequestRef(ref);
    setRequestDetails('');
    toast.info(t('citizenProfile.requestSubmitted', { ref }));
  }

  return (
    <div className="citizen-profile">
      <header className="citizen-profile__header">
        <p className="citizen-profile__kicker">{t('citizenProfile.kicker')}</p>
        <h1 className="citizen-profile__title">{t('citizenProfile.title')}</h1>
        <p className="citizen-profile__subtitle">{t('citizenProfile.subtitle')}</p>
      </header>

      <Card className="citizen-profile__card">
        <h2 className="citizen-profile__section-title">{t('citizenProfile.detailsTitle')}</h2>
        <form className="citizen-profile__form" onSubmit={handleSaveDetails} noValidate>
          <Input
            id="profile-name"
            label={t('citizenProfile.nameLabel')}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (profileErrors.name) setProfileErrors((p) => ({ ...p, name: '' }));
            }}
            dir="auto"
            required
            error={profileErrors.name}
          />
          <Input
            id="profile-contact"
            label={t('citizenProfile.contactLabel')}
            value={contact}
            onChange={(event) => {
              setContact(event.target.value);
              if (profileErrors.contact) setProfileErrors((p) => ({ ...p, contact: '' }));
            }}
            required
            error={profileErrors.contact}
          />
          <Button type="submit" variant="primary" size="md">
            {t('citizenProfile.saveDetails')}
          </Button>
        </form>
      </Card>

      <Card className="citizen-profile__card">
        <h2 className="citizen-profile__section-title">{t('citizenProfile.languageTitle')}</h2>
        <Select
          id="profile-language"
          label={t('citizenProfile.languageLabel')}
          hint={t('citizenProfile.languageHint')}
          value={language}
          onChange={handleLanguageChange}
          options={[
            { value: 'en', label: t('citizenProfile.languageEnglish') },
            { value: 'ur', label: t('citizenProfile.languageUrdu') },
          ]}
        />
      </Card>

      <Card className="citizen-profile__card">
        <h2 className="citizen-profile__section-title">{t('citizenProfile.passwordTitle')}</h2>
        {passwordSuccess ? (
          <InlineAlert tone="success">{t('citizenProfile.passwordSuccess')}</InlineAlert>
        ) : null}
        <form className="citizen-profile__form" onSubmit={handlePasswordSubmit} noValidate>
          <PasswordInput
            id="profile-current-password"
            label={t('citizenProfile.currentPassword')}
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              if (passwordErrors.current) setPasswordErrors((p) => ({ ...p, current: '' }));
            }}
            required
            error={passwordErrors.current}
          />
          <PasswordInput
            id="profile-new-password"
            label={t('citizenProfile.newPassword')}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              if (passwordErrors.next) setPasswordErrors((p) => ({ ...p, next: '' }));
            }}
            required
            error={passwordErrors.next}
          />
          <PasswordInput
            id="profile-confirm-password"
            label={t('citizenProfile.confirmPassword')}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (passwordErrors.confirm) setPasswordErrors((p) => ({ ...p, confirm: '' }));
            }}
            required
            error={passwordErrors.confirm}
          />
          <Button type="submit" variant="secondary" size="md">
            {t('citizenProfile.passwordButton')}
          </Button>
        </form>
      </Card>

      <Card className="citizen-profile__card">
        <h2 className="citizen-profile__section-title">{t('citizenProfile.dataRightsTitle')}</h2>
        <InlineAlert tone="info">{t('citizenProfile.auditRetentionNote')}</InlineAlert>
        {requestRef ? (
          <InlineAlert tone="success">
            {t('citizenProfile.requestSubmitted', { ref: requestRef })}
          </InlineAlert>
        ) : null}
        <form className="citizen-profile__form" onSubmit={handleDataRequest} noValidate>
          <Select
            id="profile-request-type"
            label={t('citizenProfile.requestTypeLabel')}
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            options={[
              { value: 'correction', label: t('citizenProfile.requestCorrection') },
              { value: 'deletion', label: t('citizenProfile.requestDeletion') },
            ]}
          />
          <Textarea
            id="profile-request-details"
            label={t('citizenProfile.requestDetailsLabel')}
            placeholder={t('citizenProfile.requestDetailsPlaceholder')}
            value={requestDetails}
            onChange={(event) => {
              setRequestDetails(event.target.value);
              if (requestError) setRequestError('');
            }}
            dir="auto"
            rows={3}
            required
            error={requestError}
          />
          <Button type="submit" variant="secondary" size="md">
            {t('citizenProfile.submitRequest')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
