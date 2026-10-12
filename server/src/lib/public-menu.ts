import type { PublicMenu } from '@faralyah/shared';
import { Category } from '../models/category';
import { MenuItem } from '../models/menu-item';

/**
 * The public menu: active categories in order, each with its visible items in order.
 * Categories left with no visible items are omitted so the page never shows an empty section.
 */
export async function getPublicMenu(): Promise<PublicMenu> {
  const categories = await Category.find({ active: true }).sort({ order: 1, _id: 1 }).lean();
  const items = await MenuItem.find({
    visible: true,
    categoryId: { $in: categories.map((c) => c._id) },
  })
    .sort({ order: 1, _id: 1 })
    .lean();

  const byCategory = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.categoryId.toString();
    byCategory.set(key, [...(byCategory.get(key) ?? []), item]);
  }

  return {
    categories: categories
      .map((category) => ({
        id: category._id.toString(),
        name: category.name,
        items: (byCategory.get(category._id.toString()) ?? []).map((item) => ({
          id: item._id.toString(),
          name: item.name,
          priceKurus: item.priceKurus,
          ...(item.priceLargeKurus != null ? { priceLargeKurus: item.priceLargeKurus } : {}),
          ...(item.description ? { description: item.description } : {}),
        })),
      }))
      .filter((category) => category.items.length > 0),
  };
}
