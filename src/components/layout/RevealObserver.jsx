import { useRef } from 'react';
import { useReveal } from '../../hooks/useReveal.js';

export function RevealObserver({ children, className }) {
  const rootRef = useRef(null);
  useReveal(rootRef);
  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
