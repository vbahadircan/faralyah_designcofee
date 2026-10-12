import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { tr } from './content/tr';
import { jsonResponse, sampleCampaigns, sampleMenu } from './test-fixtures';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('opens on the welcome page', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: tr.welcome.title })).toBeInTheDocument();
  });

  it('navigates from the welcome page to the menu and back home', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleMenu)));
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getByRole('link', { name: new RegExp(tr.welcome.cards.menu.title) }));
    expect(await screen.findByRole('region', { name: 'Tatlılar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: tr.menu.title })).toBeInTheDocument();
    expect(screen.getByText(tr.footer.allergy)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: tr.nav.home }));
    expect(screen.getByRole('heading', { level: 1, name: tr.welcome.title })).toBeInTheDocument();
  });

  it('shows the campaigns page from the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleCampaigns)));
    renderAt('/kampanyalar');
    expect(screen.getByRole('heading', { level: 1, name: tr.campaigns.title })).toBeInTheDocument();
    expect(
      await screen.findByRole('article', { name: 'Tuval Boyama + Kahve' }),
    ).toBeInTheDocument();
  });

  it('renders a Turkish not-found page with a way back', () => {
    renderAt('/yok-boyle-bir-sayfa');
    expect(screen.getByRole('heading', { name: tr.notFound.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: tr.notFound.back })).toHaveAttribute('href', '/');
  });
});
