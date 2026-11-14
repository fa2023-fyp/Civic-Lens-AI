import { cloneElement, isValidElement, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export function Tooltip({ content, children, className = '' }) {
  const id = useId();
  const targetRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  function show() {
    const rect = targetRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rtl = document.documentElement.dir === 'rtl';
    const center = rect.left + rect.width / 2;
    const above = rect.bottom + 96 > window.innerHeight;
    const inlineStart = rtl ? window.innerWidth - center : center;
    setPosition({
      insetBlockStart: above ? rect.top - 8 : rect.bottom + 8,
      insetInlineStart: Math.max(12, Math.min(window.innerWidth - 12, inlineStart)),
      transform: above ? 'translate(-50%, -100%)' : 'translateX(-50%)',
    });
    setOpen(true);
  }

  const describedBy =
    [children?.props?.['aria-describedby'], open ? id : null].filter(Boolean).join(' ') ||
    undefined;
  const child = isValidElement(children)
    ? cloneElement(children, {
        'aria-describedby': describedBy,
        tabIndex:
          children.props.tabIndex ??
          (children.type === 'button' || (children.type === 'a' && children.props.href)
            ? undefined
            : 0),
      })
    : children;

  return (
    <>
      <span
        ref={targetRef}
        className={`ui-tooltip-target${className ? ` ${className}` : ''}`}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => show()}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        {isValidElement(children) ? (
          child
        ) : (
          <span tabIndex={0} aria-describedby={open ? id : undefined}>
            {child}
          </span>
        )}
      </span>
      {open && position
        ? createPortal(
            <span id={id} role="tooltip" className="ui-tooltip anim-fade-in" style={position}>
              {content}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
