import { useCallback, useEffect, useRef, useState } from 'react';

function readStorageValue(key, initialValue) {
  if (typeof window === 'undefined') return initialValue;
  const storedValue = window.localStorage.getItem(key);
  return storedValue === null ? initialValue : JSON.parse(storedValue);
}

export function useLocalStorage(key, initialValue) {
  const initialValueRef = useRef(initialValue);
  const [value, setValue] = useState(() => readStorageValue(key, initialValueRef.current));

  useEffect(() => {
    setValue(readStorageValue(key, initialValueRef.current));
    const syncValue = (event) => {
      if (event.key === key || event.key === null) {
        setValue(readStorageValue(key, initialValueRef.current));
      }
    };
    window.addEventListener('storage', syncValue);
    return () => window.removeEventListener('storage', syncValue);
  }, [key]);

  const updateValue = useCallback(
    (nextValue) => {
      const resolvedValue =
        typeof nextValue === 'function'
          ? nextValue(readStorageValue(key, initialValueRef.current))
          : nextValue;
      window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      setValue(resolvedValue);
    },
    [key],
  );

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setValue(initialValueRef.current);
  }, [key]);

  return [value, updateValue, removeValue];
}
