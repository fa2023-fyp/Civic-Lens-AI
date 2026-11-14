import { Badge } from '../ui/Badge/Badge.jsx';
import './marketing.css';

export function DemoDataBadge({ children, className = '' }) {
  return (
    <Badge
      tone="neutral"
      className={`marketing-demo-data${className ? ` ${className}` : ''}`}
    >
      {children}
    </Badge>
  );
}
