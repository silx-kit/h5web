import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: ['packages/lib/src/vis/surface', 'packages/lib/src/vis/tiles'], // experimental
    },
  },
});
