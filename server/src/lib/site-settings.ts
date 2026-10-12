import type { SiteSettings as SiteSettingsBody, SiteSettingsInput } from '@faralyah/shared';
import { SiteSettings } from '../models/site-settings';

const KEY = 'site';

export async function getSiteSettings(): Promise<SiteSettingsBody> {
  const doc = await SiteSettings.findOne({ key: KEY }).lean();
  return doc?.wifiPassword ? { wifiPassword: doc.wifiPassword } : {};
}

/** Creates the settings document on first save; an empty password removes the field. */
export async function updateSiteSettings(input: SiteSettingsInput): Promise<void> {
  const update = input.wifiPassword
    ? { $set: { wifiPassword: input.wifiPassword } }
    : { $unset: { wifiPassword: 1 } };
  await SiteSettings.updateOne({ key: KEY }, update, { upsert: true, runValidators: true });
}
