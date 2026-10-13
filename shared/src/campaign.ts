import { z } from 'zod';
import { priceKurusSchema } from './menu';

/** Limits shared by the admin forms and the API (single source of truth). */
export const CAMPAIGN_LIMITS = {
  titleMax: 80,
  descriptionMax: 280,
} as const;

/** What the admin sends when creating or editing a campaign. The image is uploaded separately. */
export const campaignInputSchema = z.object({
  title: z.string().trim().min(1).max(CAMPAIGN_LIMITS.titleMax),
  description: z.string().trim().max(CAMPAIGN_LIMITS.descriptionMax).optional(),
  priceKurus: priceKurusSchema,
  published: z.boolean().default(true),
});

/** What the public campaigns endpoint returns: only published campaigns, in order. */
export const publicCampaignSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priceKurus: priceKurusSchema,
  /** Site-relative URL of the cover image, e.g. "/uploads/campaigns/abc.webp". */
  imageUrl: z.string().optional(),
});

export const publicCampaignListSchema = z.object({
  campaigns: z.array(publicCampaignSchema),
});

export const adminCampaignSchema = publicCampaignSchema.extend({
  published: z.boolean(),
  order: z.number().int(),
});

export const adminCampaignListSchema = z.object({
  campaigns: z.array(adminCampaignSchema),
});

export type CampaignInput = z.infer<typeof campaignInputSchema>;
export type PublicCampaign = z.infer<typeof publicCampaignSchema>;
export type PublicCampaignList = z.infer<typeof publicCampaignListSchema>;
export type AdminCampaign = z.infer<typeof adminCampaignSchema>;
export type AdminCampaignList = z.infer<typeof adminCampaignListSchema>;
