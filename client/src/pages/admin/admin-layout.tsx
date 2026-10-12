import { adminSessionSchema } from '@faralyah/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { tr } from '@/content/tr';
import { adminRequest, ApiError } from '@/lib/admin-api';
import { cn } from '@/lib/utils';
import { AdminContext, type AdminContextValue, type Notice } from './admin-context';

const t = tr.admin;

type Session =
  { status: 'loading' } | { status: 'out' } | { status: 'in'; email: string; csrf: string };

/**
 * Shell for every admin page. Checks the session on the server first; without one it sends
 * the user to the login page. The server checks again on every request.
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>({ status: 'loading' });
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    adminRequest('/session', { signal: controller.signal })
      .then((body) => {
        const parsed = adminSessionSchema.parse(body);
        setSession(
          parsed.authenticated
            ? { status: 'in', email: parsed.email, csrf: parsed.csrfToken }
            : { status: 'out' },
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setSession({ status: 'out' });
      });
    return () => controller.abort();
  }, []);

  // Success messages fade after a few seconds; errors stay until the next action.
  useEffect(() => {
    if (notice?.kind !== 'ok') return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const csrf = session.status === 'in' ? session.csrf : '';
  const call = useCallback<AdminContextValue['call']>(
    async (path, options) => {
      try {
        return await adminRequest(path, { ...options, csrf });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          navigate('/admin/giris', { replace: true, state: { expired: true } });
        }
        throw error;
      }
    },
    [csrf, navigate],
  );

  const value = useMemo<AdminContextValue | null>(
    () => (session.status === 'in' ? { email: session.email, call, notify: setNotice } : null),
    [session, call],
  );

  async function logout() {
    try {
      await call('/logout', { method: 'POST' });
    } finally {
      navigate('/admin/giris', { replace: true });
    }
  }

  if (session.status === 'loading') {
    return (
      <p aria-busy="true" className="p-6">
        {t.common.loading}
      </p>
    );
  }
  if (session.status === 'out' || !value) {
    return <Navigate to="/admin/giris" replace />;
  }

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-11 items-center rounded-pill px-4 text-base font-semibold',
      isActive ? 'bg-burgundy text-paper' : 'text-burgundy [@media(hover:hover)]:hover:bg-tint',
    );

  return (
    <AdminContext.Provider value={value}>
      <div className="mx-auto min-h-dvh max-w-[960px] px-4 pb-16">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-rule py-3">
          <p className="font-display text-xl font-bold text-burgundy">{t.title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-burgundy underline"
            >
              {t.nav.site}
            </Link>
            <Button variant="ghost" onClick={logout}>
              {t.nav.logout}
            </Button>
          </div>
        </header>
        <nav aria-label={t.nav.label} className="flex gap-2 py-3">
          <NavLink to="/admin" end className={navLink}>
            {t.nav.menu}
          </NavLink>
          <NavLink to="/admin/kampanyalar" className={navLink}>
            {t.nav.campaigns}
          </NavLink>
          <NavLink to="/admin/ayarlar" className={navLink}>
            {t.nav.settings}
          </NavLink>
        </nav>
        <div
          role="status"
          className={cn(
            'sticky top-2 z-10 rounded-md text-base font-semibold empty:sr-only',
            notice?.kind === 'error' ? 'bg-danger p-3 text-paper' : 'bg-burgundy p-3 text-paper',
          )}
        >
          {notice?.text}
        </div>
        <main id="main">
          <Outlet />
        </main>
      </div>
    </AdminContext.Provider>
  );
}
