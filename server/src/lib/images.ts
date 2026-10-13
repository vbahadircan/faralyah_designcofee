import { randomBytes } from 'node:crypto';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/** Longest side of a stored cover image; plenty for a phone screen at 3x. */
const MAX_SIZE = 1200;

/**
 * Resizes an uploaded image and stores it as WebP in `dir`. Returns the new file name.
 * sharp rejects anything that is not a real image, so a renamed non-image file fails here.
 */
export async function saveCoverImage(input: Buffer, dir: string): Promise<string> {
  await mkdir(dir, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.webp`;
  await sharp(input)
    .rotate() // respect the phone's EXIF orientation, then drop the metadata
    .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(dir, name));
  return name;
}

/** Deletes a stored image; a file that is already gone is not an error. */
export async function removeImage(dir: string, name: string | null | undefined): Promise<void> {
  if (!name || name !== path.basename(name)) return;
  await unlink(path.join(dir, name)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error;
  });
}
