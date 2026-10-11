import { tr } from '@/content/tr';

const TAB_WIDTHS = ['w-28', 'w-32', 'w-24'];

/** Loading placeholder shaped like tabs and rows (DESIGN.md §4.2); no spinner. */
export function MenuSkeleton() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse">
      <span className="sr-only">{tr.menu.loading}</span>
      <div aria-hidden="true">
        <div className="flex gap-2 border-b border-rule py-2">
          {TAB_WIDTHS.map((width) => (
            <div key={width} className={`h-11 rounded-pill bg-tint ${width}`} />
          ))}
        </div>
        <div className="mt-8 h-7 w-40 rounded-sm bg-tint" />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center justify-between py-4">
            <div className="h-5 w-40 rounded-sm bg-tint" />
            <div className="h-5 w-14 rounded-sm bg-tint" />
          </div>
        ))}
      </div>
    </div>
  );
}
