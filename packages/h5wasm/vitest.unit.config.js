import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: '@h5web/h5wasm',
      include: ['src/**/*.test.ts'],
      exclude: [...configDefaults.exclude, 'src/**/*.browser.test.{ts,tsx}'],
      restoreMocks: true,
      pool: 'threads',
    },
  }),
);
