import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tr } from '@/content/tr';
import { jsonResponse } from '@/test-fixtures';
import { WelcomePage } from './welcome-page';

/** Fake value for tests; the real one is set by staff in the admin panel. */
const WIFI_PASSWORD = 'ornek-sifre-123';
const stubSettings = (body: unknown) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));

beforeEach(() => stubSettings({ wifiPassword: WIFI_PASSWORD }));
afterEach(() => vi.unstubAllGlobals());

const t = tr.welcome;
const renderPage = () =>
  render(
    <MemoryRouter>
      <WelcomePage />
    </MemoryRouter>,
  );

describe('WelcomePage', () => {
  it('greets with the heading and subtitle from the mock-up', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: t.title })).toBeInTheDocument();
    expect(screen.getByText(t.subtitle)).toBeInTheDocument();
    expect(screen.getByText(t.topBar.qrTitle)).toBeInTheDocument();
  });

  it('has no table check-in or call-the-waiter UI', () => {
    renderPage();
    expect(screen.queryByText(/masa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/servis çağır/i)).not.toBeInTheDocument();
  });

  it('shows two photo cards (menu, campaigns), each named by title and description', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: t.sectionsNav });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/menu', '/kampanyalar']);
    for (const card of Object.values(t.cards)) {
      const link = screen.getByRole('link', { name: card.title });
      expect(link).toHaveAccessibleDescription(card.description);
    }
  });

  it('shows the sticker logo named after the cafe', () => {
    renderPage();
    expect(screen.getByRole('img', { name: tr.brand.name })).toHaveAttribute(
      'src',
      '/brand/faralyah-sticker.webp',
    );
  });

  it('shows the real photos on the two cards', () => {
    const { container } = renderPage();
    const sources = [...container.querySelectorAll('nav img')].map((i) => i.getAttribute('src'));
    expect(sources).toEqual(['/cofee-table.jpg', '/children-workshops.jpg']);
    for (const img of container.querySelectorAll('nav img')) expect(img).toHaveAttribute('alt', '');
  });

  it('is operable by keyboard in reading order', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('button', { name: t.wifi.copy });
    await user.tab();
    expect(screen.getByRole('button', { name: t.wifi.copy })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: t.cards.menu.title })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: t.cards.campaigns.title })).toHaveFocus();
  });

  it('copies the Wi-Fi password and announces it', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText(WIFI_PASSWORD)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: t.wifi.copy }));
    expect(await navigator.clipboard.readText()).toBe(WIFI_PASSWORD);
    expect(screen.getByRole('status')).toHaveTextContent(t.wifi.copied);
  });

  it('hides the Wi-Fi card when no password is set', async () => {
    stubSettings({});
    renderPage();
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/settings', expect.anything()));
    expect(screen.queryByRole('button', { name: t.wifi.copy })).not.toBeInTheDocument();
  });
});
