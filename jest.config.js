/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  projects: ['<rootDir>/packages/*'],
  testTimeout: 10_000, // https://github.com/facebook/jest/issues/11500 and https://github.com/facebook/jest/issues/11607#issuecomment-921757201
};

module.exports = config;
