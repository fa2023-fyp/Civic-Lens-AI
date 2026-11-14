import { useId, useLayoutEffect, useRef, useState } from 'react';
import './Tabs.css';

export function Tabs({ tabs = [], label, activeId, defaultActiveId, onChange, className = '' }) {
  const instanceId = useId().replace(/:/g, '');
  const tabListRef = useRef(null);
  const tabRefs = useRef([]);
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId ?? tabs[0]?.id);
  const [underline, setUnderline] = useState({ offset: 0, width: 0 });
  const controlled = activeId !== undefined;
  const selectedId = controlled ? activeId : internalActiveId;
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === selectedId),
  );

  useLayoutEffect(() => {
    const list = tabListRef.current;
    const activeTab = tabRefs.current[activeIndex];
    if (!list || !activeTab) return undefined;

    const measureUnderline = () => {
      const listRect = list.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      const offset =
        getComputedStyle(list).direction === 'rtl'
          ? listRect.right - tabRect.right
          : tabRect.left - listRect.left;
      setUnderline({ offset, width: tabRect.width });
    };

    measureUnderline();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measureUnderline);
      return () => window.removeEventListener('resize', measureUnderline);
    }

    const resizeObserver = new ResizeObserver(measureUnderline);
    resizeObserver.observe(list);
    resizeObserver.observe(activeTab);
    return () => resizeObserver.disconnect();
  }, [activeIndex, tabs]);

  if (tabs.length === 0) return null;

  function activateTab(index) {
    const nextId = tabs[index].id;
    if (nextId === selectedId) return;
    if (!controlled) setInternalActiveId(nextId);
    onChange?.(nextId);
  }

  function handleKeyDown(event, index) {
    const direction = getComputedStyle(tabListRef.current).direction;
    const forwardKey = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    let nextIndex;

    if (event.key === forwardKey) nextIndex = (index + 1) % tabs.length;
    else if (event.key === backwardKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div className={`ui-tabs${className ? ` ${className}` : ''}`}>
      <div className="ui-tabs__list" role="tablist" aria-label={label} ref={tabListRef}>
        {tabs.map((tab, index) => {
          const selected = index === activeIndex;
          const tabId = `ui-tabs-${instanceId}-tab-${index}`;
          const panelId = `ui-tabs-${instanceId}-panel-${index}`;

          return (
            <button
              key={tab.id}
              id={tabId}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              className={`ui-tabs__tab${selected ? ' is-selected' : ''}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => activateTab(index)}
              onFocus={() => activateTab(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
        <span
          className="ui-tabs__underline"
          aria-hidden="true"
          style={{ insetInlineStart: `${underline.offset}px`, inlineSize: `${underline.width}px` }}
        />
      </div>
      {tabs.map((tab, index) => {
        const selected = index === activeIndex;
        const tabId = `ui-tabs-${instanceId}-tab-${index}`;
        const panelId = `ui-tabs-${instanceId}-panel-${index}`;

        return (
          <div
            key={tab.id}
            id={panelId}
            className="ui-tabs__panel"
            role="tabpanel"
            aria-labelledby={tabId}
            tabIndex={selected ? 0 : -1}
            hidden={!selected}
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
