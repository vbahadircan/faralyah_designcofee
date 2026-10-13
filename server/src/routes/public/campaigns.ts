import { Router } from 'express';
import type { PublicCampaignList } from '@faralyah/shared';
import { getPublicCampaigns } from '../../lib/campaigns';

export const campaignsRouter = Router();

// Same short cache as the menu: staff edits show up within about a minute.
campaignsRouter.get('/campaigns', async (_req, res) => {
  const body: PublicCampaignList = { campaigns: await getPublicCampaigns() };
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  res.json(body);
});
