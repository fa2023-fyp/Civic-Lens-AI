import { Card } from '../Card/Card.jsx';
import './KeyValueList.css';

export function KeyValueList({
  items = [],
  label,
  columns = 1,
  onDark = false,
  className = '',
}) {
  if (columns !== 1 && columns !== 2) {
    throw new RangeError('KeyValueList columns must be one or two.');
  }

  return (
    <Card
      as="dl"
      variant={onDark ? 'dark' : 'outlined'}
      aria-label={label}
      className={`ui-key-value-list ui-key-value-list--${columns}-column${onDark ? ' ui-key-value-list--dark' : ''}${className ? ` ${className}` : ''}`}
    >
      {items.map((item, index) => (
        <div className="ui-key-value-list__item" key={item.id ?? index}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </Card>
  );
}
