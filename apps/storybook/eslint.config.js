import { createConfig, detectOpts } from '@h5web/eslint-config';

const opts = detectOpts(import.meta.dirname);

const config = [
  ...createConfig(opts),
  {
    name: 'h5web/storybook/ignores',
    ignores: ['build/'],
  },
];

export default config;
