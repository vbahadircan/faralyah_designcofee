import { model, Schema, type InferSchemaType } from 'mongoose';
import { MENU_LIMITS } from '@faralyah/shared';

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: MENU_LIMITS.nameMax },
    order: { type: Number, required: true, default: 0, min: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: 'categories' },
);

categorySchema.index({ order: 1 });

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
