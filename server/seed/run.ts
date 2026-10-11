/**
 * Loads menu data into the database.
 *   npm run seed                 -> uses seed/menu.json if present, else menu.sample.json
 *   npm run seed -- --reset      -> wipes categories and menu_items first
 * Refuses to run in production, and refuses to add to a non-empty menu without --reset.
 */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb, disconnectDb } from '../src/db';
import { seedFileSchema, seedMenu } from '../src/lib/seed-menu';
import { Category } from '../src/models/category';
import { MenuItem } from '../src/models/menu-item';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed with NODE_ENV=production.');
  }
  const reset = process.argv.includes('--reset');
  const real = path.join(here, 'menu.json');
  const file = existsSync(real) ? real : path.join(here, 'menu.sample.json');
  const data = seedFileSchema.parse(JSON.parse(await readFile(file, 'utf8')));

  await connectDb();
  try {
    const existing = (await Category.countDocuments()) + (await MenuItem.countDocuments());
    if (existing > 0 && !reset) {
      throw new Error('Menu is not empty. Re-run with --reset to replace it.');
    }
    if (reset) await Promise.all([Category.deleteMany({}), MenuItem.deleteMany({})]);
    const result = await seedMenu(data);
    console.log(
      `[seed] ${path.basename(file)}: ${result.categories} categories, ${result.items} items`,
    );
  } finally {
    await disconnectDb();
  }
}

main().catch((error) => {
  console.error(`[seed] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
