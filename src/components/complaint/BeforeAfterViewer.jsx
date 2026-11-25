import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext.jsx';
import { Skeleton } from '../ui/Skeleton/Skeleton.jsx';
import './BeforeAfterViewer.css';

export function BeforeAfterViewer({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  loading = false,
  className = '',
}) {
  const { t } = useI18n();
  const [position, setPosition] = useState(50);

  if (loading) {
    return (
      <div className={`complaint-before-after${className ? ` ${className}` : ''}`} aria-busy="true">
        <Skeleton height="18rem" />
      </div>
    );
  }

  return (
    <div className={`complaint-before-after${className ? ` ${className}` : ''}`}>
      <div className="complaint-before-after__labels" aria-hidden="true">
        <span>{t('complaintGallery.before')}</span>
        <span>{t('complaintGallery.after')}</span>
      </div>
      <div className="complaint-before-after__frame">
        {beforeSrc ? <img className="complaint-before-after__before" src={beforeSrc} alt={beforeAlt || ''} /> : null}
        {afterSrc ? (
          <div className="complaint-before-after__after" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
            <img src={afterSrc} alt={afterAlt || ''} />
          </div>
        ) : null}
        <input
          className="complaint-before-after__range"
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={t('complaintGallery.comparisonHandle')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={t('complaintGallery.comparisonPosition', { value: position })}
        />
        <span className="complaint-before-after__handle" style={{ insetInlineStart: `${position}%` }} aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}
