import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/!(app)',
      'packages/app/vitest.{browser,unit}.config.js',
    ],
    slowTestThreshold: 1000,
    coverage: {
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['packages/lib/src/vis/surface', 'packages/lib/src/vis/tiles'], // experimental
    },
  },
});
