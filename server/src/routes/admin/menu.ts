import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { categoryInputSchema, menuItemInputSchema, moveInputSchema } from '@faralyah/shared';
import { getAdminMenu } from '../../lib/admin-menu';
import { moveInGroup, nextOrder } from '../../lib/reorder';
import { parseBody, validId } from '../../lib/validate';
import { Category } from '../../models/category';
import { MenuItem } from '../../models/menu-item';

export const adminMenuRouter = Router();

const categoryCreate = categoryInputSchema.pick({ name: true, active: true });
const categoryPatch = categoryCreate.partial();
const itemCreate = menuItemInputSchema.omit({ order: true });
const itemPatch = itemCreate.partial();

adminMenuRouter.get('/menu', async (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(await getAdminMenu());
});

adminMenuRouter.post('/categories', async (req, res) => {
  const input = parseBody(categoryCreate, req, res);
  if (!input) return;
  const order = await nextOrder(Category, {});
  const category = await Category.create({ ...input, order });
  res.status(201).json({ id: category._id.toString() });
});

adminMenuRouter.patch('/categories/:id', async (req, res) => {
  if (!validId(req.params.id, res)) return;
  const input = parseBody(categoryPatch, req, res);
  if (!input) return;
  const category = await Category.findByIdAndUpdate(req.params.id, input, { runValidators: true });
  if (!category) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.status(204).end();
});

adminMenuRouter.post('/categories/:id/move', async (req, res) => {
  if (!validId(req.params.id, res)) return;
  const input = parseBody(moveInputSchema, req, res);
  if (!input) return;
  const moved = await moveInGroup(Category, {}, req.params.id, input.direction);
  res.status(moved ? 204 : 404).end();
});

/** Only empty categories can be deleted, so a slip never wipes out a section's items. */
adminMenuRouter.delete('/categories/:id', async (req, res) => {
  if (!validId(req.params.id, res)) return;
  if (await MenuItem.exists({ categoryId: req.params.id })) {
    res.status(409).json({ error: 'category_not_empty' });
    return;
  }
  const deleted = await Category.findByIdAndDelete(req.params.id);
  res.status(deleted ? 204 : 404).end();
});

adminMenuRouter.post('/items', async (req, res) => {
  const input = parseBody(itemCreate, req, res);
  if (!input) return;
  if (!isValidObjectId(input.categoryId) || !(await Category.exists({ _id: input.categoryId }))) {
    res.status(400).json({ error: 'unknown_category' });
    return;
  }
  const order = await nextOrder(MenuItem, { categoryId: input.categoryId });
  const { priceLargeKurus, ...rest } = input;
  const item = await MenuItem.create({
    ...rest,
    ...(priceLargeKurus != null ? { priceLargeKurus } : {}),
    order,
  });
  res.status(201).json({ id: item._id.toString() });
});

adminMenuRouter.patch('/items/:id', async (req, res) => {
  if (!validId(req.params.id, res)) return;
  const input = parseBody(itemPatch, req, res);
  if (!input) return;
  if (
    input.categoryId !== undefined &&
    (!isValidObjectId(input.categoryId) || !(await Category.exists({ _id: input.categoryId })))
  ) {
    res.status(400).json({ error: 'unknown_category' });
    return;
  }
  // An empty description and a null large price clear the field rather than storing it.
  const { description, priceLargeKurus, ...rest } = input;
  const set: Record<string, unknown> = { ...rest };
  const unset: Record<string, 1> = {};
  if (description === '') unset.description = 1;
  else if (description !== undefined) set.description = description;
  if (priceLargeKurus === null) unset.priceLargeKurus = 1;
  else if (priceLargeKurus !== undefined) set.priceLargeKurus = priceLargeKurus;
  const update = Object.keys(unset).length > 0 ? { ...set, $unset: unset } : set;
  const item = await MenuItem.findByIdAndUpdate(req.params.id, update, { runValidators: true });
  if (!item) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.status(204).end();
});

adminMenuRouter.post('/items/:id/move', async (req, res) => {
  if (!validId(req.params.id, res)) return;
  const input = parseBody(moveInputSchema, req, res);
  if (!input) return;
  const item = await MenuItem.findById(req.params.id).select('categoryId').lean();
  if (!item) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  await moveInGroup(MenuItem, { categoryId: item.categoryId }, req.params.id, input.direction);
  res.status(204).end();
});

adminMenuRouter.delete('/items/:id', async (req, res) => {
  if (!validId(req.params.id, res)) return;
  const deleted = await MenuItem.findByIdAndDelete(req.params.id);
  res.status(deleted ? 204 : 404).end();
});
