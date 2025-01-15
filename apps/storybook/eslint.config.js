import { createConfig, detectOpts } from '../../eslint.config.base.js';

const opts = detectOpts(import.meta.dirname);

const config = [
  ...createConfig(opts),
  {
    name: 'h5web/storybook/ignores',
    ignores: ['build/'],
  },
];

export default config;
