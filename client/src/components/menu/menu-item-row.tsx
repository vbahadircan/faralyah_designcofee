import type { PublicMenuItem } from '@faralyah/shared';
import { PriceTag } from '@/components/ui/price-tag';
import { tr } from '@/content/tr';

const t = tr.menu.sizes;

/**
 * DESIGN.md §4.2. A paper-menu row, not a card: name · dotted leader · price.
 * In a `sized` section (one with small/large columns) prices line up under the column heads;
 * an item with a single price puts it at the right edge across both columns, with no size label.
 */
export function MenuItemRow({ item, sized = false }: { item: PublicMenuItem; sized?: boolean }) {
  return (
    <li className="min-h-12 py-3">
      <div className="flex items-end gap-2">
        <span className="text-base">{item.name}</span>
        <span
          aria-hidden="true"
          className="mb-1.5 min-w-4 flex-1 border-b-2 border-dotted border-rule"
        />
        {item.priceLargeKurus !== undefined ? (
          <>
            <span className="w-16 text-right">
              <span className="sr-only">{t.smallLabel} </span>
              <PriceTag kurus={item.priceKurus} />
            </span>
            <span className="w-16 text-right">
              <span className="sr-only">{t.largeLabel} </span>
              <PriceTag kurus={item.priceLargeKurus} />
            </span>
          </>
        ) : sized ? (
          <span className="w-32 text-right">
            <PriceTag kurus={item.priceKurus} />
          </span>
        ) : (
          <PriceTag kurus={item.priceKurus} />
        )}
      </div>
      {item.description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
      ) : null}
    </li>
  );
}
