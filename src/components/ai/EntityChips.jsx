import { useId, useState } from 'react';
import { Badge } from '../ui/Badge/Badge.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './EntityChips.css';

const ATTRIBUTE_KEYS = [
  'area',
  'block',
  'street',
  'landmark',
  'facility',
  'issue',
  'duration',
  'dateTime',
  'severityCues',
];

export function EntityChips({
  originalText = '',
  entities = {},
  title,
  showOriginalText = true,
  className = '',
}) {
  const { t } = useI18n();
  const idPrefix = useId();
  const [activeKey, setActiveKey] = useState(null);

  const activeEntity = activeKey ? entities[activeKey] : null;

  function handleChipInteraction(key) {
    const entity = entities[key];
    if (!entity || !entity.value) return;
    setActiveKey((prev) => (prev === key ? null : key));
  }

  function renderHighlightedText() {
    if (!originalText) return null;
    if (!activeEntity || !activeEntity.value) {
      return (
        <p className="entity-chips__text" dir="auto">
          {originalText}
        </p>
      );
    }

    let start = -1;
    let end = -1;

    if (Array.isArray(activeEntity.span) && activeEntity.span.length === 2) {
      const [spanStart, spanEnd] = activeEntity.span;
      if (typeof spanStart === 'number' && typeof spanEnd === 'number') {
        start = spanStart;
        end = spanEnd;
      }
    } else if (
      activeEntity.span &&
      typeof activeEntity.span.start === 'number' &&
      typeof activeEntity.span.end === 'number'
    ) {
      start = activeEntity.span.start;
      end = activeEntity.span.end;
    } else if (typeof activeEntity.value === 'string' && activeEntity.value.trim()) {
      const idx = originalText.toLowerCase().indexOf(activeEntity.value.toLowerCase().trim());
      if (idx !== -1) {
        start = idx;
        end = idx + activeEntity.value.trim().length;
      }
    }

    if (start >= 0 && end > start && end <= originalText.length) {
      const before = originalText.slice(0, start);
      const highlighted = originalText.slice(start, end);
      const after = originalText.slice(end);

      return (
        <p className="entity-chips__text" dir="auto">
          {before}
          <mark className="entity-chips__highlight" dir="auto">
            {highlighted}
          </mark>
          {after}
        </p>
      );
    }

    return (
      <p className="entity-chips__text" dir="auto">
        {originalText}
      </p>
    );
  }

  return (
    <div className={`entity-chips${className ? ` ${className}` : ''}`}>
      <div className="entity-chips__header">
        <h4 className="entity-chips__title">
          {title || t('ai.entityChipsTitle')}
        </h4>
        <span className="entity-chips__hint">
          {t('ai.entityHoverHint')}
        </span>
      </div>

      {showOriginalText && originalText ? (
        <Card variant="outlined" className="entity-chips__original-box">
          <div className="entity-chips__box-header">
            <span className="entity-chips__box-label">
              {t('ai.originalTextTitle')}
            </span>
            {activeKey ? (
              <span className="entity-chips__active-indicator">
                {t(`ai.entities.${activeKey}`)}: <strong>{String(activeEntity?.value)}</strong>
              </span>
            ) : null}
          </div>
          {renderHighlightedText()}
        </Card>
      ) : null}

      <div
        className="entity-chips__grid"
        role="group"
        aria-label={t('ai.entityChipsTitle')}
      >
        {ATTRIBUTE_KEYS.map((key) => {
          const entity = entities[key];
          const hasValue = Boolean(entity && entity.value);
          const rawValue = hasValue ? entity.value : '—';
          const confidence = hasValue && typeof entity.confidence === 'number'
            ? (entity.confidence > 1 ? entity.confidence / 100 : entity.confidence).toFixed(2)
            : null;

          const isActive = activeKey === key;
          const chipId = `${idPrefix}-${key}`;

          return (
            <button
              key={key}
              id={chipId}
              type="button"
              className={`entity-chips__chip${isActive ? ' is-active' : ''}${hasValue ? ' has-value' : ' is-missing'}`}
              onClick={() => handleChipInteraction(key)}
              onMouseEnter={() => {
                if (hasValue) setActiveKey(key);
              }}
              onMouseLeave={() => {
                if (hasValue && activeKey === key) setActiveKey(null);
              }}
              onFocus={() => {
                if (hasValue) setActiveKey(key);
              }}
              onBlur={() => {
                if (hasValue) setActiveKey(null);
              }}
              disabled={!hasValue}
              aria-pressed={isActive}
            >
              <span className="entity-chips__attr-name">
                {t(`ai.entities.${key}`)}
              </span>

              <span className="entity-chips__attr-value" dir="auto">
                {rawValue}
              </span>

              {confidence ? (
                <Badge
                  tone={Number(confidence) >= 0.8 ? 'ai' : 'warning'}
                  className="entity-chips__confidence-tag"
                >
                  {confidence}
                </Badge>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
