import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('is a real button, activates by click and keyboard', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Kaydet</Button>);
    const button = screen.getByRole('button', { name: 'Kaydet' });
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does nothing when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Kaydet
      </Button>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('when loading, keeps the label, marks aria-busy and blocks repeat clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Kaydet
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Kaydet' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
