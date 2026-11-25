import { Badge } from '../ui/Badge/Badge.jsx';
import { useI18n } from '../../i18n/I18nContext.jsx';
import './ComplaintBadges.css';

const languageTones = {
  english: 'info',
  urdu: 'success',
  'roman-urdu': 'warning',
  mixed: 'ai',
  unknown: 'neutral',
};

export function LanguageBadge({ language = 'unknown', confidence, className = '' }) {
  const { t, formatNumber } = useI18n();
  const key = String(language).toLowerCase().replace(/\s+/g, '-');
  const normalized = typeof confidence === 'number'
    ? confidence > 1
      ? confidence / 100
      : confidence
    : null;

  return (
    <Badge tone={languageTones[key] || 'neutral'} className={`complaint-badge${className ? ` ${className}` : ''}`}>
      {t(`complaintText.language.${key === 'roman-urdu' ? 'romanUrdu' : key}`)}
      {normalized !== null ? (
        <span className="complaint-badge__confidence">
          {formatNumber(normalized, { style: 'percent', maximumFractionDigits: 0 })}
        </span>
      ) : null}
    </Badge>
  );
}
