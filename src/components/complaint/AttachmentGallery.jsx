import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { Card } from '../ui/Card/Card.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { IconButton } from '../ui/IconButton/IconButton.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import { ErrorState } from '../ui/ErrorState/ErrorState.jsx';
import './AttachmentGallery.css';

export function AttachmentGallery({
  attachments = [],
  loading = false,
  error = false,
  errorMessage,
  onRetry,
  className = '',
}) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(null);
  const [zoom, setZoom] = useState(1);
  const dialogRef = useRef(null);
  const close = () => {
    setActiveIndex(null);
    setZoom(1);
  };

  useFocusTrap(dialogRef, activeIndex !== null, close);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    setZoom(1);
  }, [activeIndex]);

  if (loading) {
    return (
      <div className={`complaint-attachment-gallery${className ? ` ${className}` : ''}`} aria-busy="true">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} height="8rem" className="complaint-attachment-gallery__skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={errorMessage || t('complaintGallery.attachmentsError')}
        referenceCode="CL-ATT-1"
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (!attachments.length) {
    return (
      <p className="complaint-attachment-gallery__empty">
        {t('complaintGallery.noAttachments')}
      </p>
    );
  }

  const active = activeIndex === null ? null : attachments[activeIndex];
  const showPrevious = () => setActiveIndex((index) => (index - 1 + attachments.length) % attachments.length);
  const showNext = () => setActiveIndex((index) => (index + 1) % attachments.length);

  function handleLightboxKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPrevious();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNext();
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      setZoom((value) => Math.min(3, value + 0.25));
    } else if (event.key === '-') {
      event.preventDefault();
      setZoom((value) => Math.max(1, value - 0.25));
    } else if (event.key === '0') {
      event.preventDefault();
      setZoom(1);
    }
  }

  return (
    <>
      <div className={`complaint-attachment-gallery${className ? ` ${className}` : ''}`}>
        {attachments.map((attachment, index) => (
          <button
            type="button"
            className="complaint-attachment-gallery__thumbnail"
            key={`${attachment.src}-${index}`}
            onClick={() => setActiveIndex(index)}
            aria-label={t('complaintGallery.openAttachment', {
              title: attachment.alt || t('complaintGallery.attachment', { number: index + 1 }),
            })}
          >
            {attachment.src ? (
              <img src={attachment.src} alt={attachment.alt || ''} />
            ) : (
              <Icon name="image" size={32} />
            )}
          </button>
        ))}
      </div>

      {active
        ? createPortal(
            <div className="complaint-lightbox-overlay" role="presentation">
              <section
                ref={dialogRef}
                className="complaint-lightbox"
                role="dialog"
                aria-modal="true"
                aria-label={t('complaintGallery.lightboxTitle')}
                tabIndex={-1}
                onKeyDown={handleLightboxKeyDown}
              >
                <header className="complaint-lightbox__header">
                  <span>{t('complaintGallery.attachmentCount', {
                    current: activeIndex + 1,
                    total: attachments.length,
                  })}</span>
                  <div className="complaint-lightbox__controls">
                    <IconButton
                      icon="minus"
                      aria-label={t('complaintGallery.zoomOut')}
                      onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
                    />
                    <IconButton
                      icon="plus"
                      aria-label={t('complaintGallery.zoomIn')}
                      onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
                    />
                    <IconButton icon="close" aria-label={t('common.close')} onClick={close} />
                  </div>
                </header>
                <div className="complaint-lightbox__stage">
                  <IconButton
                    icon="chevron-left"
                    className="complaint-lightbox__previous"
                    aria-label={t('complaintGallery.previous')}
                    onClick={showPrevious}
                  />
                  {active.src ? (
                    <img
                      src={active.src}
                      alt={active.alt || ''}
                      style={{ transform: `scale(${zoom})` }}
                    />
                  ) : (
                    <Icon name="image" size={64} />
                  )}
                  <IconButton
                    icon="chevron-right"
                    className="complaint-lightbox__next"
                    aria-label={t('complaintGallery.next')}
                    onClick={showNext}
                  />
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
