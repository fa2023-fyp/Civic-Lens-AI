import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useToast } from '../../components/ui/ToastProvider/ToastProvider.jsx';
import { iconNames, Icon } from '../../components/ui/Icon/Icon.jsx';
import { Button } from '../../components/ui/Button/Button.jsx';
import { IconButton } from '../../components/ui/IconButton/IconButton.jsx';
import { Input } from '../../components/ui/Input/Input.jsx';
import { Textarea } from '../../components/ui/Textarea/Textarea.jsx';
import { Select } from '../../components/ui/Select/Select.jsx';
import { Checkbox } from '../../components/ui/Checkbox/Checkbox.jsx';
import { RadioGroup } from '../../components/ui/RadioGroup/RadioGroup.jsx';
import { Switch } from '../../components/ui/Switch/Switch.jsx';
import { PasswordInput } from '../../components/ui/PasswordInput/PasswordInput.jsx';
import { SearchInput } from '../../components/ui/SearchInput/SearchInput.jsx';
import { OtpInput } from '../../components/ui/OtpInput/OtpInput.jsx';
import { FileDrop } from '../../components/ui/FileDrop/FileDrop.jsx';
import { Badge } from '../../components/ui/Badge/Badge.jsx';
import { Chip } from '../../components/ui/Chip/Chip.jsx';
import { Avatar } from '../../components/ui/Avatar/Avatar.jsx';
import { Card } from '../../components/ui/Card/Card.jsx';
import { Divider } from '../../components/ui/Divider/Divider.jsx';
import { Kbd } from '../../components/ui/Kbd/Kbd.jsx';
import { Modal } from '../../components/ui/Modal/Modal.jsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog/ConfirmDialog.jsx';
import { Drawer } from '../../components/ui/Drawer/Drawer.jsx';
import { Tooltip } from '../../components/ui/Tooltip/Tooltip.jsx';
import { Popover } from '../../components/ui/Popover/Popover.jsx';
import { Menu } from '../../components/ui/Menu/Menu.jsx';
import { InlineAlert } from '../../components/ui/InlineAlert/InlineAlert.jsx';
import { Spinner } from '../../components/ui/Spinner/Spinner.jsx';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton.jsx';
import { SkeletonText } from '../../components/ui/SkeletonText/SkeletonText.jsx';
import { SkeletonCard } from '../../components/ui/SkeletonCard/SkeletonCard.jsx';
import { SkeletonRow } from '../../components/ui/SkeletonRow/SkeletonRow.jsx';
import { SkeletonAvatar } from '../../components/ui/SkeletonAvatar/SkeletonAvatar.jsx';
import { SkeletonChart } from '../../components/ui/SkeletonChart/SkeletonChart.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar/ProgressBar.jsx';
import { TopLoadingBar } from '../../components/ui/TopLoadingBar/TopLoadingBar.jsx';
import { BrandLoader } from '../../components/ui/BrandLoader/BrandLoader.jsx';
import { TypingDots } from '../../components/ui/TypingDots/TypingDots.jsx';
import { InlineLoader } from '../../components/ui/InlineLoader/InlineLoader.jsx';
import { EmptyState } from '../../components/ui/EmptyState/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState/ErrorState.jsx';
import { useCountUp } from '../../hooks/useCountUp.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { useReveal } from '../../hooks/useReveal.js';
import { RevealObserver } from '../../components/layout/RevealObserver.jsx';
import {
  FeatureCard,
  FAQ,
  CTABanner,
  FloatingOrbs,
  ImageBand,
  Marquee,
  PillarCard,
  PhoneMockup,
  RecognitionCard,
  Reveal,
  SectionHeader,
  ServiceCard,
  StatGrid,
  StatStrip,
  StepsRail,
  stagger,
} from '../../components/marketing/index.js';
import './UIGallery.css';

