import { Link, Outlet } from 'react-router';
import { tr } from '@/content/tr';

export function Layout() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-burgundy focus:px-4 focus:py-3 focus:text-paper"
      >
        {tr.nav.skipToContent}
      </a>
      <header className="mx-auto flex max-w-[640px] justify-center px-4 py-6">
        <Link to="/" aria-label={tr.brand.name} className="rounded-sm">
          <img
            src="/brand/faralyah-lockup-burgundy.svg"
            alt={tr.brand.name}
            className="h-24 w-auto"
          />
        </Link>
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
