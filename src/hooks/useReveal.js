import { useEffect, useRef, useState } from 'react';

export function useReveal(targetRef, { group = false, threshold = 0.15 } = {}) {
  const internalRef = useRef(null);
  const ref = targetRef ?? internalRef;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return undefined;

    const targets = group ? target.querySelectorAll('.reveal:not(.is-visible)') : [target];
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      targets.forEach((element) => element.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === target) setIsVisible(true);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold },
    );

    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [group, ref, threshold]);

  return { ref, isVisible };
}
