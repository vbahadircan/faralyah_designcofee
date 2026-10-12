import { CampaignCard } from '@/components/campaigns/campaign-card';
import { Button } from '@/components/ui/button';
import { tr } from '@/content/tr';
import { useFetch } from '@/hooks/use-fetch';
import { fetchCampaigns } from '@/lib/api';

/** Kampanyalar: published campaigns in the order staff set in the admin panel. */
export function CampaignsPage() {
  const { state, reload } = useFetch(fetchCampaigns);

  return (
    <>
      <p className="flex items-center gap-2 pt-2 text-xs font-bold tracking-widest text-burgundy">
        <span aria-hidden="true" className="size-2 rounded-pill bg-gold" />
        {tr.campaigns.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl leading-tight font-bold">{tr.campaigns.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{tr.campaigns.subtitle}</p>

      {state.status === 'loading' ? (
        <div
          aria-busy="true"
          aria-label={tr.campaigns.loading}
          className="mt-5 flex flex-col gap-4"
        >
          {[0, 1].map((n) => (
            <div key={n} className="aspect-[4/3] w-full animate-pulse rounded-xl bg-tint" />
          ))}
        </div>
      ) : null}
      {state.status === 'error' ? (
        <div role="alert" className="py-8">
          <p>{tr.campaigns.loadError}</p>
          <Button variant="secondary" className="mt-4" onClick={reload}>
            {tr.campaigns.retry}
          </Button>
        </div>
      ) : null}
      {state.status === 'ready' && state.data.campaigns.length === 0 ? (
        <p className="py-8">{tr.campaigns.empty}</p>
      ) : null}
      {state.status === 'ready' && state.data.campaigns.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-4">
          {state.data.campaigns.map((campaign) => (
            <li key={campaign.id}>
              <CampaignCard campaign={campaign} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
