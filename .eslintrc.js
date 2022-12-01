const { getDependencies } = require('eslint-config-galex/dist/getDependencies');

const { createConfig } = require('./eslint.shared');

module.exports = createConfig(__dirname, getDependencies(), [
  {
    files: ['**/*.cy.ts'],
    rules: {
      'testing-library/await-async-query': 'off', // Cypress has its own way of dealing with asynchronicity
      'testing-library/await-async-utils': 'off', // Cypress has its own way of dealing with asynchronicity
      'testing-library/prefer-screen-queries': 'off', // Cypress provides `cy` object instead of `screen`
      'sonarjs/no-duplicate-string': 'off', // ioncompatible with Cypress testing syntax
    },
  },
]);
