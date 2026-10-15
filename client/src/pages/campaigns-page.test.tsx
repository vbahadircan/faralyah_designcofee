import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tr } from '@/content/tr';
import { jsonResponse, sampleCampaigns } from '@/test-fixtures';
import { CampaignsPage } from './campaigns-page';

const renderPage = () =>
  render(
    <MemoryRouter>
      <CampaignsPage />
    </MemoryRouter>,
  );

afterEach(() => vi.unstubAllGlobals());

describe('CampaignsPage', () => {
  it('lists campaigns with photo, title and labelled price', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleCampaigns)));
    renderPage();
    const card = await screen.findByRole('article', { name: 'Figür Boyama + Kahve' });
    expect(card.querySelector('img')).toHaveAttribute('src', '/uploads/campaigns/figur.webp');
    expect(within(card).getByText(`${tr.campaigns.price}:`)).toBeInTheDocument();
    expect(card).toHaveTextContent(/400\s₺/);
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('has no jump strip and no booking button; the staff are the way to book', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleCampaigns)));
    renderPage();
    await screen.findAllByRole('article');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a small icon tile instead of a banner when a campaign has no photo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleCampaigns)));
    renderPage();
    const plain = await screen.findByRole('article', { name: 'Tuval Boyama + Kahve' });
    expect(plain.querySelector('[class*="aspect-"]')).toBeNull();
    expect(plain.querySelector('svg')).not.toBeNull();
  });

  it('shows the empty state and the error state with retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({ campaigns: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(tr.campaigns.loadError);
    await user.click(screen.getByRole('button', { name: tr.campaigns.retry }));
    expect(await screen.findByText(tr.campaigns.empty)).toBeInTheDocument();
  });
});
