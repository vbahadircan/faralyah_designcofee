import type { PublicCampaign } from '@faralyah/shared';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PriceTag } from '@/components/ui/price-tag';
import { tr } from '@/content/tr';
import { campaignIcon } from '@/lib/campaign-icon';
import { cn } from '@/lib/utils';

/** Anchor id of a campaign card, targeted by the jump strip. */
export const campaignCardId = (id: string) => `kampanya-${id}`;

/**
 * One campaign: optional photo on top (4:3) or, without one, a small icon tile beside the title;
 * title, price, description. Online registration
 * is out of scope for v1, so the button only reveals a note sending people to the staff.
 */
export function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  const titleId = useId();
  const noteId = useId();
  const [open, setOpen] = useState(false);
  const Icon = campaignIcon(campaign.title);

  return (
    <article
      id={campaignCardId(campaign.id)}
      aria-labelledby={titleId}
      className="scroll-mt-20 overflow-hidden rounded-xl border border-rule bg-background shadow-card"
    >
      {campaign.imageUrl ? (
        <img
          src={campaign.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : null}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {campaign.imageUrl ? null : (
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-burgundy to-brown"
            >
              <Icon className="size-6 text-paper" />
            </div>
          )}
          <h2 id={titleId} className="min-w-0 flex-1 text-xl leading-tight font-bold">
            {campaign.title}
          </h2>
          <p className="shrink-0">
            <span className="sr-only">{tr.campaigns.price}: </span>
            <PriceTag kurus={campaign.priceKurus} className="font-display text-2xl font-bold" />
          </p>
        </div>
        {campaign.description ? (
          <p className="mt-2 text-sm text-muted-foreground">{campaign.description}</p>
        ) : null}
        <Button
          className="mt-4"
          variant="secondary"
          aria-expanded={open}
          aria-controls={noteId}
          onClick={() => setOpen((value) => !value)}
        >
          {tr.campaigns.ask}
        </Button>
        <div
          id={noteId}
          style={{ visibility: open ? 'visible' : 'hidden' }}
          className={cn(
            'grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out',
            open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <p className="mt-3 rounded-md bg-tint p-3 text-sm">{tr.campaigns.note}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
