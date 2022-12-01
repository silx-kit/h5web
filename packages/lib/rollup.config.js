import alias from '@rollup/plugin-alias';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

import { externals } from './vite.config.js';

export default defineConfig({
  input: './dist-ts/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  external: [...externals, /\.css$/u],
  plugins: [
    alias({
      entries: [
        {
          // Make sure rollup-plugin-dts can find shared types
          find: '@h5web/shared',
          replacement: '../shared/dist-ts/index.d.ts',
        },
      ],
    }),
    dts({ respectExternal: true }),
  ],
});
