import js from '@eslint/js';
import restrictedGlobals from 'confusing-browser-globals';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import regexpPlugin from 'eslint-plugin-regexp';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const config = tseslint.config([
  {
    name: 'h5web/shared/ignores',
    ignores: ['/dist-ts/'],
  },
  {
    /**
     * Configure type-aware linting
     *
     * To disable on a subset of files, see:
     * https://typescript-eslint.io/getting-started/typed-linting#how-can-i-disable-type-aware-linting-for-a-subset-of-files
     */
    name: 'h5web/shared/languages-ts',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    /**
     * ESLint core rules: https://eslint.org/docs/latest/rules/
     * Approach:
     *   1. Globally enable all rules as errors for future-proofing.
     *   2. Then, downgrade/configure/disable specific rules as needed.
     */
    name: 'h5web/shared/rules/core',
    rules: {
      // Enable all rules as errors
      ...js.configs.all.rules,

      // Downgrade, configure or disable specific rules
      'array-callback-return': [
        'error',
        { checkForEach: true }, // enforce no return in `forEach`
      ],
      'arrow-body-style': 'off', // use of curly braces in arrow functions should first be dictated by readabillity
      'block-scoped-var': 'off', // useless with `no-var`
      camelcase: 'warn',
      'capitalized-comments': 'off', // too nitpicky
      'class-methods-use-this': 'off', // too nitpicky
      complexity: 'warn',
      'consistent-this': 'off', // too nitpicky
      curly: [
        'warn',
        'all', // curly braces are good for readability and help avoid silly bugs
      ],
      'default-case': 'warn',
      'default-param-last': 'off', // replaced with `@typescript-eslint/default-param-last`
      'dot-notation': 'warn',
      eqeqeq: 'warn',
      'func-name-matching': 'warn',
      'func-names': [
        'warn',
        'as-needed', // unnecessary function names add clutter
      ],
      'func-style': [
        'warn',
        'declaration', // make functions stand out from variables
      ],
      'grouped-accessor-pairs': 'warn',
      'guard-for-in': 'warn',
      'id-denylist': 'off',
      'id-length': 'off',
      'id-match': 'off',
      'init-declarations': 'off',
      'logical-assignment-operators': [
        'warn', // i.e. `||=`, `&&=`, `??=`
        'never', // if re-assigning a variable is unavoidable, at least make the logic explicit
      ],
      'max-classes-per-file': ['warn', 1],
      'max-depth': 'warn',
      'max-lines': 'off', // too arbitrary
      'max-lines-per-function': 'off', // too arbitrary; prefer limiting complexity
      'max-nested-callbacks': 'off', // `max-depth` is more generic
      'max-params': 'off', // too arbitrary
      'max-statements': 'off', // too arbitrary
      'new-cap': 'warn',
      'no-alert': 'warn',

      'no-await-in-loop': 'warn', // promises should by parallelized (disable inline for legitimate cases)
      'no-case-declarations': 'warn',
      'no-console': 'warn',
      'no-continue': 'warn',
      'no-debugger': 'warn',
      'no-duplicate-imports': 'off', // replaced with `imports/no-duplicates`
      'no-else-return': [
        'warn',
        { allowElseIf: false }, // `else if` is unnecessary when all previous branch returns
      ],
      'no-empty': 'warn',
      'no-empty-function': 'warn', // insert "noop" comment (or equivalent) in function body if intentional
      'no-empty-pattern': 'warn',
      'no-empty-static-block': 'warn',
      'no-eq-null': 'off', // useless with `eqeqeq`
      'no-extra-bind': 'warn',
      'no-extra-boolean-cast': ['warn', { enforceForInnerExpressions: true }],
      'no-extra-label': 'off', // useless with `no-labels`
      'no-implicit-coercion': [
        'warn',
        { allow: ['!!'] }, // allow only coercing to boolean with `!!`
      ],
      'no-inline-comments': 'off', // inline comments are very handy...
      'no-inner-declarations': [
        'warn',
        'functions',
        { blockScopedFunctions: 'disallow' }, // stricter stylistic choice (disable inline for legitimate cases)
      ],
      'no-irregular-whitespace': 'warn',
      'no-label-var': 'off', // useless with `no-labels`
      'no-lonely-if': 'off',
      'no-loop-func': 'off', // replaced with `@typescript-eslint/no-loop-func`
      'no-magic-numbers': 'off', // impractical
      'no-multi-assign': 'warn',
      'no-negated-condition': 'off', // sometimes more readable
      'no-nested-ternary': 'off', // sometimes convenient
      'no-new': 'warn',
      'no-param-reassign': [
        'warn',
        { props: true }, // disallow mutating function parameters
      ],
      'no-plusplus': 'off', // risk obsolete with Prettier configured with `semi: true` (default)
      'no-redeclare': 'off', // useless with `no-var`
      'no-restricted-exports': 'off',
      'no-restricted-globals': [
        'error', // access globals explicitly via `window`, `self`, etc.
        ...restrictedGlobals, // https://github.com/facebook/create-react-app/blob/main/packages/confusing-browser-globals/index.js
      ],
      'no-restricted-imports': 'off',
      'no-restricted-properties': 'off',
      'no-restricted-syntax': 'off',
      'no-shadow': 'off', // replaced with `@typescript-eslint/no-shadow`
      'no-template-curly-in-string': 'warn',
      'no-ternary': 'off', // hmm, no thank you
      'no-undef-init': 'warn',
      'no-undefined': 'off', // already enforced by `no-shadow-restricted-names`
      'no-underscore-dangle': 'off', // not worth arguing about
      'no-unexpected-multiline': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-unreachable-loop': 'warn',
      'no-unsafe-optional-chaining': [
        'error',
        { disallowArithmeticOperators: true }, // prevent implicit type coercion of `undefined`
      ],
      'no-unused-expressions': 'warn',
      'no-unused-labels': 'off', // useless with `no-labels`
      'no-unused-private-class-members': 'warn',
      'no-unused-vars': [
        'warn',
        {
          args: 'all', // report all unused arguments
          ignoreRestSiblings: true, // allow using destructuring to remove properties from objects
        },
      ],
      'no-use-before-define': 'off',
      'no-useless-assignment': 'warn',
      'no-useless-catch': 'warn',
      'no-useless-computed-key': 'warn',
      'no-useless-concat': 'warn',
      'no-useless-constructor': 'warn',
      'no-useless-escape': 'warn',
      'no-useless-rename': 'warn',
      'no-useless-return': 'warn',
      'no-void': [
        'warn',
        { allowAsStatement: true }, // useful to identify promises that don't need to be chained/awaited
      ],
      'no-warning-comments': 'off',
      'object-shorthand': 'warn', // `{ a }` rather than `{ a: a }`
      'one-var': ['warn', 'never'], // disallow combining variable declarations - e.g. `const a = 1, b = 2;`
      'operator-assignment': ['warn', 'always'], // `x += y` rather than `x = x + y`
      'prefer-arrow-callback': 'warn',
      'prefer-const': 'warn',
      'prefer-destructuring': 'off', // replaced with `@typescript-eslint/prefer-destructuring`
      'prefer-exponentiation-operator': 'warn',
      'prefer-named-capture-group': 'off', // lacks browser support
      'prefer-numeric-literals': 'warn',
      'prefer-object-has-own': 'warn',
      'prefer-object-spread': 'warn',
      'prefer-template': 'warn',
      'require-atomic-updates': 'warn',
      'require-unicode-regexp': 'off', // replaced with `regexp/require-unicode-regexp`
      'sort-imports': 'off', // prefer `simple-import-sort/imports`
      'sort-keys': 'off',
      'sort-vars': 'off',
      'symbol-description': 'warn',
      'unicode-bom': 'off', // handled by Prettier
      'use-isnan': 'off', // replaced with `unicorn/prefer-number-properties`
      'vars-on-top': 'off', // useless with `no-var`
      yoda: 'warn',
    },
  },
  {
    /**
     * Promise plugin: https://github.com/eslint-community/eslint-plugin-promise
     * Approach:
     *   - Configure every available rule explictly.
     *   - Promote use of `async/await` but enforce promise chaining rules as
     *     fallback in case of local opt-out.
     */
    name: 'h5web/shared/rules/promise',
    plugins: { promise: promisePlugin },
    rules: {
      'promise/always-return': 'error',
      'promise/avoid-new': 'off', // allow `new Promise()` syntax
      'promise/catch-or-return': 'error',
      'promise/no-callback-in-promise': 'warn',
      'promise/no-multiple-resolved': 'warn',
      'promise/no-native': 'off', // obsolete
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
      'promise/valid-params': 'off', // TypeScript
    },
  },
  {
    /**
     * Regexp plugin: https://ota-meshi.github.io/eslint-plugin-regexp/rules/
     * Approach: use recommended configuration, and then tweak
     */
    name: 'h5web/shared/rules/regexp',
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
      'regexp/prefer-quantifier': 'warn',
      'regexp/require-unicode-regexp': 'warn',
      'regexp/sort-alternatives': 'warn',
      'regexp/sort-character-class-elements': 'warn',
      'regexp/sort-flags': 'warn', // downgrade
    },
  },
  {
    /**
     * Import plugin: https://github.com/import-js/eslint-plugin-import
     * Approach:
     *   - Configure each rule explictly, in a project/bundler-agnostic way
     *   - Assume ESM (`"type": "module"` in `package.json`); deal with CJS
     *     files in dedicated config object
     *   - Assume TypeScript: https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import
     *
     */
    name: 'h5web/shared/rules/import',
    plugins: { import: importPlugin },
    rules: {
      'import/consistent-type-specifier-style': [
        'warn',
        'prefer-inline', // `import { type Foo } from 'foo';`
      ],
      'import/default': 'off', // TypeScript
      'import/dynamic-import-chunkname': 'off', // bundler-specific
      'import/export': 'off', // TypeScript
      'import/exports-last': 'off', // can move related pieces of code far apart from one another
      'import/extensions': 'off', // too costly; depends on `moduleResolution` in `tsconfig.json`
      'import/first': 'warn', // move all imports to the top
      'import/group-exports': 'off', // can move related pieces of code far apart from one another
      'import/max-dependencies': 'off', // arbitrary
      'import/named': 'off', // TypeScript
      'import/namespace': 'off', // TypeScript
      'import/newline-after-import': 'warn',
      'import/no-absolute-path': 'off', // depends on `paths` in `tsconfig.json`
      'import/no-amd': 'error',
      'import/no-anonymous-default-export': 'warn', // good for IntelliSense, `console.log` debugging, etc.
      'import/no-commonjs': 'error', // only allowed in CJS files
      'import/no-cycle': [
        'warn',
        {
          ignoreExternal: true,
          maxDepth: 5, // performance vs benefit tradeoff
        },
      ],
      'import/no-default-export': 'off', // common practice in React projects
      'import/no-deprecated': 'warn',
      'import/no-duplicates': [
        'warn',
        {
          considerQueryString: true, // e.g. `?worker`
          'prefer-inline': true, // for compatibility with TypeScript inline `type` imports
        },
      ],
      'import/no-dynamic-require': 'off', // CommonJS
      'import/no-empty-named-blocks': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-import-module-exports': 'off', // CommonJS
      'import/no-internal-modules': 'off', // project-specific; enable as needed to forbid specific submodule imports
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default': 'error', // likely a mistake
      'import/no-named-default': 'warn',
      'import/no-named-as-default-member': 'off', // TypeScript
      'import/no-named-export': 'off',
      'import/no-namespace': 'warn', // namespaces make it difficult to find unused code, rename exports, etc.
      'import/no-nodejs-modules': 'off', // project-specific
      'import/no-relative-packages': 'off', // project-specific
      'import/no-relative-parent-imports': 'off', // project-specific
      'import/no-restricted-paths': 'off', // project-specific
      'import/no-self-import': 'error',
      'import/no-unassigned-import': 'off', // project-specific
      'import/no-unresolved': 'off', // TypeScript
      'import/no-unused-modules': 'warn',
      'import/no-useless-path-segments': 'warn',
      'import/no-webpack-loader-syntax': 'off', // bundler-specific
      'import/order': 'off', // prefer `simple-import-sort/imports`
      'import/prefer-default-export': 'off', // project-specific
      'import/unambiguous': 'off',
    },
  },
  {
    /**
     * Import plugin on CJS files: https://github.com/import-js/eslint-plugin-import
     * Approach: expect CommonJS module system in `.cjs` files
     */
    name: 'h5web/shared/rules-cjs/import',
    files: ['**/*.cjs'],
    plugins: { import: importPlugin },
    rules: {
      'import/no-commonjs': 'off',
      'import/no-cycle': 'off', // not supported
      'import/no-dynamic-require': 'error', // allow explicitly when needed
      'import/no-import-module-exports': 'error',
      'import/no-unresolved': ['error', { commonjs: true }],
      'import/no-useless-path-segments': ['warn', { commonjs: true }],
    },
  },
  {
    /**
     * Simple Import Sort plugin: https://github.com/lydell/eslint-plugin-simple-import-sort
     * Approach:
     *   - Sort imports (typically on save for optimal DX) but leave exports alone
     *   - Prefer this plugin over ESLint's `sort-imports` to avoid debating exact
     *     sorting order (i.e. Prettier philosophy)
     */
    name: 'h5web/shared/rules/import-sort',
    plugins: { 'simple-import-sort': simpleImportSortPlugin },
    rules: {
      'simple-import-sort/imports': 'warn', // crucial for consistency and to reduce noise in diffs
      'simple-import-sort/exports': 'off', // exports order often matters for readability/documentation
    },
  },
  {
    /**
     * Unicorn plugin: https://github.com/sindresorhus/eslint-plugin-unicorn
     * Approach: enable all rules as warnings for future-proofing, and then tweak
     */
    name: 'h5web/shared/rules/unicorn',
    languageOptions: { globals: globals.builtin },
    plugins: { unicorn: unicornPlugin },
    rules: {
      // Enable all rules as warnings
      ...Object.fromEntries(
        Object.keys(unicornPlugin.configs['flat/all'].rules)
          .filter((k) => k.startsWith('unicorn/'))
          .map((k) => [k, 'warn']),
      ),

      // Upgrade, configure or disable specific rules
      'unicorn/empty-brace-spaces': 'off', // handled by Prettier
      'unicorn/expiring-todo-comments': 'off', // project-specific
      'unicorn/filename-case': 'off', // would need more fine-grained control
      'unicorn/import-style': 'off', // project-specific
      'unicorn/no-array-for-each': 'off', // `forEach` is sometimes more concise
      'unicorn/no-array-method-this-argument': 'error', // likely a mistake
      'unicorn/no-array-reduce': 'off', // too opinionated
      'unicorn/no-await-in-promise-methods': 'error', // likely a mistake
      'unicorn/no-invalid-fetch-options': 'error', // likely a mistake
      'unicorn/no-invalid-remove-event-listener': 'error', // likely a mistake
      'unicorn/no-keyword-prefix': 'off', // keywords stand out with syntax highlighting
      'unicorn/no-magic-array-flat-depth': 'off',
      'unicorn/no-negated-condition': 'off', // sometimes more readable
      'unicorn/no-nested-ternary': 'off', // sometimes convenient; Prettier provides decent formatting
      'unicorn/no-null': 'off', // `null` declares "active absence"
      'unicorn/no-unnecessary-await': 'off', // TypeScript
      'unicorn/no-unnecessary-polyfills': 'off', // project-specific
      'unicorn/no-useless-undefined': 'off', // prefer explicitness
      'unicorn/number-literal-case': 'off', // handled by Prettier
      'unicorn/prefer-at': 'off', // poor browser support
      'unicorn/prefer-number-properties': [
        'warn',
        { checkInfinity: false }, // `Number.POSITIVE_INFINITY` is too verbose
      ],
      'unicorn/prefer-query-selector': 'off', // `getElementById` is simpler
      'unicorn/prefer-string-starts-ends-with': 'off', // replaced with `@typescript-eslint/prefer-string-starts-ends-with`
      'unicorn/prefer-structured-clone': 'off', // poor browser support
      'unicorn/prefer-ternary': 'off', // there's such a thing as ternary overuse...
      'unicorn/prefer-top-level-await': 'off', // difficult to detect if supported
      'unicorn/prevent-abbreviations': 'off', // way too opinionated
      'unicorn/string-content': 'off', // project-specific
      'unicorn/switch-case-braces': ['warn', 'avoid'], // `switch` should be less verbose than if/else if/else
      'unicorn/text-encoding-identifier-case': 'off', // false positives
    },
  },
  {
    /**
     * TypeScript plugin: https://typescript-eslint.io/rules/
     * Approach: use both `strictTypeChecked` and stylisticTypeChecked` configs, and then tweak
     */
    name: 'h5web/shared/rules/typescript',
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
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never', // prefer `const x: T = { ... };` to `const x = { ... } as T; `
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
      '@typescript-eslint/no-loop-func': 'error',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': [
        'warn',
        {
          allowComparingNullableBooleansToFalse: false,
          allowComparingNullableBooleansToTrue: false,
        },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'off', // false positives
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'warn',
      '@typescript-eslint/no-unnecessary-qualifier': 'warn',
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
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'warn',
    },
  },
  {
    /**
     * TypeScript plugin on JS files: https://typescript-eslint.io/rules/
     * Approach: disable TS rules that could cause issues in JS files
     */
    name: 'h5web/shared/rules-js/typescript',
    files: ['*.js', '*.mjs', '*.cjs', '*.jsx'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
  {
    name: 'h5web/shared/rules-jsx/react',
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    rules: {
      'no-unused-expressions': ['warn', { enforceForJSX: true }],
    },
  },
]);

export default config;
