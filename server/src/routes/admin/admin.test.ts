import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import argon2 from 'argon2';
import sharp from 'sharp';
import request from 'supertest';
import {
  adminCampaignListSchema,
  adminMenuSchema,
  publicCampaignListSchema,
  publicMenuSchema,
} from '@faralyah/shared';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { AdminUser } from '../../models/admin-user';
import { Category } from '../../models/category';
import { clearDb, startMemoryDb } from '../../test/memory-db';

let stop: () => Promise<void>;
let uploadsDir: string;
let app: ReturnType<typeof createApp>;

const EMAIL = 'sahip@example.com';
const PASSWORD = 'dogru-sifre-123';

beforeAll(async () => {
  stop = await startMemoryDb();
  uploadsDir = await mkdtemp(path.join(tmpdir(), 'faralyah-test-'));
  app = createApp({ uploadsDir });
}, 120_000);
afterAll(async () => {
  await stop();
  await rm(uploadsDir, { recursive: true, force: true });
});
beforeEach(async () => {
  await clearDb();
  await AdminUser.create({ email: EMAIL, passwordHash: await argon2.hash(PASSWORD) });
});

/** Logs in and returns an agent that keeps the cookie, plus the CSRF token. */
async function login() {
  const agent = request.agent(app);
  const res = await agent.post('/api/admin/login').send({ email: EMAIL, password: PASSWORD });
  expect(res.status).toBe(200);
  return { agent, csrf: res.body.csrfToken as string };
}

describe('admin auth', () => {
  it('rejects a wrong password and an unknown email the same way', async () => {
    const wrong = await request(app)
      .post('/api/admin/login')
      .send({ email: EMAIL, password: 'yanlis-sifre' });
    const unknown = await request(app)
      .post('/api/admin/login')
      .send({ email: 'kimse@example.com', password: PASSWORD });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('blocks admin routes without a session', async () => {
    const res = await request(app).get('/api/admin/menu');
    expect(res.status).toBe(401);
  });

  it('reports the session and ends it on logout', async () => {
    const { agent, csrf } = await login();
    const session = await agent.get('/api/admin/session');
    expect(session.body).toMatchObject({ authenticated: true, email: EMAIL, csrfToken: csrf });
    await agent.post('/api/admin/logout').expect(204);
    expect((await agent.get('/api/admin/session')).body).toEqual({ authenticated: false });
    expect((await agent.get('/api/admin/menu')).status).toBe(401);
  });

  it('refuses changes without the CSRF token', async () => {
    const { agent } = await login();
    const res = await agent.post('/api/admin/categories').send({ name: 'Yeni' });
    expect(res.status).toBe(403);
    expect(await Category.countDocuments()).toBe(0);
  });
});

describe('admin menu', () => {
  it('adds a category and item, changes the price, hides the item', async () => {
    const { agent, csrf } = await login();
    const cat = await agent
      .post('/api/admin/categories')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'Sıcak İçecekler' })
      .expect(201);
    const item = await agent
      .post('/api/admin/items')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'Örnek Ürün', priceKurus: 10000, categoryId: cat.body.id })
      .expect(201);

    await agent
      .patch(`/api/admin/items/${item.body.id}`)
      .set('X-CSRF-Token', csrf)
      .send({ priceKurus: 12550 })
      .expect(204);
    let menu = publicMenuSchema.parse((await request(app).get('/api/menu')).body);
    expect(menu.categories[0]?.items[0]?.priceKurus).toBe(12550);

    await agent
      .patch(`/api/admin/items/${item.body.id}`)
      .set('X-CSRF-Token', csrf)
      .send({ visible: false })
      .expect(204);
    menu = publicMenuSchema.parse((await request(app).get('/api/menu')).body);
    expect(menu.categories).toEqual([]);

    const admin = adminMenuSchema.parse((await agent.get('/api/admin/menu')).body);
    expect(admin.categories[0]?.items[0]).toMatchObject({ visible: false, priceKurus: 12550 });
  });

  it('sets, keeps and clears an optional large-size price', async () => {
    const { agent, csrf } = await login();
    const cat = await agent
      .post('/api/admin/categories')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'Sıcak İçecekler' })
      .expect(201);
    const item = await agent
      .post('/api/admin/items')
      .set('X-CSRF-Token', csrf)
      .send({
        name: 'Örnek Ürün',
        priceKurus: 10000,
        priceLargeKurus: 12000,
        categoryId: cat.body.id,
      })
      .expect(201);
    const publicItem = async () =>
      publicMenuSchema.parse((await request(app).get('/api/menu')).body).categories[0]?.items[0];
    expect(await publicItem()).toMatchObject({ priceKurus: 10000, priceLargeKurus: 12000 });

    // A patch that leaves the field out keeps it.
    await agent
      .patch(`/api/admin/items/${item.body.id}`)
      .set('X-CSRF-Token', csrf)
      .send({ priceKurus: 11000 })
      .expect(204);
    expect(await publicItem()).toMatchObject({ priceKurus: 11000, priceLargeKurus: 12000 });

    // null removes it, together with an empty description in the same request.
    await agent
      .patch(`/api/admin/items/${item.body.id}`)
      .set('X-CSRF-Token', csrf)
      .send({ priceLargeKurus: null, description: '' })
      .expect(204);
    expect(await publicItem()).not.toHaveProperty('priceLargeKurus');

    await agent
      .patch(`/api/admin/items/${item.body.id}`)
      .set('X-CSRF-Token', csrf)
      .send({ priceLargeKurus: 12.5 })
      .expect(400);
  });

  it('rejects invalid input', async () => {
    const { agent, csrf } = await login();
    await agent
      .post('/api/admin/categories')
      .set('X-CSRF-Token', csrf)
      .send({ name: '' })
      .expect(400);
    await agent
      .post('/api/admin/items')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'X', priceKurus: 10.5, categoryId: 'yok' })
      .expect(400);
  });

  it('reorders categories and refuses to delete a category with items', async () => {
    const { agent, csrf } = await login();
    const a = await Category.create({ name: 'A', order: 0 });
    const b = await Category.create({ name: 'B', order: 1 });
    await agent
      .post(`/api/admin/categories/${b._id}/move`)
      .set('X-CSRF-Token', csrf)
      .send({ direction: 'up' })
      .expect(204);
    const admin = adminMenuSchema.parse((await agent.get('/api/admin/menu')).body);
    expect(admin.categories.map((c) => c.name)).toEqual(['B', 'A']);

    await agent
      .post('/api/admin/items')
      .set('X-CSRF-Token', csrf)
      .send({ name: 'Örnek', priceKurus: 100, categoryId: a._id.toString() })
      .expect(201);
    await agent.delete(`/api/admin/categories/${a._id}`).set('X-CSRF-Token', csrf).expect(409);
    await agent.delete(`/api/admin/categories/${b._id}`).set('X-CSRF-Token', csrf).expect(204);
  });
});

