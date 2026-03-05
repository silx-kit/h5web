import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'jsdom',
          include: ['packages/app/src/__tests__/**/*.test.{ts,tsx}'],
          setupFiles: ['packages/app/src/setupTests.ts'],
          environment: 'jsdom',
          restoreMocks: true,
          testTimeout: 15_000,
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
