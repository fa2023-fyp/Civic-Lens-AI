import { Skeleton } from '../Skeleton/Skeleton.jsx';
import './SkeletonRow.css';

export function SkeletonRow({ columns = 4, className = '' }) {
  return (
    <div className={`ui-skeleton-row${className ? ` ${className}` : ''}`} aria-hidden="true">
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} width={index === 0 ? '80%' : '100%'} />
      ))}
    </div>
  );
}
