# H5Web Visualization Components

[![Docs](https://img.shields.io/website?down_message=offline&label=docs&up_message=online&url=https%3A%2F%2Fh5web-docs.panosc.eu%2F)](https://h5web-docs.panosc.eu/)
[![Version](https://img.shields.io/npm/v/@h5web/lib)](https://www.npmjs.com/package/@h5web/lib)

H5Web is a collection of React components to visualize and explore data. It
consists of two packages:

- `@h5web/lib`: visualisation components built with
  [react-three-fiber](https://github.com/react-spring/react-three-fiber) **(this
  library)**.
- `@h5web/app`: a stand-alone, web-based viewer to explore HDF5 files.

While used in `@h5web/app` for HDF5 files, **`@h5web/lib` visualisation
components are not tied to HDF5 and can be used to visualize data from any
source.**

For more information, visit the
[Storybook documentation site](https://h5web-docs.panosc.eu/).

## Getting started 🚀

```bash
npm install @h5web/lib three @react-three/fiber ndarray
```

```tsx
import '@h5web/lib/dist/style.css';

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

### Examples

The following code sandboxes demonstrate how to set up and use `@h5web/lib` with
various front-end development stacks:

- [Vite](https://codesandbox.io/s/h5weblib-vite-xru04)
- [Create React App v4](https://codesandbox.io/s/h5weblib-cra-v4-2te48)
