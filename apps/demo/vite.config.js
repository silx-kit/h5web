import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  server: { open: true },
  preview: { open: true },
  plugins: [react(), eslintPlugin()],

  // `es2020` required by @h5web/h5wasm for BigInt `123n` notation support
  build: { target: 'es2020', sourcemap: true },
  optimizeDeps: { esbuildOptions: { target: 'es2020' } },
});
