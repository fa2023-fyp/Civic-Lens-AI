import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { useFocusTrap } from '../../../hooks/useFocusTrap.js';
import { IconButton } from '../IconButton/IconButton.jsx';
import './Modal.css';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  className = '',
}) {
  const generatedId = useId();
  const dialogRef = useRef(null);
  const { t } = useI18n();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const close = useCallback(() => onClose?.(), [onClose]);

  useFocusTrap(dialogRef, open, close);
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="ui-overlay anim-fade-in"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) close();
      }}
    >
      <section
        ref={dialogRef}
        className={`ui-modal anim-scale-in${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : t('ui.dialog')}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="ui-modal__header">
          <div>
            {title ? (
              <h2 className="ui-modal__title" id={titleId}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="ui-modal__description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <IconButton icon="close" aria-label={t('common.close')} onClick={close} />
        </header>
        <div className="ui-modal__body">{children}</div>
        {footer ? <footer className="ui-modal__footer">{footer}</footer> : null}
      </section>
    </div>,
    document.body,
  );
}
