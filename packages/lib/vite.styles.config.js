import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve('src/styles.ts'),
      formats: ['es'],
      fileName: 'styles',
    },
    outDir: 'dist/temp',
    emptyOutDir: false,
  },
});
