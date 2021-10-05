const { createConfig } = require('eslint-config-galex/src/createConfig');

const { rules, overrides } = require('../../eslint.config');

module.exports = createConfig({
  cwd: __dirname,
  rules,
  overrides,
});
