import type { PublicMenuItem } from '@faralyah/shared';
import { PriceTag } from '@/components/ui/price-tag';

/** DESIGN.md §4.2. A paper-menu row, not a card: name · dotted leader · price. */
export function MenuItemRow({ item }: { item: PublicMenuItem }) {
  return (
    <li className="min-h-12 py-3">
      <div className="flex items-end gap-2">
        <span className="text-base">{item.name}</span>
        <span
          aria-hidden="true"
          className="mb-1.5 min-w-4 flex-1 border-b-2 border-dotted border-rule"
        />
        <PriceTag kurus={item.priceKurus} />
      </div>
      {item.description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
      ) : null}
    </li>
  );
}
