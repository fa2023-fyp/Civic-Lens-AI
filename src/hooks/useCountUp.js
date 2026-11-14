import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, duration = 1400) {
  const elementRef = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const finish = () => setValue(target);
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      finish();
      return undefined;
    }

    let frameId;
    let startedAt;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const animate = (time) => {
          if (startedAt === undefined) startedAt = time;
          const progress = Math.min((time - startedAt) / duration, 1);
          const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
          setValue(Math.round(target * eased));
          if (progress < 1) frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (frameId !== undefined) cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return { elementRef, value };
}
