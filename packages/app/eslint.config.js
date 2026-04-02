import { createConfig, detectOpts } from '@esrf/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

const opts = detectOpts(import.meta.dirname);

const config = defineConfig([
  globalIgnores(['dist/', 'dist-ts/']),
  ...createConfig(opts),
  {
    files: ['src/**/*.browser.test.{ts,tsx}'],
    rules: {
      // Allow conditional tests for visual regression testing
      'vitest/no-conditional-in-test': 'off',
      'vitest/no-conditional-expect': 'off',
    },
  },
]);

export default config;
