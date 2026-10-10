import { describe, expect, it } from 'vitest';
import { formatPrice } from './price';

describe('formatPrice', () => {
  it('shows whole prices without decimals and a non-breaking space before ₺', () => {
    expect(formatPrice(12000)).toBe('120\u00A0₺');
  });

  it('uses a decimal comma for non-whole prices', () => {
    expect(formatPrice(4250)).toBe('42,50\u00A0₺');
  });

  it('groups thousands the Turkish way', () => {
    expect(formatPrice(1250000)).toBe('12.500\u00A0₺');
  });

  it('rejects negative or fractional kuruş', () => {
    expect(() => formatPrice(-1)).toThrow(RangeError);
    expect(() => formatPrice(10.5)).toThrow(RangeError);
  });
});
