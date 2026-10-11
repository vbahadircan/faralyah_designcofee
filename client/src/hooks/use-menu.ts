import { useCallback, useEffect, useState } from 'react';
import type { PublicMenu } from '@faralyah/shared';
import { fetchMenu } from '@/lib/api';

export type MenuState =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; menu: PublicMenu };

export function useMenu(): { state: MenuState; reload: () => void } {
  const [state, setState] = useState<MenuState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchMenu(controller.signal)
      .then((menu) => setState({ status: 'ready', menu }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload };
}
