# Contributing

- [Quick start](#quick-start)
- [Development](#development)
  - [`pnpm` v7 cheat sheet](#pnpm-v7-cheat-sheet)
  - [Dependency management](#dependency-management)
    - [DefinitelyTyped packages](#definitelytyped-packages)
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
  - [Beta testing](#beta-testing)
  - [Local testing](#local-testing)

## Quick start

```bash
pnpm install
pnpm start
```

Once the development server has started, press `o` to open the development URL
in your browser, or `h` to show all the available keyboard shortcuts.

## Development

- `pnpm start` - start the H5Web stand-alone demo
- `pnpm start:storybook` - start the component library's
  [Storybook](https://storybook.js.org/docs/react/get-started/introduction)
  documentation site at http://localhost:6006

### `pnpm` cheat sheet

- `pnpm install` - install the dependencies of every project in the workspace
  and of the workspace itself
- `pnpm --filter <project-name> add [-D] <pkg-name>` -
  [add a dependency](https://pnpm.io/cli/add) to a project in the workspace
- `pnpm [run] <script> [--<arg>]` - run a workspace script
- `pnpm [run] "/<regex>/" [--<arg>]` - run multiple workspace scripts in
  parallel
- `pnpm [run] --filter {packages/*} [--parallel] <script> [--<arg>]` -
  [run a script](https://pnpm.io/cli/run) in every project in the `packages`
  folder
- `pnpm [exec] <binary>` - run a binary located in `node_modules/.bin`
  (equivalent to `npx <pkg-name>` for a package installed in the workspace)
- `pnpm dlx <pkg-name>` - fetch a package from the registry and run its default
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
1. Run `pnpm up -rL <pkg-name>` to upgrade a dependency to the latest version in
   all projects. Alternatively, you can either replace `-r` with `--filter` to
   target specific projects, or edit the relevant `package.json` file(s)
   manually and run `pnpm install` (but make sure to specify an exact dependency
   version rather than a range - i.e. don't prefix the version with a caret or a
   tilde).

> If you run into peer dependency warnings and other package resolution issues,
> note that `pnpm` offers numerous solutions for dealing with them, like
> [`pnpm.peerDependencyRules.allowedVersions`](https://pnpm.io/package_json#pnpmpeerdependencyrulesallowedversions).

#### [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) packages

The major versions of `@types/*` packages must be aligned with the major
versions of the packages they provide types for—i.e. `foo@x.y.z` requires
`@types/foo@^x`.

For convenience, some `@types` packages can be quickly upgraded to their latest
minor/patch version by running `pnpm up -r`.

#### Workspace dependencies

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
- `pnpm serve` - serve the built demo at http://localhost:5173
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
`style.css` file and there's no `build:css` script.

Finally, since `@h5web/shared` is not a published package, it does not need to
be built with Vite. However, its types do need to be built with `tsc` so that
other packages can inline them in their own `dist/index.d.ts`.

## Code quality

- `pnpm lint` - run Prettier, ESLint and TypeScript on the entire workspace
- `pnpm lint:prettier` - check that every file is formatted with Prettier
- `pnpm lint:eslint` - lint every project with ESLint
- `pnpm [--filter <project-name|{folder/*}>] lint:eslint` - lint specific
  projects
- `pnpm lint:root:eslint` - lint files that don't belong to projects
- `pnpm lint:tsc` - type-check every project with TypeScript
- `pnpm [--filter <project-name|{folder/*}>] lint:tsc` - type-check specific
  projects
- `pnpm lint:cypress:tsc` - type-check the `cypress` folder
- `pnpm --filter @h5web/<lib|app> analyze` - analyze a package's bundle (run
  only after building the package)
- `pnpm --filter storybook exec storybook doctor` - diagnose problems with
  Storybook installation

### Fixing and formatting

- `pnpm lint:prettier --write` - format all files with Prettier
- `pnpm lint:eslint --fix` - auto-fix linting issues in every project
- `pnpm [--filter <project-name|{folder/*}>] lint:eslint --fix` - auto-fix
  linting issues in specific projects

### Editor integration

Most editors support fixing and formatting files automatically on save. The
configuration for VSCode is provided out of the box, so all you need to do is
install the recommended extensions.

## Testing

- `pnpm test` - run unit and feature tests with [Vitest](https://vitest.dev/) in
  watch mode (or once when on the CI)
- `pnpm test run` - run unit and feature tests once
- `pnpm test [run] <filter>` - run tests matching the given filter
- `pnpm test -- --project <lib|app|...>` - run Vitest on a specific project
- `pnpm test:ui` - run tests inside the
  [Vitest UI](https://vitest.dev/guide/ui.html)
- `pnpm cypress` - open the
  [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html) end-to-end
  test runner (local dev server must be running in separate terminal)
- `pnpm cypress:run` - run end-to-end tests once (local dev server must be
  running in separate terminal)

> Vitest is able to run on the entire monorepo thanks to the
> [workspace configuration](https://vitest.dev/guide/workspace.html) defined in
> `vitest.workspace.ts`. It then uses each project's Vite configuration to
> decide how to run the tests.

### Feature tests

The `@h5web/app` package includes feature tests written with
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
and running in a [JSDOM environment](https://vitest.dev/guide/environment.html).
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
test**. To do so, you can use Testing Library's asynchronous APIs for
[finding elements](https://testing-library.com/docs/dom-testing-library/api-async/#findby-queries)
and [interacting with them](https://testing-library.com/docs/user-event), as
well as Vitest's [`waitFor``](https://vitest.dev/api/vi.html#vi-waitfor-0-34-5)
utility.

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

> Note that the version of pnpm that Netlify installs by default is outdated and
> incompatible with this monorepo. We use the
> [`packageManager` entry](https://docs.netlify.com/configure-builds/manage-dependencies/#pnpm)
> in the root `package.json` to specify a more recent version.

## Release process

To release a new version and publish the packages to NPM:

1. Check out `main` and pull the latest changes.
1. Make sure your working tree doesn't have uncommitted changes and that the
   latest commit on `main` has passed the CI.
1. Run `pnpm version [ patch | minor | major | <new-version> ]`

> The `pnpm version` command:
>
> 1. bumps the version in the workspace's `package.json`;
> 1. copies the new version into each package's `package.json` (via the
>    `version` script);
> 1. commits and tags the changes, and then pushes the new commit and the new
>    tag to the remote repository (via the `postversion` script).
>
> This, in turn, triggers the _Publish packages_ and _Deploy Storybook_
> workflows on the CI, which builds and publishes the packages to NPM (with
> `pnpm -r publish`) and deploys the Storybook site.
>
> A few things happen when `pnpm publish` runs for each package:
>
> 1. First, it triggers a `prepack` script that removes the `type` field from
>    the package's `package.json`. The reason for this workaround is explained
>    in [#1219](https://github.com/silx-kit/h5web/issues/1219).
> 2. Then, pnpm modifies `package.json` further by merging in the content of the
>    [`publishConfig` field](https://pnpm.io/package_json#publishconfig).
> 3. Finally, the package gets published to NPM. Note that it's possible to
>    publish to a local registry for testing purposes (e.g.
>    [Verdaccio](https://verdaccio.org/)) by overriding NPM's default
>    [`registry` configuration](https://docs.npmjs.com/cli/v9/using-npm/registry).

Once the CI workflows have run successfully:

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
Once the _Publish packages_ workflow has run successfully, check that the beta
packages are published with the correct tag by running
`npm dist-tag ls @h5web/lib`. This command should print something like:

```
latest: <a.b.c>
next: <x.y.z>-beta.0
```

You can then install the beta packages with `npm install @h5web/lib@next` or the
like and make sure that they work as expected. Once you're done testing, follow
the normal release process, making sure to run `pnpm version <x.y.z>` at step 3
(without the `beta` suffix).

Once you've completed the release process, you may remove the `next` tag from
the obsolete beta packages by running
`npm dist-tag rm @h5web/lib@<x.y.z-beta.0> next`

### Local testing

To test a package locally in another project without publishing it to NPM,
follow these steps:

1. Run `pnpm packages`.
1. Navigate to the package's directory - e.g. `cd packages/app`.
1. Run `pnpm pack` to pack the package into a tarball, optionally passing a
   target directory for the tarball with `--pack-destination <dir>`.
1. Navigate to the project in which you want to install and test the package.
1. Install the tarball with the project's package manager (e.g.
   `pnpm add <path-to-tarball>`).

> Like `pnpm publish`, `pnpm pack` runs the package's `prepack` script, which
> removes `"type": "module"` from `package.json`, so don't forget to revert this
> change when you're done.
