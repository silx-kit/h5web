const DEPS_TO_TRANSFORM = [
  'd3-array',
  'd3-color',
  'd3-format',
  'd3-interpolate',
  'd3-scale-chromatic',
  'internmap',
  'three',
];

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  displayName: 'app',
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
  preset: 'ts-jest/presets/js-with-ts',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  testRegex: '\\.test\\.tsx?$',
  testTimeout: 10_000,
  transformIgnorePatterns: [
    `node_modules/\\.pnpm/(?!(${DEPS_TO_TRANSFORM.join('|')})@)`,
  ],
};

export default config;
