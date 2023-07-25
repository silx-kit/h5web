import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  server: { open: true },
  preview: { open: true },
  plugins: [
    react(),
    { ...eslintPlugin(), apply: 'serve' }, // dev only to reduce build time
    { ...checker({ typescript: true }), apply: 'serve' }, // dev only to reduce build time
  ],

  // `es2020` required by @h5web/h5wasm for BigInt `123n` notation support
  optimizeDeps: { esbuildOptions: { target: 'es2020' } },
  build: {
    target: 'es2020',
    // Out of memory! https://github.com/vitejs/vite/issues/2433
    // sourcemap: true,
  },
});
