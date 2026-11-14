import { Card } from '../Card/Card.jsx';
import { Reveal } from '../../marketing/Reveal.jsx';
import './Timeline.css';

export function Timeline({ items = [], label, onDark = false, className = '' }) {
  return (
    <Reveal
      className={`ui-timeline__reveal${onDark ? ' ui-timeline__reveal--dark' : ''}${className ? ` ${className}` : ''}`}
    >
      <ol className="ui-timeline" aria-label={label}>
        {items.map((item, index) => (
          <li className="ui-timeline__item" key={item.id ?? index}>
            <span className="ui-timeline__marker" aria-hidden="true" />
            <Card
              as="article"
              variant={onDark ? 'dark' : 'outlined'}
              className="ui-timeline__entry"
            >
              <div className="ui-timeline__heading">
                <h3>{item.title}</h3>
                {item.time ? (
                  <time dateTime={item.dateTime}>{item.time}</time>
                ) : null}
              </div>
              {item.description ? <p>{item.description}</p> : null}
            </Card>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
