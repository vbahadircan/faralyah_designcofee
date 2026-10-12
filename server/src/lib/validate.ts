import type { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import type { z } from 'zod';

/** Parses the body with a shared Zod schema; on failure answers 400 and returns undefined. */
export function parseBody<S extends z.ZodType>(
  schema: S,
  req: Request,
  res: Response,
): z.infer<S> | undefined {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'invalid_input', issues: result.error.issues });
    return undefined;
  }
  return result.data;
}

/** Route ids that are not ObjectIds can't exist; answer 404 instead of letting Mongoose throw. */
export function validId(id: unknown, res: Response): id is string {
  if (typeof id !== 'string' || !isValidObjectId(id)) {
    res.status(404).json({ error: 'not_found' });
    return false;
  }
  return true;
}
