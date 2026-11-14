import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(asyncFunction, { immediate = true, initialData = null } = {}) {
  const [status, setStatus] = useState(immediate ? 'loading' : 'idle');
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const mounted = useRef(false);
  const asyncFunctionRef = useRef(asyncFunction);

  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
  }, [asyncFunction]);

  const run = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setStatus('loading');
    setError(null);

    try {
      const result = await asyncFunctionRef.current();
      if (mounted.current && currentRequestId === requestId.current) {
        setData(result);
        setStatus('success');
      }
      return result;
    } catch (requestError) {
      if (mounted.current && currentRequestId === requestId.current) {
        setError(requestError);
        setStatus('error');
      }
      return undefined;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, []);

  useEffect(() => {
    if (immediate) run();
  }, [immediate, run]);

  return { status, data, error, retry: run, run };
}
