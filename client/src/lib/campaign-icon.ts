import { Baby, Frame, Gem, Palette, Shapes, type LucideIcon } from 'lucide-react';

/** First match wins; keywords are lower-case Turkish stems found in campaign titles. */
const ICON_BY_KEYWORD: [keyword: string, icon: LucideIcon][] = [
  ['figür', Shapes],
  ['taşlı', Gem],
  ['tuval', Frame],
  ['çocuk', Baby],
];

/** Icon for a campaign's no-photo placeholder; plain palette when nothing matches. */
export function campaignIcon(title: string): LucideIcon {
  const lower = title.toLocaleLowerCase('tr-TR');
  return ICON_BY_KEYWORD.find(([keyword]) => lower.includes(keyword))?.[1] ?? Palette;
}
