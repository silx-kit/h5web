import { createConfig, detectOpts } from './index.js';

const opts = detectOpts(import.meta.dirname);

const config = [
  ...createConfig(opts),
  {
    name: 'h5web/eslint-config/ignores',
    ignores: [],
  },
];

export default config;
