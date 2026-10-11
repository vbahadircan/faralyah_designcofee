import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';
import { connectDb } from './db';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const isProd = process.env.NODE_ENV === 'production';

const app = createApp({
  clientDir: isProd ? path.resolve(here, '../../client/dist') : undefined,
  uploadsDir: path.resolve(here, '../../uploads'),
});

// Listen first so the dev proxy never sees ECONNREFUSED while MongoDB connects;
// queries issued meanwhile are buffered by Mongoose until the connection is ready.
const server = app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `[server] Port ${port} is already in use. Another dev server is probably still running; stop it and try again.`,
    );
  } else {
    console.error('[server]', error);
  }
  process.exit(1);
});

try {
  await connectDb();
  console.log('[server] connected to MongoDB');
} catch (error) {
  console.error(
    '[server] Could not connect to MongoDB. Is it running? Check MONGODB_URI in .env.',
    error instanceof Error ? `(${error.message})` : '',
  );
  process.exit(1);
}
