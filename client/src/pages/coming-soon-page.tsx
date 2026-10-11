import { tr } from '@/content/tr';

/** Stand-in for sections whose content is not built yet (events, campaigns). */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <h1 className="pt-4 text-2xl">{title}</h1>
      <p className="mt-3 text-base">{tr.comingSoon}</p>
    </>
  );
}
