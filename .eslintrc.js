const { createConfig } = require('eslint-config-galex/src/createConfig');
const { files: jestFiles } = require('eslint-config-galex/src/overrides/jest');
const {
  files: reactFiles,
} = require('eslint-config-galex/src/overrides/react');
const {
  files: tsFiles,
} = require('eslint-config-galex/src/overrides/typescript');

module.exports = createConfig({
  rules: {
    'import/order': 'off',

    'sort-keys-fix/sort-keys-fix': 'off', // keys should be sorted based on significance
    'import/no-default-export': 'off', // default exports are common in React
    'no-negated-condition': 'off', // ternaries are sometimes more readable when `true` branch is most significant branch

    // Prefer explicit, consistent return - e.g. `return undefined;`
    'unicorn/no-useless-undefined': 'off',
    'consistent-return': 'error',
  },
  overrides: [
    {
      files: reactFiles,
      rules: {
        // Allow returning empty fragment instead of `null` to simplify functional component return type
        // => `ReactElement` instead of `ReactElement | null`
        'react/jsx-no-useless-fragment': 'off',
      },
    },
    {
      files: tsFiles,
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off', // too strict
        '@typescript-eslint/no-floating-promises': 'off', // big crash sometimes better than silent fail
        '@typescript-eslint/lines-between-class-members': 'off', // allow grouping single-line members

        // TypeScript requires types where they should not be
        // https://github.com/typescript-eslint/typescript-eslint/issues/2183
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // Unused vars should be removed (but not prevent compilation)
        '@typescript-eslint/no-unused-vars': 'warn',

        // Prefer `interface` over `type`
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
      },
    },
    {
      files: jestFiles,
      rules: {
        'jest/no-focused-tests': 'warn', // warning instead of error
        'jest/prefer-strict-equal': 'off', // `toEqual` is shorter and sufficient in most cases
        'jest-formatting/padding-around-all': 'off', // allow writing concise two-line tests
        'testing-library/await-fire-event': 'off', // not supported by React Testing Library

        // Tests in different `describe` blocks may have the same names and identical functions
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/no-identical-functions': 'off',
      },
    },
    {
      files: ['*.stories.tsx'],
      rules: {
        'react/function-component-definition': 'off', // allow typing template components with Storybook's `Story` type
        'import/no-anonymous-default-export': 'off', // allow exporting anonymous config object
      },
    },
  ],
});
