/**
 * Loads the owner's starting categories and campaigns (seed/initial-content.json).
 *   npm run content:init
 * Safe in production: each part is added only if that collection is empty.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDb, disconnectDb } from '../src/db';
import { initialContentSchema, loadInitialContent } from '../src/lib/initial-content';

const here = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const file = path.join(here, 'initial-content.json');
  const data = initialContentSchema.parse(JSON.parse(await readFile(file, 'utf8')));
  await connectDb();
  try {
    const result = await loadInitialContent(data);
    console.log(
      `[content] added ${result.categories} categories, ${result.campaigns} campaigns` +
        (result.categories + result.campaigns === 0
          ? ' (already had content, nothing changed)'
          : ''),
    );
  } finally {
    await disconnectDb();
  }
}

main().catch((error) => {
  console.error(`[content] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
