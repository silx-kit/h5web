import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve('src/styles.ts'),
      formats: ['es'],
      fileName: () => 'styles.js',
    },
    outDir: 'dist/temp',
    emptyOutDir: false,
  },
});
