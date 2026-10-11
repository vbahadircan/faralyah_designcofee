/// <reference types="vitest/config" />
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Brand assets (logo SVGs) live in the repo-root /public folder.
  publicDir: path.resolve(__dirname, '../public'),
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    // Fail loudly instead of silently moving to another port when a stale dev server exists.
    strictPort: true,
    proxy: { '/api': 'http://localhost:3000', '/uploads': 'http://localhost:3000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: false,
  },
});
