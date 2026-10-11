import { z } from 'zod';

/** Limits shared by the admin forms and the API (single source of truth). */
export const MENU_LIMITS = {
  nameMax: 60,
  descriptionMax: 120,
} as const;

/** Price in integer kuruş (1 ₺ = 100 kuruş). */
export const priceKurusSchema = z.number().int().min(0).max(10_000_000);

export const menuItemInputSchema = z.object({
  name: z.string().trim().min(1).max(MENU_LIMITS.nameMax),
  priceKurus: priceKurusSchema,
  description: z.string().trim().max(MENU_LIMITS.descriptionMax).optional(),
  categoryId: z.string().min(1),
  order: z.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(MENU_LIMITS.nameMax),
  order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

/** What the public menu endpoint returns: only visible items in active categories. */
export const publicMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceKurus: priceKurusSchema,
  description: z.string().optional(),
});

export const publicCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(publicMenuItemSchema),
});

export const publicMenuSchema = z.object({
  categories: z.array(publicCategorySchema),
});

export type MenuItemInput = z.infer<typeof menuItemInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type PublicMenuItem = z.infer<typeof publicMenuItemSchema>;
export type PublicCategory = z.infer<typeof publicCategorySchema>;
export type PublicMenu = z.infer<typeof publicMenuSchema>;
