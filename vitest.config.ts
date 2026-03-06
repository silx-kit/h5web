import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'browser',
          include: ['packages/app/src/__tests__/**/*.test.{ts,tsx}'],
          setupFiles: 'packages/app/src/setupTests.ts',
          browser: {
            provider: playwright(),
            enabled: true,
            instances: [{ browser: 'firefox' }],
            viewport: { width: 1920, height: 1080 },
          },
        },
      },
      {
        test: {
          name: 'unit',
          include: [
            'packages/*/src/**/*.test.ts',
            '!packages/app/src/__tests__/**',
          ],
        },
      },
    ],
    coverage: {
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['packages/lib/src/vis/surface', 'packages/lib/src/vis/tiles'], // experimental
    },
  },
});
