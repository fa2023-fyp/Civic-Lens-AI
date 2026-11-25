import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { Button } from '../ui/Button/Button.jsx';
import { Card } from '../ui/Card/Card.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import './ComplaintText.css';

export function ComplaintText({
  originalText = '',
  normalisedText = '',
  loading = false,
  className = '',
}) {
  const { t } = useI18n();
  const [showNormalised, setShowNormalised] = useState(false);

  if (loading) {
    return (
      <Card className={`complaint-text${className ? ` ${className}` : ''}`} aria-busy="true">
        <Skeleton width="25%" />
        <Skeleton height="5rem" />
      </Card>
    );
  }

  return (
    <Card className={`complaint-text${className ? ` ${className}` : ''}`}>
      <div className="complaint-text__header">
        <h3>{t(showNormalised ? 'complaintText.normalisedTitle' : 'complaintText.originalTitle')}</h3>
        {normalisedText ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowNormalised((visible) => !visible)}
            aria-pressed={showNormalised}
          >
            {t(showNormalised ? 'complaintText.showOriginal' : 'complaintText.showNormalised')}
          </Button>
        ) : null}
      </div>

      {showNormalised ? (
        <>
          <p className="complaint-text__derived" dir="auto">
            {t('complaintText.derivedLabel')}
          </p>
          <p className="complaint-text__body" dir="auto">
            {normalisedText}
          </p>
        </>
      ) : (
        <p className="complaint-text__body complaint-text__body--original" dir="auto">
          {originalText}
        </p>
      )}
    </Card>
  );
}
