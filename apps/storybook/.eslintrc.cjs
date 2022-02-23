const { createConfig } = require('eslint-config-galex/src/createConfig');

const { rules, overrides } = require('../../eslint.shared');

module.exports = createConfig({
  cwd: __dirname,
  rules,
  overrides: [
    ...overrides,
    {
      files: ['**/*.stories.tsx'],
      rules: {
        'storybook/csf-component': 'off', // buggy
        'storybook/hierarchy-separator': 'off', // buggy
        'storybook/meta-inline-properties': 'off', // buggy
        'unicorn/numeric-separators-style': 'off', // not supported by Storybook's Babel config
        'storybook/no-title-property-in-meta': 'off', // file path does not always make for an appropriate title
        'sonarjs/no-duplicate-string': 'off', // no problem repeating strings for argTypes
        'sonarjs/no-identical-functions': 'off', // clarity trumps reusability in docs
      },
    },
  ],
});
