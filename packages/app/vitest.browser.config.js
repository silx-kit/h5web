import { playwright } from '@vitest/browser-playwright';
import reactFallbackThrottlePlugin from 'vite-plugin-react-fallback-throttle';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const browser = process.env.CI
  ? 'chromium' // Firefox doesn't work in CI: https://github.com/microsoft/playwright/issues/11566
  : process.env.VITE_TEST_BROWSER;

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [reactFallbackThrottlePlugin()], // remove React 19's 300ms `Suspense` fallback delay
    test: {
      name: '@h5web/app (browser)',
      include: ['src/**/*.browser.test.{ts,tsx}'],
      setupFiles: 'src/setupTests.ts',
      clearMocks: true,
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
