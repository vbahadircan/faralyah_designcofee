import { publicMenuSchema, type PublicMenu } from '@faralyah/shared';

/** Fetches and validates the public menu. Throws on network, HTTP or shape errors. */
export async function fetchMenu(signal?: AbortSignal): Promise<PublicMenu> {
  const response = await fetch('/api/menu', { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Menu request failed with status ${response.status}`);
  return publicMenuSchema.parse(await response.json());
}
