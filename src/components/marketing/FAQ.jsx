import { useId, useState } from 'react';
import { Button } from '../ui/Button/Button.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import './marketing-showcase.css';

export function FAQ({
  items = [],
  label,
  id,
  oneOpen = false,
  expandAllLabel,
  collapseAllLabel,
  className = '',
}) {
  const instanceId = useId().replace(/:/g, '');
  const [openIndices, setOpenIndices] = useState([]);
  const visibleOpenIndices = oneOpen ? openIndices.slice(-1) : openIndices;
  const allOpen =
    items.length > 0 && items.every((_, index) => visibleOpenIndices.includes(index));

  function toggleItem(index) {
    setOpenIndices((current) => {
      const currentVisible = oneOpen ? current.slice(-1) : current;
      if (currentVisible.includes(index)) {
        return currentVisible.filter((openIndex) => openIndex !== index);
      }
      return oneOpen ? [index] : [...currentVisible, index];
    });
  }

  function toggleAll() {
    setOpenIndices(allOpen ? [] : items.map((_, index) => index));
  }

  return (
    <div
      id={id}
      className={`marketing-faq${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={label}
    >
      {!oneOpen && items.length > 0 ? (
        <div className="marketing-faq__actions">
          <Button variant="ghost" size="sm" onClick={toggleAll}>
            {allOpen ? collapseAllLabel : expandAllLabel}
          </Button>
        </div>
      ) : null}
      <div className="marketing-faq__items">
        {items.map((item, index) => {
          const expanded = visibleOpenIndices.includes(index);
          const buttonId = `marketing-faq-${instanceId}-button-${index}`;
          const panelId = `marketing-faq-${instanceId}-panel-${index}`;

          return (
            <article className="marketing-faq__item" key={item.id ?? index}>
              <Button
                id={buttonId}
                variant="ghost"
                fullWidth
                className="marketing-faq__trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggleItem(index)}
              >
                <span className="marketing-faq__question">{item.question}</span>
                <Icon
                  name="chevron-down"
                  className={`marketing-faq__icon${expanded ? ' is-expanded' : ''}`}
                  size={20}
                />
              </Button>
              <div
                id={panelId}
                className={`marketing-faq__panel${expanded ? ' is-expanded' : ''}`}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!expanded}
              >
                <div className="marketing-faq__panel-inner">
                  <p>{item.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
