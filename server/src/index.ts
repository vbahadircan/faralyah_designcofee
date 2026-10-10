import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 3000);
const isProd = process.env.NODE_ENV === 'production';

const app = createApp({
  clientDir: isProd ? path.resolve(here, '../../client/dist') : undefined,
  uploadsDir: path.resolve(here, '../../uploads'),
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
