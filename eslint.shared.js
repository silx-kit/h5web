const { files: jestFiles } = require('eslint-config-galex/src/overrides/jest');
const {
  files: reactFiles,
} = require('eslint-config-galex/src/overrides/react');
const {
  files: tsFiles,
} = require('eslint-config-galex/src/overrides/typescript');

const rules = {
  'sort-keys-fix/sort-keys-fix': 'off', // keys should be sorted based on significance
  'import/no-default-export': 'off', // default exports are common in React
  'no-negated-condition': 'off', // ternaries are sometimes more readable when `true` branch is most significant branch

  // Prefer explicit, consistent return - e.g. `return undefined;`
  'unicorn/no-useless-undefined': 'off',
  'consistent-return': 'error',

  // Properties available after typeguard may be tedious to destructure (e.g. in JSX)
  'unicorn/consistent-destructuring': 'off',

  // Not really more readable and makes Jest crash
  'unicorn/prefer-prototype-methods': 'off',

  /* Forcing use of `else` for consistency with mandatory `default` clause in `switch` statements is unreasonable.
   * `if`/`else if` serves a different purpose than `switch`. */
  'sonarjs/elseif-without-else': 'off',
};

const overrides = [
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
      '@typescript-eslint/lines-between-class-members': 'off', // allow grouping single-line members
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // `||` is often conveninent and safe to use with TS
      '@typescript-eslint/explicit-module-boundary-types': 'off', // worsens readability sometimes (e.g. for React components)

      // Allow removing properties with destructuring
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { ignoreRestSiblings: true },
      ],

      // Allow writing void-returning arrow functions in shorthand to save space
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],

      // Prefer `interface` over `type`
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

      // Disallows calling function with value of type `any` (disabled due to false positives)
      // Re-enabling because has helped fix a good number of true positives
      '@typescript-eslint/no-unsafe-argument': 'warn',

      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow', // `never` is too strict
        },
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
      'testing-library/no-unnecessary-act': 'off', // `act` is sometimes required when advancing timers manually
    },
  },
];

module.exports = {
  rules,
  overrides,
};
