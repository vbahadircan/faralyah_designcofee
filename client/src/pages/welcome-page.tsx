import { Coffee, Palette } from 'lucide-react';
import { StickerLogo } from '@/components/ui/sticker-logo';
import { PreviewCard } from '@/components/welcome-alt/preview-card';
import { TopBar } from '@/components/welcome-alt/top-bar';
import { WifiCard } from '@/components/welcome-alt/wifi-card';
import { tr } from '@/content/tr';
import { useFetch } from '@/hooks/use-fetch';
import { fetchSettings } from '@/lib/api';

const t = tr.welcome;

/**
 * The QR landing page (/), built from the cafe's mock-up: Wi-Fi card and two photo cards,
 * Menü and Kampanyalar. Everything stays on one screen: the cards share the leftover height,
 * and less important lines hide on short phones.
 */
export function WelcomePage() {
  // The Wi-Fi card appears once the password has loaded; without one (or on error) it stays hidden.
  const { state } = useFetch(fetchSettings);
  const wifiPassword = state.status === 'ready' ? state.data.wifiPassword : undefined;
  return (
    <div className="min-h-dvh bg-dots">
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col gap-2 px-3 py-3">
        <TopBar />
        <main id="main" className="flex flex-1 flex-col gap-2">
          <div className="px-2 text-center">
            <StickerLogo className="mx-auto mb-1 size-20 [@media(min-height:700px)]:size-28" />
            <p className="text-xs tracking-widest text-muted-foreground">{t.eyebrow}</p>
            <h1 className="font-display text-xl font-bold sm:text-2xl">{t.title}</h1>
            <p className="mx-auto mt-0.5 max-w-[38ch] text-sm text-balance text-muted-foreground">
              {t.subtitle}
            </p>
          </div>
          {wifiPassword ? (
            <div className="[@media(max-height:620px)]:hidden">
              <WifiCard password={wifiPassword} />
            </div>
          ) : null}
          <nav aria-label={t.sectionsNav} className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-2">
              <li className="flex max-h-60 min-h-30 flex-1">
                <PreviewCard
                  to="/menu"
                  icon={Coffee}
                  photo="/cofee-table.jpg"
                  photoPosition="object-[50%_35%]"
                  placeholder="burgundy"
                  badgeTone="light"
                  {...t.cards.menu}
                />
              </li>
              <li className="flex max-h-60 min-h-30 flex-1">
                <PreviewCard
                  to="/kampanyalar"
                  icon={Palette}
                  photo="/children-workshops.jpg"
                  photoPosition="object-[50%_30%]"
                  placeholder="brown"
                  badgeTone="gold"
                  {...t.cards.campaigns}
                />
              </li>
            </ul>
          </nav>
        </main>
      </div>
    </div>
  );
}
