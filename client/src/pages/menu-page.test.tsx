import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tr } from '@/content/tr';
import { jsonResponse, sampleMenu } from '@/test-fixtures';
import { MenuPage } from './menu-page';

afterEach(() => vi.unstubAllGlobals());

describe('MenuPage', () => {
  it('shows a loading state, then categories with their items and prices', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleMenu)));
    render(<MenuPage />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');

    const section = await screen.findByRole('region', { name: 'Sıcak İçecekler' });
    expect(within(section).getAllByRole('listitem')).toHaveLength(2);
    expect(within(section).getByText('135 ₺')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Tatlılar' })).toBeInTheDocument();
    expect(screen.getByText('120,50 ₺')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: tr.menu.categoriesNav })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a friendly empty state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ categories: [] })));
    render(<MenuPage />);
    expect(await screen.findByText(tr.menu.empty)).toBeInTheDocument();
  });

  it('shows an error with a retry that recovers', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: 'x' }, 500))
      .mockResolvedValueOnce(jsonResponse(sampleMenu));
    vi.stubGlobal('fetch', fetchMock);
    render(<MenuPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(tr.menu.loadError);
    await userEvent.setup().click(screen.getByRole('button', { name: tr.menu.retry }));
    expect(await screen.findByRole('region', { name: 'Tatlılar' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats a malformed response as an error, not a crash', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ nope: true })));
    render(<MenuPage />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
