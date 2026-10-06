import { useCallback, useState } from 'react';

/**
 * Wraps a one-shot async action (e.g. a form submit) with a loading flag.
 * Every mutation/button gets a loading state via `request(fn)`.
 */
export function useRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, request, setError };
}