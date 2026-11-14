import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import './Popover.css';

export function Popover({
  trigger,
  children,
  role = 'dialog',
  label,
  open: controlledOpen,
  className = '',
  onOpenChange,
}) {
  const generatedId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const open = controlledOpen ?? internalOpen;
  const { t } = useI18n();

  function setExpanded(next) {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  useEffect(() => {
    if (!open || !triggerRef.current) return undefined;
    const rect = triggerRef.current.getBoundingClientRect();
    const rtl = document.documentElement.dir === 'rtl';
    setPosition({
      insetBlockStart: rect.bottom + window.scrollY + 8,
      insetInlineStart: rtl ? window.innerWidth - rect.right : rect.left,
      minInlineSize: rect.width,
    });

    function dismiss(event) {
      if (
        !triggerRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        setExpanded(false);
      }
    }

    function keyDown(event) {
      if (event.key === 'Escape') {
        setExpanded(false);
        triggerRef.current
          ?.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])')
          ?.focus();
      } else if (event.key === 'Tab') {
        setExpanded(false);
      }
    }

    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', keyDown);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', keyDown);
    };
  }, [open]);

  if (!isValidElement(trigger)) throw new Error('Popover requires a single trigger element.');

  const triggerNode = cloneElement(trigger, {
    'aria-expanded': open,
    'aria-controls': generatedId,
    'aria-haspopup': role === 'menu' ? 'menu' : 'dialog',
    onClick: (event) => {
      trigger.props.onClick?.(event);
      if (!event.defaultPrevented) setExpanded(!open);
    },
  });

  return (
    <>
      <span className="ui-popover-trigger" ref={triggerRef}>
        {triggerNode}
      </span>
      {open && position
        ? createPortal(
            <div
              ref={panelRef}
              id={generatedId}
              className={`ui-popover anim-scale-in${className ? ` ${className}` : ''}`}
              role={role}
              aria-label={label || t(role === 'menu' ? 'ui.menu' : 'ui.popover')}
              style={position}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
