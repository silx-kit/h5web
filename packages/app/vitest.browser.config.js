import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

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
      attachmentsDir: 'src/__tests__/__screenshots__/.attachments',

      browser: {
        enabled: true,
        provider: playwright({
          connectOptions: process.env.VITE_TEST_IN_DOCKER
            ? {
                wsEndpoint: 'ws://localhost:6677',
                exposeNetwork: '<loopback>',
              }
            : undefined,
        }),
        instances: [{ browser: process.env.VITE_TEST_BROWSER }],
        viewport: { width: 1920, height: 1080 },
        ui: false,
        screenshotFailures: false, // disable debug screenshots for now as they end up in the same directory as visual regression screenshots
        expect: {
          toMatchScreenshot: {
            comparatorOptions: {
              allowedMismatchedPixelRatio: 0,
              threshold: 0,
              includeAA: false,
            },
          },
        },
      },
    },
  }),
);
