import { createConfig, detectOpts } from '@h5web/eslint-config';

const opts = detectOpts(import.meta.dirname);

const config = [
  ...createConfig(opts),
  {
    name: 'h5web/h5wasm/ignores',
    ignores: ['dist/', 'dist-ts/'],
  },
];

export default config;
