import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { tr } from '@/content/tr';
import { CategoryTabs } from './category-tabs';

const categories = [
  { id: 'sicak', name: 'Sıcak İçecekler' },
  { id: 'tatli', name: 'Tatlılar' },
];

describe('CategoryTabs', () => {
  it('is a labelled nav of anchors pointing at the sections', () => {
    render(<CategoryTabs categories={categories} />);
    expect(screen.getByRole('navigation', { name: tr.menu.categoriesNav })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tatlılar' })).toHaveAttribute(
      'href',
      '#kategori-tatli',
    );
  });

  it('marks the first tab current, and moves the mark when another is activated', async () => {
    const user = userEvent.setup();
    render(<CategoryTabs categories={categories} />);
    expect(screen.getByRole('link', { name: 'Sıcak İçecekler' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await user.click(screen.getByRole('link', { name: 'Tatlılar' }));
    expect(screen.getByRole('link', { name: 'Tatlılar' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Sıcak İçecekler' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('is reachable and activatable with the keyboard', async () => {
    const user = userEvent.setup();
    render(<CategoryTabs categories={categories} />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Sıcak İçecekler' })).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('link', { name: 'Tatlılar' })).toHaveAttribute('aria-current', 'true');
  });
});
