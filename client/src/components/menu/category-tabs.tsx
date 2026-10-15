import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
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

/** Which edges of the tab row have tabs hidden past them, so only those edges fade. */
type Edges = { start: boolean; end: boolean };

function readEdges(row: HTMLElement): Edges {
  return {
    start: row.scrollLeft > 1,
    end: row.scrollWidth - row.clientWidth - row.scrollLeft > 1,
  };
}

/**
 * DESIGN.md §4.3. Sticky anchor nav: links jump to sections (works without JS for content);
 * the active tab follows scroll position and is kept in view. The row scrolls sideways, tabs
 * snap to the left edge, and an edge fades only while tabs are hidden past it.
 */
export function CategoryTabs({ categories }: Props) {
  const { activeId, select } = useScrollSpy(categories, categorySectionId);
  const links = useRef(new Map<string, HTMLAnchorElement>());

  // Sliding pill behind the active tab; re-measured when the tab or the bar width changes.
  const list = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number }>();
  const [edges, setEdges] = useState<Edges>({ start: false, end: false });
  useLayoutEffect(() => {
    const measure = () => {
      const link = activeId ? links.current.get(activeId) : undefined;
      if (link) setPill({ left: link.offsetLeft, width: link.offsetWidth });
      if (list.current) {
        const next = readEdges(list.current);
        setEdges((current) =>
          current.start === next.start && current.end === next.end ? current : next,
        );
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeId, categories]);

  useEffect(() => {
    const link = activeId ? links.current.get(activeId) : undefined;
    if (link && typeof link.scrollIntoView === 'function') {
      link.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    }
  }, [activeId]);

  const fade: CSSProperties = {
    '--fade-start': edges.start ? 'var(--scroll-fade-edge)' : '0',
    '--fade-end': edges.end ? 'var(--scroll-fade-edge)' : '0',
  } as CSSProperties;

  return (
    <nav
      aria-label={tr.menu.categoriesNav}
      className="sticky top-0 z-10 -mx-4 border-b border-rule bg-background/80 py-2 backdrop-blur-md reduce-transparency:bg-background reduce-transparency:backdrop-blur-none"
    >
      <ul
        ref={list}
        onScroll={(event) => {
          const next = readEdges(event.currentTarget);
          setEdges((current) =>
            current.start === next.start && current.end === next.end ? current : next,
          );
        }}
        style={fade}
        className="scroll-fade-x relative flex snap-x snap-mandatory scroll-ps-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none]"
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
            <li key={category.id} className="shrink-0 snap-start">
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
