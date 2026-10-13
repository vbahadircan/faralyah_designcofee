import { model, Schema, type InferSchemaType } from 'mongoose';
import { SETTINGS_LIMITS } from '@faralyah/shared';

/** One document (`key: 'site'`) holding site-wide settings. */
const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    /** Shown on the landing page's Wi-Fi card; no card when unset. */
    wifiPassword: { type: String, trim: true, maxlength: SETTINGS_LIMITS.wifiPasswordMax },
  },
  { timestamps: true, collection: 'site_settings' },
);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettings = model('SiteSettings', siteSettingsSchema);
