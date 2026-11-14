import './Kbd.css';

export function Kbd({ children, className = '' }) {
  return <kbd className={`ui-kbd${className ? ` ${className}` : ''}`}>{children}</kbd>;
}
