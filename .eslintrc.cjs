const { getDependencies } = require('eslint-config-galex/dist/getDependencies');

const { createConfig } = require('./eslint.shared.cjs');

module.exports = createConfig(__dirname, getDependencies(), [
  {
    files: ['cypress/**/*.ts'],
    rules: {
      'testing-library/await-async-query': 'off', // Cypress has its own way of dealing with asynchronicity
      'testing-library/await-async-utils': 'off', // Cypress has its own way of dealing with asynchronicity
      'testing-library/prefer-screen-queries': 'off', // Cypress provides `cy` object instead of `screen`
      'sonarjs/no-duplicate-string': 'off', // incompatible with Cypress testing syntax
      'unicorn/numeric-separators-style': 'off', // not supported
    },
  },
]);
