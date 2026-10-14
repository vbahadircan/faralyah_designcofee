import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { PublicCategory } from '@faralyah/shared';
import { tr } from '@/content/tr';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';
import { categorySectionId } from './category-section';

/** Restarts a short tint on the target heading so a tap on an already visible section still reads. */
function flashHeading(categoryId: string) {
  const heading = document.getElementById(`${categorySectionId(categoryId)}-baslik`);
  if (!heading) return;
  heading.classList.remove('heading-flash');
  void heading.offsetWidth; // reflow so the animation restarts on repeat taps
  heading.classList.add('heading-flash');
}

type Props = { categories: Pick<PublicCategory, 'id' | 'name'>[] };

/**
 * DESIGN.md §4.3. Sticky anchor nav: links jump to sections (works without JS for content);
 * the active tab follows scroll position and is kept in view.
 */
export function CategoryTabs({ categories }: Props) {
  const { activeId, select } = useScrollSpy(categories, categorySectionId);
  const links = useRef(new Map<string, HTMLAnchorElement>());

  // Sliding pill behind the active tab; re-measured when the tab or the bar width changes.
  const list = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number }>();
  useLayoutEffect(() => {
    const measure = () => {
      const link = activeId ? links.current.get(activeId) : undefined;
      if (link) setPill({ left: link.offsetLeft, width: link.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeId, categories]);

  useEffect(() => {
    const link = activeId ? links.current.get(activeId) : undefined;
    if (link && typeof link.scrollIntoView === 'function') {
      link.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <nav
      aria-label={tr.menu.categoriesNav}
      className="sticky top-0 z-10 -mx-4 border-b border-rule bg-background/80 py-2 backdrop-blur-md reduce-transparency:bg-background reduce-transparency:backdrop-blur-none"
    >
      <ul
        ref={list}
        className="scroll-fade-x relative flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        {pill ? (
          <li
            aria-hidden="true"
            style={{ width: pill.width, transform: `translateX(${pill.left}px)` }}
            className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-pill bg-primary transition-[transform,width] duration-300 ease-out"
          />
        ) : null}
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
                onClick={() => {
                  select(category.id);
                  flashHeading(category.id);
                }}
                className={cn(
                  'press relative inline-flex min-h-11 items-center rounded-pill px-4 font-semibold whitespace-nowrap',
                  active
                    ? 'text-primary-foreground'
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
