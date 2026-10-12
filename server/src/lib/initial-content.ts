import { z } from 'zod';
import { CAMPAIGN_LIMITS, MENU_LIMITS } from '@faralyah/shared';
import { Campaign } from '../models/campaign';
import { Category } from '../models/category';

/** Starting categories and campaigns from the owner, in ₺ like the menu seed file. */
export const initialContentSchema = z.object({
  categories: z.array(z.string().trim().min(1).max(MENU_LIMITS.nameMax)),
  campaigns: z.array(
    z.object({
      title: z.string().trim().min(1).max(CAMPAIGN_LIMITS.titleMax),
      description: z.string().trim().max(CAMPAIGN_LIMITS.descriptionMax).optional(),
      price: z.number().min(0).max(100_000),
    }),
  ),
});

export type InitialContent = z.infer<typeof initialContentSchema>;

/**
 * Adds the starting categories and campaigns, each only when its collection is still empty,
 * so it is safe to run on a live database: it never overwrites what staff have entered.
 */
export async function loadInitialContent(
  data: InitialContent,
): Promise<{ categories: number; campaigns: number }> {
  let categories = 0;
  let campaigns = 0;
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(data.categories.map((name, order) => ({ name, order })));
    categories = data.categories.length;
  }
  if ((await Campaign.countDocuments()) === 0) {
    await Campaign.insertMany(
      data.campaigns.map((c, order) => ({
        title: c.title,
        description: c.description,
        priceKurus: Math.round(c.price * 100),
        order,
      })),
    );
    campaigns = data.campaigns.length;
  }
  return { categories, campaigns };
}
