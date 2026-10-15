import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: '@h5web/h5wasm',
      exclude: [...configDefaults.exclude, 'src/**/*.browser.test.tsx'],
    },
  }),
);
