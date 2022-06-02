# Contributing

- [Quick start](#quick-start-)
- [Development](#development)
  - [`pnpm` v7 cheat sheet](#pnpm-v7-cheat-sheet)
  - [Dependency management](#dependency-management)
  - [Workspace dependencies](#workspace-dependencies)
  - [Icon set](#icon-set)
- [Build](#build)
  - [Package builds](#package-builds)
- [Code quality](#code-quality)
  - [Fixing and formatting](#fixing-and-formatting)
  - [Editor integration](#editor-integration)
- [Testing](#testing)
  - [Feature tests](#feature-tests)
    - [Fake timers](#fake-timers)
    - [Debugging](#debugging)
  - [Visual regression](#visual-regression)
- [Deployment](#deployment)
- [Release process](#release-process)

## Quick start 🚀

```bash
pnpm install
pnpm start
```

## Development

- `pnpm start` - start the H5Web stand-alone demo
- `pnpm start:storybook` - start the component library's
  [Storybook](https://storybook.js.org/docs/react/get-started/introduction)
  documentation site at http://localhost:6006

### `pnpm` v7 cheat sheet

- `pnpm install` - install the dependencies of every project in the workspace
  and of the workspace itself
- `pnpm --filter <project-name> add [-D] <pkg-name>` -
  [add a dependency](https://pnpm.io/cli/add) to a project in the workspace
- `pnpm [run] <script> [--<arg>]` - run a workspace script
- `pnpm [run] --filter {packages/*} [--parallel] <script> [--<arg>]` -
  [run a script](https://pnpm.io/cli/run) in every project in the `packages`
  folder
- `pnpm [exec] <binary>` - run a binary located in `node_modules/.bin`
  (equivalent to `npx <pkg-name>` for a package installed in the workspace)
- `pnpx <pkg-name>` - fetch a package from the registry and run its default
  command binary (equivalent to `npx <pkg-name>`)
- `pnpm why -r <pkg-name>` - show all project and packages that depend on the
  specified package
- `pnpm outdated -r` - list outdated dependencies in the workspace
- `pnpm up -rL <pkg-name>` - update a package to the latest version in every
  project

### Dependency management

1. Run `pnpm outdated -r` to list dependencies that can be upgraded.
1. Read the changelogs and release notes of the dependencies you'd like to
   upgrade. Look for potential breaking changes, and for bug fixes and new
   features that may help improve the codebase.
1. Run `pnpm up -rL <pkg-name>` to update a dependency to the latest version in
   all projects. Alternatively, you can either replace `-r` with `--filter` to
   target specific projects, or edit the relevant `package.json` file(s)
   manually and run `pnpm install` (but make sure to specify an exact dependency
   version rather than a range - i.e. don't prefix the version with a caret or a
   tilde).

Beware of the following versioning requirements:

- The major version number of `@types/node` must match the version of Node
  specified in the `engine` field of `package.json`.
- The major version numbers of
  [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) packages
  must match the major version numbers of their corresponding dependencies (e.g.
  `@types/jest@27` for `jest@27`).

Note that `pnpm` offers multiple solutions for dealing with peer dependency
version conflicts and other package resolution issues:
[`pnpm.overrides`](https://pnpm.io/package_json#pnpmoverrides),
[`pnpm.packageExtensions`](https://pnpm.io/package_json#pnpmpackageextensions)
[`peerDependenciesMeta`](https://pnpm.io/package_json#peerdependenciesmeta),
[`.pnpmfile.cjs`](https://pnpm.io/pnpmfile).

`pnpm.overrides` is currently used to force the version of ESLint to the one
required by `eslint-config-galex`. This is needed because, in the `demo`
project, `vite-plugin-eslint` depends on an older version of ESLint.

### Workspace dependencies

To reference a workspace dependency, use pnpm's
[workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)
with the `*` alias - e.g. `"@h5web/lib": "workspace:*"`. This tells pnpm to link
the dependency to its corresponding workspace folder, and saves you from having
to keep the version of the dependency up to date. During publishing, pnpm
automatically replaces `workspace:*` with the correct version.

A workspace dependency's `package.json` must include a `main` field pointing to
the dependency's source entry file - e.g. `src/index.ts`. This is the key to
this monorepo set-up, as it avoids having to run watch tasks in separate
terminals to automatically rebuild dependencies during development.

Obviously, a package's `main` field cannot point to its source TypeScript entry
file once published, as consumers may not understand TypeScript. Additionally,
`package.json` needs to point to more entry files (type declarations, ESM build,
etc.) and do so in a way that is compatible with various toolchains (webpack 4,
webpack 5, Parcel, Rollup, Vite, CRA, etc.) pnpm provides a nice solution to
this problem in the form of the
[`publishConfig` field](https://pnpm.io/package_json#publishconfig).

### Icon set

H5Web uses the [Feather icon set](https://react-icons.netlify.com/#/icons/fi).
Icons can be imported as React components from `react-icons/fi`.

## Build

- `pnpm build` - build the H5Web stand-alone demo
- `pnpm build:storybook` - build the component library's Storybook documentation
  site
- `pnpm serve` - serve the built demo at http://localhost:3000
- `pnpm serve:storybook` - serve the built Storybook at http://localhost:6006
- `pnpm packages` - build packages (cf. details below)

### Package builds

The build process of `@h5web/lib` works as follows:

1. First, Vite builds the JS bundles (ESM and CommonJS) in library mode starting
   from the package's entrypoint: `src/index.ts`. The bundles are placed in the
   output `dist` directory and referenced from `package.json`.

   The JS build also generates a file called `style.css` in the `dist` folder
   that contains the compiled CSS modules that Vite comes across while building
   the React components. These styles are called "local" styles.

2. Second, we run two scripts in parallel: `build:css` and `build:dts`.
   - The job of `build:css` is to build the package's global styles and
     concatenate them with the local styles compiled at the first step. To do
     so, we run Vite again but with a different config: `vite.styles.config.js`,
     and a different entrypoint: `src/styles.ts`. The output files are placed in
     a temporary folder: `dist/temp`. We then concatenate `dist/temp/style.css`
     (the global styles) and `dist/style.css` (the local styles) and output the
     result to `dist/styles.css`, which is the stylesheet referenced from
     `package.json` that consumers need to import.
   - The job of `build:dts` is to generate type declarations for package
     consumers who use TypeScript. This is a two step process: first we generate
     type declarations for all TS files in the `dist-ts` folder with `tsc`, then
     we use Rollup to merge all the declarations into a single file:
     `dist/index.d.ts`, which is referenced from `package.json`. Note that since
     `@h5web/shared` is not a published package, it cannot be marked as an
     external dependency; its types must therefore be inlined into
     `dist/index.d.ts`, so we make sure to tell Rollup where to find them.

The build process of `@h5web/app` is the same with one exception: in addition to
importing the package's global styles, `src/styles.ts` also imports the `lib`
package's distributed styles - i.e. the output of the lib's `build:css` script.
The lib's distributed styles include both its global _and_ local styles. This
allows us to provide a single CSS bundle for consumers of `@h5web/app` to
import.

The build process of`@h5web/h5wasm` is also the same as the lib's, but since the
package does not include any styles, `vite build` does not generate a
`style.css` file and there's not `build:css` script.

Finally, since `@h5web/shared` is not a published package, it does not need to
be built with Vite. However, its types do need to be built with `tsc` so that
other packages can inline them in their own `dist/index.d.ts`.

## Code quality

- `pnpm prettier` - check that all files in the workspace have been formatted
  with Prettier
- `pnpm lint` - lint and type-check every project in the workspace with ESLint
  and TypeScript, as well as the workspace root and `cypress` folder
- `pnpm lint:eslint` - lint every project with ESLint
- `pnpm lint:tsc` - type-check every project with TypeScript
- `pnpm [--filter <project-name|{folder/*}>] lint:eslint` - lint specific
  projects
- `pnpm [--filter <project-name|{folder/*}>] lint:tsc` - type-check specific
  projects
- `pnpm --filter @h5web/<lib|app> analyze` - analyze a package's bundle (run
  only after building the package)

### Fixing and formatting

- `pnpm prettier --write` - format all files with Prettier
- `pnpm lint:eslint --fix` - auto-fix linting issues in every project
- `pnpm [--filter <project-name|{folder/*}>] lint:eslint --fix` - auto-fix
  linting issues in specific projects

### Editor integration

Most editors support fixing and formatting files automatically on save. The
configuration for VSCode is provided out of the box, so all you need to do is
install the recommended extensions.

## Testing

- `pnpm test` - run unit and feature tests with Jest
- `pnpm test --watch` - run tests related to changed files in watch mode
- `pnpm test --watchAll` - run all tests in watch mode
- `pnpm --filter <project-name> test` - run Jest in a specific project
- `pnpm cypress` - open the
  [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html) end-to-end
  test runner (local dev server must be running in separate terminal)
- `pnpm cypress:run` - run end-to-end tests once (local dev server must be
  running in separate terminal)

> Note that the workspace's `test` script doesn't recursively run the `test`
> script in every project like (i.e. it is not equivalent to `pnpm -r test`).
> Instead, it runs Jest globally using a
> [`projects` configuration](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig)
> located in `jest.config.json`. This results in a nicer terminal output when
> running tests on the entire workspace.

### Feature tests

The `@h5web/app` package includes feature tests written with
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro).
They are located under `src/__tests__`. Each file covers a particular subtree of
components of H5Web.

H5Web's feature tests typically consist in rendering the entire app with mock
data (i.e. inside `MockProvider`), executing an action like a real user would
(e.g. clicking on a button, pressing a key, etc.), and then expecting something
to happen in the DOM as a result. Most tests, perform multiple actions and
expectations consecutively to minimise the overhead of rendering the entire app
again and again.

`MockProvider` resolves most requests instantaneously to save time in tests, but
its API's methods are still called asynchronously like other providers. This
means that during tests, `Suspense` loading fallbacks render just like they
would normally; they just don't stick around in the DOM for long.

This adds a bit of complexity when testing, as React doesn't like when something
happens after a test has completed. In fact, we have to ensure that every
component that suspends inside a test **finishes loading before the end of that
test**. This is where Testing Library's
[asynchronous methods](https://testing-library.com/docs/dom-testing-library/api-async)
come in.

To keep tests readable and focused, H5Web's testing utilities `renderApp` and
`selectExplorerNode` call Testing Library's `waitFor` utility for you to wait
for suspended components to finish loading (cf. `waitForAllLoaders` in
`test-utils.tsx`). As a result, in most cases, you can just use synchronous
queries like `getBy` in your tests.

#### Fake timers

To allow developing and testing loading interfaces, as well as features like
cancel/retry, `MockProvider` adds an artificial delay of 3s (`SLOW_TIMEOUT`) to
some requests, notably to value requests for datasets prefixed with `slow_`.

In order for this artificial delay to not slow down feature tests, we must use
[fake timers](https://testing-library.com/docs/using-fake-timers/). This is done
by setting the `withFakeTimers` option when calling `renderApp()`:

```ts
renderApp({ withFakeTimers: true });
```

When `withFakeTimers` is set, `renderApp` and `selectExplorerNode` no longer
wait for suspended components to finish loading. It is up to you to wait for and
expect the loaders you're interested in testing to appear, and then to wait for
and expect their corresponding suspended components to replace them on the
screen. You can do so with Testing Library's async methods: `findBy` or
`waitFor`.

Indeed, when Jest's fake timers are enabled, `findBy` and `waitFor` use
`jest.advanceTimersByTime()` internally to simulate the passing of time. By
default, they advance the clock by intervals of
[50 ms](https://github.com/testing-library/dom-testing-library/blob/main/src/wait-for.js#L25)
and give up after
[1000 ms](https://github.com/testing-library/dom-testing-library/blob/main/src/config.ts#L14)
(20 attempts). Therefore, the easiest way to skip the artificial delay
introduced by `MockProvider` is to configure the `waitFor` timeout:

```ts
import { SLOW_TIMEOUT } from '../providers/mock/mock-api';
import { renderApp } from '../test-utils';

test('show loader while fetching dataset value', async () => {
  await renderApp({
    initialPath: '/resilience/slow_value',
    withFakeTimers: true,
  });

  // Wait for value loader to appear
  await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();

  // Wait for all slow fetches to succeed (i.e. for visualization to appear)
  await expect(
    screen.findByText(/42/, undefined, { timeout: SLOW_TIMEOUT })
  ).resolves.toBeVisible();
});
```

> It's important _not_ to use Jest's `advanceTimersByTime` directly to avoid
> [`act()` warnings](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#the-dreaded-act-warning).

Note that when using fake timers, you may also need to use `findBy` and
`waitFor` after triggering an action. For instance:

```ts
await user.click(screen.getByRole('button', { name: /Retry/ }));
await expect(screen.findByText(/Loading data/)).resolves.toBeVisible();
```

#### Debugging

You can use Testing Library's
[`prettyDOM` utility](https://testing-library.com/docs/dom-testing-library/api-debugging#prettydom)
to log the state of the DOM anywhere in your tests:

```ts
console.debug(prettyDOM()); // if you use `console.log` without mocking it, the test will fail
console.debug(prettyDOM(screen.getByText('foo'))); // you can also print out a specific element
```

To ensure that the entire DOM is printed out in the terminal, you may have to
set environment variable `DEBUG_PRINT_LIMIT`
[to a large value](https://testing-library.com/docs/dom-testing-library/api-debugging#automatic-logging)
when calling `pnpm test`.

### Visual regression

Cypress is used for end-to-end testing but also for visual regression testing.
The idea is to take a screenshot (or "snapshot") of the app in a known state and
compare it with a previously approved "reference snapshot". If any pixel has
changed, the test fails and a diff image highlighting the differences is
created.

Taking consistent screenshots across platforms is impossible because the exact
rendering of the app depends on the GPU. For this reason, visual regression
tests are run only on the CI. This is done through an environment variable
called `CYPRESS_TAKE_SNAPSHOTS`.

Visual regression tests may fail in the CI, either expectedly (e.g. when
implementing a new feature) or unexpectedly (when detecting a regression). When
this happens, the diff images and debug screenshots that Cypress generates are
uploaded as artifacts of the workflow, which can be downloaded and reviewed.

If the visual regressions are expected, the version-controlled reference
snapshots can be updated by posting a comment in the Pull Request with this
exact text: `/approve`. This triggers the _Approve snapshots_ workflow, which
runs Cypress again but this time telling it to update the reference snapshots
when it finds differences and to pass the tests. Once Cypress has updated the
reference snapshots, the workflow automatically opens a PR to merge the new
and/or updated snapshots into the working branch. After this PR is merged, the
visual regression tests in the working branch succeed and the branch can be
merged into `main`.

Here is the summarised workflow (also described with screenshots in
[PR #306](https://github.com/silx-kit/h5web/pull/306)):

1. Push your working branch and open a PR.
2. If the `e2e` job of the _Lint & Test_ CI workflow fails, check out the logs.
3. If the fail is caused by a visual regression (i.e. if a test fails on a
   `cy.matchImageSnapshot()` call), download the workflow's artifacts.
4. Review the snapshot diffs. If the visual regression is unexpected: fix the
   bug, push it and start from step 2 again. If the visual regression is
   expected: continue to step 5.
5. In the PR, post a comment with `/approve`.
6. Go to the _Actions_ page and wait for the _Approve snapshots_ workflow to
   complete.
7. Go to the newly opened PR titled _Update Cypress reference snapshots_.
8. Review the new reference snapshots once more and merge the PR.
9. Go back to your main PR and wait for the jobs of the _Lint & Test_ workflow
   to succeed.

## Deployment

- The project's `main` branch is continuously deployed to
  https://h5web.panosc.eu/ with [Netlify](https://www.netlify.com/).
- The component library's Storybook documentation site is deployed to GitHub
  Pages on every release: https://h5web-docs.panosc.eu

## Release process

To release a new version and publish the packages to NPM:

1. Check out `main` and pull the latest changes.
1. Make sure your working tree doesn't have uncommitted changes and that the
   latest commit on `main` has passed the CI.
1. Run `pnpm version [ patch | minor | major | <new-version> ]`

This command bumps the version number in the workspace's `package.json`, commits
the change and then tags the commit with the same version number. The
`postversion` script then runs automatically and pushes the new commit and the
new tag to the remote repository. This, in turn, triggers the _Release_ workflow
on the CI, which builds and publishes the packages to NPM (with `pnpm publish`)
and deploys the Storybook site.

Once the _Release_ workflow has completed:

- Make sure the new package versions are available on NPM and that the live
  Storybook site still works as expected.
- Upgrade and test the packages in apps and code sandboxes, as required.
- Write and publish [release notes](https://github.com/silx-kit/h5web/releases)
  on GitHub.

### Beta testing

The beta release process described below allows publishing packages to NPM with
the `next` tag (instead of the default `latest` tag) so they can be beta-tested
before the official release.

1. Follow steps 1 and 2 of the normal release process.
1. At step 3, run `pnpm version <x.y.z-beta.0>` (incrementing the beta version
   number as needed).

The CI will then build and deploy the packages with `pnpm publish --tag next`.
Once the _Release_ workflow has completed, check that the beta packages have
been published with the correct tag by running `npm dist-tag ls @h5web/lib`.
This command should print something like:

```
latest: <a.b.c>
next: <x.y.z>-beta.0
```

You can then install the beta packages with `npm install @h5web/lib@next` or the
like and make sure that they work as expected. Once you're done testing, follow
the normal release process, making sure to run `pnpm version <x.y.z>` at step 3
(without the `beta` suffix).

Once the release process has completed, you can remove the `next` tag from the
obsolete beta packages by running
`npm dist-tag rm @h5web/lib@<x.y.z>-beta.0 next`
