import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: '@h5web/app (unit)',
      include: ['src/**/*.test.ts', '!src/__tests__/**'],
      restoreMocks: true,
      pool: 'threads',
    },
  }),
);
