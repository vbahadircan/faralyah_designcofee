import { tmpdir } from 'node:os';
import path from 'node:path';
import express, { type ErrorRequestHandler, type Express } from 'express';
import session, { type Store } from 'express-session';
import helmet from 'helmet';
import { requireAdmin, requireCsrf } from './middleware/auth';
import { authRouter } from './routes/admin/auth';
import { createAdminCampaignsRouter } from './routes/admin/campaigns';
import { adminMenuRouter } from './routes/admin/menu';
import { campaignsRouter } from './routes/public/campaigns';
import { menuRouter } from './routes/public/menu';

export interface AppOptions {
  /** Absolute path to the built client. When set, it is served with SPA fallback. */
  clientDir?: string;
  /** Absolute path to user-uploaded files (campaign images). */
  uploadsDir?: string;
  /** Where admin sessions live. Production passes a MongoDB store; tests use memory. */
  sessionStore?: Store;
  sessionSecret?: string;
  /** Behind Caddy in production: trust X-Forwarded-* so Secure cookies work. */
  production?: boolean;
}

export function createApp({
  clientDir,
  uploadsDir = path.join(tmpdir(), 'faralyah-uploads'),
  sessionStore,
  sessionSecret = 'dev-only-session-secret',
  production = false,
}: AppOptions = {}): Express {
  const app = express();
  app.disable('x-powered-by');
  if (production) app.set('trust proxy', 1);
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', menuRouter);
  app.use('/api', campaignsRouter);

  // Sessions exist only for the admin API; public pages set no cookies.
  const adminSession = session({
    name: 'faralyah.sid',
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: production,
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000,
    },
  });
  app.use('/api/admin', adminSession, authRouter);
  app.use(
    '/api/admin',
    requireAdmin,
    requireCsrf,
    adminMenuRouter,
    createAdminCampaignsRouter(uploadsDir),
  );

  // Unknown API routes must be a JSON 404, never the SPA shell.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', immutable: true }));

  if (clientDir) {
    app.use(express.static(clientDir, { index: false, maxAge: '1h' }));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  // Last: unexpected errors become a JSON 500 without leaking details to the client.
  app.use(((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    console.error('[server] unhandled error:', error);
    res.status(500).json({ error: 'internal_error' });
  }) satisfies ErrorRequestHandler);

  return app;
}
