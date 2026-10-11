import { Router } from 'express';
import { getPublicMenu } from '../../lib/public-menu';

export const menuRouter = Router();

// Short cache: staff edits show up within about a minute (PRODUCT.md §7).
menuRouter.get('/menu', async (_req, res) => {
  const menu = await getPublicMenu();
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  res.json(menu); // Express adds a weak ETag, so revalidation returns 304.
});
