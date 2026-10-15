import { MENU_LIMITS } from '@faralyah/shared';
import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { CheckboxField, TextField } from '@/components/ui/field';
import { tr } from '@/content/tr';
import { cn } from '@/lib/utils';
import type { DraftCategory, DraftItem } from '@/pages/admin/menu-draft';
import { MenuProductRow } from './menu-product-row';
import { RowMenu } from './row-menu';
import { SortableList, SortableRow } from './sortable-list';

const t = tr.admin;

/**
 * One category as a box: grip handle, name and product count, and a three-dot menu. Expanded it
 * lists the products under an add button and they can be dragged into order. Everything acts on
 * the draft; Kaydet saves it.
 */
export function MenuCategoryBox({
  category,
  handle,
  expanded,
  renaming,
  editingItemId,
  onToggle,
  onRename,
  onChange,
  onDelete,
  onAddItem,
  onEditItem,
  onChangeItem,
  onReorderItem,
  onDeleteItem,
  onFinishItem,
}: {
  category: DraftCategory;
  handle: ReactNode;
  expanded: boolean;
  renaming: boolean;
  editingItemId: string | null;
  onToggle: () => void;
  onRename: () => void;
  onChange: (patch: Partial<Pick<DraftCategory, 'name' | 'active'>>) => void;
  onDelete: () => void;
  onAddItem: () => void;
  onEditItem: (itemId: string) => void;
  onChangeItem: (itemId: string, patch: Partial<Omit<DraftItem, 'id'>>) => void;
  onReorderItem: (activeId: string, overId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onFinishItem: () => void;
}) {
  const panelId = useId();
  const count = category.items.length;

  return (
    <div className="rounded-md border border-rule bg-background">
      <div className="flex items-center gap-1 p-1">
        {handle}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 text-left [@media(hover:hover)]:hover:bg-tint"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn('size-5 shrink-0 transition-transform', expanded && 'rotate-180')}
          />
          <span className="min-w-0">
            <span className="font-display text-xl font-bold wrap-break-word text-burgundy">
              {category.name}
            </span>
            {category.active ? null : (
              <span className="ml-2 rounded-pill border border-rule px-2 text-xs font-semibold text-muted-foreground">
                {t.menu.hidden}
              </span>
            )}
            <span className="block text-sm text-muted-foreground">{t.menu.itemCount(count)}</span>
          </span>
        </button>
        <RowMenu
          label={`${category.name}: ${t.menu.moreActions}`}
          items={[
            { label: t.menu.editCategory, onSelect: onRename },
            { label: t.common.delete, onSelect: onDelete, danger: true },
          ]}
        />
      </div>

      {renaming ? (
        <CategoryRenameForm category={category} onChange={onChange} onDone={onRename} />
      ) : null}

      {expanded ? (
        <div id={panelId} className="border-t border-rule px-3 pb-3 pt-3">
          <Button variant="secondary" onClick={onAddItem}>
            {t.menu.addItem}
          </Button>
          {count === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t.menu.emptyCategory}</p>
          ) : (
            <SortableList
              ids={category.items.map((item) => item.id)}
              onReorder={onReorderItem}
              className="mt-3"
            >
              {category.items.map((item) => (
                <SortableRow key={item.id} id={item.id} label={`${item.name}: ${t.menu.reorder}`}>
                  {(itemHandle) => (
                    <MenuProductRow
                      item={item}
                      handle={itemHandle}
                      editing={editingItemId === item.id}
                      onEdit={() => onEditItem(item.id)}
                      onChange={(patch) => onChangeItem(item.id, patch)}
                      onDelete={() => onDeleteItem(item.id)}
                      onDone={onFinishItem}
                    />
                  )}
                </SortableRow>
              ))}
            </SortableList>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** Inline name editor for a category, with the show-on-site toggle. Changes are kept in the draft. */
function CategoryRenameForm({
  category,
  onChange,
  onDone,
}: {
  category: DraftCategory;
  onChange: (patch: Partial<Pick<DraftCategory, 'name' | 'active'>>) => void;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  // Focus the name when the editor opens, so keyboard and screen reader users land in it.
  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        if (category.name.trim()) onDone();
      }}
      className="flex flex-wrap items-end gap-3 border-t border-rule p-3"
    >
      <TextField
        className="min-w-48 flex-1"
        label={t.menu.categoryName}
        value={category.name}
        maxLength={MENU_LIMITS.nameMax}
        onChange={(event) => onChange({ name: event.target.value })}
      />
      <CheckboxField
        label={t.menu.categoryVisible}
        checked={category.active}
        onChange={(event) => onChange({ active: event.target.checked })}
      />
      <Button type="submit" disabled={!category.name.trim()}>
        {t.menu.done}
      </Button>
    </form>
  );
}
