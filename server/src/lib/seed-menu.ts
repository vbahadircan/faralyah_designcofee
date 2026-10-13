import { z } from 'zod';
import { MENU_LIMITS } from '@faralyah/shared';
import { Category } from '../models/category';
import { MenuItem } from '../models/menu-item';

/** Seed files are written in ₺ (what an owner's spreadsheet has); we store kuruş. */
export const seedFileSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(MENU_LIMITS.nameMax),
        items: z.array(
          z.object({
            name: z.string().trim().min(1).max(MENU_LIMITS.nameMax),
            price: z.number().min(0).max(100_000),
            /** Optional large-size price; `price` is then the small size. */
            priceLarge: z.number().min(0).max(100_000).optional(),
            description: z.string().trim().max(MENU_LIMITS.descriptionMax).optional(),
          }),
        ),
      }),
    )
    .min(1),
});

export type SeedFile = z.infer<typeof seedFileSchema>;

/** Inserts categories and items in array order. Callers decide whether to wipe first. */
export async function seedMenu(data: SeedFile): Promise<{ categories: number; items: number }> {
  let itemCount = 0;
  for (const [categoryIndex, category] of data.categories.entries()) {
    const created = await Category.create({ name: category.name, order: categoryIndex });
    for (const [itemIndex, item] of category.items.entries()) {
      await MenuItem.create({
        name: item.name,
        priceKurus: Math.round(item.price * 100),
        ...(item.priceLarge !== undefined
          ? { priceLargeKurus: Math.round(item.priceLarge * 100) }
          : {}),
        description: item.description,
        categoryId: created._id,
        order: itemIndex,
      });
      itemCount += 1;
    }
  }
  return { categories: data.categories.length, items: itemCount };
}
