import { Coffee, Sparkles } from 'lucide-react';
import { tr } from '@/content/tr';

/** Brand tile and name on the left, "QR MENÜ / Karşılama" and a round brand mark on the right. */
export function TopBar() {
  const t = tr.welcomeAlt.topBar;
  return (
    <header className="flex items-center justify-between rounded-xl border border-rule bg-background px-3 py-2 shadow-card">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-lg bg-burgundy text-paper"
        >
          <Coffee className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-burgundy">{t.brand}</p>
          <p className="text-xs tracking-widest text-muted-foreground">{t.tagline}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-xs tracking-widest text-muted-foreground">{t.qrLabel}</p>
          <p className="font-display text-base font-bold text-burgundy">{t.qrTitle}</p>
        </div>
        <span
          aria-hidden="true"
          className="flex size-10 items-center justify-center rounded-pill border-2 border-gold bg-burgundy text-gold"
        >
          <Sparkles className="size-5" />
        </span>
      </div>
    </header>
  );
}
