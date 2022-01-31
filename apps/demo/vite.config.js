import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  server: { open: true },
  preview: { open: true },
  // css: { modules: { root: '.' } }, // https://github.com/vitejs/vite/issues/3092#issuecomment-915952727
  plugins: [react(), eslintPlugin()],
});
