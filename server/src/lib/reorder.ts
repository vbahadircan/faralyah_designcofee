import type { Model } from 'mongoose';

type Ordered = { order: number };

/**
 * Moves one document up or down among its siblings and renumbers the group 0..n-1, so gaps
 * and duplicate `order` values left by older data are repaired on the way. Returns false when
 * the id is not in the group.
 */
export async function moveInGroup<T extends Ordered>(
  model: Model<T>,
  filter: Record<string, unknown>,
  id: string,
  direction: 'up' | 'down',
): Promise<boolean> {
  const siblings = await model.find(filter).sort({ order: 1, _id: 1 }).select('_id order').lean();
  const index = siblings.findIndex((s) => String(s._id) === id);
  if (index === -1) return false;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target >= 0 && target < siblings.length) {
    [siblings[index], siblings[target]] = [siblings[target]!, siblings[index]!];
  }
  await model.bulkWrite(
    siblings.map((s, order) => ({
      updateOne: { filter: { _id: s._id }, update: { $set: { order } } },
    })) as Parameters<Model<T>['bulkWrite']>[0],
  );
  return true;
}

/** The `order` value for a new last item in a group. */
export async function nextOrder<T extends Ordered>(
  model: Model<T>,
  filter: Record<string, unknown>,
): Promise<number> {
  const last = await model.findOne(filter).sort({ order: -1 }).select('order').lean();
  return last ? last.order + 1 : 0;
}
