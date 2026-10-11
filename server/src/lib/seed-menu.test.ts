import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { clearDb, startMemoryDb } from '../test/memory-db';
import { Category } from '../models/category';
import { MenuItem } from '../models/menu-item';
import { getPublicMenu } from './public-menu';
import { seedFileSchema, seedMenu } from './seed-menu';

let stop: () => Promise<void>;
beforeAll(async () => {
  stop = await startMemoryDb();
}, 120_000);
afterAll(async () => stop());
beforeEach(clearDb);

describe('seedMenu', () => {
  it('converts ₺ to integer kuruş and keeps array order', async () => {
    const data = seedFileSchema.parse({
      categories: [
        {
          name: 'Tatlılar',
          items: [
            { name: 'Sütlaç', price: 42.5 },
            { name: 'Brownie', price: 150 },
          ],
        },
      ],
    });
    await seedMenu(data);
    const menu = await getPublicMenu();
    expect(menu.categories[0]?.items.map((i) => [i.name, i.priceKurus])).toEqual([
      ['Sütlaç', 4250],
      ['Brownie', 15000],
    ]);
  });

  it('the bundled sample file is valid and seeds a full menu', async () => {
    const raw = await readFile(new URL('../../seed/menu.sample.json', import.meta.url), 'utf8');
    const result = await seedMenu(seedFileSchema.parse(JSON.parse(raw)));
    expect(result.categories).toBe(5);
    expect(await Category.countDocuments()).toBe(5);
    expect(await MenuItem.countDocuments()).toBe(result.items);
  });
});

describe('MenuItem model', () => {
  it('rejects fractional prices', async () => {
    const category = await Category.create({ name: 'X' });
    await expect(
      MenuItem.create({ name: 'Y', priceKurus: 10.5, categoryId: category._id }),
    ).rejects.toThrow(/integer/);
  });
});
