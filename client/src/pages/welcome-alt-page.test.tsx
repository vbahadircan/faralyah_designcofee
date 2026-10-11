import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { tr } from '@/content/tr';
import { WIFI_PASSWORD } from '@/components/welcome-alt/wifi-card';
import { WelcomeAltPage } from './welcome-alt-page';

const t = tr.welcomeAlt;
const renderPage = () =>
  render(
    <MemoryRouter>
      <WelcomeAltPage />
    </MemoryRouter>,
  );

describe('WelcomeAltPage (/onizleme)', () => {
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

  it('shows two photo cards (menu, activities), each named by title and description', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: t.sectionsNav });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/menu', '/etkinlikler']);
    for (const card of Object.values(t.cards)) {
      const link = screen.getByRole('link', { name: card.title });
      expect(link).toHaveAccessibleDescription(card.description);
    }
  });

  it('has no campaigns card; campaigns are reached through the combined link box', () => {
    renderPage();
    expect(screen.queryByRole('link', { name: 'Kampanyalar' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: t.updatesLink })).toHaveAttribute(
      'href',
      '/etkinlikler-kampanyalar',
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
    await user.tab();
    expect(screen.getByRole('button', { name: t.wifi.copy })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: t.updatesLink })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: t.cards.menu.title })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: t.cards.activities.title })).toHaveFocus();
  });

  it('copies the Wi-Fi password and announces it', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText(WIFI_PASSWORD)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: t.wifi.copy }));
    expect(await navigator.clipboard.readText()).toBe(WIFI_PASSWORD);
    expect(screen.getByRole('status')).toHaveTextContent(t.wifi.copied);
  });
});
