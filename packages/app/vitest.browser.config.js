import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const browser = process.env.CI
  ? 'chromium' // Firefox doesn't work in CI: https://github.com/microsoft/playwright/issues/11566
  : process.env.VITE_TEST_BROWSER;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: '@h5web/app (browser)',
      include: ['src/__tests__/**/*.test.tsx'],
      setupFiles: 'src/setupTests.ts',
      restoreMocks: true,
      pool: 'threads',
      testTimeout: 10_000,

      browser: {
        provider: playwright(),
        enabled: true,
        instances: [{ browser }],
        viewport: { width: 1920, height: 1080 },
      },
    },
  }),
);
