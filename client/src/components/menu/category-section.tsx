import type { PublicCategory } from '@faralyah/shared';
import { tr } from '@/content/tr';
import { MenuItemRow } from './menu-item-row';

export const categorySectionId = (categoryId: string) => `kategori-${categoryId}`;

export function CategorySection({ category }: { category: PublicCategory }) {
  const headingId = `${categorySectionId(category.id)}-baslik`;
  const sized = category.items.some((item) => item.priceLargeKurus !== undefined);
  return (
    <section
      id={categorySectionId(category.id)}
      aria-labelledby={headingId}
      className="scroll-mt-20 pt-8"
    >
      <h2 id={headingId} className="border-b-2 border-gold pb-2 text-xl">
        {category.name}
      </h2>
      {sized ? (
        // Visual column heads only; each price carries its own screen-reader label.
        <div
          aria-hidden="true"
          className="flex justify-end gap-2 pt-2 text-xs font-bold tracking-widest text-muted-foreground"
        >
          <span className="w-16 text-right">{tr.menu.sizes.small}</span>
          <span className="w-16 text-right">{tr.menu.sizes.large}</span>
        </div>
      ) : null}
      <ul>
        {category.items.map((item) => (
          <MenuItemRow key={item.id} item={item} sized={sized} />
        ))}
      </ul>
    </section>
  );
}
