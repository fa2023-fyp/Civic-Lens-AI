import { Skeleton } from '../Skeleton/Skeleton.jsx';
import './SkeletonChart.css';

export function SkeletonChart({ className = '' }) {
  return (
    <div className={`ui-skeleton-chart${className ? ` ${className}` : ''}`} aria-hidden="true">
      {['42%', '72%', '55%', '88%', '64%', '96%', '50%'].map((height, index) => (
        <Skeleton key={index} shape="rect" width="100%" height={height} />
      ))}
    </div>
  );
}
