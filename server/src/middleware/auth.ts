import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';

declare module 'express-session' {
  interface SessionData {
    adminId?: string;
    email?: string;
    csrfToken?: string;
  }
}

export function newCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Every admin route checks the session on the server; the UI hiding things is not enough. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.session.adminId) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF protection for admin changes: the client echoes the per-session token (from
 * GET /api/admin/session) in X-CSRF-Token. Another site can't read that token, so it can't
 * forge the header.
 */
export const requireCsrf: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const expected = req.session.csrfToken;
  const actual = req.get('x-csrf-token');
  if (
    !expected ||
    !actual ||
    expected.length !== actual.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
  ) {
    res.status(403).json({ error: 'csrf' });
    return;
  }
  next();
};
