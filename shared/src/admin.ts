import { z } from 'zod';
import { priceKurusSchema } from './menu';

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

export type LoginInput = z.infer<typeof loginInputSchema>;
export type AdminSession = z.infer<typeof adminSessionSchema>;
export type MoveInput = z.infer<typeof moveInputSchema>;
export type AdminMenuItem = z.infer<typeof adminMenuItemSchema>;
export type AdminCategory = z.infer<typeof adminCategorySchema>;
export type AdminMenu = z.infer<typeof adminMenuSchema>;
