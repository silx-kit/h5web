import { playwright } from '@vitest/browser-playwright';
import { configDefaults, defineProject } from 'vitest/config';

const browser =
  process.env.VITE_TEST_WITH_CHROMIMUM === 'true' ? 'chromium' : 'firefox';

export default defineProject({
  test: {
    name: '@h5web/app',
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          exclude: [
            ...configDefaults.exclude,
            'src/**/*.browser.test.{ts,tsx}',
          ],
          restoreMocks: true,
          pool: 'threads',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
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
      },
    ],
  },
});
