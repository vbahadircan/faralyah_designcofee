import {
  publicCampaignListSchema,
  publicMenuSchema,
  siteSettingsSchema,
  type PublicCampaignList,
  type PublicMenu,
  type SiteSettings,
} from '@faralyah/shared';

/** Fetches and validates the public menu. Throws on network, HTTP or shape errors. */
export async function fetchMenu(signal?: AbortSignal): Promise<PublicMenu> {
  const response = await fetch('/api/menu', { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Menu request failed with status ${response.status}`);
  return publicMenuSchema.parse(await response.json());
}

/** Fetches and validates the published campaigns. Throws on network, HTTP or shape errors. */
export async function fetchCampaigns(signal?: AbortSignal): Promise<PublicCampaignList> {
  const response = await fetch('/api/campaigns', {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Campaigns request failed with status ${response.status}`);
  return publicCampaignListSchema.parse(await response.json());
}

/** Fetches and validates the site settings (Wi-Fi password). Throws on network, HTTP or shape errors. */
export async function fetchSettings(signal?: AbortSignal): Promise<SiteSettings> {
  const response = await fetch('/api/settings', {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Settings request failed with status ${response.status}`);
  return siteSettingsSchema.parse(await response.json());
}
