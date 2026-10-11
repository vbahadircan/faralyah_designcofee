import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

type Tone = 'burgundy' | 'brown' | 'paper';

/** Surface, text and accent classes per tone. Gold is used only where it is decoration. */
const TONES: Record<Tone, { surface: string; text: string; accent: string; tile: string }> = {
  burgundy: {
    surface: 'bg-burgundy text-paper [@media(hover:hover)]:hover:bg-brown',
    text: 'text-paper/85',
    accent: 'text-gold border-gold',
    tile: 'bg-paper/10 text-gold',
  },
  brown: {
    surface: 'bg-brown text-paper [@media(hover:hover)]:hover:bg-burgundy',
    text: 'text-paper/85',
    accent: 'text-gold border-gold',
    tile: 'bg-paper/10 text-gold',
  },
  paper: {
    surface:
      'border border-burgundy bg-background text-burgundy [@media(hover:hover)]:hover:bg-tint',
    text: 'text-muted-foreground',
    accent: 'text-burgundy border-burgundy',
    tile: 'bg-tint text-burgundy',
  },
};

type Props = {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  tone: Tone;
};

/**
 * Landing-page entry card (DESIGN.md §4.5). The whole card is one link; the heading and
 * description give it its accessible name. The inner gold hairline is purely decorative.
 */
export function HomeCard({ to, icon: Icon, title, description, tone }: Props) {
  const styles = TONES[tone];
  return (
    <Link
      to={to}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-md p-4 transition-colors',
        'before:pointer-events-none before:absolute before:inset-1 before:rounded-sm before:border before:border-gold/60',
        styles.surface,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('flex size-11 shrink-0 items-center justify-center rounded-md', styles.tile)}
      >
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <h2 className="font-display text-lg leading-tight text-inherit sm:text-xl">{title}</h2>
        <span className={cn('mt-1 line-clamp-2 block text-sm', styles.text)}>{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-pill border',
          styles.accent,
        )}
      >
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
