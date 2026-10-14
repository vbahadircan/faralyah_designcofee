import { formatPrice, type PublicCampaign } from '@faralyah/shared';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { tr } from '@/content/tr';
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import { cn } from '@/lib/utils';
import { campaignCardId } from './campaign-card';

/** Restarts a short tint on the target card so a tap on an already visible card still reads. */
function flashCard(campaignId: string) {
  const card = document.getElementById(campaignCardId(campaignId));
  if (!card) return;
  card.classList.remove('card-flash');
  void card.offsetWidth; // reflow so the animation restarts on repeat taps
  card.classList.add('card-flash');
}

/**
 * DESIGN.md §4.5b. Sticky pill strip, one chip per campaign (name + price) so all options can be
 * compared at a glance; same interaction as the menu CategoryTabs, plus a sliding active pill.
 */
export function CampaignJumpStrip({
  campaigns,
}: {
  campaigns: Pick<PublicCampaign, 'id' | 'title' | 'priceKurus'>[];
}) {
  const { activeId, select } = useScrollSpy(campaigns, campaignCardId);
  const links = useRef(new Map<string, HTMLAnchorElement>());

  // Sliding pill behind the active chip; re-measured when the chip or the bar width changes.
  const [pill, setPill] = useState<{ left: number; width: number }>();
  useLayoutEffect(() => {
    const measure = () => {
      const link = activeId ? links.current.get(activeId) : undefined;
      if (link) setPill({ left: link.offsetLeft, width: link.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeId, campaigns]);

  useEffect(() => {
    const link = activeId ? links.current.get(activeId) : undefined;
    if (link && typeof link.scrollIntoView === 'function') {
      link.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <nav
      aria-label={tr.campaigns.title}
      className="sticky top-0 z-10 -mx-4 mt-5 border-b border-rule bg-background px-4 py-2"
    >
      <ul className="relative flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {pill ? (
          <li
            aria-hidden="true"
            style={{ width: pill.width, transform: `translateX(${pill.left}px)` }}
            className="pointer-events-none absolute top-0 bottom-0 left-0 rounded-pill bg-primary transition-[transform,width] duration-300 ease-out"
          />
        ) : null}
        {campaigns.map((campaign) => {
          const active = campaign.id === activeId;
          return (
            <li key={campaign.id} className="shrink-0">
              <a
                ref={(node) => {
                  if (node) links.current.set(campaign.id, node);
                  else links.current.delete(campaign.id);
                }}
                href={`#${campaignCardId(campaign.id)}`}
                aria-current={active ? 'true' : undefined}
                onClick={() => {
                  select(campaign.id);
                  flashCard(campaign.id);
                }}
                className={cn(
                  'relative inline-flex min-h-11 items-center gap-2 rounded-pill px-4 font-semibold whitespace-nowrap transition-colors',
                  active
                    ? 'text-primary-foreground'
                    : 'text-foreground [@media(hover:hover)]:hover:bg-tint',
                )}
              >
                {campaign.title}
                <span className="font-normal tabular-nums">{formatPrice(campaign.priceKurus)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
