import { ArrowLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { tr } from '@/content/tr';

/** Shell for inner pages (menu, activities, campaigns). The landing page has its own layout. */
export function Layout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-burgundy focus:px-4 focus:py-3 focus:text-paper"
      >
        {tr.nav.skipToContent}
      </a>
      <header className="mx-auto grid max-w-[640px] grid-cols-[1fr_auto_1fr] items-center px-4 pt-3 pb-4">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1 justify-self-start rounded-sm text-sm font-semibold whitespace-nowrap text-burgundy"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {tr.nav.home}
        </Link>
        <Link to="/" aria-label={tr.brand.name} className="rounded-sm">
          <img
            src="/brand/faralyah-lockup-burgundy.svg"
            alt={tr.brand.name}
            className="h-24 w-auto"
          />
        </Link>
        <span aria-hidden="true" />
      </header>
      <main id="main" className="mx-auto max-w-[640px] px-4 pb-12">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-[640px] border-t border-rule px-4 py-6 text-sm text-ink-muted">
        {tr.footer.allergy}
      </footer>
    </>
  );
}
