import { Coffee, Gift, Palette } from 'lucide-react';
import { HomeCard } from '@/components/home/home-card';
import { tr } from '@/content/tr';

const { cards } = tr.welcome;

/**
 * The QR landing page. Fills the viewport so menu, activities and campaigns are all visible
 * at once without scrolling; the cards share the leftover height (with a floor for short phones).
 */
export function WelcomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[640px] flex-col px-4 py-3">
      <header className="flex justify-center">
        <img
          src="/brand/faralyah-lockup-burgundy.svg"
          alt={tr.brand.name}
          className="h-24 w-auto"
        />
      </header>
      <main id="main" className="flex flex-1 flex-col">
        <div className="mt-1 text-center">
          <h1 className="text-2xl">{tr.welcome.title}</h1>
          <p className="mx-auto mt-1 max-w-[32ch] text-base text-balance text-muted-foreground">
            {tr.welcome.subtitle}
          </p>
        </div>
        <nav
          aria-label={tr.welcome.sectionsNav}
          className="mt-4 flex flex-1 flex-col justify-center"
        >
          <ul className="flex flex-1 flex-col justify-center gap-3">
            <li className="flex max-h-36 min-h-26 flex-1">
              <HomeCard
                to="/menu"
                icon={Coffee}
                tone="burgundy"
                title={cards.menu.title}
                description={cards.menu.description}
              />
            </li>
            <li className="flex max-h-36 min-h-26 flex-1">
              <HomeCard
                to="/etkinlikler"
                icon={Palette}
                tone="brown"
                title={cards.activities.title}
                description={cards.activities.description}
              />
            </li>
            <li className="flex max-h-36 min-h-26 flex-1">
              <HomeCard
                to="/kampanyalar"
                icon={Gift}
                tone="paper"
                title={cards.campaigns.title}
                description={cards.campaigns.description}
              />
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
