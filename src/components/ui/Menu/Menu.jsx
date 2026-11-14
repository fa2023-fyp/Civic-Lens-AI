import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import { Icon } from '../Icon/Icon.jsx';
import { Popover } from '../Popover/Popover.jsx';
import './Menu.css';

export function Menu({ trigger, items, label, className = '' }) {
  const { t } = useI18n();
  const itemRefs = useRef([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => focusItem(0), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  function focusItem(index) {
    const enabled = itemRefs.current.filter((item) => item && !item.disabled);
    enabled[index]?.focus();
  }

  function moveFocus(event, offset) {
    const enabled = itemRefs.current.filter((item) => item && !item.disabled);
    if (!enabled.length) return;
    const currentIndex = enabled.indexOf(document.activeElement);
    const nextIndex = (currentIndex + offset + enabled.length) % enabled.length;
    enabled[nextIndex]?.focus();
  }

  return (
    <Popover
      role="menu"
      label={label || t('ui.menu')}
      className={`ui-menu${className ? ` ${className}` : ''}`}
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
    >
      <div
        className="ui-menu__items"
        role="presentation"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveFocus(event, 1);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveFocus(event, -1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            focusItem(0);
          } else if (event.key === 'End') {
            event.preventDefault();
            focusItem(itemRefs.current.length - 1);
          }
        }}
      >
        {items.map((item, index) => (
          <button
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            className="ui-menu__item"
            type="button"
            role="menuitem"
            disabled={item.disabled}
            key={item.id || item.label}
            onClick={(event) => {
              const menu = event.currentTarget.closest('[role="menu"]');
              const triggerElement = menu
                ? [...document.querySelectorAll('[aria-controls]')].find(
                    (element) => element.getAttribute('aria-controls') === menu.id,
                  )
                : null;
              item.onSelect?.();
              triggerElement?.focus();
              setOpen(false);
            }}
          >
            {item.icon ? <Icon name={item.icon} /> : null}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </Popover>
  );
}
