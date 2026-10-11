import request from 'supertest';
import { publicMenuSchema } from '@faralyah/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { Category } from '../../models/category';
import { MenuItem } from '../../models/menu-item';
import { clearDb, startMemoryDb } from '../../test/memory-db';

let stop: () => Promise<void>;
const app = createApp();

beforeAll(async () => {
  stop = await startMemoryDb();
}, 120_000);
afterAll(async () => stop());
beforeEach(clearDb);

describe('GET /api/menu', () => {
  it('returns an empty menu when there is nothing', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ categories: [] });
  });

  it('returns categories and items in order, matching the shared schema', async () => {
    const tatlilar = await Category.create({ name: 'Tatlılar', order: 1 });
    const sicak = await Category.create({ name: 'Sıcak İçecekler', order: 0 });
    await MenuItem.create({ name: 'Latte', priceKurus: 13500, categoryId: sicak._id, order: 1 });
    await MenuItem.create({
      name: 'Türk Kahvesi',
      priceKurus: 9500,
      description: 'Sade, orta veya şekerli',
      categoryId: sicak._id,
      order: 0,
    });
    await MenuItem.create({ name: 'Brownie', priceKurus: 15000, categoryId: tatlilar._id });

    const res = await request(app).get('/api/menu');
    const menu = publicMenuSchema.parse(res.body);

    expect(menu.categories.map((c) => c.name)).toEqual(['Sıcak İçecekler', 'Tatlılar']);
    expect(menu.categories[0]?.items.map((i) => i.name)).toEqual(['Türk Kahvesi', 'Latte']);
    expect(menu.categories[0]?.items[0]).toMatchObject({
      priceKurus: 9500,
      description: 'Sade, orta veya şekerli',
    });
    expect(menu.categories[0]?.items[1]).not.toHaveProperty('description');
  });

  it('never exposes hidden items, inactive categories, or empty categories', async () => {
    const live = await Category.create({ name: 'Canlı', order: 0 });
    const inactive = await Category.create({ name: 'Pasif', order: 1, active: false });
    const empty = await Category.create({ name: 'Boş', order: 2 });
    const allHidden = await Category.create({ name: 'Hepsi gizli', order: 3 });
    await MenuItem.create({ name: 'Görünür', priceKurus: 100, categoryId: live._id });
    await MenuItem.create({ name: 'Gizli', priceKurus: 100, categoryId: live._id, visible: false });
    await MenuItem.create({ name: 'Pasif kategoride', priceKurus: 100, categoryId: inactive._id });
    await MenuItem.create({
      name: 'Gizli 2',
      priceKurus: 100,
      categoryId: allHidden._id,
      visible: false,
    });
    void empty;

    const res = await request(app).get('/api/menu');
    expect(res.body.categories).toHaveLength(1);
    expect(res.body.categories[0].name).toBe('Canlı');
    expect(res.body.categories[0].items.map((i: { name: string }) => i.name)).toEqual(['Görünür']);
    expect(JSON.stringify(res.body)).not.toMatch(/Gizli|Pasif/);
  });

  it('is cacheable for ~30 s and supports ETag revalidation', async () => {
    const category = await Category.create({ name: 'Tatlılar' });
    await MenuItem.create({ name: 'Brownie', priceKurus: 15000, categoryId: category._id });

    const first = await request(app).get('/api/menu');
    expect(first.headers['cache-control']).toBe('public, max-age=30, stale-while-revalidate=60');
    const etag = first.headers.etag;
    expect(etag).toBeTruthy();

    const second = await request(app).get('/api/menu').set('If-None-Match', etag!);
    expect(second.status).toBe(304);
  });
});
