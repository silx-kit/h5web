# H5Web App & Providers

[![Demo](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web-docs.panosc.eu%2F)](https://h5web.panosc.eu/)
[![Version](https://img.shields.io/npm/v/@h5web/app)](https://www.npmjs.com/package/@h5web/app)

[H5Web](https://github.com/silx-kit/h5web) is a web-based viewer to explore HDF5
files. It is built with React and uses
[react-three-fiber](https://github.com/react-spring/react-three-fiber) for
visualizations.

This library exposes the root `App` component of H5Web, as well as the built-in
data providers:

- `H5GroveProvider` for use with [H5Grove](https://github.com/silx-kit/h5grove)
  server implementations, like
  [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web);
- `HsdsProvider` for use with [HSDS](https://github.com/HDFGroup/hsds);
- `MockProvider` for testing purposes.

## Getting started 🚀

```bash
npm install @h5web/app
```

```tsx
import '@h5web/app/dist/style-lib.css';
import '@h5web/app/dist/style.css';

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

> If your bundler supports it (e.g. webpack 5), you may be able to shorten the
> stylesheet import paths as follows:
>
> ```ts
> import '@h5web/app/style-lib.css';
> import '@h5web/app/style.css';
> ```
