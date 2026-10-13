import { describe, expect, it } from 'vitest';
import { formatPrice, parsePriceInput } from './price';

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

describe('parsePriceInput', () => {
  it('reads whole and decimal prices with comma or dot', () => {
    expect(parsePriceInput('120')).toBe(12000);
    expect(parsePriceInput('42,50')).toBe(4250);
    expect(parsePriceInput('42.5')).toBe(4250);
    expect(parsePriceInput(' 350 ₺ ')).toBe(35000);
  });

  it('reads Turkish thousands grouping', () => {
    expect(parsePriceInput('1.250')).toBe(125000);
    expect(parsePriceInput('1.250,75')).toBe(125075);
  });

  it('rejects empty, negative or malformed input', () => {
    expect(parsePriceInput('')).toBeNull();
    expect(parsePriceInput('-5')).toBeNull();
    expect(parsePriceInput('12,345')).toBeNull();
    expect(parsePriceInput('abc')).toBeNull();
  });
});
