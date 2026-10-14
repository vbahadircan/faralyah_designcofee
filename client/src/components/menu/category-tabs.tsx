import { useEffect, useRef } from 'react';
import type { PublicCategory } from '@faralyah/shared';
import { tr } from '@/content/tr';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';
import { categorySectionId } from './category-section';

type Props = { categories: Pick<PublicCategory, 'id' | 'name'>[] };

/**
 * DESIGN.md §4.3. Sticky anchor nav: links jump to sections (works without JS for content);
 * the active tab follows scroll position and is kept in view.
 */
export function CategoryTabs({ categories }: Props) {
  const { activeId, select } = useScrollSpy(categories, categorySectionId);
  const links = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    const link = activeId ? links.current.get(activeId) : undefined;
    if (link && typeof link.scrollIntoView === 'function') {
      link.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <nav
      aria-label={tr.menu.categoriesNav}
      className="sticky top-0 z-10 -mx-4 border-b border-rule bg-background px-4 py-2"
    >
      <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {categories.map((category) => {
          const active = category.id === activeId;
          return (
            <li key={category.id} className="shrink-0">
              <a
                ref={(node) => {
                  if (node) links.current.set(category.id, node);
                  else links.current.delete(category.id);
                }}
                href={`#${categorySectionId(category.id)}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => select(category.id)}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-pill px-4 font-semibold whitespace-nowrap transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground [@media(hover:hover)]:hover:bg-tint',
                )}
              >
                {category.name}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
