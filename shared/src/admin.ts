import { z } from 'zod';
import { MENU_LIMITS, priceKurusSchema } from './menu';

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

export const adminSessionSchema = z.discriminatedUnion('authenticated', [
  z.object({ authenticated: z.literal(false) }),
  z.object({
    authenticated: z.literal(true),
    email: z.string(),
    /** Sent back in the X-CSRF-Token header on every admin change. */
    csrfToken: z.string(),
  }),
]);

/** Reorder request for anything with an `order` field. */
export const moveInputSchema = z.object({ direction: z.enum(['up', 'down']) });

/** The full menu as the admin sees it: hidden items and inactive categories included. */
export const adminMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceKurus: priceKurusSchema,
  priceLargeKurus: priceKurusSchema.optional(),
  description: z.string().optional(),
  visible: z.boolean(),
});

export const adminCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  items: z.array(adminMenuItemSchema),
});

export const adminMenuSchema = z.object({ categories: z.array(adminCategorySchema) });

const OBJECT_ID = /^[a-f\d]{24}$/i;

/** One product in a whole-menu save. No `id` means a new product. */
export const menuSaveItemSchema = z.object({
  id: z.string().regex(OBJECT_ID).optional(),
  name: z.string().trim().min(1).max(MENU_LIMITS.nameMax),
  priceKurus: priceKurusSchema,
  priceLargeKurus: priceKurusSchema.nullable().optional(),
  description: z.string().trim().max(MENU_LIMITS.descriptionMax).optional(),
  visible: z.boolean(),
});

/** One category in a whole-menu save. Array order becomes the stored order. */
export const menuSaveCategorySchema = z.object({
  id: z.string().regex(OBJECT_ID).optional(),
  name: z.string().trim().min(1).max(MENU_LIMITS.nameMax),
  active: z.boolean(),
  items: z.array(menuSaveItemSchema).max(500),
});

/**
 * The whole admin menu as the panel edits it. The server makes the database match this list:
 * anything missing from it is deleted, so the panel always sends the complete menu.
 */
export const menuSaveSchema = z.object({
  categories: z.array(menuSaveCategorySchema).max(100),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type AdminSession = z.infer<typeof adminSessionSchema>;
export type MoveInput = z.infer<typeof moveInputSchema>;
export type AdminMenuItem = z.infer<typeof adminMenuItemSchema>;
export type AdminCategory = z.infer<typeof adminCategorySchema>;
export type AdminMenu = z.infer<typeof adminMenuSchema>;
export type MenuSave = z.infer<typeof menuSaveSchema>;
