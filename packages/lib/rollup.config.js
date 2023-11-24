import alias from '@rollup/plugin-alias';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

import { aliasEntries } from '../shared/rollup.utils.js';
import { externals } from './vite.config.js';

export default defineConfig({
  input: './dist-ts/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  external: [...externals, /\.css$/u],
  plugins: [
    alias({ entries: aliasEntries }), // make sure rollup-plugin-dts can find type declatations in @h5web/shared
    dts(),
  ],
});
