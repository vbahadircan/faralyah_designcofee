import { PackageCard } from '@/components/offers/package-card';
import { tr } from '@/content/tr';
import { SAMPLE_PACKAGES } from '@/content/sample-packages';

/** Etkinlikler / Kampanyalar: today's featured combo packages. Sample data until the API exists. */
export function OffersPage() {
  return (
    <>
      <p className="flex items-center gap-2 pt-2 text-xs font-bold tracking-widest text-burgundy">
        <span aria-hidden="true" className="size-2 rounded-pill bg-gold" />
        {tr.offers.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl leading-tight font-bold">{tr.offers.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{tr.offers.subtitle}</p>
      <ul className="mt-5 flex flex-col gap-4">
        {SAMPLE_PACKAGES.map((pkg) => (
          <li key={pkg.id}>
            <PackageCard pkg={pkg} />
          </li>
        ))}
      </ul>
    </>
  );
}