function GallerySection({ title, children, className = '' }) {
  return (
    <section className={`ui-gallery__section${className ? ` ${className}` : ''}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function UIGallery() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [selectedContact, setSelectedContact] = useState('email');
  const [notifications, setNotifications] = useState(false);
  const [name, setName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [search, setSearch] = useState('');
  const [otp, setOtp] = useState('');
  const [countdownTarget] = useState(() => Date.now() + 60 * 60 * 1000);
  const { ref: countUpRef, formattedValue } = useCountUp(1248.5, {
    decimals: 1,
    prefix: '$',
  });
  const { ref: revealRef, isVisible } = useReveal();
  const countdown = useCountdown(countdownTarget);
  const demoDataLabel = t('preview.demoBadge');
  const marketingStats = [
    { value: 1248, suffix: '+', caption: t('marketingGallery.statReports') },
    { value: 8, caption: t('marketingGallery.statRelated') },
    { value: 91, suffix: '%', caption: t('marketingGallery.statConfidence') },
    { value: 3, caption: t('marketingGallery.statDays') },
  ];
  const marketingGridStats = [
    { value: 12, caption: t('marketingGallery.gridOne') },
    { value: 24, caption: t('marketingGallery.gridTwo') },
    { value: 36, caption: t('marketingGallery.gridThree') },
    { value: 48, caption: t('marketingGallery.gridFour') },
    { value: 60, caption: t('marketingGallery.gridFive') },
    { value: 72, caption: t('marketingGallery.gridSix') },
  ];
  const marketingCards = [
    {
      component: FeatureCard,
      icon: 'sparkles',
      title: t('marketingGallery.featureTitle'),
      text: t('marketingGallery.featureText'),
      label: t('marketingGallery.featureLabel'),
      href: '#marketing-stats',
      linkText: t('marketingGallery.cardLink'),
    },
    {
      component: PillarCard,
      icon: 'shield-check',
      title: t('marketingGallery.pillarTitle'),
      text: t('marketingGallery.pillarText'),
      label: t('marketingGallery.pillarLabel'),
      href: '#marketing-stats',
      linkText: t('marketingGallery.cardLink'),
    },
    {
      component: ServiceCard,
      icon: 'building',
      title: t('marketingGallery.serviceTitle'),
      text: t('marketingGallery.serviceText'),
      label: t('marketingGallery.serviceLabel'),
      href: '#marketing-stats',
      linkText: t('marketingGallery.cardLink'),
    },
    {
      component: RecognitionCard,
      icon: 'check-circle',
      title: t('marketingGallery.recognitionTitle'),
      text: t('marketingGallery.recognitionText'),
      label: t('marketingGallery.recognitionLabel'),
      href: '#marketing-stats',
      linkText: t('marketingGallery.cardLink'),
    },
  ];
  const revealVariants = [
    { variant: 'fade-up', label: t('marketingGallery.revealFadeUp') },
    { variant: 'fade-in', label: t('marketingGallery.revealFadeIn') },
    { variant: 'slide-start', label: t('marketingGallery.revealSlideStart') },
    { variant: 'slide-end', label: t('marketingGallery.revealSlideEnd') },
    { variant: 'scale', label: t('marketingGallery.revealScale') },
  ];

  function showToast(message, type) {
    toast(message, type);
  }

  return (
    <RevealObserver className="ui-gallery">
      <header className="ui-gallery__hero section">
        <div className="container">
          <p className="eyebrow">{t('gallery.kicker')}</p>
          <h1>{t('gallery.title')}</h1>
          <p className="lead">{t('gallery.lead')}</p>
        </div>
      </header>

      <div className="container ui-gallery__content">
        <GallerySection title={t('gallery.actions')}>
          <div className="ui-gallery__row">
            <Button>{t('gallery.primary')}</Button>
            <Button variant="cta" size="lg">
              {t('gallery.cta')}
            </Button>
            <Button variant="secondary">{t('gallery.secondary')}</Button>
            <Button variant="ghost">{t('gallery.ghost')}</Button>
            <Button variant="danger">{t('gallery.danger')}</Button>
            <Button size="sm">{t('gallery.small')}</Button>
            <Button size="lg">{t('gallery.large')}</Button>
            <Button loading>{t('gallery.loading')}</Button>
            <Button disabled>{t('gallery.disabled')}</Button>
            <Button iconStart="sparkles" iconEnd="arrow-right" fullWidth>
              {t('gallery.primary')}
            </Button>
            <IconButton
              icon="bell"
              aria-label={t('gallery.openMenu')}
              tooltip={t('gallery.openMenu')}
            />
          </div>
        </GallerySection>

        <GallerySection title={t('gallery.iconGallery')}>
          <div className="ui-gallery__icons">
            {iconNames.map((name) => (
              <span
                className="ui-gallery__icon"
                key={name}
                role="img"
                aria-label={t('gallery.iconLabel', { name })}
              >
                <Icon name={name} size={20} />
                <code>{name}</code>
              </span>
            ))}
          </div>
        </GallerySection>

        <GallerySection title={t('gallery.forms')}>
          <div className="ui-gallery__form-grid">
            <Input
              label={t('gallery.name')}
              hint={t('gallery.nameHint')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('gallery.name')}
            />
            <Input
              type="email"
              label={t('gallery.email')}
              placeholder={t('gallery.emailPlaceholder')}
              error={t('gallery.invalidEmail')}
              leadingIcon="mail"
            />
            <Textarea
              label={t('gallery.complaint')}
              hint={t('gallery.complaintHint')}
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              rows={4}
              minLength={10}
              maxLength={2000}
              showCount
              dir="auto"
            />
            <Select
              label={t('gallery.selection')}
              placeholder={t('gallery.selectPlaceholder')}
              options={[
                { value: 'roads', label: t('gallery.roads') },
                { value: 'water', label: t('gallery.water') },
              ]}
            />
            <Checkbox
              label={t('gallery.terms')}
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
              required
            />
            <RadioGroup
              label={t('gallery.priority')}
              value={selectedContact}
              onChange={(event) => setSelectedContact(event.target.value)}
              options={[
                { value: 'email', label: t('gallery.emailOption') },
                { value: 'phone', label: t('gallery.phoneOption') },
              ]}
            />
            <Switch
              label={t('gallery.notifications')}
              checked={notifications}
              onChange={setNotifications}
            />
            <PasswordInput
              label={t('gallery.password')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="new-password"
            />
            <SearchInput
              label={t('gallery.lookup')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch('')}
            />
            <OtpInput label={t('gallery.otp')} value={otp} onChange={setOtp} />
            <FileDrop label={t('gallery.files')} />
          </div>
        </GallerySection>

        <GallerySection title={t('gallery.displays')}>
          <div className="ui-gallery__row">
            {['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'ai'].map((tone) => (
              <Badge tone={tone} key={tone}>
                {t(
                  `gallery.${tone === 'brand' ? 'brandTone' : tone === 'info' ? 'infoTone' : tone === 'success' ? 'successTone' : tone === 'warning' ? 'warningTone' : tone === 'danger' ? 'dangerTone' : tone === 'ai' ? 'aiTone' : 'neutral'}`,
                )}
              </Badge>
            ))}
            {['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'ai'].map((tone) => (
              <Chip tone={tone} key={`chip-${tone}`}>
                {t(
                  `gallery.${tone === 'brand' ? 'brandTone' : tone === 'info' ? 'infoTone' : tone === 'success' ? 'successTone' : tone === 'warning' ? 'warningTone' : tone === 'danger' ? 'dangerTone' : tone === 'ai' ? 'aiTone' : 'neutral'}`,
                )}
              </Chip>
            ))}
            <Chip tone="brand" onRemove={() => showToast(t('gallery.successMessage'), 'success')}>
              {t('gallery.roads')}
            </Chip>
            <Avatar name={t('gallery.profile')} />
            <Avatar name={t('gallery.profile')} size="sm" />
            <Avatar name={t('gallery.profile')} size="lg" />
          </div>
          <div className="ui-gallery__cards">
            {['flat', 'raised', 'outlined', 'dark'].map((variant) => (
              <Card variant={variant} hoverLift key={variant}>
                <h3>{t('gallery.cardTitle')}</h3>
                <p>{t('gallery.cardBody')}</p>
              </Card>
            ))}
          </div>
          <div className="ui-gallery__row">
            <Divider label={t('gallery.divider')} />
            <Divider orientation="vertical" />
          </div>
          <div className="ui-gallery__row">
            <Kbd>{t('gallery.shortcut')}</Kbd>
            <Kbd>?</Kbd>
          </div>
        </GallerySection>

        <GallerySection title={t('gallery.stateExamples')}>
          <div className="ui-gallery__state-grid">
            <div className="ui-gallery__state">
              <Button loading>{t('gallery.loading')}</Button>
              <Button disabled>{t('gallery.disabled')}</Button>
            </div>
            <InlineAlert tone="danger" title={t('gallery.invalidEmail')}>
              {t('gallery.errorMessage')}
            </InlineAlert>
            <div className="ui-gallery__state" dir="rtl">
              <Icon name="arrow-left" flip />
              <Chip tone="info">{t('gallery.rtlExample')}</Chip>
            </div>
          </div>
        </GallerySection>

        <GallerySection title={t('gallery.overlays')}>
          <div className="ui-gallery__row">
            <Button onClick={() => setDialogOpen(true)}>{t('gallery.openModal')}</Button>
            <Button variant="danger" onClick={() => setReasonDialogOpen(true)}>
              {t('gallery.openReasonDialog')}
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              {t('gallery.openDrawer')}
            </Button>
            <Tooltip content={t('gallery.tooltipBody')}>
              <Button variant="ghost">{t('gallery.showTooltip')}</Button>
            </Tooltip>
            <Popover
              label={t('ui.popover')}
              trigger={<Button variant="secondary">{t('gallery.openMenu')}</Button>}
            >
              <p>{t('gallery.drawerBody')}</p>
            </Popover>
            <Menu
              trigger={
                <Button variant="secondary" iconEnd="chevron-down">
                  {t('gallery.openMenu')}
                </Button>
              }
              items={[
                {
                  label: t('gallery.menuFirst'),
                  icon: 'file',
                  onSelect: () => showToast(t('gallery.infoMessage'), 'info'),
                },
                {
                  label: t('gallery.menuSecond'),
                  icon: 'clipboard',
                  onSelect: () => showToast(t('gallery.successMessage'), 'success'),
                },
              ]}
            />
          </div>
          <Modal
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title={t('gallery.modalTitle')}
            description={t('gallery.modalBody')}
            footer={<Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>}
          >
            <p>{t('gallery.cardBody')}</p>
          </Modal>
          <ConfirmDialog
            open={reasonDialogOpen}
            onCancel={() => setReasonDialogOpen(false)}
            onConfirm={(reason) => {
              setReasonDialogOpen(false);
              showToast(reason, 'success');
            }}
            title={t('gallery.modalTitle')}
            body={t('gallery.modalBody')}
            confirmTone="danger"
            requireReason
          />
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title={t('gallery.drawerTitle')}
            footer={<Button onClick={() => setDrawerOpen(false)}>{t('common.close')}</Button>}
          >
            <p>{t('gallery.drawerBody')}</p>
          </Drawer>
        </GallerySection>

        <GallerySection title={t('gallery.feedback')}>
          <div className="ui-gallery__row">
            {[
              ['success', 'successMessage'],
              ['info', 'infoMessage'],
              ['warning', 'warningMessage'],
              ['error', 'errorMessage'],
            ].map(([type, key]) => (
              <Button
                key={type}
                variant="secondary"
                onClick={() => showToast(t(`gallery.${key}`), type)}
              >
                {t(`gallery.${type === 'error' ? 'dangerTone' : `${type}Tone`}`)}
              </Button>
            ))}
            <Button
              variant="ghost"
              onClick={() => {
                showToast(t('gallery.successMessage'), 'success');
                showToast(t('gallery.infoMessage'), 'info');
                showToast(t('gallery.warningMessage'), 'warning');
                showToast(t('gallery.errorMessage'), 'error');
              }}
            >
              {t('gallery.showToasts')}
            </Button>
          </div>
          {['info', 'success', 'warning', 'danger'].map((tone) => (
            <InlineAlert key={tone} tone={tone} title={t('gallery.alertTitle')}>
              {t('gallery.alertBody')}
            </InlineAlert>
          ))}
        </GallerySection>

        <GallerySection title={t('gallery.loaders')}>
          <div className="ui-gallery__loader-grid">
            <div className="ui-gallery__loader-item">
              <div className="ui-gallery__row">
                <Spinner size="sm" />
                <Spinner />
                <Spinner size="lg" />
              </div>
              <InlineLoader label={t('gallery.loaderLabel')} />
              <TypingDots />
              <ProgressBar value={62} label={t('gallery.loaderLabel')} showValue />
              <ProgressBar label={t('gallery.loaderLabel')} />
              <TopLoadingBar active />
            </div>
            <div className="ui-gallery__loader-item">
              <Skeleton width="60%" />
              <SkeletonText />
              <SkeletonCard />
              <SkeletonRow />
              <SkeletonAvatar />
              <SkeletonChart />
            </div>
            <div className="ui-gallery__brand-loader">
              <BrandLoader label={t('gallery.loaderLabel')} />
            </div>
          </div>
        </GallerySection>

        <GallerySection title="Hooks">
          <div className="ui-gallery__hook-grid">
            <div className="ui-gallery__hook-example">
              <h3>useCountUp</h3>
              <strong ref={countUpRef} className="ui-gallery__hook-number tabular-nums">
                {formattedValue}
              </strong>
              <p>Animates once when this counter first enters view.</p>
            </div>
            <div
              ref={revealRef}
              className={`ui-gallery__hook-example reveal${isVisible ? ' is-visible' : ''}`}
            >
              <h3>useReveal</h3>
              <p>{isVisible ? 'This example is visible.' : 'Scroll this example into view.'}</p>
            </div>
            <div className="ui-gallery__hook-example">
              <h3>useCountdown</h3>
              <strong className="ui-gallery__hook-number tabular-nums">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </strong>
              <p>{countdown.isComplete ? 'Complete' : 'Time remaining'}</p>
            </div>
          </div>
        </GallerySection>

        <GallerySection title={t('marketingGallery.sectionTitle')}>
          <SectionHeader
            kicker={t('marketingGallery.sectionKicker')}
            headline={t('marketingGallery.sectionHeadline')}
            lead={t('marketingGallery.sectionLead')}
            align="center"
            headingAs="h3"
          />

          <div className="marketing-reveal-examples">
            {stagger(revealVariants, (item, index, delay) => (
              <Reveal
                key={`${item.variant}-${index}`}
                variant={item.variant}
                delay={delay}
                className="marketing-reveal-example"
              >
                {item.label}
              </Reveal>
            ))}
          </div>

          <SectionHeader
            kicker={t('marketingGallery.statsKicker')}
            headline={t('marketingGallery.statsHeadline')}
            lead={t('marketingGallery.statsLead')}
            headingAs="h3"
          />
          <StatStrip items={marketingStats} demoDataLabel={demoDataLabel} />
          <StatGrid
            id="marketing-stats"
            items={marketingGridStats}
            demoDataLabel={demoDataLabel}
          />

          <SectionHeader
            kicker={t('marketingGallery.cardsKicker')}
            headline={t('marketingGallery.cardsHeadline')}
            lead={t('marketingGallery.cardsLead')}
            headingAs="h3"
          />
          <div className="marketing-card-grid">
            {stagger(marketingCards, (item, index, delay) => {
              const { component: MarketingCard, ...props } = item;
              return <MarketingCard key={index} {...props} delay={delay} />;
            })}
          </div>

          <section className="marketing-dark-showcase">
            <SectionHeader
              kicker={t('marketingGallery.darkKicker')}
              headline={t('marketingGallery.darkHeadline')}
              lead={t('marketingGallery.darkLead')}
              align="center"
              onDark
              headingAs="h3"
            />
            <StatStrip items={marketingStats} demoDataLabel={demoDataLabel} onDark />
            <div className="marketing-card-grid">
              {stagger(marketingCards, (item, index, delay) => {
                const { component: MarketingCard, ...props } = item;
                return <MarketingCard key={index} {...props} delay={delay} onDark />;
              })}
            </div>
          </section>
        </GallerySection>

        <GallerySection title={t('marketingShowcase.sectionTitle')}>
          <SectionHeader
            kicker={t('marketingShowcase.stepsKicker')}
            headline={t('marketingShowcase.stepsHeadline')}
            lead={t('marketingShowcase.stepsLead')}
            headingAs="h3"
          />
          <StepsRail
            id="marketing-steps"
            label={t('marketingShowcase.stepsLabel')}
            steps={[
              {
                id: 'understand',
                title: t('marketingShowcase.understandTitle'),
                description: t('marketingShowcase.understandText'),
              },
              {
                id: 'extract',
                title: t('marketingShowcase.extractTitle'),
                description: t('marketingShowcase.extractText'),
              },
              {
                id: 'classify',
                title: t('marketingShowcase.classifyTitle'),
                description: t('marketingShowcase.classifyText'),
              },
              {
                id: 'route',
                title: t('marketingShowcase.routeTitle'),
                description: t('marketingShowcase.routeText'),
              },
            ]}
          />

          <SectionHeader
            kicker={t('marketingShowcase.faqKicker')}
            headline={t('marketingShowcase.faqHeadline')}
            lead={t('marketingShowcase.faqLead')}
            headingAs="h3"
          />
          <FAQ
            id="marketing-faq"
            label={t('marketingShowcase.faqLabel')}
            items={[
              {
                id: 'replacement',
                question: t('marketingShowcase.faqQuestionOne'),
                answer: t('marketingShowcase.faqAnswerOne'),
              },
              {
                id: 'decisions',
                question: t('marketingShowcase.faqQuestionTwo'),
                answer: t('marketingShowcase.faqAnswerTwo'),
              },
              {
                id: 'statistics',
                question: t('marketingShowcase.faqQuestionThree'),
                answer: t('marketingShowcase.faqAnswerThree'),
              },
            ]}
            expandAllLabel={t('marketingShowcase.faqExpandAll')}
            collapseAllLabel={t('marketingShowcase.faqCollapseAll')}
          />
          <FAQ
            label={t('marketingShowcase.faqSingleLabel')}
            oneOpen
            items={[
              {
                id: 'single-decisions',
                question: t('marketingShowcase.faqQuestionTwo'),
                answer: t('marketingShowcase.faqAnswerTwo'),
              },
              {
                id: 'single-statistics',
                question: t('marketingShowcase.faqQuestionThree'),
                answer: t('marketingShowcase.faqAnswerThree'),
              },
            ]}
          />

          <CTABanner
            eyebrow={t('marketingShowcase.ctaEyebrow')}
            headline={t('marketingShowcase.ctaHeadline')}
            body={t('marketingShowcase.ctaBody')}
            primaryLabel={t('marketingShowcase.ctaPrimary')}
            primaryHref="#marketing-steps"
            secondaryLabel={t('marketingShowcase.ctaSecondary')}
            secondaryHref="#marketing-faq"
          />

          <ImageBand
            kicker={t('marketingShowcase.imageKicker')}
            headline={t('marketingShowcase.imageHeadline')}
            body={t('marketingShowcase.imageBody')}
          />

          <div className="marketing-showcase-examples">
            <PhoneMockup label={t('marketingShowcase.phoneLabel')}>
              <div className="marketing-phone-example">
                <h3>{t('marketingShowcase.phoneTitle')}</h3>
                <p>{t('marketingShowcase.phoneBody')}</p>
                <Chip tone="ai">{t('marketingShowcase.phoneChip')}</Chip>
              </div>
            </PhoneMockup>
            <FloatingOrbs className="marketing-orbs-example">
              <div className="marketing-orbs-example__copy">
                <h3>{t('marketingShowcase.orbsTitle')}</h3>
                <p>{t('marketingShowcase.orbsBody')}</p>
              </div>
            </FloatingOrbs>
          </div>

          <Marquee
            label={t('marketingShowcase.marqueeLabel')}
            items={[
              t('marketingShowcase.marqueeOne'),
              t('marketingShowcase.marqueeTwo'),
              t('marketingShowcase.marqueeThree'),
              t('marketingShowcase.marqueeFour'),
            ]}
          />
        </GallerySection>

        <GallerySection title={t('gallery.emptyState')}>
          <EmptyState
            title={t('gallery.emptyTitle')}
            text={t('gallery.emptyBody')}
            action={<Button variant="secondary">{t('gallery.emptyAction')}</Button>}
          />
        </GallerySection>

        <GallerySection title={t('gallery.errorState')}>
          <ErrorState
            message={t('gallery.errorMessage')}
            referenceCode="UI-DEMO"
            onRetry={() => showToast(t('gallery.retryExample'), 'info')}
          />
        </GallerySection>
      </div>
    </RevealObserver>
  );
}
