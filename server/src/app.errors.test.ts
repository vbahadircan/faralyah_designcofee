import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./lib/public-menu', () => ({
  getPublicMenu: vi.fn().mockRejectedValue(new Error('db exploded: secret-connection-detail')),
}));

const { createApp } = await import('./app');

describe('unexpected errors', () => {
  it('become a JSON 500 that does not leak internals', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(createApp()).get('/api/menu');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'internal_error' });
    expect(JSON.stringify(res.body)).not.toMatch(/secret|exploded/);
  });
});
