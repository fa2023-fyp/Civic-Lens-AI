import { useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon/Icon.jsx';
import { LanguageSwitch } from '../ui/LanguageSwitch/LanguageSwitch.jsx';
import { ThemeToggle } from '../ui/ThemeToggle/ThemeToggle.jsx';
import './PreferencesMenu.css';

const popoverId = 'preferences-menu-panel';
const triggerId = 'preferences-menu-trigger';

function PreferencesPanel() {
  return (
    <section
      id={popoverId}
      className="preferences-menu__panel"
      role="group"
      aria-labelledby={triggerId}
    >
      <div className="preferences-menu__row">
        <LanguageSwitch />
      </div>
      <div className="preferences-menu__row">
        <ThemeToggle />
      </div>
    </section>
  );
}

export function PreferencesMenu() {
  const containerRef = useRef(null);

  useEffect(() => {
    function handlePointer(event) {
      if (!containerRef.current?.open) return;
      if (containerRef.current.contains(event.target)) return;
      containerRef.current.open = false;
    }

    function handleKey(event) {
      if (event.key !== 'Escape') return;
      if (!containerRef.current?.open) return;
      containerRef.current.open = false;
      containerRef.current.querySelector('summary')?.focus();
    }

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <details ref={containerRef} className="preferences-menu">
      <summary
        id={triggerId}
        className="preferences-menu__trigger"
        aria-label="Preferences"
      >
        <Icon name="globe" size={20} />
      </summary>
      <PreferencesPanel />
    </details>
  );
}