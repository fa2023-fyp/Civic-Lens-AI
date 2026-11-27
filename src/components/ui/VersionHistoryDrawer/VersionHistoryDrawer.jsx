import { Drawer } from '../Drawer/Drawer.jsx';

export function VersionHistoryDrawer({ open, onClose, versions = [] }) {
  return (
    <Drawer open={open} onClose={onClose} title="Version history">
      <ul>
        {versions.map((v, i) => (
          <li key={i}>
            <strong>{v.editor}</strong> — {v.time} — {v.summary}
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
export default VersionHistoryDrawer;
