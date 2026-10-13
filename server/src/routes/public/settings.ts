import { Router } from 'express';
import { getSiteSettings } from '../../lib/site-settings';

export const settingsRouter = Router();

// Same short cache as the menu: staff edits show up within about a minute.
settingsRouter.get('/settings', async (_req, res) => {
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  res.json(await getSiteSettings());
});
