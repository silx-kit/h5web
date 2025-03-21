import { createConfig, detectOpts } from '@h5web/eslint-config';

const opts = detectOpts(import.meta.dirname);

const config = [
  ...createConfig(opts),
  {
    name: 'h5web/root/ignores',
    ignores: ['apps/', 'packages/'],
  },
];

export default config;
