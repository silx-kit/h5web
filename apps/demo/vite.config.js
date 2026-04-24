import react from '@vitejs/plugin-react';
import sonda from 'sonda/vite';
import { defineConfig } from 'vite';
import { patchCssModules } from 'vite-css-modules';
import { checker } from 'vite-plugin-checker';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  server: { open: true },
  build: { sourcemap: true },
  plugins: [
    react(),
    patchCssModules(),
    { ...eslintPlugin(), apply: 'serve' }, // dev only to reduce build time
    { ...checker({ typescript: true }), apply: 'serve' }, // dev only to reduce build time
    sonda({ enabled: !process.env.CI }), // disable bundle analysis on build in CI
  ],

  // Import HDF5 compression plugins as static assets
  assetsInclude: ['**/*.so'],
});
