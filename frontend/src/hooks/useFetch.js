import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function on mount (and when deps change), exposing loading/data/error.
 * `refetch()` re-runs the function. This gives every data-loading screen a loading state.
 */
export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const [reload, setReload] = useState(0);
  const refetch = useCallback(() => setReload((r) => r + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const result = await fnRef.current();
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reload]);

  return { data, loading, error, refetch, setData };
}