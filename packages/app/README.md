# H5Web App & Providers

[![Demo](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web-docs.panosc.eu%2F)](https://h5web.panosc.eu/)
[![Version](https://img.shields.io/npm/v/@h5web/app)](https://www.npmjs.com/package/@h5web/app)

[H5Web](https://github.com/silx-kit/h5web) is a web-based viewer to explore HDF5
files. It is built with React and uses
[react-three-fiber](https://github.com/react-spring/react-three-fiber) for
visualizations.

This library exposes the root `App` component of H5Web, as well as a number of
built-in data providers.

## Getting started 🚀

```bash
npm install @h5web/app
```

```tsx
import React from 'react';
import { App, MockProvider } from '@h5web/app';

function MyApp() {
  return (
    <MockProvider>
      <App />
    </MockProvider>
  );
}

export default MyApp;
```
