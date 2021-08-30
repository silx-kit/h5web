# Contributing

- [Quick start](#quick-start-)
- [Build](#build)
- [Code quality](#code-quality)
  - [Automatic fixing and formatting](#automatic-fixing-and-formatting)
  - [Editor integration](#editor-integration)
- [Testing](#testing)
  - [Visual regression](#visual-regression)
- [Continuous deployment](#continuous-deployment)
- [NPM packages](#npm-packages-)
  - [Release process](#release-process)
  - [Build and test locally](#build-and-test-locally)
- [Icon set](#icon-set)
- [Dependencies](#dependencies)

## Quick start 🚀

```bash
yarn install
yarn start
```

## Build

- `yarn build` - build H5Web for production
- `yarn storybook:build` - build the component library's Storybook documentation
  site

## Code quality

- `yarn lint` - run all linting and code formatting commands
- `yarn lint:eslint` - lint all TS and JS files with ESLint
- `yarn lint:tsc` - type-check the whole project, test files included
- `yarn lint:prettier` - check that all files have been formatted with Prettier
- `yarn analyze` - inspect the size and content of the JS bundles (after
  `yarn build`)

### Automatic fixing and formatting

- `yarn lint:eslint --fix` - auto-fix linting issues
- `yarn lint:prettier --write` - format all files with Prettier

### Editor integration

Most editors support fixing and formatting files automatically on save. The
configuration for VSCode is provided out of the box, so all you need to do is
install the recommended extensions.

## Testing

- `yarn test` - run unit and feature tests with Jest
- `yarn cypress` - open the
  [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html) end-to-end
  test runner (local dev server must be running in separate terminal)
- `yarn cypress:run` - run end-to-end tests once (local dev server must be
  running in separate terminal)
- `yarn storybook` - manually test components in isolation in
  [Storybook](https://storybook.js.org/docs/react/get-started/introduction), at
  http://localhost:6006

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

## NPM packages 📚

The `src/packages` folder contains entry points for the packages published to
NPM: [@h5web/lib](https://www.npmjs.com/package/@h5web/lib) and
[@h5web/app](https://www.npmjs.com/package/@h5web/app).

### Release process

To release a new version:

1. Check out `main` and pull the latest changes.
1. Make sure your working tree doesn't have uncommitted changes and that the
   latest commit on `main` has passed the CI.
1. Run `yarn version [ patch | minor | major | <new-version> ]`

This command bumps the version number in `package.json`, commits the change and
then tags the commit with the same version number. The `postversion` script then
runs automatically and pushes the new commit and the new tag. This, in turn,
triggers the _Release_ workflow on the CI, which builds and publishes the
packages to NPM and deploys the Storybook site. The workflow is detailed in
[issue #358](https://github.com/silx-kit/h5web/issues/358).

Once the _Release_ workflow has completed:

- Make sure the new package versions are available on NPM and that the live
  Storybook site still works as expected.
- Upgrade and test the packages in apps and code sandboxes, as required.
- Write and publish [release notes](https://github.com/silx-kit/h5web/releases)
  on GitHub.

### Build and test locally

To build the packages, run the following commands:

```bash
cd packages
yarn install
yarn build
```

To test a package locally, build the packages then run the following commands:

```bash
cd lib/dist
yarn link
cd /your/test/app
yarn link @h5web/lib
```

> If you see an "invalid hook call" error, you may need to
> [alias the `react` and `react-dom` imports](https://github.com/facebook/react/issues/13991#issuecomment-435587809)
> to point to your test app's `node_modules` folder.

## Icon set

H5Web uses the [Feather icon set](https://react-icons.netlify.com/#/icons/fi).
Icons can be imported as React components from `react-icons/fi`.

## Dependencies

To upgrade dependencies, run one of the following commands:

- `yarn upgrade [package] --latest`
- `yarn upgrade-interactive --latest`, then select the dependency to update.

Alternatively, change the versions of the dependencies you want to upgrade in
`package.json` and run `yarn install`.

When upgrading dependencies, take care of reading their changelogs and release
notes. Look for potential breaking changes and for bug fixes and new features
that may help improve the codebase.

Beware also of the following versioning requirements:

- The major version number of `@types/node` must match the version of Node
  specified in the `engine` field of `package.json`.
- The major version number of `@types/jest` must match the version of Jest
  installed by `react-scripts` - i.e. jest@26.

If you run into trouble because two dependencies require two different versions
of the same package, try using yarn's
[`resolutions` field](https://classic.yarnpkg.com/en/docs/selective-version-resolutions)
in `package.json` to force the installation of a common version. This feature is
currently used to resolve the following version conflicts:

- `react-scripts` requires `babel-loader@8.1.0` but `@storybook/**` installs a
  more recent version.
- `eslint-config-galex` requires more recent versions of ESLint plugins than the
  ones installed by `react-scripts`.
