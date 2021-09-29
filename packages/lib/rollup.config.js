import dts from 'rollup-plugin-dts';
import { externals } from './vite.config';

/** @type {import('rollup').MergedRollupOptions} */
const config = {
  input: './dist-ts/index.d.ts',
  output: [{ file: 'dist/index.d.ts', format: 'es' }],
  external: [...externals, /\.css$/u],
  plugins: [dts({ respectExternal: true })],
};

export default config;
