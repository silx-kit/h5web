# H5Web Visualization Components

[![Docs](https://img.shields.io/website?down_message=offline&label=docs&up_message=online&url=https%3A%2F%2Fh5web-docs.panosc.eu%2F)](https://h5web-docs.panosc.eu/)
[![Version](https://img.shields.io/npm/v/@h5web/lib)](https://www.npmjs.com/package/@h5web/lib)

[H5Web](https://github.com/silx-kit/h5web) is a collection of React components
to visualize and explore data. It consists of two main packages:

- **[`@h5web/lib`](https://www.npmjs.com/package/@h5web/lib): visualization
  components built with
  [react-three-fiber](https://github.com/react-spring/react-three-fiber) (this
  library)**.
- [`@h5web/app`](https://www.npmjs.com/package/@h5web/app): a stand-alone,
  web-based viewer to explore HDF5 files.

While used in `@h5web/app` with HDF5 files, `@h5web/lib` visualization
components are **not tied to HDF5** and can be used to visualize data from any
source.

For more information, visit the
[Storybook documentation site](https://h5web-docs.panosc.eu/).

## Prerequisites

The `react` and `react-dom` dependencies must be installed in your project. Note
that as of version 10, `@h5web/lib` requires **React 18**.

This package supports TypeScript out of the box without the need to install a
separate `@types/` package.

## Getting started 🚀

```bash
npm install @h5web/lib three @react-three/fiber ndarray
```

```tsx
import '@h5web/lib/dist/styles.css';

import React from 'react';
import ndarray from 'ndarray';
import { HeatmapVis, getDomain } from '@h5web/lib';

// Initialise source 2D array
const values = [
  [0, 1, 2],
  [3, 4, 5],
];

// Flatten source array
const flatValues: number[] = values.flat(Infinity);

// Convert to ndarray and get domain
const dataArray = ndarray(flatValues, [2, 3]);
const domain = getDomain(dataArray);

function MyApp() {
  return (
    <div style={{ display: 'flex', height: '30rem' }}>
      <HeatmapVis dataArray={dataArray} domain={domain} />
    </div>
  );
}

export default MyApp;
```

> If your bundler supports it (e.g. webpack 5), you may be able to shorten the
> stylesheet import path as follows:
>
> ```ts
> import '@h5web/lib/styles.css';
> ```

### Examples

The following code sandboxes demonstrate how to set up and use `@h5web/lib` with
various front-end development stacks:

- [Vite](https://codesandbox.io/p/sandbox/h5weblib-vite-xru04?file=%2Fsrc%2FApp.tsx%3A1%2C1)
- [Create React App v4](https://codesandbox.io/p/sandbox/h5weblib-cra-v4-2te48?file=%2Fsrc%2FApp.tsx%3A1%2C1)
- [Create React App v5](https://codesandbox.io/p/sandbox/h5weblib-cra-v5-nhznhh?file=%2Fsrc%2FApp.tsx%3A1%2C1)

### Browser support

H5Web works out of the box on **Firefox 78 ESR**.

Support for Firefox 68 ESR is possible by polyfilling the `ResizeObserver` API.
One easy way to do this is with [polyfill.io](https://polyfill.io/v3/):

```html
<head>
  <!-- title, meta, link, etc. -->
  <script src="https://polyfill.io/v3/polyfill.min.js?features=default%2CResizeObserver"></script>
</head>
```

Older versions of Firefox are not supported.
