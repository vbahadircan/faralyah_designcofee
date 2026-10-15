import { parsePriceInput, type AdminMenu, type MenuSave } from '@faralyah/shared';
import { arrayMove } from '@dnd-kit/sortable';
import { priceToInput } from './admin-ui';

/**
 * The menu as the admin edits it before Kaydet. Prices stay as typed text until saved, so a
 * half-typed price never breaks the list. Pure functions: every change returns a new draft.
 */
export type DraftItem = {
  id: string;
  name: string;
  price: string;
  priceLarge: string;
  description: string;
  visible: boolean;
};

export type DraftCategory = {
  id: string;
  name: string;
  active: boolean;
  items: DraftItem[];
};

export type Draft = DraftCategory[];

let draftSeq = 0;

/** A temporary id for a row the server does not know yet. The server assigns the real one. */
export function newDraftId(): string {
  draftSeq += 1;
  return `new-${draftSeq}`;
}

export function isNewDraftId(id: string): boolean {
  return id.startsWith('new-');
}

export function draftFromMenu(menu: AdminMenu): Draft {
  return menu.categories.map((category) => ({
    id: category.id,
    name: category.name,
    active: category.active,
    items: category.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: priceToInput(item.priceKurus),
      priceLarge: item.priceLargeKurus === undefined ? '' : priceToInput(item.priceLargeKurus),
      description: item.description ?? '',
      visible: item.visible,
    })),
  }));
}

/** A stable string for comparing the draft with the saved menu ("unsaved changes" check). */
export function draftKey(draft: Draft): string {
  return JSON.stringify(draft);
}

/**
 * Builds the save request, or returns null when a name or price cannot be read. The editor
 * blocks invalid rows, so null here means the draft was changed some other way.
 */
export function draftToSave(draft: Draft): MenuSave | null {
  const categories: MenuSave['categories'] = [];
  for (const category of draft) {
    const name = category.name.trim();
    if (!name) return null;
    const items: MenuSave['categories'][number]['items'] = [];
    for (const item of category.items) {
      const itemName = item.name.trim();
      const priceKurus = parsePriceInput(item.price);
      const priceLargeKurus = item.priceLarge.trim() ? parsePriceInput(item.priceLarge) : undefined;
      if (!itemName || priceKurus === null || priceLargeKurus === null) return null;
      items.push({
        ...(isNewDraftId(item.id) ? {} : { id: item.id }),
        name: itemName,
        priceKurus,
        ...(priceLargeKurus === undefined ? {} : { priceLargeKurus }),
        description: item.description.trim(),
        visible: item.visible,
      });
    }
    categories.push({
      ...(isNewDraftId(category.id) ? {} : { id: category.id }),
      name,
      active: category.active,
      items,
    });
  }
  return { categories };
}

/** Moves the row `activeId` to the position of `overId` (drag and drop). Unknown ids change nothing. */
export function reorderById<T extends { id: string }>(
  list: T[],
  activeId: string,
  overId: string,
): T[] {
  const from = list.findIndex((row) => row.id === activeId);
  const to = list.findIndex((row) => row.id === overId);
  if (from === -1 || to === -1 || from === to) return list;
  return arrayMove(list, from, to);
}

export function addCategory(draft: Draft, id: string, name: string): Draft {
  return [...draft, { id, name, active: true, items: [] }];
}

export function updateCategory(
  draft: Draft,
  id: string,
  patch: Partial<Pick<DraftCategory, 'name' | 'active'>>,
): Draft {
  return draft.map((category) => (category.id === id ? { ...category, ...patch } : category));
}

export function removeCategory(draft: Draft, id: string): Draft {
  return draft.filter((category) => category.id !== id);
}

/** Adds an empty product at the end of the category. */
export function addItem(draft: Draft, categoryId: string, id: string): Draft {
  return mapItems(draft, categoryId, (items) => [
    ...items,
    { id, name: '', price: '', priceLarge: '', description: '', visible: true },
  ]);
}

export function updateItem(
  draft: Draft,
  categoryId: string,
  id: string,
  patch: Partial<Omit<DraftItem, 'id'>>,
): Draft {
  return mapItems(draft, categoryId, (items) =>
    items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  );
}

export function removeItem(draft: Draft, categoryId: string, id: string): Draft {
  return mapItems(draft, categoryId, (items) => items.filter((item) => item.id !== id));
}

export function reorderItems(
  draft: Draft,
  categoryId: string,
  activeId: string,
  overId: string,
): Draft {
  return mapItems(draft, categoryId, (items) => reorderById(items, activeId, overId));
}

function mapItems(
  draft: Draft,
  categoryId: string,
  change: (items: DraftItem[]) => DraftItem[],
): Draft {
  return draft.map((category) =>
    category.id === categoryId ? { ...category, items: change(category.items) } : category,
  );
}
