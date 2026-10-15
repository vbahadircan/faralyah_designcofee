import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MenuItemRow } from './menu-item-row';

const renderRow = (item: Parameters<typeof MenuItemRow>[0]['item']) =>
  render(
    <ul>
      <MenuItemRow item={item} />
    </ul>,
  );

describe('MenuItemRow', () => {
  it('shows name and price as a list item', () => {
    renderRow({ id: '1', name: 'Latte', priceKurus: 13500 });
    expect(screen.getByRole('listitem')).toHaveTextContent('Latte');
    expect(screen.getByText('135 ₺')).toBeInTheDocument();
  });

  it('shows the optional description only when present', () => {
    const { unmount } = renderRow({ id: '1', name: 'Latte', priceKurus: 13500 });
    expect(screen.queryByText('Sade, orta veya şekerli')).not.toBeInTheDocument();
    unmount();
    renderRow({
      id: '2',
      name: 'Türk Kahvesi',
      priceKurus: 9500,
      description: 'Sade, orta veya şekerli',
    });
    expect(screen.getByText('Sade, orta veya şekerli')).toBeInTheDocument();
  });

  it('labels both prices of a two-size item for screen readers', () => {
    renderRow({ id: '1', name: 'Latte', priceKurus: 13500, priceLargeKurus: 15500 });
    const row = screen.getByRole('listitem');
    expect(row).toHaveTextContent('Küçük boy 135 ₺');
    expect(row).toHaveTextContent('Büyük boy 155 ₺');
  });

  it('shows a single price without a dash in a two-size section', () => {
    render(
      <ul>
        <MenuItemRow item={{ id: '1', name: 'Doppio', priceKurus: 10000 }} sized />
      </ul>,
    );
    const row = screen.getByRole('listitem');
    expect(row).toHaveTextContent('100 ₺');
    expect(row).not.toHaveTextContent('Küçük boy');
    expect(row).not.toHaveTextContent('–');
    expect(row).not.toHaveTextContent('Büyük boy');
  });

  it('hides the decorative leader from assistive tech', () => {
    const { container } = renderRow({ id: '1', name: 'Latte', priceKurus: 13500 });
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
