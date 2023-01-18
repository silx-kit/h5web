const DEPS_TO_TRANSFORM = [
  'd3-array',
  'd3-color',
  'd3-format',
  'd3-interpolate',
  'd3-scale',
  'd3-scale-chromatic',
  'd3-time',
  'd3-time-format',
  'internmap',
  'three',
];

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  displayName: 'lib',
  testRegex: '\\.test\\.tsx?$',
  preset: 'ts-jest/presets/js-with-ts',
  resetMocks: true,
  roots: ['<rootDir>/src'],
  transformIgnorePatterns: [
    `node_modules/\\.pnpm/(?!(${DEPS_TO_TRANSFORM.join('|')})@)`,
  ],
};

export default config;
