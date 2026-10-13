import type { PublicCampaign } from '@faralyah/shared';
import { Palette } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PriceTag } from '@/components/ui/price-tag';
import { tr } from '@/content/tr';

/**
 * One campaign: optional photo on top (4:3), title, price, description. Online registration
 * is out of scope for v1, so the button only reveals a note sending people to the staff.
 */
export function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  const titleId = useId();
  const noteId = useId();
  const [open, setOpen] = useState(false);

  return (
    <article
      aria-labelledby={titleId}
      className="overflow-hidden rounded-xl border border-rule bg-background shadow-card"
    >
      {campaign.imageUrl ? (
        <img
          src={campaign.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-burgundy to-brown"
        >
          <Palette className="absolute -top-4 -right-4 size-40 text-paper/10" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl leading-tight font-bold">
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
        <p id={noteId} hidden={!open} className="mt-3 rounded-md bg-tint p-3 text-sm">
          {tr.campaigns.note}
        </p>
      </div>
    </article>
  );
}
