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
      name: 'Browser tests',
      include: ['src/**/*.browser.test.tsx'],
      setupFiles: 'src/setupTests.ts',
      restoreMocks: true,
      pool: 'threads',
      testTimeout: 10_000,

      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser }],
        viewport: { width: 1920, height: 1080 },
        ui: false,
      },
    },
  }),
);
