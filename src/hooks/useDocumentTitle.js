import { useEffect } from 'react';

export function useDocumentTitle(title, { restoreOnUnmount = true } = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      if (restoreOnUnmount) document.title = previousTitle;
    };
  }, [restoreOnUnmount, title]);
}
