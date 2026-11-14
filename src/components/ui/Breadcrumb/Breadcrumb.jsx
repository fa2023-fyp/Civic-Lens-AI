import { Icon } from '../Icon/Icon.jsx';
import './Breadcrumb.css';

export function Breadcrumb({ items = [], label, className = '' }) {
  return (
    <nav
      className={`ui-breadcrumb${className ? ` ${className}` : ''}`}
      aria-label={label}
    >
      <ol className="ui-breadcrumb__list">
        {items.map((item, index) => {
          const current = item.current ?? index === items.length - 1;

          return (
            <li className="ui-breadcrumb__item" key={item.id ?? item.href ?? item.label ?? index}>
              {index > 0 ? (
                <Icon
                  name="chevron-right"
                  flip
                  size={16}
                  className="ui-breadcrumb__separator"
                />
              ) : null}
              {current || !item.href ? (
                <span aria-current={current ? 'page' : undefined}>{item.label}</span>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
