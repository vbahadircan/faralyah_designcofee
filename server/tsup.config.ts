import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  // The shared workspace is TypeScript source, so bundle it into the server build.
  noExternal: ['@faralyah/shared'],
});
