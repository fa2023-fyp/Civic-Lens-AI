import { useI18n } from '../../i18n/I18nContext.jsx';
import { useCountUp } from '../../hooks/useCountUp.js';

export function AnimatedNumber({ value, className }) {
  const { language } = useI18n();
  const { elementRef, value: count } = useCountUp(value);
  const formatted = new Intl.NumberFormat(language).format(count);

  return (
    <strong ref={elementRef} className={className} aria-live="off">
      {formatted}
    </strong>
  );
}
