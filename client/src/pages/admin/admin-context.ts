import { createContext, useContext } from 'react';

export type Notice = { kind: 'ok' | 'error'; text: string };

export type AdminContextValue = {
  email: string;
  /** Calls the admin API with the CSRF token; a 401 sends the user back to the login page. */
  call: (
    path: string,
    options?: {
      method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
      json?: unknown;
      form?: FormData;
      signal?: AbortSignal;
    },
  ) => Promise<unknown>;
  /** Shows a short message in the panel's live region. */
  notify: (notice: Notice) => void;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext);
  if (!value) throw new Error('useAdmin must be used inside AdminLayout');
  return value;
}
