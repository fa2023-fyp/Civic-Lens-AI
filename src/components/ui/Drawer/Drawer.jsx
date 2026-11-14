import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { useFocusTrap } from '../../../hooks/useFocusTrap.js';
import { IconButton } from '../IconButton/IconButton.jsx';
import './Drawer.css';

export function Drawer({ open, onClose, title, children, footer, className = '' }) {
  const generatedId = useId();
  const panelRef = useRef(null);
  const { t } = useI18n();
  const close = useCallback(() => onClose?.(), [onClose]);

  useFocusTrap(panelRef, open, close);
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
      className="ui-drawer-overlay anim-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <aside
        ref={panelRef}
        className={`ui-drawer anim-slide-in-end${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${generatedId}-title`}
        tabIndex={-1}
      >
        <header className="ui-drawer__header">
          <h2 id={`${generatedId}-title`}>{title}</h2>
          <IconButton icon="close" aria-label={t('common.close')} onClick={close} />
        </header>
        <div className="ui-drawer__body">{children}</div>
        {footer ? <footer className="ui-drawer__footer">{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  );
}
