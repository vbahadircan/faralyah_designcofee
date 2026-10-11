import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

/** Link box shaped like the Wi-Fi card: icon circle, one line of text, arrow. */
export function LinkCard({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-14 items-center gap-3 rounded-xl border border-rule bg-background px-3 py-2 shadow-card transition-colors [@media(hover:hover)]:hover:bg-tint"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-tint text-burgundy"
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 font-display text-base font-bold text-burgundy">{label}</span>
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-pill border border-burgundy text-burgundy"
      >
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
