import path from 'node:path';
import express, { type Express } from 'express';
import helmet from 'helmet';

export interface AppOptions {
  /** Absolute path to the built client. When set, it is served with SPA fallback. */
  clientDir?: string;
  /** Absolute path to user-uploaded files (event cover images). */
  uploadsDir?: string;
}

export function createApp({ clientDir, uploadsDir }: AppOptions = {}): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Unknown API routes must be a JSON 404, never the SPA shell.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  if (uploadsDir) {
    app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', immutable: true }));
  }

  if (clientDir) {
    app.use(express.static(clientDir, { index: false, maxAge: '1h' }));
    app.get(/.*/, (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  return app;
}
