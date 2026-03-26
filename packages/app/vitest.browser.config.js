import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const IN_DOCKER = process.env.VITE_TEST_IN_DOCKER;
const BROWSER = process.env.VITE_TEST_BROWSER;

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
        provider: playwright({
          connectOptions: IN_DOCKER
            ? {
                wsEndpoint: 'ws://127.0.0.1:6677/',
                exposeNetwork: '<loopback>',
              }
            : undefined,
        }),
        instances: [{ browser: BROWSER }],
        viewport: { width: 1920, height: 1080 },
        ui: false,
      },

      env: {
        TAKE_SCREENSHOTS: IN_DOCKER,
      },
    },
  }),
);
