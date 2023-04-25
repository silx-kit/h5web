const { getDependencies } = require('eslint-config-galex/dist/getDependencies');

const { createConfig } = require('../../eslint.shared');

module.exports = createConfig(__dirname, getDependencies(), [
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
      '@typescript-eslint/no-shadow': 'off',
      'react-hooks/rules-of-hooks': 'off', // https://github.com/storybookjs/storybook/issues/21115
    },
  },
]);
