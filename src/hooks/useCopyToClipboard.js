import { useCallback, useState } from 'react';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const copy = useCallback(async (text) => {
    setCopied(false);
    setError(null);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is not available in this browser context.');
      }
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      return true;
    } catch (copyError) {
      setError(copyError);
      return false;
    }
  }, []);

  return { copied, error, copy };
}
