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
- `npm run storybook` - manually test components in isolation in
  [Storybook](https://storybook.js.org/docs/react/get-started/introduction), at http://localhost:6006

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
- A [GitHub Action](https://github.com/silx-kit/h5web/actions) runs the `lint` and `test` scripts on push to any branch.
- A GitHub Action is also used to continuously deploy the Component Library's Storybook documentation site to GitHub
  Pages: https://h5web-docs.panosc.eu

### Icon set

H5Web uses the [Feather icon set](https://react-icons.netlify.com/#/icons/fi). Icons can be imported as React components
from `react-icons/fi`.

## NPM packages 📚

The `src/packages` folder contains entry points for packages published to NPM.

To publish the packages, bump their version numbers in their respective `packages/package-<name>.json` files, then
follow the steps below:

```bash
cd packages
npm install
npm run build
cd dist-lib && npm publish
cd ../dist-app && npm publish
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
