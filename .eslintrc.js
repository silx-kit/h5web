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

    // Properties available after typeguard may be tedious to destructure (e.g. in JSX)
    'unicorn/consistent-destructuring': 'off',

    // zustand has `whitelist` option
    'inclusive-language/use-inclusive-words': [
      'error',
      { allowedTerms: ['whitelist'] },
    ],
  },
  overrides: [
    {
      files: reactFiles,
      rules: {
        'react/jsx-no-constructed-context-values': 'off', // too strict
      },
    },
    {
      files: tsFiles,
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off', // too strict
        '@typescript-eslint/no-floating-promises': 'off', // big crash sometimes better than silent fail
        '@typescript-eslint/lines-between-class-members': 'off', // allow grouping single-line members

        // TypeScript requires types where they should not be required
        // https://github.com/typescript-eslint/typescript-eslint/issues/2183
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // Unused vars should be removed but not prevent compilation
        '@typescript-eslint/no-unused-vars': 'warn',

        // Allow writing void-returning arrow functions in shorthand to save space
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          { ignoreArrowShorthand: true },
        ],

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
        'jest/require-top-level-describe': 'off', // filename should already be meaningful, extra nesting is unnecessary
      },
    },
  ],
});
