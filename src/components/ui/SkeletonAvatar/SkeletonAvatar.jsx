import { Skeleton } from '../Skeleton/Skeleton.jsx';
import './SkeletonAvatar.css';

export function SkeletonAvatar({ size = 'md' }) {
  const dimension =
    size === 'sm' ? 'var(--space-8)' : size === 'lg' ? 'var(--space-16)' : 'var(--space-12)';
  return (
    <Skeleton shape="circle" width={dimension} height={dimension} className="ui-skeleton-avatar" />
  );
}
