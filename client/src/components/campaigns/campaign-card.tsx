import type { PublicCampaign } from '@faralyah/shared';
import { useId } from 'react';
import { PriceTag } from '@/components/ui/price-tag';
import { tr } from '@/content/tr';
import { campaignIcon } from '@/lib/campaign-icon';

/**
 * One campaign: optional photo on top (full width on phones, beside the text from 640 px up),
 * shown at its own proportions. Without a
 * photo, a small icon tile sits beside the title. Then title, price and optional description.
 * Bookings happen with the staff, so the card has no action of its own.
 */
export function CampaignCard({ campaign }: { campaign: PublicCampaign }) {
  const titleId = useId();
  const Icon = campaignIcon(campaign.title);

  return (
    <article
      aria-labelledby={titleId}
      className="overflow-hidden rounded-xl border border-rule bg-background shadow-card sm:flex"
    >
      {campaign.imageUrl ? (
        <img
          src={campaign.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="block h-auto w-full sm:w-56 sm:shrink-0 sm:self-start"
        />
      ) : null}
      <div className="p-4 sm:min-w-0 sm:flex-1">
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
      </div>
    </article>
  );
}
