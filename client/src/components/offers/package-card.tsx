import { formatPrice } from '@faralyah/shared';
import { Palette, Timer } from 'lucide-react';
import { useId, useState } from 'react';
import { PriceTag } from '@/components/ui/price-tag';
import { Button } from '@/components/ui/button';
import { tr } from '@/content/tr';
import type { CampaignPackage } from '@/content/sample-packages';
import { cn } from '@/lib/utils';

const FACT_ICONS = { palette: Palette, timer: Timer } as const;

/**
 * One campaign package. The button reveals a short note: online registration is out of scope
 * for v1 (PRODUCT.md), so the card sends people to the staff instead of a dead end.
 */
export function PackageCard({ pkg }: { pkg: CampaignPackage }) {
  const titleId = useId();
  const noteId = useId();
  const [open, setOpen] = useState(false);

  return (
    <article
      aria-labelledby={titleId}
      className="rounded-xl border border-rule bg-background p-4 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <ul className="flex min-w-0 flex-wrap gap-1.5">
          {pkg.tags.map((tag) => (
            <li
              key={tag.label}
              className={cn(
                'rounded-pill px-2.5 py-1 text-xs font-bold tracking-wide',
                tag.tone === 'dark' ? 'bg-burgundy text-paper' : 'bg-tint text-burgundy',
              )}
            >
              {tag.label}
            </li>
          ))}
        </ul>
        <div className="shrink-0 text-right leading-tight">
          {pkg.priceLabel ? (
            <p className="text-xs tracking-wide text-muted-foreground">{pkg.priceLabel}</p>
          ) : null}
          {pkg.oldPriceKurus !== undefined ? (
            <p className="text-xs text-muted-foreground">
              <span className="sr-only">{tr.offers.oldPrice}: </span>
              <del>{formatPrice(pkg.oldPriceKurus)}</del>
            </p>
          ) : null}
          <p>
            <span className="sr-only">{tr.offers.price}: </span>
            <PriceTag kurus={pkg.priceKurus} className="font-display text-2xl font-bold" />
          </p>
        </div>
      </div>

      <h2 id={titleId} className="mt-3 text-xl leading-tight font-bold">
        {pkg.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
          {pkg.facts.map((fact) => {
            const Icon = FACT_ICONS[fact.icon];
            return (
              <li key={fact.text} className="flex items-center gap-1.5">
                <Icon className="size-4" aria-hidden="true" />
                {fact.text}
              </li>
            );
          })}
        </ul>
        <Button
          variant={pkg.cta === 'select' ? 'primary' : 'ghost'}
          className={cn(pkg.cta === 'details' && 'bg-tint')}
          aria-expanded={open}
          aria-controls={noteId}
          onClick={() => setOpen((value) => !value)}
        >
          {pkg.cta === 'select' ? tr.offers.select : tr.offers.details}
        </Button>
      </div>

      <p id={noteId} hidden={!open} className="mt-3 rounded-md bg-tint p-3 text-sm">
        {tr.offers.note}
      </p>
    </article>
  );
}
