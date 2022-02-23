const { createConfig } = require('eslint-config-galex/src/createConfig');

const { rules, overrides } = require('./eslint.shared');

const config = createConfig({
  cwd: __dirname,
  rules,
  overrides: [
    ...overrides,
    {
      files: ['**/*.spec.ts'],
      rules: {
        'testing-library/await-async-query': 'off', // Cypress has its own way of dealing with asynchronicity
        'testing-library/await-async-utils': 'off', // Cypress has its own way of dealing with asynchronicity
        'testing-library/prefer-screen-queries': 'off', // Cypress provides `cy` object instead of `screen`
      },
    },
  ],
});

module.exports = config;
