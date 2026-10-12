import type { AdminMenu } from '@faralyah/shared';
import { Category } from '../models/category';
import { MenuItem } from '../models/menu-item';

/** The whole menu for the admin, hidden items and inactive categories included. */
export async function getAdminMenu(): Promise<AdminMenu> {
  const categories = await Category.find().sort({ order: 1, _id: 1 }).lean();
  const items = await MenuItem.find().sort({ order: 1, _id: 1 }).lean();
  return {
    categories: categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      active: category.active,
      items: items
        .filter((item) => item.categoryId.equals(category._id))
        .map((item) => ({
          id: item._id.toString(),
          name: item.name,
          priceKurus: item.priceKurus,
          ...(item.priceLargeKurus != null ? { priceLargeKurus: item.priceLargeKurus } : {}),
          visible: item.visible,
          ...(item.description ? { description: item.description } : {}),
        })),
    })),
  };
}
