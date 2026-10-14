import { ArrowRight, Sparkles, type LucideIcon } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';

type Props = {
  to: string;
  title: string;
  eyebrow: string;
  badge: string;
  /** `light` = paper pill, `gold` = gold pill with burgundy text (both pass contrast). */
  badgeTone: 'light' | 'gold';
  description: string;
  chips: readonly string[];
  /** Big faint icon used in the placeholder until a real photo is supplied. */
  icon: LucideIcon;
  /** Path under /public, e.g. "/photos/menu.jpg". Without it a brand-color placeholder is shown. */
  photo?: string;
  /** Tailwind object-position class choosing which slice of the photo the short card shows. */
  photoPosition?: string;
  placeholder: 'burgundy' | 'brown';
};

/**
 * Photo card: image on top with badge, gold eyebrow, serif title and arrow overlaid;
 * description and chips underneath. The whole card is one link named by title + description.
 * On short phones the badge and chips drop out so all three cards still fit one screen.
 */
export function PreviewCard({
  to,
  title,
  eyebrow,
  badge,
  badgeTone,
  description,
  chips,
  icon: Icon,
  photo,
  photoPosition,
  placeholder,
}: Props) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Link
      to={to}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="press flex w-full flex-col overflow-hidden rounded-xl border border-rule bg-background shadow-card"
    >
      <span className="relative block min-h-20 flex-1 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt=""
            decoding="async"
            className={cn('absolute inset-0 size-full object-cover', photoPosition)}
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              placeholder === 'burgundy' ? 'from-burgundy to-brown' : 'from-brown to-burgundy',
            )}
          >
            <Icon className="absolute -top-3 -right-3 size-32 text-paper/10" />
            <Sparkles className="absolute top-6 left-[58%] size-4 text-gold/70" />
            <Sparkles className="absolute top-12 left-[72%] size-3 text-gold/50" />
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-brown/95 via-brown/60 to-transparent"
        />
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-2.5 left-2.5 hidden items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-bold tracking-wide [@media(min-height:700px)]:inline-flex',
            badgeTone === 'gold' ? 'bg-gold text-burgundy' : 'bg-background/95 text-burgundy',
          )}
        >
          <Icon className="size-3.5" />
          {badge}
        </span>
        <span className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2">
          <span className="min-w-0">
            <span
              aria-hidden="true"
              className="block text-xs font-bold tracking-widest text-gold uppercase"
            >
              {eyebrow}
            </span>
            <span
              id={titleId}
              className="block font-display text-lg leading-tight font-bold text-paper sm:text-xl"
            >
              {title}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-pill border border-paper/40 bg-paper/20 text-paper"
          >
            <ArrowRight className="size-4" />
          </span>
        </span>
      </span>
      <span className="block shrink-0 px-3 py-2">
        <span id={descriptionId} className="line-clamp-2 block text-xs text-muted-foreground">
          {description}
        </span>
        {chips.length > 0 ? (
          <span
            aria-hidden="true"
            className="mt-1.5 hidden flex-wrap gap-1.5 [@media(min-height:760px)]:flex"
          >
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-pill bg-tint px-2.5 py-1 text-xs font-semibold text-burgundy"
              >
                {chip}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
