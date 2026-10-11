import { describe, expect, it } from 'vitest';
import { menuItemInputSchema, publicMenuSchema } from './menu';

describe('menuItemInputSchema', () => {
  const valid = { name: ' Latte ', priceKurus: 14000, categoryId: 'abc' };

  it('trims, applies defaults and accepts integer kuruş', () => {
    const parsed = menuItemInputSchema.parse(valid);
    expect(parsed).toMatchObject({ name: 'Latte', priceKurus: 14000, order: 0, visible: true });
  });

  it('rejects fractional, negative or missing prices and empty names', () => {
    expect(menuItemInputSchema.safeParse({ ...valid, priceKurus: 140.5 }).success).toBe(false);
    expect(menuItemInputSchema.safeParse({ ...valid, priceKurus: -1 }).success).toBe(false);
    expect(menuItemInputSchema.safeParse({ ...valid, name: '  ' }).success).toBe(false);
    expect(menuItemInputSchema.safeParse({ name: 'x', categoryId: 'a' }).success).toBe(false);
  });
});

describe('publicMenuSchema', () => {
  it('parses a menu payload', () => {
    const payload = {
      categories: [
        { id: '1', name: 'Tatlılar', items: [{ id: 'a', name: 'Sütlaç', priceKurus: 9500 }] },
      ],
    };
    expect(publicMenuSchema.parse(payload)).toEqual(payload);
  });
});
