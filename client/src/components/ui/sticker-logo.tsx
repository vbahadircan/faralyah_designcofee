import { tr } from '@/content/tr';
import { cn } from '@/lib/utils';

/**
 * The cafe's round sticker as a logo (owner decision, see brand.md §6). A cropped photo, so
 * size it with a `size-*` class and never stretch it.
 */
export function StickerLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/faralyah-sticker.webp"
      alt={tr.brand.name}
      width={480}
      height={480}
      className={cn('aspect-square rounded-pill object-cover', className)}
    />
  );
}
