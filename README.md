# H5Web, a web-based HDF5 file viewer

[![Demo](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web.panosc.eu%2F)](https://h5web.panosc.eu/)

H5Web is a web-based viewer to explore HDF5 files. It is built with React and uses
[react-three-fiber](https://github.com/react-spring/react-three-fiber) for visualizations.

## Quick start 🚀

```bash
npm install
npm start
```

## Development 🛠️

### Testing

- `npm test` - run unit and feature tests with Jest
- `npm run cypress` - open the [Cypress](https://docs.cypress.io/guides/overview/why-cypress.html) end-to-end test
  runner (local dev server must be running in separate terminal)
- `npm run cypress:run` - run end-to-end tests once (local dev server must be running in separate terminal)
- `npm run storybook` - manually test components in isolation in
  [Storybook](https://storybook.js.org/docs/react/get-started/introduction), at http://localhost:6006

#### Visual regression

Cypress is used for end-to-end testing, but also for visual regression testing. The idea is to take screenshots
(referred to as "snapshots") of the app in various situations and compare them with previously approved "reference
snapshots". If any pixel has changed, the test fails and a diff image that highlights the differences is created.

Cypress is unable to take consistent screenshots across platforms because the exact rendering depends on the GPU (even
when running in Docker). For this reason, visual regression tests are only run on the CI. Environment variable
`CYPRESS_TAKE_SNAPSHOTS` is used to enable visual regression testing in the CI. This variable is set automatically in
the _Cypress_ GitHub workflow, which runs on push to any branch.

Visual regression tests may fail in the CI, either expectedly (e.g. when implementing a new feature) or unexpectedly
(when detecting a regression). When this happens, the diff images and debug screenshots that Cypress generates are
uploaded as workflow artifacts, which can be downloaded and reviewed.

If the visual regressions are expected, the version-controlled reference snapshots can be updated by posting a comment
in the Pull Request with the following text: `/approve`. This action triggers the _Approve snapshots_ workflow, which
runs Cypress again but this time telling it to update the reference snapshots when it finds differences (instead of
failing the tests).

Once Cypress has updated the reference snapshots, the _Approve snapshots_ workflow automatically opens a Pull Request to
merge the new and/or updated snapshots into the working branch. After this PR is merged, the visual regression tests in
the working branch should succeed.

Here is the summarised workflow (also described with screenshots in
[PR #306](https://github.com/silx-kit/h5web/pull/306)):

1. Push your working branch and open a PR.
2. If the _Cypress_ CI workflow fails, check out the logs.
3. If the fail is caused by a visual regression (i.e. if a test fails on a `cy.matchImageSnapshot()` call), download the
   workflow's artifacts.
4. Review the snapshot diffs:

   - If the visual regressions are unexpected: fix the bug, push it and start from step 2 again.
   - If the visual regressions are expected: continue to step 5.

5. In the PR, post a comment with the following text: `/approve`.
6. Go to the _Actions_ page and wait for the _Approve snapshots_ workflow to complete.
7. Go to the newly opened PR titled _Update Cypress reference snapshots_.
8. Review the new reference snapshots and merge the PR.
9. Go back to your main PR and wait for the _Cypress_ workflow to succeed.

### Build

- `npm run build` - build H5Web for production
- `npm run storybook:build` - build the Component Library's Storybook documentation site

### Code quality

- `npm run lint` - run all linting and code formatting commands
- `npm run lint:eslint` - lint all TS and JS files with ESLint
- `npm run lint:tsc` - type-check the whole project, test files included
- `npm run lint:prettier` - check that all files have been formatted with Prettier

#### Automatic fixing and formatting

- `npm run lint:eslint -- --fix` - auto-fix linting issues
- `npm run lint:prettier -- --write` - format all files with Prettier

#### Editor integration

Most editors support fixing and formatting files automatically on save. The configuration for VSCode is provided out of
the box, so all you need to do is install the recommended extensions.

### Continuous integration and deployment

- The project's `master` branch is continuously deployed to https://h5web.panosc.eu/ with
  [Netlify](https://www.netlify.com/).
- Netlify also deploys each pull request individually to URLs of the form:
  https:\//deploy-preview-<pr-number\>--h5web.netlify.app/
- On push to any branch, a [GitHub Action](https://github.com/silx-kit/h5web/actions):
  - runs the `lint` and `test` scripts;
  - runs end-to-end tests with Cypress.
- On push to `master`, another GitHub Action continuously deploys the Component Library's Storybook documentation site
  to GitHub Pages: https://h5web-docs.panosc.eu

### Icon set

H5Web uses the [Feather icon set](https://react-icons.netlify.com/#/icons/fi). Icons can be imported as React components
from `react-icons/fi`.

## NPM packages 📚

The `src/packages` folder contains entry points for packages published to NPM.

To publish the packages, bump their version numbers in their respective `packages/<name>/package.json` files, log in to
NPM locally with `npm login`, then follow the steps below:

```bash
cd packages
npm install
npm run build
cd lib/dist && npm publish
cd ../../app/dist && npm publish
```

> To test the packages locally, run `npm link` instead of `npm publish`, and then `npm link @h5web/<package>` in your
> test app. If you see an "invalid hook call" error, you may need to
> [alias the `react` and `react-dom` imports](https://github.com/facebook/react/issues/13991#issuecomment-435587809) to
> point to your test app's `node_modules` folder.

### @h5web/lib

H5Web's Component Library, which includes the main visualization components (`LineVis`, `HeatmapVis`, etc.) as well as
some of their lower-level building blocks (`AxisSystem`, `ColorBar`, etc.)

The library is documented in a Storybook site accessible at https://h5web-docs.panosc.eu.

### @h5web/app

H5Web's top-level `App` component and data providers (`SilxProvider`, etc.)

## HSDS demo

H5web can display data requested to an [HSDS](https://github.com/HDFGroup/hsds) server instance. A demo is available on
https://h5web.panosc.eu/hsds with several files (or domains) available:

- `/home/reader/water` (**default**): A file with data similar to the demo https://h5web.panosc.eu/. Some datasets
  cannot be displayed as bitshuffle compression is not supported by HSDS yet.
- `/home/reader/tall`: The demo file of HSDS.
- `/home/reader/chunked`: A file containing a simple 2D chunked dataset.

The different domains can be reached through `https://h5web.panosc.eu/hsds?domain=<domain_name>`.
