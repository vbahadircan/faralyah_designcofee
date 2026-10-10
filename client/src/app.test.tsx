import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { tr } from './content/tr';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App', () => {
  it('renders the home page with logo, skip link and allergy footer', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: tr.home.title })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: tr.brand.name })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: tr.nav.skipToContent })).toHaveAttribute(
      'href',
      '#main',
    );
    expect(screen.getByText(tr.footer.allergy)).toBeInTheDocument();
  });

  it('renders a Turkish not-found page with a way back', () => {
    renderAt('/yok-boyle-bir-sayfa');
    expect(screen.getByRole('heading', { name: tr.notFound.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: tr.notFound.back })).toHaveAttribute('href', '/');
  });
});
