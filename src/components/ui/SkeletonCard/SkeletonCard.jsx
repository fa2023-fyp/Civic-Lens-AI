import { Card } from '../Card/Card.jsx';
import { Skeleton } from '../Skeleton/Skeleton.jsx';
import { SkeletonText } from '../SkeletonText/SkeletonText.jsx';
import './SkeletonCard.css';

export function SkeletonCard({ className = '' }) {
  return (
    <Card className={`ui-skeleton-card${className ? ` ${className}` : ''}`} aria-hidden="true">
      <Skeleton width="40%" />
      <SkeletonText lines={3} />
      <Skeleton width="28%" height="var(--space-8)" />
    </Card>
  );
}
