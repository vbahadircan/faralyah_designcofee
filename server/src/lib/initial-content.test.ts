import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Campaign } from '../models/campaign';
import { Category } from '../models/category';
import { clearDb, startMemoryDb } from '../test/memory-db';
import { initialContentSchema, loadInitialContent } from './initial-content';

let stop: () => Promise<void>;
beforeAll(async () => {
  stop = await startMemoryDb();
}, 120_000);
afterAll(async () => stop());
beforeEach(clearDb);

async function readFileContent() {
  const raw = await readFile(new URL('../../seed/initial-content.json', import.meta.url), 'utf8');
  return initialContentSchema.parse(JSON.parse(raw));
}

describe('loadInitialContent', () => {
  it('loads the owner’s four categories and four campaigns into an empty database', async () => {
    const result = await loadInitialContent(await readFileContent());
    expect(result).toEqual({ categories: 4, campaigns: 4 });
    const campaign = await Campaign.findOne({ title: 'Tuval Boyama + Kahve' }).lean();
    expect(campaign?.priceKurus).toBe(35000);
  });

  it('never touches collections that already have content', async () => {
    await Category.create({ name: 'Mevcut', order: 0 });
    const result = await loadInitialContent(await readFileContent());
    expect(result.categories).toBe(0);
    expect(await Category.countDocuments()).toBe(1);
  });
});
