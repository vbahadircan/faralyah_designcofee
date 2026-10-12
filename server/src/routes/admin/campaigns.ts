import path from 'node:path';
import { Router, type ErrorRequestHandler } from 'express';
import multer from 'multer';
import { campaignInputSchema, moveInputSchema } from '@faralyah/shared';
import { CAMPAIGN_IMAGE_DIR, getAdminCampaigns } from '../../lib/campaigns';
import { removeImage, saveCoverImage } from '../../lib/images';
import { moveInGroup, nextOrder } from '../../lib/reorder';
import { parseBody, validId } from '../../lib/validate';
import { Campaign } from '../../models/campaign';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function createAdminCampaignsRouter(uploadsDir: string): Router {
  const router = Router();
  const imageDir = path.join(uploadsDir, CAMPAIGN_IMAGE_DIR);
  const campaignPatch = campaignInputSchema.partial();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (_req, file, done) => done(null, file.mimetype.startsWith('image/')),
  });

  router.get('/campaigns', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ campaigns: await getAdminCampaigns() });
  });

  router.post('/campaigns', async (req, res) => {
    const input = parseBody(campaignInputSchema, req, res);
    if (!input) return;
    const order = await nextOrder(Campaign, {});
    const campaign = await Campaign.create({ ...input, order });
    res.status(201).json({ id: campaign._id.toString() });
  });

  router.patch('/campaigns/:id', async (req, res) => {
    if (!validId(req.params.id, res)) return;
    const input = parseBody(campaignPatch, req, res);
    if (!input) return;
    const { description, ...rest } = input;
    const update =
      description === undefined
        ? rest
        : description === ''
          ? { ...rest, $unset: { description: 1 } }
          : { ...rest, description };
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, update, {
      runValidators: true,
    });
    res.status(campaign ? 204 : 404).end();
  });

  router.post('/campaigns/:id/move', async (req, res) => {
    if (!validId(req.params.id, res)) return;
    const input = parseBody(moveInputSchema, req, res);
    if (!input) return;
    const moved = await moveInGroup(Campaign, {}, req.params.id, input.direction);
    res.status(moved ? 204 : 404).end();
  });

  router.delete('/campaigns/:id', async (req, res) => {
    if (!validId(req.params.id, res)) return;
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    await removeImage(imageDir, campaign.image);
    res.status(204).end();
  });

  router.put('/campaigns/:id/image', upload.single('image'), async (req, res) => {
    if (!validId(req.params.id, res)) return;
    if (!req.file) {
      res.status(400).json({ error: 'image_required' });
      return;
    }
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    let name: string;
    try {
      name = await saveCoverImage(req.file.buffer, imageDir);
    } catch {
      res.status(400).json({ error: 'invalid_image' });
      return;
    }
    const previous = campaign.image;
    campaign.image = name;
    await campaign.save();
    await removeImage(imageDir, previous);
    res.status(204).end();
  });

  router.delete('/campaigns/:id/image', async (req, res) => {
    if (!validId(req.params.id, res)) return;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    const previous = campaign.image;
    campaign.image = undefined;
    await campaign.save();
    await removeImage(imageDir, previous);
    res.status(204).end();
  });

  // Upload limits (too big, too many files) become a 400 instead of a 500.
  router.use(((error, _req, res, next) => {
    if (error instanceof multer.MulterError) {
      res
        .status(400)
        .json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'image_too_large' : 'upload' });
      return;
    }
    next(error);
  }) satisfies ErrorRequestHandler);

  return router;
}
