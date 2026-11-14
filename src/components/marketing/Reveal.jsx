import { useReveal } from '../../hooks/useReveal.js';
import './marketing.css';

const revealVariants = new Set(['fade-up', 'fade-in', 'slide-start', 'slide-end', 'scale']);

export function Reveal({
  as: Component = 'div',
  variant = 'fade-up',
  delay = 0,
  className = '',
  style = {},
  children,
  ...props
}) {
  if (!revealVariants.has(variant)) {
    throw new RangeError(`Unsupported reveal variant: ${variant}`);
  }

  const { ref, isVisible } = useReveal();

  return (
    <Component
      ref={ref}
      className={`marketing-reveal marketing-reveal--${variant}${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, '--marketing-reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function stagger(items, renderItem, step = 80, initialDelay = 0) {
  return items.map((item, index) => renderItem(item, index, initialDelay + index * step));
}
