import { Skeleton } from '../Skeleton/Skeleton.jsx';
import './SkeletonText.css';

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <span className={`ui-skeleton-text${className ? ` ${className}` : ''}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? '68%' : '100%'} />
      ))}
    </span>
  );
}
