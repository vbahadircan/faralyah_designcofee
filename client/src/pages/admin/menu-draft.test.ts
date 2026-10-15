import type { AdminMenu } from '@faralyah/shared';
import { describe, expect, it } from 'vitest';
import {
  addCategory,
  addItem,
  draftFromMenu,
  draftKey,
  draftToSave,
  newDraftId,
  removeCategory,
  reorderById,
  reorderItems,
  updateItem,
  type Draft,
} from './menu-draft';

const MENU: AdminMenu = {
  categories: [
    {
      id: 'c1',
      name: 'Sıcak İçecekler',
      active: true,
      items: [
        { id: 'i1', name: 'Espresso', priceKurus: 8500, visible: true },
        {
          id: 'i2',
          name: 'Caffè Latte',
          priceKurus: 12500,
          priceLargeKurus: 14500,
          description: 'Sütlü',
          visible: false,
        },
      ],
    },
    { id: 'c2', name: 'Tatlılar', active: true, items: [] },
  ],
};

describe('draftFromMenu', () => {
  it('shows prices as typed text and keeps the server ids', () => {
    const draft = draftFromMenu(MENU);
    expect(draft[0]?.items[0]).toEqual({
      id: 'i1',
      name: 'Espresso',
      price: '85',
      priceLarge: '',
      description: '',
      visible: true,
    });
    expect(draft[0]?.items[1]).toMatchObject({ price: '125', priceLarge: '145', visible: false });
  });
});

describe('draftToSave', () => {
  it('round-trips the saved menu without changes', () => {
    expect(draftToSave(draftFromMenu(MENU))).toEqual({
      categories: [
        {
          id: 'c1',
          name: 'Sıcak İçecekler',
          active: true,
          items: [
            { id: 'i1', name: 'Espresso', priceKurus: 8500, description: '', visible: true },
            {
              id: 'i2',
              name: 'Caffè Latte',
              priceKurus: 12500,
              priceLargeKurus: 14500,
              description: 'Sütlü',
              visible: false,
            },
          ],
        },
        { id: 'c2', name: 'Tatlılar', active: true, items: [] },
      ],
    });
  });

  it('leaves ids off new rows and drops an empty large price', () => {
    let draft = addCategory(draftFromMenu(MENU), 'new-9', 'Soğuk');
    draft = addItem(draft, 'new-9', 'new-10');
    draft = updateItem(draft, 'new-9', 'new-10', { name: ' Limonata ', price: '42,5' });
    draft = updateItem(draft, 'c1', 'i2', { priceLarge: '  ' });

    const save = draftToSave(draft);
    expect(save?.categories[2]).toEqual({
      name: 'Soğuk',
      active: true,
      items: [{ name: 'Limonata', priceKurus: 4250, description: '', visible: true }],
    });
    expect(save?.categories[0]?.items[1]).not.toHaveProperty('priceLargeKurus');
  });

  it('refuses a price it cannot read, an empty name, or an empty category name', () => {
    expect(
      draftToSave(updateItem(draftFromMenu(MENU), 'c1', 'i1', { price: 'on lira' })),
    ).toBeNull();
    expect(draftToSave(updateItem(draftFromMenu(MENU), 'c1', 'i1', { name: '  ' }))).toBeNull();
    expect(
      draftToSave(updateItem(draftFromMenu(MENU), 'c1', 'i2', { priceLarge: 'çok' })),
    ).toBeNull();
    const renamed = draftFromMenu(MENU).map((c) => (c.id === 'c2' ? { ...c, name: ' ' } : c));
    expect(draftToSave(renamed)).toBeNull();
  });
});

describe('drag reordering', () => {
  it('moves a category to where it is dropped', () => {
    const draft = draftFromMenu(MENU);
    expect(reorderById(draft, 'c2', 'c1').map((c) => c.id)).toEqual(['c2', 'c1']);
    expect(reorderById(draft, 'c1', 'c1')).toBe(draft);
  });

  it('moves a product inside its own category only', () => {
    const draft = draftFromMenu(MENU);
    const moved = reorderItems(draft, 'c1', 'i2', 'i1');
    expect(moved[0]?.items.map((i) => i.id)).toEqual(['i2', 'i1']);
    expect(moved[1]).toEqual(draft[1]);
  });

  it('leaves the list alone when an id is unknown', () => {
    const draft = draftFromMenu(MENU);
    expect(reorderById(draft, 'yok', 'c1')).toBe(draft);
    expect(reorderItems(draft, 'c1', 'i1', 'yok')).toEqual(draft);
  });
});

describe('draft changes', () => {
  it('adds a category and product with empty fields and removes a category', () => {
    let draft = addCategory(draftFromMenu(MENU), 'new-1', 'Yeni');
    expect(draft.at(-1)).toEqual({ id: 'new-1', name: 'Yeni', active: true, items: [] });
    draft = addItem(draft, 'c2', 'new-2');
    expect(draft[1]?.items).toEqual([
      { id: 'new-2', name: '', price: '', priceLarge: '', description: '', visible: true },
    ]);
    expect(removeCategory(draft, 'c1').map((c) => c.id)).toEqual(['c2', 'new-1']);
  });

  it('gives new ids that do not repeat', () => {
    expect(newDraftId()).not.toBe(newDraftId());
  });

  it('detects unsaved changes by comparing with the saved draft', () => {
    const saved: Draft = draftFromMenu(MENU);
    const same = draftFromMenu(MENU);
    const changed = updateItem(saved, 'c1', 'i1', { price: '90' });
    expect(draftKey(same)).toBe(draftKey(saved));
    expect(draftKey(changed)).not.toBe(draftKey(saved));
  });
});
