import { useEffect, useRef, useState } from 'react';

/** Just below the sticky bar (targets use scroll-mt-20 = 80 px). */
const SPY_OFFSET_PX = 100;
const CLICK_LOCK_MS = 900;

/**
 * Scroll-spy for sticky jump navs: the active item is the last one whose element top has passed
 * the sticky bar (or the last one at the page bottom). `select` sets it right away and pauses the
 * spy while the smooth scroll runs. Shared by the menu category tabs and the campaign strip.
 */
export function useScrollSpy(items: { id: string }[], elementId: (id: string) => string) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  /** After a click, ignore scroll-spy while the smooth scroll runs. */
  const lockUntil = useRef(0);
  const getElementId = useRef(elementId);
  getElementId.current = elementId;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (performance.now() < lockUntil.current) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight > window.innerHeight + 2;
      const atBottom = scrollable && window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      let current = items[0]?.id;
      if (atBottom) {
        current = items[items.length - 1]?.id;
      } else {
        for (const item of items) {
          const target = document.getElementById(getElementId.current(item.id));
          if (target && target.getBoundingClientRect().top <= SPY_OFFSET_PX) current = item.id;
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // restores the right item when the page loads already scrolled
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  const select = (id: string) => {
    lockUntil.current = performance.now() + CLICK_LOCK_MS;
    setActiveId(id);
  };

  return { activeId, select };
}
