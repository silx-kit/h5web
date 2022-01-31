# Contributing

- [Quick start](#quick-start-)
- [Development](#development)
  - [`pnpm` cheat sheet](#pnpm-cheat-sheet)
  - [Dependency management](#dependency-management)
  - [Workspace dependencies](#workspace-dependencies)
  - [Icon set](#icon-set)
- [Build](#build)
  - [Package builds](#package-builds)
- [Code quality](#code-quality)
  - [Fixing and formatting](#fixing-and-formatting)
  - [Editor integration](#editor-integration)
- [Testing](#testing)
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

### `pnpm` cheat sheet

- `pnpm install` - install the dependencies of every project in the workspace
  and of the workspace itself
- `pnpm add [-D] <pkg-name> --filter <project-name>` -
  [add a dependency](https://pnpm.io/cli/add) to a project in the workspace
- `pnpm [script] [-- --<arg>]` - run a workspace script
- `pnpm [script] [--parallel] --filter {packages} [-- --<arg>]` -
  [run a script](https://pnpm.io/cli/run) in every project in the `packages`
  folder
- `pnpm dlx <pkg-name>` - fetch a package from the registry and run its default
  command binary (equivalent to `npx <pkg-name>`)
- `pnpm exec <binary>` - run a binary located in `node_modules/.bin` (equivalent
  to `npx <pkg-name>` for a package installed in the workspace)
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
1. Run `pnpm up -r -L <pkg-name>` to update a dependency to the latest version
   in all projects. Alternatively, you can either replace `-r` with `--filter`
   to target specific projects, or edit the relevant `package.json` file(s)
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
- `pnpm packages` - build packages `@h5web/app` and `@h5web/lib` (cf. details
  below)

### Package builds

The build process of `@h5web/lib` works as follows:

1. First, Vite builds the JS bundles (ESM and CommonJS) in library mode starting
   from the package's entrypoint: `src/index.ts`. The bundles are placed in the
   output `dist` directory and referenced from `package.json`.

   The JS build also generates a file called `style.css` in the `dist` folder
   that contains the compiled CSS modules that Vite comes across while building
   the React components. These styles are called "local" styles.

2. Second, we run two scripts in parallel: `build:css` and `build:ts`.
   - The job of `build:css` is to build the package's global styles and
     concatenate them with the local styles compiled at the first step. To do
     so, we run Vite again but with a different config: `vite.styles.config.js`,
     and a different entrypoint: `src/styles.ts`. The output files are placed in
     a temporary folder: `dist/temp`. We then concatenate `dist/temp/style.css`
     (the global styles) and `dist/style.css` (the local styles) and output the
     result to `dist/styles.css`, which is the stylesheet referenced from
     `package.json` that consumers need to import.
   - The job of `build:ts` is to generate type declarations for package
     consumers who use TypeScript. This is a two step process: first we generate
     type declarations for all TS files in the `dist-ts` folder with `tsc`, then
     we use Rollup to merge all the declarations into a single file:
     `dist/index.d.ts`, which is referenced from `package.json`.

The build process of `@h5web/app` is the same with one exception: in addition to
importing the package's global styles, `src/styles.ts` also imports the `lib`
package's distributed styles - i.e. the output of the lib's `build:css` script.
The lib's distributed styles include both its global _and_ local styles. This
allows us to provide a single CSS bundle for consumers of `@h5web/app` to
import.

## Code quality

- `pnpm prettier` - check that all files in the workspace have been formatted
  with Prettier
- `pnpm lint` - lint and type-check every project in the workspace with ESLint
  and TypeScript
- `pnpm lint:all:eslint` - lint every project with ESLint
- `pnpm lint:all:tsc` - type-check every project with TypeScript
- `pnpm lint:eslint [--filter <project-name|{folder}>]` - lint specific projects
- `pnpm lint:tsc [--filter <project-name|{folder}>]` - type-check specific
  projects
- `pnpm analyze --filter @h5web/<lib|app>` - analyze a package's bundle (run
  only after building the package)

### Fixing and formatting

- `pnpm prettier -- --write` - format all files with Prettier
- `pnpm lint:all:eslint -- -- --fix` - auto-fix linting issues in the entire
  workspace
- `pnpm lint:eslint [--filter <project-name|{folder}>] -- --fix` - auto-fix
  linting issues in specific projects

### Editor integration

Most editors support fixing and formatting files automatically on save. The
configuration for VSCode is provided out of the box, so all you need to do is
install the recommended extensions.

## Testing

- `pnpm test` - run unit and feature tests with Jest
- `pnpm test -- --watch` - run tests related to changed files in watch mode
- `pnpm test -- --watchAll` - run all tests in watch mode
- `pnpm test --filter <project-name>` - run Jest in a specific project
- `pnpm cypress` - open the
  [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html) end-to-end
  test runner (local dev server must be running in separate terminal)
- `pnpm cypress:run` - run end-to-end tests once (local dev server must be
  running in separate terminal)

> Note that, unlike `pnpm lint`, `pnpm test` (without `--filter`) doesn't
> recursively run the `test` script in every project in the workspace (i.e. it
> is not equivalent to `pnpm test --filter {apps} --filter {packages}`).
> Instead, it runs Jest globally using a
> [`projects` configuration](https://jestjs.io/docs/configuration#projects-arraystring--projectconfig)
> located in `jest.config.json`. This results in a nicer terminal output when
> running tests on the entire workspace.

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
