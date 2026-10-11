import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { SAMPLE_PACKAGES } from '@/content/sample-packages';
import { tr } from '@/content/tr';
import { OffersPage } from './offers-page';

const renderPage = () =>
  render(
    <MemoryRouter>
      <OffersPage />
    </MemoryRouter>,
  );

describe('OffersPage', () => {
  it('has the heading, eyebrow and subtitle', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: tr.offers.title })).toBeInTheDocument();
    expect(screen.getByText(tr.offers.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(tr.offers.subtitle)).toBeInTheDocument();
  });

  it('does not show the table-specific "Masaya Özel" label', () => {
    renderPage();
    expect(screen.queryByText(/masaya/i)).not.toBeInTheDocument();
  });

  it('lists every package as an article with a heading', () => {
    renderPage();
    for (const pkg of SAMPLE_PACKAGES) {
      expect(screen.getByRole('article', { name: pkg.title })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(SAMPLE_PACKAGES.length);
  });

  it('shows the old price struck through, with accessible labels for both prices', () => {
    renderPage();
    const card = screen.getByRole('article', { name: 'Tuval Boyama & Filtre Kahve' });
    expect(card.querySelector('del')).toHaveTextContent('650 ₺');
    expect(within(card).getByText(`${tr.offers.oldPrice}:`)).toBeInTheDocument();
    expect(within(card).getByText(`${tr.offers.price}:`)).toBeInTheDocument();
    expect(within(card).getByText('500 ₺')).toBeInTheDocument();
  });

  it('shows a label instead of an old price on the advantage package', () => {
    renderPage();
    const card = screen.getByRole('article', { name: 'Seramik Çömlek & Barista İkramı' });
    expect(within(card).getByText('AVANTAJLI')).toBeInTheDocument();
    expect(card.querySelector('del')).toBeNull();
    expect(within(card).getByText('750 ₺')).toBeInTheDocument();
  });

  it('uses "Paketi Seç" on two packages and "İncele" on the third', () => {
    renderPage();
    expect(screen.getAllByRole('button', { name: tr.offers.select })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: tr.offers.details })).toHaveLength(1);
  });

  it('reveals a staff note when a button is activated, by mouse or keyboard', async () => {
    const user = userEvent.setup();
    renderPage();
    const card = screen.getByRole('article', { name: 'Kahve & Figür Boyama Deneyimi' });
    const button = within(card).getByRole('button', { name: tr.offers.select });
    const note = within(card).getByText(tr.offers.note);

    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(note).not.toBeVisible();

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(note).toBeVisible();

    button.focus();
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(note).not.toBeVisible();
  });
});
