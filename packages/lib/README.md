# H5Web Component Library

[![Docs](https://img.shields.io/website?down_message=offline&label=docs&up_message=online&url=https%3A%2F%2Fh5web-docs.panosc.eu%2F)](https://h5web-docs.panosc.eu/)
[![Version](https://img.shields.io/npm/v/@h5web/lib)](https://www.npmjs.com/package/@h5web/lib)

[H5Web](https://github.com/silx-kit/h5web) is a web-based viewer to explore HDF5
files. It is built with React and uses
[react-three-fiber](https://github.com/react-spring/react-three-fiber) for
visualizations.

This library provides data visualization components and utilities from H5Web for
use in other front-end web applications. For more information, visit the
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
