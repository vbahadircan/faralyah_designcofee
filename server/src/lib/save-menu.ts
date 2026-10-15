import { Types } from 'mongoose';
import type { MenuSave } from '@faralyah/shared';
import { Category } from '../models/category';
import { MenuItem } from '../models/menu-item';

/** True when one id appears twice in the save; the panel never sends that, so refuse it. */
export function hasDuplicateIds(input: MenuSave): boolean {
  const ids = input.categories.flatMap((category) => [
    category.id,
    ...category.items.map((item) => item.id),
  ]);
  const known = ids.filter((id): id is string => id !== undefined);
  return new Set(known).size !== known.length;
}

/**
 * Makes the database match the menu the admin sent. Array order becomes `order`, rows without
 * an id are created, and anything missing from the list is deleted (its items go with it).
 *
 * Not a transaction: a standalone MongoDB has none. A failure part-way can leave a partial
 * save, which the panel shows on its next load.
 */
export async function saveAdminMenu(input: MenuSave): Promise<void> {
  const categories = input.categories.map((category) => ({
    ...category,
    id: category.id ?? new Types.ObjectId().toHexString(),
  }));

  const items = categories.flatMap((category) =>
    category.items.map((item, order) => ({
      ...item,
      id: item.id ?? new Types.ObjectId().toHexString(),
      categoryId: category.id,
      order,
    })),
  );

  await Category.bulkWrite(
    categories.map((category, order) => ({
      updateOne: {
        filter: { _id: category.id },
        update: { $set: { name: category.name, active: category.active, order } },
        upsert: true,
      },
    })),
  );

  // An empty description and a missing large price are removed, not stored as empty values.
  await MenuItem.bulkWrite(
    items.map((item) => {
      const set: Record<string, unknown> = {
        name: item.name,
        priceKurus: item.priceKurus,
        visible: item.visible,
        categoryId: item.categoryId,
        order: item.order,
      };
      const unset: Record<string, 1> = {};
      if (item.description) set.description = item.description;
      else unset.description = 1;
      if (item.priceLargeKurus != null) set.priceLargeKurus = item.priceLargeKurus;
      else unset.priceLargeKurus = 1;
      return {
        updateOne: {
          filter: { _id: item.id },
          update: { $set: set, ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}) },
          upsert: true,
        },
      };
    }) as Parameters<typeof MenuItem.bulkWrite>[0],
  );

  const categoryIds = categories.map((category) => category.id);
  const itemIds = items.map((item) => item.id);
  await Category.deleteMany({ _id: { $nin: categoryIds } });
  await MenuItem.deleteMany({
    $or: [{ _id: { $nin: itemIds } }, { categoryId: { $nin: categoryIds } }],
  });
}
