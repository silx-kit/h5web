import fs from 'node:fs';
import path from 'node:path';

import stylisticPlugin from '@stylistic/eslint-plugin-js';
import vitestPlugin from '@vitest/eslint-plugin';
import restrictedGlobals from 'confusing-browser-globals';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import regexpPlugin from 'eslint-plugin-regexp';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import storybookPlugin from 'eslint-plugin-storybook';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import _ from 'lodash';
import tseslint from 'typescript-eslint';

const DEFAULT_OPTS = {
  typescript: false,
  react: false,
  storybook: false,
  vitest: false,
  cypress: false,
  reactTestingLibrary: false,
  cypressTestingLibrary: false,
};

export function detectOpts(projectDir) {
  const pkgPath = path.resolve(projectDir, './package.json');
  const tsconfigPath = path.resolve(projectDir, './tsconfig.json');

  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  const deps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  return {
    typescript: deps.has('typescript') && fs.existsSync(tsconfigPath),
    react: deps.has('react'),
    storybook: deps.has('storybook'),
    vitest: deps.has('vitest'),
    cypress: deps.has('cypress'),
    reactTestingLibrary: deps.has('@testing-library/react'),
    cypressTestingLibrary: deps.has('@testing-library/cypress'),
  };
}

// eslint-disable-next-line complexity
export function createConfig(opts = {}) {
  const {
    typescript: withTypeScript,
    react: withReact,
    storybook: withStorybook,
    vitest: withVitest,
    cypress: withCypress,
    reactTestingLibrary: withReactTestingLibrary,
    cypressTestingLibrary: withCypressTestingLibrary,
  } = { ...DEFAULT_OPTS, ...opts };

  return tseslint.config(
    _.compact([
      withTypeScript && {
        /**
         * Configure type-aware linting.
         *
         * To disable on a subset of files, see:
         * https://typescript-eslint.io/getting-started/typed-linting#how-can-i-disable-type-aware-linting-for-a-subset-of-files
         */
        name: 'h5web/defaults/languages-ts',
        languageOptions: {
          parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
          },
        },
      },
      withReact && {
        /**
         * Enable JSX parsing.
         */
        name: 'h5web/defaults/languages-jsx',
        files: ['**/*.{jsx,tsx}'],
        languageOptions: {
          parserOptions: {
            ecmaFeatures: { jsx: true },
            jsxPragma: null, // https://typescript-eslint.io/packages/parser/#jsxpragma
          },
        },
      },
      {
        /**
         * Configure browser globals on files we're confident aren't meant to run
         * in a non-browser environment.
         */
        name: 'h5web/defaults/globals-browser',
        files: ['**/*.{jsx,tsx}'],
        languageOptions: {
          globals: { ...globals.browser },
        },
      },
      {
        /**
         * ESLint core rules: https://eslint.org/docs/latest/rules/
         */
        name: 'h5web/defaults/rules/core',
        rules: {
          'accessor-pairs': 'error',
          'array-callback-return': [
            'error',
            { checkForEach: true }, // enforce no return in `forEach`
          ],
          // 'arrow-body-style': 'off', // use of curly braces in arrow functions should first be dictated by readabillity
          // 'block-scoped-var': 'off', // useless with `no-var`
          // camelcase: 'off', // too tedious to fix when dealing with back-end responses, external libs, etc.
          // 'capitalized-comments': 'off', // too nitpicky
          // 'class-methods-use-this': 'off', // too nitpicky
          complexity: 'warn',
          'consistent-return': 'error',
          // 'consistent-this': 'off', // too nitpicky
          'constructor-super': 'error',
          curly: [
            'warn',
            'all', // curly braces are good for readability and help avoid silly bugs
          ],
          'default-case': 'warn',
          'default-case-last': 'error',
          'default-param-last': 'warn',
          'dot-notation': 'warn',
          eqeqeq: 'warn',
          'for-direction': 'error',
          // 'func-name-matching': 'off', // arbitrary
          'func-names': [
            'warn',
            'as-needed', // unnecessary function names add clutter
          ],
          'func-style': [
            'warn',
            'declaration', // make functions stand out from variables
          ],
          'getter-return': 'error',
          'grouped-accessor-pairs': 'warn',
          'guard-for-in': 'warn',
          // 'id-denylist': 'off',
          // 'id-length': 'off',
          // 'id-match': 'off',
          // 'init-declarations': 'off',
          'logical-assignment-operators': [
            'warn', // i.e. `||=`, `&&=`, `??=`
            'never', // if re-assigning a variable is unavoidable, at least make the logic explicit
          ],
          'max-classes-per-file': ['warn', 1],
          'max-depth': 'warn',
          // 'max-lines': 'off', // too arbitrary
          // 'max-lines-per-function': 'off', // too arbitrary; prefer limiting complexity
          // 'max-nested-callbacks': 'off', // `max-depth` is more generic
          // 'max-params': 'off', // too arbitrary
          // 'max-statements': 'off', // too arbitrary
          'new-cap': 'warn',
          'no-alert': 'warn',
          'no-array-constructor': 'error',
          'no-async-promise-executor': 'error',
          'no-await-in-loop': 'warn', // promises should by parallelized (disable inline for legitimate cases)
          'no-bitwise': 'error',
          'no-caller': 'error',
          'no-case-declarations': 'warn',
          'no-class-assign': 'error',
          'no-compare-neg-zero': 'error',
          'no-cond-assign': 'error',
          'no-console': 'warn',
          'no-const-assign': 'error',
          'no-constant-binary-expression': 'error',
          'no-constant-condition': 'error',
          'no-constructor-return': 'error',
          'no-continue': 'warn',
          'no-control-regex': 'error',
          'no-debugger': 'warn',
          'no-delete-var': 'error',
          'no-div-regex': 'error',
          'no-dupe-args': 'error',
          'no-dupe-class-members': 'error',
          'no-dupe-else-if': 'error',
          'no-dupe-keys': 'error',
          'no-duplicate-case': 'error',
          // 'no-duplicate-imports': 'off', // replaced with `imports/no-duplicates`
          'no-else-return': [
            'warn',
            { allowElseIf: false }, // `else if` is unnecessary when all previous branch returns
          ],
          'no-empty': 'warn',
          'no-empty-character-class': 'error',
          'no-empty-function': [
            'warn', // insert "noop" comment (or equivalent) in function body if intentional
            { allow: ['arrowFunctions'] }, // often used as default values for callback parameters
          ],
          'no-empty-pattern': 'warn',
          'no-empty-static-block': 'warn',
          // 'no-eq-null': 'off', // useless with `eqeqeq`
          'no-eval': 'error',
          'no-ex-assign': 'error',
          'no-extend-native': 'error',
          'no-extra-bind': 'warn',
          'no-extra-boolean-cast': [
            'warn',
            { enforceForInnerExpressions: true },
          ],
          // 'no-extra-label': 'off', // useless with `no-labels`
          'no-fallthrough': 'error',
          'no-func-assign': 'error',
          'no-global-assign': 'error',
          'no-implicit-coercion': [
            'warn',
            { allow: ['!!'] }, // allow only coercing to boolean with `!!`
          ],
          'no-implicit-globals': 'error',
          'no-implied-eval': 'error',
          'no-import-assign': 'error',
          // 'no-inline-comments': 'off', // inline comments are very handy...
          'no-inner-declarations': [
            'warn',
            'functions',
            { blockScopedFunctions: 'disallow' }, // stricter stylistic choice (disable inline for legitimate cases)
          ],
          'no-invalid-regexp': 'error',
          'no-invalid-this': 'error',
          'no-irregular-whitespace': 'warn',
          'no-iterator': 'error',
          // 'no-label-var': 'off', // useless with `no-labels`
          'no-labels': 'error',
          'no-lone-blocks': 'error',
          // 'no-lonely-if': 'off',
          'no-loop-func': 'error',
          'no-loss-of-precision': 'error',
          // 'no-magic-numbers': 'off', // impractical
          'no-misleading-character-class': 'error',
          'no-multi-assign': 'warn',
          'no-multi-str': 'error',
          // 'no-negated-condition': 'off', // sometimes more readable
          // 'no-nested-ternary': 'off', // sometimes convenient
          'no-new-func': 'error',
          'no-new-native-nonconstructor': 'error',
          'no-new-wrappers': 'error',
          'no-new': 'warn',
          'no-nonoctal-decimal-escape': 'error',
          'no-obj-calls': 'error',
          'no-object-constructor': 'error',
          'no-octal-escape': 'error',
          'no-octal': 'error',
          'no-param-reassign': [
            'warn',
            { props: true }, // disallow mutating function parameters
          ],
          // 'no-plusplus': 'off', // risk obsolete with Prettier configured with `semi: true` (default)
          'no-promise-executor-return': 'error',
          'no-proto': 'error',
          'no-prototype-builtins': 'error',
          // 'no-redeclare': 'off', // useless with `no-var`
          'no-regex-spaces': 'error',
          // 'no-restricted-exports': 'off',
          'no-restricted-globals': [
            'error', // access globals explicitly via `window`, `self`, etc.
            ...restrictedGlobals, // https://github.com/facebook/create-react-app/blob/main/packages/confusing-browser-globals/index.js
          ],
          // 'no-restricted-imports': 'off',
          // 'no-restricted-properties': 'off',
          // 'no-restricted-syntax': 'off',
          'no-return-assign': 'error',
          'no-script-url': 'error',
          'no-self-assign': 'error',
          'no-self-compare': 'error',
          'no-sequences': 'error',
          'no-setter-return': 'error',
          'no-shadow-restricted-names': 'error',
          'no-shadow': 'warn',
          'no-sparse-arrays': 'error',
          'no-template-curly-in-string': 'warn',
          // 'no-ternary': 'off', // hmm, no thank you
          'no-this-before-super': 'error',
          'no-throw-literal': 'error',
          'no-undef-init': 'warn',
          'no-undef': 'error',
          // 'no-undefined': 'off', // already enforced by `no-shadow-restricted-names`
          // 'no-underscore-dangle': 'off', // not worth arguing about
          'no-unexpected-multiline': 'warn',
          'no-unmodified-loop-condition': 'error',
          'no-unneeded-ternary': 'warn',
          'no-unreachable-loop': 'warn',
          'no-unreachable': 'error',
          'no-unsafe-finally': 'error',
          'no-unsafe-negation': 'error',
          'no-unsafe-optional-chaining': [
            'error',
            { disallowArithmeticOperators: true }, // prevent implicit type coercion of `undefined`
          ],
          'no-unused-expressions': 'warn',
          // 'no-unused-labels': 'off', // useless with `no-labels`
          'no-unused-private-class-members': 'warn',
          'no-unused-vars': [
            'warn',
            {
              args: 'all', // report all unused arguments
              argsIgnorePattern: '^_', // unless they are specifically prefixed with an underscore
              ignoreRestSiblings: true, // allow using destructuring to remove properties from objects
            },
          ],
          // 'no-use-before-define': 'off',
          // 'no-useless-assignment': 'off', // false positives in JSX (and already covered by TypeScript)
          'no-useless-backreference': 'error',
          'no-useless-call': 'error',
          'no-useless-catch': 'warn',
          'no-useless-computed-key': 'warn',
          'no-useless-concat': 'warn',
          'no-useless-constructor': 'warn',
          'no-useless-escape': 'warn',
          'no-useless-rename': 'warn',
          'no-useless-return': 'warn',
          'no-var': 'error',
          'no-void': [
            'warn',
            { allowAsStatement: true }, // useful to identify promises that don't need to be chained/awaited
          ],
          // 'no-warning-comments': 'off',
          'no-with': 'error',
          'object-shorthand': 'warn', // `{ a }` rather than `{ a: a }`
          'one-var': ['warn', 'never'], // disallow combining variable declarations - e.g. `const a = 1, b = 2;`
          'operator-assignment': ['warn', 'always'], // `x += y` rather than `x = x + y`
          'prefer-arrow-callback': 'warn',
          'prefer-const': 'warn',
          'prefer-destructuring': 'warn',
          'prefer-exponentiation-operator': 'warn',
          // 'prefer-named-capture-group': 'off', // lacks browser support
          'prefer-numeric-literals': 'warn',
          'prefer-object-has-own': 'warn',
          'prefer-object-spread': 'warn',
          'prefer-promise-reject-errors': 'error',
          'prefer-regex-literals': 'error',
          'prefer-rest-params': 'error',
          'prefer-spread': 'error',
          'prefer-template': 'warn',
          'require-atomic-updates': 'warn',
          // 'require-await': 'off', // making a synchronous function `async` intentionally is perfectly fine
          // 'require-unicode-regexp': 'off', // replaced with `regexp/require-unicode-regexp`
          'require-yield': 'error',
          // 'sort-imports': 'off', // prefer `simple-import-sort/imports`
          // 'sort-keys': 'off',
          // 'sort-vars': 'off',
          'symbol-description': 'warn',
          // 'unicode-bom': 'off', // handled by Prettier
          // 'use-isnan': 'off', // replaced with `unicorn/prefer-number-properties`
          'valid-typeof': 'error',
          // 'vars-on-top': 'off', // useless with `no-var`
          // radix: 'off', // obsolete since ES5
          strict: 'error',
          yoda: 'warn',
        },
      },
      withTypeScript && {
        /**
         * ESLint core rules on TS/TSX files.
         * Turn off rules made obsolete by TypeScript or with better alternatives in TypeScript plugin.
         */
        name: 'h5web/defaults/rules-ts/core',
        files: ['**/*.{ts,tsx}'],
        rules: {
          'default-case': 'off',
          'default-param-last': 'off', // replaced with `@typescript-eslint/default-param-last`
          'no-loop-func': 'off', // replaced with `@typescript-eslint/no-loop-func`
          'no-shadow': 'off', // replaced with `@typescript-eslint/no-shadow`
          'prefer-destructuring': 'off', // replaced with `@typescript-eslint/prefer-destructuring`
        },
      },
      withReact && {
        /**
         * ESLint core rules on JSX/TSX files.
         * Configure specific rules to support/check JSX syntax.
         */
        name: 'h5web/defaults/rules-jsx/core',
        files: ['**/*.{jsx,tsx}'],
        rules: {
          'no-unused-expressions': ['warn', { enforceForJSX: true }],
        },
      },
      {
        /**
         * Promise plugin: https://github.com/eslint-community/eslint-plugin-promise
         * Promote use of `async/await` but enforce promise chaining rules as
         * fallback in case of local opt-out.
         */
        name: 'h5web/defaults/rules/promise',
        plugins: { promise: promisePlugin },
        rules: {
          'promise/always-return': 'error',
          // 'promise/avoid-new': 'off', // allow `new Promise()` syntax
          'promise/catch-or-return': 'error',
          'promise/no-callback-in-promise': 'warn',
          'promise/no-multiple-resolved': 'warn',
          // 'promise/no-native': 'off', // obsolete
          'promise/no-nesting': 'warn',
          'promise/no-new-statics': 'error',
          'promise/no-promise-in-callback': 'warn',
          'promise/no-return-in-finally': 'warn',
          'promise/no-return-wrap': 'error',
          'promise/param-names': 'warn',
          'promise/prefer-await-to-callbacks': 'warn',
          'promise/prefer-await-to-then': [
            'error', // `async/await` is a must!
            { strict: true }, // disallow `await promise.then()`
          ],
          'promise/prefer-catch': 'warn',
          'promise/spec-only': 'error',
          'promise/valid-params': 'error',
        },
      },
      withTypeScript && {
        /**
         * Promise plugin on TS/TSX files.
         * Turn off rules that TypeScript can report.
         */
        name: 'h5web/defaults/rules-ts/promise',
        files: ['**/*.{ts,tsx}'],
        rules: {
          'promise/valid-params': 'off',
        },
      },
      {
        /**
         * Regexp plugin: https://ota-meshi.github.io/eslint-plugin-regexp/rules/
         * Use recommended configuration, and then tweak.
         */
        name: 'h5web/defaults/rules/regexp',
        plugins: { regexp: regexpPlugin },
        rules: {
          ...regexpPlugin.configs['flat/recommended'].rules,

          'regexp/grapheme-string-literal': 'warn',
          'regexp/hexadecimal-escape': 'warn',
          'regexp/letter-case': 'warn',
          'regexp/no-control-character': 'error', // complements `no-control-regex`
          'regexp/no-octal': 'error',
          'regexp/no-standalone-backslash': 'error',
          'regexp/no-super-linear-move': 'error', // protects from regex DoS
          'regexp/prefer-escape-replacement-dollar-char': 'warn',
          'regexp/require-unicode-regexp': 'warn',
          'regexp/sort-alternatives': 'warn',
          'regexp/sort-character-class-elements': 'warn',
          'regexp/sort-flags': 'warn', // downgrade
        },
      },
      {
        /**
         * Regexp plugin on test/Cypress files
         */
        name: 'h5web/defaults/rules-test/regexp',
        files: [
          '**/__tests__/**/*.{js,jsx,ts,tsx}',
          '**/*.test.{js,jsx,ts,tsx}',
          'cypress/**/*.ts',
        ],
        rules: {
          'regexp/require-unicode-regexp': 'off', // futile in tests
        },
      },
      {
        /**
         * Stylistic plugin: https://eslint.style/
         * Minor formatting tweaks to complement Prettier.
         */
        name: 'h5web/defaults/rules/stylistic-js',
        plugins: { '@stylistic/js': stylisticPlugin },
        rules: {
          '@stylistic/js/spaced-comment': [
            'warn',
            'always', // force space after `//` and `/*`, and before `*/`
          ],
        },
      },
      {
        /**
         * Stylistic plugin on TS declaration files.
         */
        name: 'h5web/defaults/rules-dts/stylistic-js',
        files: ['**/*.d.ts'],
        rules: {
          '@stylistic/js/spaced-comment': [
            'warn',
            'always',
            { line: { markers: ['/'] } }, // allow triple slash directives
          ],
        },
      },
      {
        /**
         * Import plugin: https://github.com/import-js/eslint-plugin-import
         * - Assume ESM (`"type": "module"` in `package.json`)
         * - Disable slow rules: https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
         */
        name: 'h5web/defaults/rules/import',
        plugins: { import: importPlugin },
        rules: {
          'import/consistent-type-specifier-style': [
            'warn',
            'prefer-inline', // `import { type Foo } from 'foo';`
          ],
          'import/default': 'error',
          // 'import/dynamic-import-chunkname': 'off', // bundler-specific
          'import/export': 'error',
          // 'import/exports-last': 'off', // can move related pieces of code far apart from one another
          // 'import/extensions': 'off', // project-specific
          'import/first': 'warn', // move all imports to the top
          // 'import/group-exports': 'off', // can move related pieces of code far apart from one another
          // 'import/max-dependencies': 'off', // arbitrary
          // 'import/named': 'off', // too slow even when applied only to a few JS files
          // 'import/namespace': 'off', // too slow even when applied only to a few JS files
          'import/newline-after-import': 'warn',
          // 'import/no-absolute-path': 'off', // project-specific
          'import/no-amd': 'error',
          'import/no-anonymous-default-export': 'warn', // good for IntelliSense, `console.log` debugging, etc.
          'import/no-commonjs': 'error', // only allowed in CJS files
          // 'import/no-cycle': 'off', // way too slow!
          // 'import/no-default-export': 'off', // common practice in React projects
          // 'import/no-deprecated': 'off', // too slow even when applied only to a few JS files; cf. also `@typescript-eslint/no-deprecated`
          'import/no-duplicates': [
            'warn',
            {
              considerQueryString: true, // e.g. `?worker`
              'prefer-inline': true, // for compatibility with TypeScript's inline `type` imports
            },
          ],
          // 'import/no-dynamic-require': 'off', // CommonJS
          // 'import/no-empty-named-blocks': 'off',
          // 'import/no-extraneous-dependencies': 'off',
          // 'import/no-import-module-exports': 'off', // CommonJS
          // 'import/no-internal-modules': 'off', // project-specific
          'import/no-mutable-exports': 'error',
          'import/no-named-as-default': 'error',
          'import/no-named-default': 'warn',
          'import/no-named-as-default-member': 'error',
          // 'import/no-named-export': 'off',
          'import/no-namespace': 'warn', // namespaces make it difficult to find unused code, rename exports, etc.
          // 'import/no-nodejs-modules': 'off', // project-specific
          // 'import/no-relative-packages': 'off', // project-specific
          // 'import/no-relative-parent-imports': 'off', // project-specific
          // 'import/no-restricted-paths': 'off', // project-specific
          'import/no-self-import': 'error',
          // 'import/no-unassigned-import': 'off', // project-specific
          // 'import/no-unresolved': 'off', // slow, false positives
          'import/no-unused-modules': 'warn',
          'import/no-useless-path-segments': 'warn',
          // 'import/no-webpack-loader-syntax': 'off', // bundler-specific
          // 'import/order': 'off', // prefer `simple-import-sort/imports`
          // 'import/prefer-default-export': 'off', // project-specific
          // 'import/unambiguous': 'off',
        },
      },
      {
        /**
         * Import plugin on CJS files.
         * Expect CommonJS module system in `.cjs` files.
         */
        name: 'h5web/defaults/rules-cjs/import',
        files: ['**/*.cjs'],
        rules: {
          'import/no-commonjs': 'off',
          'import/no-cycle': 'off', // not supported
          'import/no-dynamic-require': 'error', // allow explicitly when needed
          'import/no-import-module-exports': 'error',
          'import/no-unresolved': ['error', { commonjs: true }],
          'import/no-useless-path-segments': ['warn', { commonjs: true }],
        },
      },
      withTypeScript && {
        /**
         * Import plugin on TS/TSX files.
         * Turn off rules that TypeScript can report.
         */
        name: 'h5web/defaults/rules-ts/import',
        files: ['**/*.{ts,tsx}'],
        rules: {
          'import/default': 'off',
          'import/no-named-as-default-member': 'off',
          'import/no-unresolved': 'off',
        },
      },
      {
        /**
         * Simple Import Sort plugin: https://github.com/lydell/eslint-plugin-simple-import-sort
         * Prefer this plugin over ESLint's `sort-imports` to avoid debating exact
         * sorting order (i.e. Prettier philosophy).
         */
        name: 'h5web/defaults/rules/import-sort',
        plugins: { 'simple-import-sort': simpleImportSortPlugin },
        rules: {
          'simple-import-sort/imports': 'warn', // crucial for consistency and to reduce noise in diffs
          // 'simple-import-sort/exports': 'off', // exports order often matters for readability/documentation
        },
      },
      {
        /**
         * Unicorn plugin: https://github.com/sindresorhus/eslint-plugin-unicorn
         */
        name: 'h5web/defaults/rules/unicorn',
        languageOptions: { globals: globals.builtin },
        plugins: { unicorn: unicornPlugin },
        rules: {
          'unicorn/better-regex': 'warn',
          'unicorn/catch-error-name': 'warn',
          // 'unicorn/consistent-destructuring': 'off', // false positives after type narrowing - e.g. `isDataset(entity) && entity.chunks`
          'unicorn/consistent-empty-array-spread': 'warn',
          'unicorn/consistent-existence-index-check': 'warn',
          'unicorn/consistent-function-scoping': 'warn',
          'unicorn/custom-error-definition': 'warn',
          // 'unicorn/empty-brace-spaces': 'off', // handled by Prettier
          'unicorn/error-message': 'warn',
          'unicorn/escape-case': 'warn',
          // 'unicorn/expiring-todo-comments': 'off', // project-specific
          'unicorn/explicit-length-check': 'warn',
          // 'unicorn/filename-case': 'off', // would need more fine-grained control
          // 'unicorn/import-style': 'off', // project-specific
          'unicorn/new-for-builtins': 'warn',
          'unicorn/no-abusive-eslint-disable': 'warn',
          'unicorn/no-anonymous-default-export': 'warn',
          // 'unicorn/no-array-callback-reference': 'off', // too convenient to pass up on
          // 'unicorn/no-array-for-each': 'off', // `forEach` is sometimes more concise
          'unicorn/no-array-method-this-argument': 'error',
          'unicorn/no-array-push-push': 'warn',
          // 'unicorn/no-array-reduce': 'off', // too opinionated
          'unicorn/no-await-expression-member': 'warn',
          'unicorn/no-await-in-promise-methods': 'error',
          'unicorn/no-console-spaces': 'warn',
          'unicorn/no-document-cookie': 'warn',
          'unicorn/no-empty-file': 'warn',
          'unicorn/no-for-loop': 'warn',
          'unicorn/no-hex-escape': 'warn',
          'unicorn/no-instanceof-array': 'warn',
          'unicorn/no-invalid-fetch-options': 'error',
          'unicorn/no-invalid-remove-event-listener': 'error',
          // 'unicorn/no-keyword-prefix': 'off', // keywords stand out with syntax highlighting
          'unicorn/no-length-as-slice-end': 'warn',
          'unicorn/no-lonely-if': 'warn',
          // 'unicorn/no-magic-array-flat-depth': 'off',
          // 'unicorn/no-negated-condition': 'off', // sometimes more readable
          'unicorn/no-negation-in-equality-check': 'warn',
          // 'unicorn/no-nested-ternary': 'off', // sometimes convenient; Prettier provides decent formatting
          'unicorn/no-new-array': 'warn',
          'unicorn/no-new-buffer': 'warn',
          // 'unicorn/no-null': 'off', // `null` declares "active absence"
          'unicorn/no-object-as-default-parameter': 'warn',
          'unicorn/no-process-exit': 'warn',
          'unicorn/no-single-promise-in-promise-methods': 'warn',
          'unicorn/no-static-only-class': 'warn',
          'unicorn/no-thenable': 'warn',
          'unicorn/no-this-assignment': 'warn',
          'unicorn/no-typeof-undefined': 'warn',
          'unicorn/no-unnecessary-await': 'warn',
          // 'unicorn/no-unnecessary-polyfills': 'off', // project-specific
          'unicorn/no-unreadable-array-destructuring': 'warn',
          'unicorn/no-unreadable-iife': 'warn',
          'unicorn/no-unused-properties': 'warn',
          'unicorn/no-useless-fallback-in-spread': 'warn',
          'unicorn/no-useless-length-check': 'warn',
          'unicorn/no-useless-promise-resolve-reject': 'warn',
          'unicorn/no-useless-spread': 'warn',
          'unicorn/no-useless-switch-case': 'warn',
          // 'unicorn/no-useless-undefined': 'off', // prefer explicitness
          'unicorn/no-zero-fractions': 'warn',
          // 'unicorn/number-literal-case': 'off', // handled by Prettier
          'unicorn/numeric-separators-style': 'warn',
          'unicorn/prefer-add-event-listener': 'warn',
          'unicorn/prefer-array-find': 'warn',
          'unicorn/prefer-array-flat-map': 'warn',
          'unicorn/prefer-array-flat': 'warn',
          'unicorn/prefer-array-index-of': 'warn',
          'unicorn/prefer-array-some': 'warn',
          // 'unicorn/prefer-at': 'off', // poor browser support
          'unicorn/prefer-blob-reading-methods': 'warn',
          'unicorn/prefer-code-point': 'warn',
          'unicorn/prefer-date-now': 'warn',
          'unicorn/prefer-default-parameters': 'warn',
          'unicorn/prefer-dom-node-append': 'warn',
          'unicorn/prefer-dom-node-dataset': 'warn',
          'unicorn/prefer-dom-node-remove': 'warn',
          'unicorn/prefer-dom-node-text-content': 'warn',
          'unicorn/prefer-event-target': 'warn',
          'unicorn/prefer-export-from': 'warn',
          'unicorn/prefer-global-this': 'warn',
          'unicorn/prefer-includes': 'warn',
          'unicorn/prefer-json-parse-buffer': 'warn',
          'unicorn/prefer-keyboard-event-key': 'warn',
          'unicorn/prefer-logical-operator-over-ternary': 'warn',
          'unicorn/prefer-math-min-max': 'warn',
          'unicorn/prefer-math-trunc': 'warn',
          'unicorn/prefer-modern-dom-apis': 'warn',
          'unicorn/prefer-modern-math-apis': 'warn',
          'unicorn/prefer-module': 'warn',
          'unicorn/prefer-native-coercion-functions': 'warn',
          'unicorn/prefer-negative-index': 'warn',
          'unicorn/prefer-node-protocol': 'warn',
          'unicorn/prefer-number-properties': [
            'warn',
            { checkInfinity: false }, // `Number.POSITIVE_INFINITY` is too verbose
          ],
          'unicorn/prefer-object-from-entries': 'warn',
          'unicorn/prefer-optional-catch-binding': 'warn',
          'unicorn/prefer-prototype-methods': 'warn',
          // 'unicorn/prefer-query-selector': 'off', // `getElementById` is simpler
          'unicorn/prefer-reflect-apply': 'warn',
          'unicorn/prefer-regexp-test': 'warn',
          'unicorn/prefer-set-has': 'warn',
          'unicorn/prefer-set-size': 'warn',
          'unicorn/prefer-spread': 'warn',
          'unicorn/prefer-string-raw': 'warn',
          'unicorn/prefer-string-replace-all': 'warn',
          'unicorn/prefer-string-slice': 'warn',
          // 'unicorn/prefer-string-starts-ends-with': 'off', // replaced with `@typescript-eslint/prefer-string-starts-ends-with`
          'unicorn/prefer-string-trim-start-end': 'warn',
          // 'unicorn/prefer-structured-clone': 'off', // poor browser support
          'unicorn/prefer-switch': 'warn',
          // 'unicorn/prefer-ternary': 'off', // there's such a thing as ternary overuse...
          // 'unicorn/prefer-top-level-await': 'off', // difficult to detect if supported
          'unicorn/prefer-type-error': 'warn',
          // 'unicorn/prevent-abbreviations': 'off', // way too opinionated
          'unicorn/relative-url-style': 'warn',
          'unicorn/require-array-join-separator': 'warn',
          'unicorn/require-number-to-fixed-digits-argument': 'warn',
          'unicorn/require-post-message-target-origin': 'warn',
          // 'unicorn/string-content': 'off', // project-specific
          'unicorn/switch-case-braces': ['warn', 'avoid'], // `switch` should be less verbose than if/else if/else
          'unicorn/template-indent': 'warn',
          // 'unicorn/text-encoding-identifier-case': 'off', // false positives
          'unicorn/throw-new-error': 'warn',
        },
      },
      withTypeScript && {
        /**
         * Unicorn plugin on TS/TSX files.
         * Turn off rules made obsolete by TypeScript.
         */
        name: 'h5web/defaults/rules-ts/unicorn',
        files: ['**/*.{ts,tsx}'],
        rules: {
          'unicorn/no-unnecessary-await': 'off',
        },
      },
      withCypress && {
        /**
         * Unicorn plugin on Cypress files.
         */
        name: 'h5web/defaults/rules-cypress/unicorn',
        files: ['cypress/**/*.ts'],
        rules: {
          'unicorn/numeric-separators-style': 'off', // not supported
        },
      },
      withTypeScript && {
        /**
         * TypeScript plugin: https://typescript-eslint.io/rules/
         * Use both `strictTypeChecked` and stylisticTypeChecked` configs, and then tweak.
         */
        name: 'h5web/defaults/rules-ts/typescript',
        extends: [
          tseslint.configs.strictTypeChecked,
          tseslint.configs.stylisticTypeChecked,
        ],
        rules: {
          '@typescript-eslint/ban-ts-comment': [
            'error',
            {
              'ts-expect-error': 'allow-with-description', // allow explicitly disabling errors
              'ts-ignore': true,
              'ts-nocheck': true,
            },
          ],
          '@typescript-eslint/consistent-indexed-object-style': 'warn', // downgrade
          '@typescript-eslint/consistent-type-assertions': [
            'error',
            {
              arrayLiteralTypeAssertions: 'allow-as-parameter', // prefer `const x: T[] = [ ... ];` to `const x = [ ... ] as T[];`
              objectLiteralTypeAssertions: 'allow-as-parameter', // prefer `const x: T = { ... };` to `const x = { ... } as T;`
            },
          ],
          '@typescript-eslint/consistent-type-exports': 'warn',
          '@typescript-eslint/consistent-type-imports': [
            // Prefer this rule to TypeScript's `verbatimModuleSyntax` option
            // https://typescript-eslint.io/rules/consistent-type-imports/#comparison-with-importsnotusedasvalues--verbatimmodulesyntax
            'warn',
            {
              disallowTypeAnnotations: true,
              fixStyle: 'inline-type-imports', // `import { type Foo } from 'foo';`
              prefer: 'type-imports',
            },
          ],
          '@typescript-eslint/default-param-last': 'error',
          '@typescript-eslint/explicit-member-accessibility': 'warn',
          '@typescript-eslint/explicit-module-boundary-types': 'warn',
          '@typescript-eslint/member-ordering': 'warn',
          '@typescript-eslint/method-signature-style': 'warn',
          '@typescript-eslint/no-confusing-void-expression': [
            'warn',
            { ignoreArrowShorthand: true },
          ],
          '@typescript-eslint/no-empty-function': [
            'warn', // insert "noop" comment (or equivalent) in function body if intentional
            { allow: ['arrowFunctions'] }, // often used as default values for callback parameters
          ],
          '@typescript-eslint/no-empty-object-type': [
            'error',
            { allowInterfaces: 'always' }, // empty interfaces don't have the same downside as the empty object type `{}`
          ],
          '@typescript-eslint/no-loop-func': 'error',
          '@typescript-eslint/no-shadow': 'warn',
          '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
            'warn',
            {
              allowComparingNullableBooleansToFalse: false,
              allowComparingNullableBooleansToTrue: false,
            },
          ],
          '@typescript-eslint/no-unnecessary-condition': 'warn', // false positives due to not enabling `noUncheckedIndexedAccess` can be disabled inline
          '@typescript-eslint/no-unnecessary-parameter-property-assignment':
            'warn',
          '@typescript-eslint/no-unnecessary-qualifier': 'warn',
          '@typescript-eslint/no-unnecessary-type-arguments': 'warn', // downgrade
          '@typescript-eslint/no-unsafe-argument': 'warn',
          '@typescript-eslint/no-unsafe-assignment': 'off', // too tricky to fix when `any` is declared externally (JSON.parse, Array.isArray, etc.)
          '@typescript-eslint/no-unused-vars': [
            'warn', // downgrade
            {
              args: 'all', // report all unused arguments
              argsIgnorePattern: '^_', // unless they are specifically prefixed with an underscore
              ignoreRestSiblings: true, // allow using destructuring to remove properties from objects
            },
          ],
          '@typescript-eslint/no-useless-empty-export': 'error',
          '@typescript-eslint/parameter-properties': [
            'warn',
            { prefer: 'parameter-property' }, // e.g. `constructor(public readonly name: string) {}`
          ],
          '@typescript-eslint/prefer-destructuring': 'warn',
          '@typescript-eslint/prefer-enum-initializers': 'error',
          '@typescript-eslint/prefer-nullish-coalescing': 'off', // `??` not supported before FF 72
          '@typescript-eslint/prefer-readonly': 'error',
          '@typescript-eslint/prefer-regexp-exec': 'off', // handled by `regexp/prefer-regexp-exec`
          '@typescript-eslint/promise-function-async': 'error',
          '@typescript-eslint/require-array-sort-compare': 'error',
          '@typescript-eslint/require-await': 'off', // making a synchronous function `async` intentionally is perfectly fine
          '@typescript-eslint/restrict-template-expressions': [
            'error',
            { allowNumber: true },
          ],
        },
      },
      withTypeScript && {
        /**
         * TypeScript plugin on JS/JSX/CJS files
         * Disable some TS rules that could cause issues in JS files.
         */
        name: 'h5web/defaults/rules-js/typescript',
        files: ['**/*.{js,jsx,cjs}'],
        rules: {
          '@typescript-eslint/explicit-member-accessibility': 'off',
          '@typescript-eslint/explicit-module-boundary-types': 'off',
          '@typescript-eslint/no-unsafe-argument': 'off',
          '@typescript-eslint/no-unsafe-assignment': 'off',
          '@typescript-eslint/no-unsafe-call': 'off',
          '@typescript-eslint/no-unsafe-member-access': 'off',
          '@typescript-eslint/no-unsafe-return': 'off',
        },
      },
      withTypeScript && {
        /**
         * TypeScript plugin on JSX/TSX files.
         */
        name: 'h5web/defaults/rules-jsx/typescript',
        files: ['**/*.{jsx,tsx}'],
        rules: {
          '@typescript-eslint/explicit-module-boundary-types': 'off', // affects readability of React components
        },
      },
      withReact && {
        /**
         * React plugin: https://github.com/jsx-eslint/eslint-plugin-react
         */
        name: 'h5web/defaults/rules-jsx/react',
        plugins: { react: reactPlugin },
        settings: { react: { version: 'detect' } },
        rules: {
          // 'react/boolean-prop-naming': 'off',
          'react/button-has-type': 'warn',
          'react/checked-requires-onchange-or-readonly': 'warn',
          'react/default-props-match-prop-types': 'error',
          'react/destructuring-assignment': 'warn',
          'react/display-name': 'warn',
          // 'react/forbid-component-props': 'off', // project-specific
          // 'react/forbid-dom-props': 'off', // project-specific
          // 'react/forbid-elements': 'off', // project-specific
          // 'react/forbid-foreign-prop-types': 'off', // obsolete
          // 'react/forbid-prop-types': 'error', // project-specific
          'react/forward-ref-uses-ref': 'error',
          'react/function-component-definition': [
            'warn',
            {
              namedComponents: 'function-declaration', // `function Foo() { return <div />; }`
              unnamedComponents: 'arrow-function', // `() => { return <div />; }`
            },
          ],
          // 'react/hook-use-state': 'off', // too restrictive
          'react/iframe-missing-sandbox': 'error',
          'react/jsx-boolean-value': 'warn',
          // 'react/jsx-child-element-spacing': 'off', // Prettier
          // 'react/jsx-closing-bracket-location': 'off', // Prettier
          // 'react/jsx-closing-tag-location': 'off', // Prettier
          'react/jsx-curly-brace-presence': ['warn', 'never'], // remove curly braces when not needed
          // 'react/jsx-curly-newline': 'off', // Prettier
          // 'react/jsx-curly-spacing': 'off', // Prettier
          // 'react/jsx-equals-spacing': 'off', // Prettier
          'react/jsx-filename-extension': [
            'warn',
            {
              allow: 'always', // allow components without JSX to have JSX/TSX extension
              extensions: ['.jsx', '.tsx'],
              ignoreFilesWithoutCode: true,
            },
          ],
          // 'react/jsx-first-prop-new-line': 'off', // Prettier
          'react/jsx-fragments': ['warn', 'syntax'], // prefer `<></>` over `<Fragment></Fragment>` (except with `key`)
          // 'react/jsx-handler-names': 'off', // too restrictive
          // 'react/jsx-indent': 'off', // Prettier
          // 'react/jsx-indent-props': 'off', // Prettier
          'react/jsx-key': [
            'error',
            {
              checkFragmentShorthand: true,
              checkKeyMustBeforeSpread: true,
              warnOnDuplicates: true,
            },
          ],
          // 'react/jsx-max-depth': 'off', // arbitrary
          // 'react/jsx-max-props-per-line': 'off', // Prettier
          // 'react/jsx-newline': 'off', // Prettier
          // 'react/jsx-no-bind': 'off', // premature optimisation
          'react/jsx-no-comment-textnodes': 'error',
          // 'react/jsx-no-constructed-context-values': 'off', // premature optimisation
          'react/jsx-no-duplicate-props': 'error',
          'react/jsx-no-leaked-render': 'error', // disabled later on TS files
          // 'react/jsx-no-literals': 'off', // absurd
          'react/jsx-no-script-url': 'error',
          // 'react/jsx-no-target-blank': 'off', // obsolete with modern browsers
          'react/jsx-no-undef': 'error',
          'react/jsx-no-useless-fragment': 'warn',
          // 'react/jsx-one-expression-per-line': 'off', // Prettier
          'react/jsx-pascal-case': 'error',
          // 'react/jsx-props-no-multi-spaces': 'off', // Prettier
          'react/jsx-props-no-spread-multi': 'error',
          // 'react/jsx-props-no-spreading': 'off', // too restrictive
          // 'react/jsx-sort-default-props': 'off',
          // 'react/jsx-sort-props': 'off',
          // 'react/jsx-space-before-closing': 'off', // Prettier
          // 'react/jsx-tag-spacing': 'off', // Prettier
          // 'react/jsx-uses-react': 'off', // importing React in every file shouldn't be required with modern bundlers
          'react/jsx-uses-vars': 'warn', // for `no-unused-vars` and `@typescript-eslint/no-unused-vars` to not report variables used in JSX/TSX
          // 'react/jsx-wrap-multilines': 'off', // Prettier
          'react/no-access-state-in-setstate': 'error',
          // 'react/no-adjacent-inline-elements': 'off', // arbitrary
          'react/no-array-index-key': 'warn', // disable inline as needed
          'react/no-arrow-function-lifecycle': 'error',
          'react/no-children-prop': 'error',
          // 'react/no-danger': 'off', // React's API gives sufficient warning
          'react/no-danger-with-children': 'error',
          'react/no-deprecated': 'error',
          'react/no-did-mount-set-state': 'warn',
          'react/no-did-update-set-state': 'error',
          'react/no-direct-mutation-state': 'error',
          'react/no-find-dom-node': 'error',
          'react/no-invalid-html-attribute': 'error', // check value of `rel` attribute is allowed
          'react/no-is-mounted': 'error',
          'react/no-multi-comp': 'warn',
          'react/no-namespace': 'error',
          // 'react/no-object-type-as-default-prop': 'off', // premature optimisation
          'react/no-redundant-should-component-update': 'error',
          'react/no-render-return-value': 'error',
          // 'react/no-set-state': 'off', // absurd
          'react/no-string-refs': 'error',
          'react/no-this-in-sfc': 'error',
          'react/no-typos': 'error',
          // 'react/no-unescaped-entities': 'off', // Prettier probably sufficient to spot these typos
          'react/no-unknown-property': 'error', // configure `ignore` setting if need be
          'react/no-unsafe': 'error',
          'react/no-unstable-nested-components': 'error',
          'react/no-unused-class-component-methods': 'warn',
          'react/no-unused-prop-types': 'warn',
          'react/no-unused-state': 'warn',
          'react/no-will-update-set-state': 'error',
          'react/prefer-es6-class': 'error',
          'react/prefer-exact-props': 'error',
          // 'react/prefer-read-only-props': 'off', // too restrictive
          'react/prefer-stateless-function': 'warn',
          'react/prop-types': 'warn',
          // 'react/react-in-jsx-scope': 'off', // importing React in every file shouldn't be required with modern bundlers
          // 'react/require-default-props': 'off', // false positives with `forwardRef`
          // 'react/require-optimization': 'off', // absurd
          'react/require-render-return': 'error',
          'react/self-closing-comp': 'warn',
          'react/sort-comp': 'warn',
          // 'react/sort-default-props': 'off',
          // 'react/sort-prop-types': 'off',
          // 'react/state-in-constructor': 'off', // no preference
          'react/static-property-placement': 'warn',
          'react/style-prop-object': 'warn',
          'react/void-dom-elements-no-children': 'error',
        },
      },
      withReact &&
        withTypeScript && {
          /**
           * React plugin on TS/TSX files.
           * Disable rules made obsolete by type-checking.
           */
          name: 'h5web/defaults/rules-ts/react',
          files: ['**/*.{ts,tsx}'],
          rules: {
            'react/jsx-no-leaked-render': 'off',
            'react/jsx-no-undef': 'off',
            'react/no-unknown-property': 'off',
          },
        },
      withReact && {
        /**
         * React hooks plugin: https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
         */
        name: 'h5web/defaults/rules/react-hooks',
        plugins: { 'react-hooks': reactHooksPlugin },
        rules: {
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': [
            'error',
            { additionalHooks: '(useCameraState)' }, // H5Web-specific: `useCameraState` accepts an array of deps like `useEffect`
          ],
        },
      },
      withReact &&
        withStorybook && {
          /**
           * React hooks plugin on Storybook stories files.
           */
          name: 'h5web/defaults/rules-stories/react-hooks',
          files: ['**/*.stories.{jsx,tsx}'],
          rules: {
            'react-hooks/rules-of-hooks': 'off',
          },
        },
      withReact && {
        /**
         * JSX accessibility plugin on JSX/TSX files: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
         */
        name: 'h5web/defaults/rules-jsx/jsx-a11y',
        files: ['**/*.{jsx,tsx}'],
        plugins: { 'jsx-a11y': jsxA11yPlugin },
        rules: {
          'jsx-a11y/alt-text': 'warn',
          // 'jsx-a11y/anchor-ambiguous-text': 'off', // too restrictive
          'jsx-a11y/anchor-has-content': 'warn',
          'jsx-a11y/anchor-is-valid': 'warn',
          'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
          'jsx-a11y/aria-props': 'error',
          'jsx-a11y/aria-proptypes': 'error', // reported also by TS, but error message is clearer
          'jsx-a11y/aria-role': 'error',
          'jsx-a11y/aria-unsupported-elements': 'error',
          'jsx-a11y/autocomplete-valid': 'error',
          // 'jsx-a11y/click-events-have-key-events': 'off', // not sure why
          'jsx-a11y/control-has-associated-label': 'warn',
          'jsx-a11y/heading-has-content': 'warn',
          // 'jsx-a11y/html-has-lang': 'off', // superseded by `jsx-a11y/lang`
          'jsx-a11y/iframe-has-title': 'warn',
          'jsx-a11y/img-redundant-alt': 'warn',
          'jsx-a11y/interactive-supports-focus': 'warn',
          'jsx-a11y/label-has-associated-control': 'warn',
          'jsx-a11y/lang': 'warn',
          // 'jsx-a11y/media-has-caption': 'off', // too restrictive
          'jsx-a11y/mouse-events-have-key-events': 'warn',
          'jsx-a11y/no-access-key': 'error',
          'jsx-a11y/no-aria-hidden-on-focusable': 'error',
          'jsx-a11y/no-autofocus': 'warn',
          'jsx-a11y/no-distracting-elements': 'warn',
          'jsx-a11y/no-interactive-element-to-noninteractive-role': 'warn',
          'jsx-a11y/no-noninteractive-element-interactions': 'warn',
          'jsx-a11y/no-noninteractive-element-to-interactive-role': 'warn',
          'jsx-a11y/no-noninteractive-tabindex': 'warn',
          'jsx-a11y/no-redundant-roles': 'warn',
          // 'jsx-a11y/no-static-element-interactions': 'off', // some valid cases like backdrops
          // 'jsx-a11y/prefer-tag-over-role': 'off', // too many valid cases
          'jsx-a11y/role-has-required-aria-props': 'warn',
          'jsx-a11y/role-supports-aria-props': 'error',
          'jsx-a11y/scope': 'error', // reported also by TS, but error message is clearer
          'jsx-a11y/tabindex-no-positive': 'error',
        },
      },
      withVitest && {
        /**
         * Vitest plugin on test files: https://github.com/vitest-dev/eslint-plugin-vitest
         */
        name: 'h5web/defaults/rules-test/vitest',
        files: [
          '**/__tests__/**/*.{js,jsx,ts,tsx}',
          '**/*.test.{js,jsx,ts,tsx}',
        ],
        plugins: { vitest: vitestPlugin },
        settings: { vitest: { typecheck: true } },
        rules: {
          // 'vitest/consistent-test-filename': 'off', // incompatible with enabling Vitest rules only on specific files
          'vitest/consistent-test-it': 'warn',
          'vitest/expect-expect': 'warn',
          // 'vitest/max-expects': 'off', // arbitrary
          'vitest/max-nested-describe': ['warn', { max: 3 }],
          'vitest/no-alias-methods': 'warn',
          'vitest/no-commented-out-tests': 'warn',
          'vitest/no-conditional-expect': 'warn',
          'vitest/no-conditional-in-test': 'warn',
          'vitest/no-conditional-tests': 'warn',
          'vitest/no-disabled-tests': 'warn',
          'vitest/no-duplicate-hooks': 'warn',
          'vitest/no-focused-tests': ['warn', { fixable: false }],
          // 'vitest/no-hooks': 'off', // not clear why
          'vitest/no-identical-title': 'warn',
          'vitest/no-import-node-test': 'error',
          // 'vitest/no-interpolation-in-snapshots': 'off', // not clear why
          // 'vitest/no-large-snapshots': 'off',
          'vitest/no-mocks-import': 'error',
          // 'vitest/no-restricted-matchers': 'off',
          // 'vitest/no-restricted-vi-methods': 'off',
          'vitest/no-standalone-expect': 'error',
          'vitest/no-test-prefixes': 'error',
          'vitest/no-test-return-statement': 'error',
          // 'vitest/prefer-called-with': 'off',
          'vitest/prefer-comparison-matcher': 'warn',
          'vitest/prefer-each': 'warn',
          'vitest/prefer-equality-matcher': 'warn',
          // 'vitest/prefer-expect-assertions': 'off', // too tedious
          'vitest/prefer-expect-resolves': 'warn',
          'vitest/prefer-hooks-in-order': 'warn',
          'vitest/prefer-hooks-on-top': 'warn',
          // 'vitest/prefer-lowercase-title': 'off',
          'vitest/prefer-mock-promise-shorthand': 'warn',
          // 'vitest/prefer-snapshot-hint': 'off',
          'vitest/prefer-spy-on': 'warn',
          // 'vitest/prefer-strict-equal': 'off', // unnecessary with primitive values
          'vitest/prefer-to-be': 'warn',
          // 'vitest/prefer-to-be-falsy': 'off', // `toBe(false)` is stricter
          'vitest/prefer-to-be-object': 'warn',
          // 'vitest/prefer-to-be-truthy': 'off', // `toBe(true)` is stricter
          'vitest/prefer-to-contain': 'warn',
          'vitest/prefer-to-have-length': 'warn',
          'vitest/prefer-todo': 'warn',
          'vitest/prefer-vi-mocked': 'warn',
          // 'vitest/require-hook': 'off', // false positives with env var type guards
          'vitest/require-local-test-context-for-concurrent-snapshots': 'warn',
          'vitest/require-to-throw-message': 'warn',
          // 'vitest/require-top-level-describe': 'off', // one `describe` in a file is often unnecessary
          'vitest/valid-describe-callback': 'warn',
          'vitest/valid-expect': 'warn',
          // 'vitest/valid-title': 'off',
          'vitest/valid-expect-in-promise': 'error',
        },
      },
      (withReactTestingLibrary || withCypressTestingLibrary) && {
        /**
         * Testing Library plugin on test/Cypress files: https://github.com/testing-library/eslint-plugin-testing-library
         */
        name: 'h5web/defaults/rules-test-cypress/testing-library',
        files: [
          '**/__tests__/**/*.{js,jsx,ts,tsx}',
          '**/*.test.{js,jsx,ts,tsx}',
          'cypress/**/*.ts',
        ],
        plugins: { 'testing-library': testingLibraryPlugin },
        rules: {
          'testing-library/await-async-events': 'error',
          'testing-library/await-async-queries': 'error',
          'testing-library/await-async-utils': 'error',
          // 'testing-library/consistent-data-testid': 'off',
          'testing-library/no-await-sync-events': 'error',
          'testing-library/no-await-sync-queries': 'error',
          'testing-library/no-container': 'warn',
          'testing-library/no-debugging-utils': 'warn',
          'testing-library/no-dom-import': 'warn',
          'testing-library/no-global-regexp-flag-in-query': 'warn',
          'testing-library/no-manual-cleanup': 'warn',
          'testing-library/no-node-access': 'warn',
          'testing-library/no-promise-in-fire-event': 'error',
          'testing-library/no-render-in-lifecycle': 'error',
          'testing-library/no-unnecessary-act': 'warn',
          'testing-library/no-wait-for-multiple-assertions': 'error',
          'testing-library/no-wait-for-side-effects': 'error',
          'testing-library/no-wait-for-snapshot': 'error',
          'testing-library/prefer-explicit-assert': 'warn',
          'testing-library/prefer-find-by': 'warn',
          // 'testing-library/prefer-implicit-assert': 'off', // prefer `testing-library/prefer-explicit-assert`
          'testing-library/prefer-presence-queries': 'warn',
          'testing-library/prefer-query-by-disappearance': 'warn',
          // 'testing-library/prefer-query-matchers': 'off',
          'testing-library/prefer-screen-queries': 'warn',
          'testing-library/prefer-user-event': 'warn',
          'testing-library/render-result-naming-convention': 'warn',
        },
      },
      withCypress && {
        /**
         * Testing Library plugin on Cypress files.
         */
        name: 'h5web/defaults/rules-cypress/testing-library',
        files: ['cypress/**/*.ts'],
        rules: {
          'testing-library/await-async-queries': 'off', // Cypress has its own way of dealing with asynchronicity
          'testing-library/await-async-utils': 'off', // Cypress has its own way of dealing with asynchronicity
          'testing-library/prefer-screen-queries': 'off', // Cypress provides `cy` object instead of `screen`
        },
      },
      withStorybook && {
        /**
         * Storybook plugin on stories files: https://github.com/storybookjs/eslint-plugin-storybook
         */
        name: 'h5web/defaults/rules-stories/storybook',
        files: ['**/*.stories.{jsx,tsx}'],
        plugins: { storybook: storybookPlugin },
        rules: {
          'storybook/await-interactions': 'error',
          'storybook/context-in-play-function': 'error',
          // 'storybook/csf-component': 'off', // valid cases + false positives when spreading stories metadata
          'storybook/default-exports': 'error',
          // 'storybook/hierarchy-separator': 'off', // obsolete
          'storybook/meta-inline-properties': 'warn',
          'storybook/no-redundant-story-name': 'warn',
          // 'storybook/no-stories-of': 'off', // obsolete
          // 'storybook/no-title-property-in-meta': 'off', // custom titles make docs more readable
          // 'storybook/no-uninstalled-addons': 'off', // reported at runtime
          'storybook/prefer-pascal-case': 'warn',
          'storybook/story-exports': 'error',
          'storybook/use-storybook-expect': 'error',
          'storybook/use-storybook-testing-library': 'error',
        },
      },
    ]),
  );
}
