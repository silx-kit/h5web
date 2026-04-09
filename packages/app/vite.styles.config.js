import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve('src/lib-styles.ts'),
      formats: ['es'],
      fileName: 'noop',
      cssFileName: 'lib',
    },
    outDir: 'dist-css',
  },
});
