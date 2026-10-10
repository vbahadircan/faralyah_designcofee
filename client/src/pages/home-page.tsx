import { tr } from '@/content/tr';

export function HomePage() {
  return (
    <>
      <h1 className="text-2xl">{tr.home.title}</h1>
      <p className="mt-3 text-base">{tr.home.comingSoon}</p>
    </>
  );
}
