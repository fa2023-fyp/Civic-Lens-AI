import './Skeleton.css';

export function Skeleton({
  as: Component = 'span',
  width = '100%',
  height = 'var(--space-4)',
  shape = 'rounded',
  className = '',
}) {
  return (
    <Component
      className={`ui-skeleton anim-shimmer ui-skeleton--${shape}${className ? ` ${className}` : ''}`}
      style={{ inlineSize: width, blockSize: height }}
      aria-hidden="true"
    />
  );
}
