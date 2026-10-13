import { useCallback, useEffect, useState } from 'react';

export type FetchState<T> =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T };

/**
 * Loads data on mount. `reload` shows the loading state again (retry after an error);
 * `refresh` fetches in the background and keeps showing the current data meanwhile.
 */
export function useFetch<T>(load: (signal: AbortSignal) => Promise<T>): {
  state: FetchState<T>;
  reload: () => void;
  refresh: () => void;
} {
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [attempt, load]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  return { state, reload, refresh };
}
