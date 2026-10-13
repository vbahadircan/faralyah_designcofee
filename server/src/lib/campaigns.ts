import type { AdminCampaign, PublicCampaign } from '@faralyah/shared';
import { Campaign } from '../models/campaign';

export const CAMPAIGN_IMAGE_DIR = 'campaigns';

export function campaignImageUrl(image: string | null | undefined): string | undefined {
  return image ? `/uploads/${CAMPAIGN_IMAGE_DIR}/${image}` : undefined;
}

type CampaignLean = {
  _id: { toString(): string };
  title: string;
  description?: string | null;
  priceKurus: number;
  image?: string | null;
  order: number;
  published: boolean;
};

function toPublic(campaign: CampaignLean): PublicCampaign {
  const imageUrl = campaignImageUrl(campaign.image);
  return {
    id: campaign._id.toString(),
    title: campaign.title,
    priceKurus: campaign.priceKurus,
    ...(campaign.description ? { description: campaign.description } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  };
}

export async function getPublicCampaigns(): Promise<PublicCampaign[]> {
  const campaigns = await Campaign.find({ published: true }).sort({ order: 1, _id: 1 }).lean();
  return campaigns.map(toPublic);
}

export async function getAdminCampaigns(): Promise<AdminCampaign[]> {
  const campaigns = await Campaign.find().sort({ order: 1, _id: 1 }).lean();
  return campaigns.map((c) => ({ ...toPublic(c), published: c.published, order: c.order }));
}
