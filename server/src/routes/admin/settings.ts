import { Router } from 'express';
import { siteSettingsInputSchema } from '@faralyah/shared';
import { getSiteSettings, updateSiteSettings } from '../../lib/site-settings';
import { parseBody } from '../../lib/validate';

export const adminSettingsRouter = Router();

adminSettingsRouter.get('/settings', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await getSiteSettings());
});

adminSettingsRouter.patch('/settings', async (req, res) => {
  const input = parseBody(siteSettingsInputSchema, req, res);
  if (!input) return;
  await updateSiteSettings(input);
  res.status(204).end();
});
