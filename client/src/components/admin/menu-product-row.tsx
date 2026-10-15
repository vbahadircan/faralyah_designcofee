import { formatPrice, MENU_LIMITS, parsePriceInput } from '@faralyah/shared';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { CheckboxField, TextField } from '@/components/ui/field';
import { tr } from '@/content/tr';
import type { DraftItem } from '@/pages/admin/menu-draft';
import { RowMenu } from './row-menu';

const t = tr.admin;

/** "85 ₺" or "85 ₺ · 105 ₺" for two sizes; an unreadable price shows a dash. */
function priceLabel(item: DraftItem): string {
  const small = parsePriceInput(item.price);
  if (small === null) return t.menu.noPrice;
  const large = item.priceLarge.trim() ? parsePriceInput(item.priceLarge) : null;
  return large === null ? formatPrice(small) : `${formatPrice(small)} · ${formatPrice(large)}`;
}

/**
 * One product in an open category: grip handle, name and price, and a three-dot menu with edit
 * and delete. Edit swaps the row for an inline editor. Nothing is saved here; Kaydet saves the menu.
 */
export function MenuProductRow({
  item,
  handle,
  editing,
  onEdit,
  onChange,
  onDelete,
  onDone,
}: {
  item: DraftItem;
  handle: ReactNode;
  editing: boolean;
  onEdit: () => void;
  onChange: (patch: Partial<Omit<DraftItem, 'id'>>) => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  if (editing) {
    return <ProductEditor item={item} onChange={onChange} onDelete={onDelete} onDone={onDone} />;
  }
  return (
    <div className="flex items-center gap-1 border-t border-rule">
      {handle}
      <div className="min-w-0 flex-1 py-2">
        <p className="text-base font-semibold">
          {item.name}
          {item.visible ? null : (
            <span className="ml-2 rounded-pill border border-rule px-2 text-xs font-semibold text-muted-foreground">
              {t.menu.hidden}
            </span>
          )}
        </p>
        <p className="text-sm tabular-nums text-muted-foreground">{priceLabel(item)}</p>
      </div>
      <RowMenu
        label={`${item.name}: ${t.menu.moreActions}`}
        items={[
          { label: t.menu.editItem, onSelect: onEdit },
          { label: t.common.delete, onSelect: onDelete, danger: true },
        ]}
      />
    </div>
  );
}

function ProductEditor({
  item,
  onChange,
  onDelete,
  onDone,
}: {
  item: DraftItem;
  onChange: (patch: Partial<Omit<DraftItem, 'id'>>) => void;
  onDelete: () => void;
  onDone: () => void;
}) {
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  // Focus the name when the editor opens, so keyboard and screen reader users land in it.
  useEffect(() => {
    fieldsetRef.current?.querySelector('input')?.focus();
  }, []);

  const priceError =
    item.price.trim() && parsePriceInput(item.price) === null ? t.common.invalidPrice : undefined;
  const largeError =
    item.priceLarge.trim() && parsePriceInput(item.priceLarge) === null
      ? t.common.invalidPrice
      : undefined;
  const canFinish =
    item.name.trim() !== '' && parsePriceInput(item.price) !== null && largeError === undefined;

  return (
    <div className="border-t border-rule py-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (canFinish) onDone();
        }}
      >
        <fieldset ref={fieldsetRef} className="flex flex-col gap-3">
          <legend className="sr-only">{item.name || t.menu.addItem}</legend>
          <TextField
            label={t.menu.itemName}
            value={item.name}
            maxLength={MENU_LIMITS.nameMax}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label={t.menu.price}
              value={item.price}
              inputMode="decimal"
              error={priceError}
              onChange={(event) => onChange({ price: event.target.value })}
            />
            <TextField
              label={t.menu.priceLarge}
              value={item.priceLarge}
              inputMode="decimal"
              error={largeError}
              onChange={(event) => onChange({ priceLarge: event.target.value })}
            />
          </div>
          <p className="text-sm text-muted-foreground">{t.menu.sizesHint}</p>
          <TextField
            label={t.menu.description}
            value={item.description}
            maxLength={MENU_LIMITS.descriptionMax}
            onChange={(event) => onChange({ description: event.target.value })}
          />
          <CheckboxField
            label={t.menu.visible}
            checked={item.visible}
            onChange={(event) => onChange({ visible: event.target.checked })}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" className="text-danger" onClick={onDelete}>
              <Trash2 className="size-5" aria-hidden="true" />
              {t.common.delete}
            </Button>
            <Button type="submit" disabled={!canFinish}>
              {t.menu.done}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
