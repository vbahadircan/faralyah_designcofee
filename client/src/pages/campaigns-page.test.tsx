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

  it('reveals the ask-the-staff note from the button', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleCampaigns)));
    const user = userEvent.setup();
    renderPage();
    const card = await screen.findByRole('article', { name: 'Tuval Boyama + Kahve' });
    const button = within(card).getByRole('button', { name: tr.campaigns.ask });
    const note = within(card).getByText(tr.campaigns.note);
    expect(note).not.toBeVisible();
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(note).toBeVisible();
  });

  it('has a jump strip with a chip per campaign (name and price) pointing at its card', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(sampleCampaigns)));
    const user = userEvent.setup();
    renderPage();
    const nav = await screen.findByRole('navigation', { name: tr.campaigns.title });
    const chip = within(nav).getByRole('link', { name: /Tuval Boyama \+ Kahve/ });
    expect(chip).toHaveTextContent(/350\s₺/);
    expect(chip).toHaveAttribute('href', '#kampanya-k2');
    await user.click(chip);
    expect(chip).toHaveAttribute('aria-current', 'true');
    expect(document.getElementById('kampanya-k2')).toHaveClass('card-flash');
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
