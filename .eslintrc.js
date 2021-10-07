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
        // Cypress has its own way of dealing with asynchronicity
        'testing-library/await-async-query': 'off',
        'testing-library/await-async-utils': 'off',
        'testing-library/prefer-screen-queries': 'off',
      },
    },
  ],
});

module.exports = config;
