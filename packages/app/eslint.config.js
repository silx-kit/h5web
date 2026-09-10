import { createConfig, detectOpts } from '@esrf/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

const opts = detectOpts(import.meta.dirname);

const config = defineConfig([
  globalIgnores(['dist/', 'dist-css/', 'dist-ts/']),
  ...createConfig(opts),
  {
    files: ['src/**/*.test.ts'],
    rules: {
      'vitest/expect-expect': [
        'warn',
        {
          assertFunctionNames: ['expect*'],
        },
      ],
    },
  },
]);

export default config;
