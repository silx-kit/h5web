const DEPS_TO_TRANSFORM = ['d3-format'];

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
const config = {
  displayName: 'shared',
  testRegex: '\\.test\\.tsx?$',
  preset: 'ts-jest/presets/js-with-ts',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  transformIgnorePatterns: [
    `node_modules/\\.pnpm/(?!(${DEPS_TO_TRANSFORM.join('|')})@)`,
  ],
};

export default config;
