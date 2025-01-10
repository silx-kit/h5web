import { createConfig, detectOpts } from '../../eslint.config.base.js';

const opts = detectOpts(import.meta.dirname);

const config = [
  ...createConfig(opts),
  {
    name: 'h5web/demo/ignores',
    ignores: ['dist/'],
  },
];

export default config;
