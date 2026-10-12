import { model, Schema, type InferSchemaType } from 'mongoose';
import { MENU_LIMITS } from '@faralyah/shared';

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: MENU_LIMITS.nameMax },
    /** Integer kuruş (1 ₺ = 100 kuruş). Formatted only at the edge. */
    priceKurus: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'priceKurus must be an integer' },
    },
    /** Optional large-size price in kuruş; `priceKurus` is then the small size. */
    priceLargeKurus: {
      type: Number,
      min: 0,
      validate: { validator: Number.isInteger, message: 'priceLargeKurus must be an integer' },
    },
    description: { type: String, trim: true, maxlength: MENU_LIMITS.descriptionMax },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    order: { type: Number, required: true, default: 0, min: 0 },
    /** "Menüde göster" — hidden items never reach the public menu. */
    visible: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: 'menu_items' },
);

menuItemSchema.index({ categoryId: 1, order: 1 });

export type MenuItemDoc = InferSchemaType<typeof menuItemSchema>;
export const MenuItem = model('MenuItem', menuItemSchema);
