import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { tr } from '@/content/tr';
import { WelcomePage } from './welcome-page';

const renderPage = () =>
  render(
    <MemoryRouter>
      <WelcomePage />
    </MemoryRouter>,
  );

describe('WelcomePage', () => {
  it('greets in Turkish with the logo and a single h1', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: tr.welcome.title })).toBeInTheDocument();
    expect(screen.getByText(tr.welcome.subtitle)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: tr.brand.name })).toBeInTheDocument();
  });

  it('shows all three sections as links, in a labelled navigation', () => {
    renderPage();
    const nav = screen.getByRole('navigation', { name: tr.welcome.sectionsNav });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/menu',
      '/etkinlikler',
      '/kampanyalar',
    ]);
  });

  it('gives each card an accessible name from its title and description', () => {
    renderPage();
    const { menu, activities, campaigns } = tr.welcome.cards;
    for (const card of [menu, activities, campaigns]) {
      const link = screen.getByRole('link', { name: new RegExp(card.title) });
      expect(link).toHaveTextContent(card.description);
    }
  });

  it('has a heading per card and keeps decorative icons out of the accessibility tree', () => {
    const { container } = renderPage();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    expect(container.querySelectorAll('a [aria-hidden="true"]').length).toBeGreaterThanOrEqual(6);
  });

  it('is fully keyboard operable, in reading order', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.tab();
    expect(
      screen.getByRole('link', { name: new RegExp(tr.welcome.cards.menu.title) }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole('link', { name: new RegExp(tr.welcome.cards.activities.title) }),
    ).toHaveFocus();
    await user.tab();
    expect(
      screen.getByRole('link', { name: new RegExp(tr.welcome.cards.campaigns.title) }),
    ).toHaveFocus();
  });
});