describe('admin campaigns', () => {
  it('creates a campaign, uploads an image, and hides unpublished ones', async () => {
    const { agent, csrf } = await login();
    const created = await agent
      .post('/api/admin/campaigns')
      .set('X-CSRF-Token', csrf)
      .send({ title: 'Tuval Boyama + Kahve', priceKurus: 35000 })
      .expect(201);

    const png = await sharp({
      create: { width: 40, height: 30, channels: 3, background: { r: 200, g: 100, b: 50 } },
    })
      .png()
      .toBuffer();
    await agent
      .put(`/api/admin/campaigns/${created.body.id}/image`)
      .set('X-CSRF-Token', csrf)
      .attach('image', png, { filename: 'foto.png', contentType: 'image/png' })
      .expect(204);

    const list = publicCampaignListSchema.parse((await request(app).get('/api/campaigns')).body);
    expect(list.campaigns).toHaveLength(1);
    expect(list.campaigns[0]).toMatchObject({ title: 'Tuval Boyama + Kahve', priceKurus: 35000 });
    expect(list.campaigns[0]?.imageUrl).toMatch(/^\/uploads\/campaigns\/.+\.webp$/);
    expect(await readdir(path.join(uploadsDir, 'campaigns'))).toHaveLength(1);
    await request(app).get(list.campaigns[0]!.imageUrl!).expect(200);

    await agent
      .patch(`/api/admin/campaigns/${created.body.id}`)
      .set('X-CSRF-Token', csrf)
      .send({ published: false })
      .expect(204);
    expect((await request(app).get('/api/campaigns')).body).toEqual({ campaigns: [] });
    const admin = adminCampaignListSchema.parse((await agent.get('/api/admin/campaigns')).body);
    expect(admin.campaigns[0]?.published).toBe(false);

    await agent
      .delete(`/api/admin/campaigns/${created.body.id}`)
      .set('X-CSRF-Token', csrf)
      .expect(204);
    expect(await readdir(path.join(uploadsDir, 'campaigns'))).toHaveLength(0);
  });

  it('rejects a file that is not an image', async () => {
    const { agent, csrf } = await login();
    const created = await agent
      .post('/api/admin/campaigns')
      .set('X-CSRF-Token', csrf)
      .send({ title: 'Kampanya', priceKurus: 100 })
      .expect(201);
    await agent
      .put(`/api/admin/campaigns/${created.body.id}/image`)
      .set('X-CSRF-Token', csrf)
      .attach('image', Buffer.from('not an image'), {
        filename: 'x.png',
        contentType: 'image/png',
      })
      .expect(400);
  });
});
