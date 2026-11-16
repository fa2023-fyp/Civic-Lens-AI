import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext.jsx';

export function useReducedMotion() {
  const mediaQuery =
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const [reducedMotion, setReducedMotion] = useState(mediaQuery ? mediaQuery.matches : false);

  useEffect(() => {
    if (!mediaQuery) return undefined;
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [mediaQuery]);

  return reducedMotion;
}

export function AnimatedNumber({ value, suffix = '' }) {
  const { formatNumber } = useI18n();
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState(reducedMotion ? value : 0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setCurrent(value);
      hasAnimated.current = true;
      return;
    }

    if (hasAnimated.current) return;

    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(value * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      setCurrent(value);
      hasAnimated.current = true;
    }

    requestAnimationFrame(tick);
  }, [reducedMotion, value]);

  return (
    <span>
      {formatNumber(current, { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  );
}
