import type { PublicCategory } from '@faralyah/shared';
import { MenuItemRow } from './menu-item-row';

export const categorySectionId = (categoryId: string) => `kategori-${categoryId}`;

export function CategorySection({ category }: { category: PublicCategory }) {
  const headingId = `${categorySectionId(category.id)}-baslik`;
  return (
    <section
      id={categorySectionId(category.id)}
      aria-labelledby={headingId}
      className="scroll-mt-20 pt-8"
    >
      <h2 id={headingId} className="border-b-2 border-gold pb-2 text-xl">
        {category.name}
      </h2>
      <ul>
        {category.items.map((item) => (
          <MenuItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}
