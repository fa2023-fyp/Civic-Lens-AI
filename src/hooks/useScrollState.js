import { useEffect, useState } from 'react';

function getScrollState(previousY = 0) {
  const scrollY = window.scrollY;
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  return {
    scrolled: scrollY > 16,
    direction: scrollY > previousY ? 'down' : scrollY < previousY ? 'up' : 'none',
    progress: scrollableHeight > 0 ? Math.min(1, Math.max(0, scrollY / scrollableHeight)) : 0,
  };
}

export function useScrollState() {
  const [scrollState, setScrollState] = useState(() => ({
    scrolled: false,
    direction: 'none',
    progress: 0,
  }));

  useEffect(() => {
    let previousY = window.scrollY;
    const updateScrollState = () => {
      setScrollState(getScrollState(previousY));
      previousY = window.scrollY;
    };
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  return scrollState;
}
