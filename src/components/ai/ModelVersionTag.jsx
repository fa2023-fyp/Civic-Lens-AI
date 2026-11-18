import './ModelVersionTag.css';

export function ModelVersionTag({ version, className = '' }) {
  if (!version) return null;

  return (
    <span className={`model-version-tag${className ? ` ${className}` : ''}`}>
      <code>{version}</code>
    </span>
  );
}
