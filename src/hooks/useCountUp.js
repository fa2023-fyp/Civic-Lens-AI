import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, options = {}) {
  const {
    duration = 1400,
    decimals = 0,
    prefix = '',
    suffix = '',
    threshold = 0.15,
  } = typeof options === 'number' ? { duration: options } : options;
  const elementRef = useRef(null);
  const [value, setValue] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasStarted.current) return undefined;

    const finish = () => {
      hasStarted.current = true;
      setValue(target);
    };
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || reducedMotion) {
      finish();
      return undefined;
    }

    let frameId;
    let startedAt;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStarted.current) return;
        hasStarted.current = true;
        observer.disconnect();

        const animate = (time) => {
          if (startedAt === undefined) startedAt = time;
          const progress = Math.min((time - startedAt) / duration, 1);
          const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
          const nextValue = target * eased;
          setValue(Number(nextValue.toFixed(decimals)));
          if (progress < 1) frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
      },
      { threshold },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, [decimals, duration, target, threshold]);

  const formattedValue = `${prefix}${value.toFixed(decimals)}${suffix}`;
  return { ref: elementRef, elementRef, value, formattedValue };
}
