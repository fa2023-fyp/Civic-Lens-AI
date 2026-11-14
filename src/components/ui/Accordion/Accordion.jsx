import { useId, useState } from 'react';
import { Button } from '../Button/Button.jsx';
import { Icon } from '../Icon/Icon.jsx';
import './Accordion.css';

export function Accordion({
  items = [],
  label,
  allowMultiple = true,
  defaultOpenIds = [],
  className = '',
}) {
  const instanceId = useId().replace(/:/g, '');
  const [openIds, setOpenIds] = useState(defaultOpenIds);

  function toggleItem(id) {
    setOpenIds((current) => {
      if (current.includes(id)) return current.filter((openId) => openId !== id);
      return allowMultiple ? [...current, id] : [id];
    });
  }

  return (
    <div
      className={`ui-accordion${className ? ` ${className}` : ''}`}
      role="group"
      aria-label={label}
    >
      {items.map((item, index) => {
        const itemId = item.id ?? String(index);
        const expanded = openIds.includes(itemId);
        const triggerId = `ui-accordion-${instanceId}-trigger-${index}`;
        const panelId = `ui-accordion-${instanceId}-panel-${index}`;

        return (
          <section className="ui-accordion__item" key={itemId}>
            <Button
              id={triggerId}
              className="ui-accordion__trigger"
              variant="ghost"
              fullWidth
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => toggleItem(itemId)}
            >
              <span className="ui-accordion__title">{item.title}</span>
              <Icon
                name="chevron-down"
                className={`ui-accordion__icon${expanded ? ' is-expanded' : ''}`}
                size={20}
              />
            </Button>
            <div
              id={panelId}
              className={`ui-accordion__panel${expanded ? ' is-expanded' : ''}`}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!expanded}
            >
              <div className="ui-accordion__panel-inner">{item.content}</div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
