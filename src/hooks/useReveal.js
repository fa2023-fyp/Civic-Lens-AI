import { useEffect } from 'react';

export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef?.current || document;
    const targets = root.querySelectorAll('.reveal:not(.is-visible)');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [rootRef]);
}
