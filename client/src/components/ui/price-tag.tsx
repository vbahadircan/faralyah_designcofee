import { formatPrice } from '@faralyah/shared';
import { cn } from '@/lib/utils';

/** DESIGN.md §4.4. Always text, never color-only; never wraps; tabular numerals. */
export function PriceTag({ kurus, className }: { kurus: number; className?: string }) {
  return (
    <data
      value={kurus / 100}
      className={cn('font-semibold whitespace-nowrap text-burgundy tabular-nums', className)}
    >
      {formatPrice(kurus)}
    </data>
  );
}
