import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds, { rootMargin = '0px 0px -70% 0px', threshold = 0 } = {}) {
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? null);
  const idsKey = sectionIds.join(',');

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) {
      setActiveSectionId(null);
      return undefined;
    }

    if (!('IntersectionObserver' in window)) {
      setActiveSectionId(sections[0].id);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        if (visibleSections.length === 0) return;
        visibleSections.sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
        setActiveSectionId(visibleSections[0].target.id);
      },
      { rootMargin, threshold },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [idsKey, rootMargin, threshold]);

  return activeSectionId;
}
