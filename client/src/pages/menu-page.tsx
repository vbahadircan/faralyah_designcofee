import { CategorySection } from '@/components/menu/category-section';
import { CategoryTabs } from '@/components/menu/category-tabs';
import { MenuSkeleton } from '@/components/menu/menu-skeleton';
import { Button } from '@/components/ui/button';
import { tr } from '@/content/tr';
import { useMenu } from '@/hooks/use-menu';

export function MenuPage() {
  const { state, reload } = useMenu();

  return (
    <>
      <h1 className="sr-only">{tr.menu.title}</h1>
      {state.status === 'loading' ? <MenuSkeleton /> : null}
      {state.status === 'error' ? (
        <div role="alert" className="py-8">
          <p>{tr.menu.loadError}</p>
          <Button variant="secondary" className="mt-4" onClick={reload}>
            {tr.menu.retry}
          </Button>
        </div>
      ) : null}
      {state.status === 'ready' && state.menu.categories.length === 0 ? (
        <p className="py-8">{tr.menu.empty}</p>
      ) : null}
      {state.status === 'ready' && state.menu.categories.length > 0 ? (
        <>
          <CategoryTabs categories={state.menu.categories} />
          {state.menu.categories.map((category) => (
            <CategorySection key={category.id} category={category} />
          ))}
        </>
      ) : null}
    </>
  );
}
