const { createConfig } = require('eslint-config-galex/src/createConfig');

const { rules, overrides } = require('../../eslint.shared');

module.exports = createConfig({
  cwd: __dirname,
  rules,
  overrides,
});
