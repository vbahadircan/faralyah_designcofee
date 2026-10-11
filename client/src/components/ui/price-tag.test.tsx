import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriceTag } from './price-tag';

describe('PriceTag', () => {
  it('formats whole prices without decimals, with a non-breaking space', () => {
    render(<PriceTag kurus={12000} />);
    expect(screen.getByText('120 ₺')).toHaveAttribute('value', '120');
  });

  it('formats prices with kuruş using a decimal comma', () => {
    render(<PriceTag kurus={4250} />);
    expect(screen.getByText('42,50 ₺')).toBeInTheDocument();
  });

  it('uses a non-breaking space so the number and ₺ never split across lines', () => {
    render(<PriceTag kurus={9500} />);
    const nbsp = String.fromCharCode(160);
    expect(screen.getByText('95 ₺').textContent).toBe(`95${nbsp}₺`);
  });

  it('never wraps', () => {
    render(<PriceTag kurus={9500} />);
    expect(screen.getByText('95 ₺')).toHaveClass('whitespace-nowrap');
  });
});
