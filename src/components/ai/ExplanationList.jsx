import { Badge } from '../ui/Badge/Badge.jsx';
import { Icon } from '../ui/Icon/Icon.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './ExplanationList.css';

export function ExplanationList({
  items = [],
  safetyRule,
  title,
  className = '',
}) {
  const { t } = useI18n();

  const reasonsList = items.map((item) =>
    typeof item === 'string' ? { text: item, isSafetyRule: false } : item,
  );

  const hasSafetyRule = Boolean(safetyRule);
  const safetyRuleText =
    typeof safetyRule === 'object' && safetyRule !== null
      ? safetyRule.text || safetyRule.rule || ''
      : String(safetyRule || '');

  return (
    <div className={`explanation-list${className ? ` ${className}` : ''}`}>
      <h4 className="explanation-list__title">
        {title || t('ai.reasonsTitle')}
      </h4>

      {hasSafetyRule ? (
        <div className="explanation-list__safety-highlight" role="alert">
          <div className="explanation-list__safety-header">
            <div className="explanation-list__safety-tag">
              <Icon name="shield-check" size={14} className="explanation-list__safety-icon" />
              <Badge tone="warning">{t('ai.safetyRuleApplied')}</Badge>
            </div>
            <span className="explanation-list__safety-desc">
              {t('ai.safetyRuleDescription')}
            </span>
          </div>
          <p className="explanation-list__safety-text" dir="auto">
            {safetyRuleText}
          </p>
        </div>
      ) : null}

      {reasonsList.length > 0 ? (
        <ul className="explanation-list__items">
          {reasonsList.map((reason, index) => {
            if (reason.isSafetyRule) {
              return (
                <li
                  key={index}
                  className="explanation-list__item explanation-list__item--safety"
                >
                  <Icon name="shield" size={14} className="explanation-list__item-icon--safety" />
                  <div className="explanation-list__item-content">
                    <Badge tone="warning" className="explanation-list__item-badge">
                      {t('ai.safetyRuleApplied')}
                    </Badge>
                    <span className="explanation-list__item-text" dir="auto">
                      {reason.text}
                    </span>
                  </div>
                </li>
              );
            }

            return (
              <li key={index} className="explanation-list__item">
                <span className="explanation-list__bullet" aria-hidden="true" />
                <span className="explanation-list__item-text" dir="auto">
                  {reason.text}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
