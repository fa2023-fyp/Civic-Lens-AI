import { useEffect } from 'react';

function matchesHotkey(event, hotkey) {
  const parts = hotkey.toLowerCase().split('+').map((part) => part.trim());
  const key = parts[parts.length - 1];
  const modifiers = new Set(parts.slice(0, -1));

  return (
    event.key.toLowerCase() === key &&
    event.ctrlKey === (modifiers.has('ctrl') || modifiers.has('control')) &&
    event.metaKey === (modifiers.has('meta') || modifiers.has('cmd')) &&
    event.altKey === modifiers.has('alt') &&
    event.shiftKey === modifiers.has('shift')
  );
}

export function useHotkeys(hotkeys, callback, { enabled = true, target } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;
    const eventTarget = target ?? window;
    const keys = Array.isArray(hotkeys) ? hotkeys : [hotkeys];
    const handleKeyDown = (event) => {
      if (!keys.some((hotkey) => matchesHotkey(event, hotkey))) return;
      callback(event);
    };

    eventTarget.addEventListener('keydown', handleKeyDown);
    return () => eventTarget.removeEventListener('keydown', handleKeyDown);
  }, [callback, enabled, hotkeys, target]);
}
