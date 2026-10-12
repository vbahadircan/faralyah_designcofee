import { model, Schema, type InferSchemaType } from 'mongoose';
import { CAMPAIGN_LIMITS } from '@faralyah/shared';

const campaignSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: CAMPAIGN_LIMITS.titleMax },
    description: { type: String, trim: true, maxlength: CAMPAIGN_LIMITS.descriptionMax },
    /** Integer kuruş (1 ₺ = 100 kuruş). Formatted only at the edge. */
    priceKurus: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'priceKurus must be an integer' },
    },
    /** File name inside uploads/campaigns/, served at /uploads/campaigns/<name>. */
    image: { type: String },
    order: { type: Number, required: true, default: 0, min: 0 },
    /** "Yayında" — unpublished campaigns never reach the public page. */
    published: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: 'campaigns' },
);

campaignSchema.index({ order: 1 });

export type CampaignDoc = InferSchemaType<typeof campaignSchema>;
export const Campaign = model('Campaign', campaignSchema);
