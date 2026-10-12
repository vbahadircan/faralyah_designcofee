import { z } from 'zod';

/** WPA passphrases are at most 63 characters. */
export const SETTINGS_LIMITS = { wifiPasswordMax: 63 } as const;

/** Site-wide settings staff edit in the admin panel. Missing means "not set". */
export const siteSettingsSchema = z.object({
  wifiPassword: z.string().optional(),
});

/** What the admin sends. An empty Wi-Fi password removes it (the card is then hidden). */
export const siteSettingsInputSchema = z.object({
  wifiPassword: z.string().trim().max(SETTINGS_LIMITS.wifiPasswordMax),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
