import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdminMenu } from '@faralyah/shared';
import { App } from '@/app';
import { tr } from '@/content/tr';
import { jsonResponse } from '@/test-fixtures';

const t = tr.admin;
const SESSION = { authenticated: true, email: 'sahip@example.com', csrfToken: 'token-123' };
const MENU: AdminMenu = {
  categories: [
    {
      id: 'c1',
      name: 'Sıcak İçecekler',
      active: true,
      items: [{ id: 'i1', name: 'Örnek Ürün', priceKurus: 12550, visible: true }],
    },
  ],
};

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

/** Routes fetch calls by URL + method; unknown calls fail the test loudly. */
function stubApi(routes: Record<string, () => Response>) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${url}`;
    const handler = routes[key];
    if (!handler) throw new Error(`Unexpected request ${key}`);
    return handler();
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('admin panel', () => {
  it('sends visitors without a session to the login page', async () => {
    stubApi({ 'GET /api/admin/session': () => jsonResponse({ authenticated: false }) });
    renderAt('/admin');
    expect(
      await screen.findByRole('heading', { level: 1, name: t.login.title }),
    ).toBeInTheDocument();
  });

  it('shows an error for a wrong password', async () => {
    stubApi({
      'POST /api/admin/login': () => jsonResponse({ error: 'invalid_credentials' }, 401),
    });
    const user = userEvent.setup();
    renderAt('/admin/giris');
    await user.type(screen.getByLabelText(t.login.email), 'sahip@example.com');
    await user.type(screen.getByLabelText(t.login.password), 'yanlis');
    await user.click(screen.getByRole('button', { name: t.login.submit }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t.login.invalid);
    expect(screen.getByLabelText(t.login.password)).toHaveValue('');
  });

  it('changes a price with the CSRF token and confirms it', async () => {
    const fetchMock = stubApi({
      'GET /api/admin/session': () => jsonResponse(SESSION),
      'GET /api/admin/menu': () => jsonResponse(MENU),
      'PATCH /api/admin/items/i1': () => new Response(null, { status: 204 }),
    });
    const user = userEvent.setup();
    renderAt('/admin');

    const item = await screen.findByRole('group', { name: 'Örnek Ürün' });
    const price = within(item).getByLabelText(t.menu.price);
    expect(price).toHaveValue('125,50');
    await user.clear(price);
    await user.type(price, '140');
    await user.click(within(item).getByRole('button', { name: t.common.save }));

    expect(await screen.findByRole('status')).toHaveTextContent(t.common.saved);
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(call?.[0]).toBe('/api/admin/items/i1');
    expect((call?.[1]?.headers as Record<string, string>)['X-CSRF-Token']).toBe('token-123');
    expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({ priceKurus: 14000 });
  });

  it('rejects a price it cannot read without calling the server', async () => {
    const fetchMock = stubApi({
      'GET /api/admin/session': () => jsonResponse(SESSION),
      'GET /api/admin/menu': () => jsonResponse(MENU),
    });
    const user = userEvent.setup();
    renderAt('/admin');
    const item = await screen.findByRole('group', { name: 'Örnek Ürün' });
    const price = within(item).getByLabelText(t.menu.price);
    await user.clear(price);
    await user.type(price, 'on lira');
    await user.click(within(item).getByRole('button', { name: t.common.save }));
    expect(price).toHaveAccessibleDescription(t.common.invalidPrice);
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });

  it('saves the Wi-Fi password from the Ayarlar page', async () => {
    const fetchMock = stubApi({
      'GET /api/admin/session': () => jsonResponse(SESSION),
      'GET /api/admin/settings': () => jsonResponse({}),
      'PATCH /api/admin/settings': () => new Response(null, { status: 204 }),
    });
    const user = userEvent.setup();
    renderAt('/admin/ayarlar');

    const field = await screen.findByLabelText(t.settings.wifiPassword);
    expect(screen.getByRole('link', { name: t.nav.settings })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await user.type(field, 'ornek-sifre-123');
    await user.click(screen.getByRole('button', { name: t.common.save }));

    expect(await screen.findByRole('status')).toHaveTextContent(t.common.saved);
    const call = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect((call?.[1]?.headers as Record<string, string>)['X-CSRF-Token']).toBe('token-123');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ wifiPassword: 'ornek-sifre-123' });
  });
});
