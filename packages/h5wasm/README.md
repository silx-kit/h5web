# H5Web's H5Wasm Provider

[![Demo](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web.panosc.eu%2Fh5wasm)](https://h5web.panosc.eu/h5wasm)
[![Version](https://img.shields.io/npm/v/@h5web/h5wasm)](https://www.npmjs.com/package/@h5web/h5wasm)

[H5Web](https://github.com/silx-kit/h5web) is a collection of React components
to visualize and explore data. It consists of two main packages:

- [@h5web/lib](https://www.npmjs.com/package/@h5web/lib): visualization
  components built with
  [react-three-fiber](https://github.com/react-spring/react-three-fiber).
- [@h5web/app](https://www.npmjs.com/package/@h5web/app): a stand-alone,
  web-based viewer to explore HDF5 files.

`@h5web/app` exposes the HDF5 viewer component `App`, as well as the following
built-in data providers:

- `H5GroveProvider` for use with [H5Grove](https://github.com/silx-kit/h5grove)
  server implementations, like
  [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web);
- `HsdsProvider` for use with [HSDS](https://github.com/HDFGroup/hsds);
- `MockProvider` for testing purposes.

This package, `@h5web/h5wasm`, provides one additional data provider,
`H5WasmProvider`, that can **read HDF5 files straight in the browser** thanks to
the [h5wasm](https://github.com/usnistgov/h5wasm) library.

Check out [this code sandbox](https://codesandbox.io/s/h5web-h5wasm-77j67x) for
a demonstration of how to set up `@h5web/h5wasm` and use the `H5WasmProvider`.

## Getting started 🚀

```bash
npm install @h5web/app @h5web/h5wasm
```

```tsx
import '@h5web/app/dist/styles.css';

import React, { useState } from 'react';
import { type ChangeEvent } from 'react';
import { App } from '@h5web/app';
import { H5WasmProvider } from '@h5web/h5wasm';

interface H5File {
  filename: string;
  buffer: ArrayBuffer;
}

function MyApp() {
  const [h5File, setH5File] = useState<H5File>();

  function handleFileInputChange(evt: ChangeEvent<HTMLInputElement>) {
    const file = evt.target.files?.[0];
    if (!file) {
      return;
    }

    /* `H5WasmProvider` expects an HDF5 file in the form of an `ArrayBuffer`.
     * The way you get this buffer is up to you. Here, we show a simple file picker
     * and use the FileReader API to process the selected file. */
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setH5File({
        filename: file.name,
        buffer: reader.result as ArrayBuffer,
      });
    });

    reader.readAsArrayBuffer(file);
  }

  if (!h5File) {
    return (
      <input
        aria-label="Pick HDF5 file"
        type="file"
        accept=".h5"
        onChange={handleFileInputChange}
      />
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <H5WasmProvider {...h5File}>
        <App />
      </H5WasmProvider>
    </div>
  );
}

export default MyApp;
```

> If your bundler supports it (e.g. webpack 5), you may be able to shorten the
> stylesheet import path as follows:
>
> ```ts
> import '@h5web/app/styles.css';
> ```

## Caveats

### Requires BigInt support

The `h5wasm` library uses the BigInt `123n` notation, which
[is challenging to polyfill](https://javascript.info/bigint#polyfills). This
means that:

- your build tool must understand the BigInt notation (e.g.
  [babel-plugin-syntax-bigint](https://babeljs.io/docs/en/babel-plugin-syntax-bigint))
- your application will only run in browsers that
  [support BigInt](https://caniuse.com/bigint).

### External links are not resolved

The provider doesn't know how to resolve links to groups and datasets contained
in other HDF5 files. Such links will appear as unresolved entities in the
viewer.

### File size is limited

Since `h5wasm` requires the entire HDF5 file to be passed as a single
`ArrayBuffer`, there's a limit to how big a file you can load. This limit
depends on your browser, on your operating system, and on your machine's
resources.

## API reference

### `H5WasmProvider`

- `filename: string` (required) - the name of the file
- `buffer: ArrayBuffer` (required) - the content of the file

```tsx
<H5WasmProvider filename="foo.h5" buffer={buffer}>
  <App />
</H5WasmProvider>
```

#### `filename: string` (required)

The name of the file to display in the UI.

#### `buffer: ArrayBuffer` (required)

The entire file's content as a binary buffer.

#### `getExportURL?: (...args) => URL | (() => Promise<URL | Blob>) | undefined` (optional)

See
[`H5GroveProvider#getExportURL`](https://github.com/silx-kit/h5web/blob/main/packages/app/README.md#getexporturl-args--url----promiseurl--blob--undefined-optional).

`H5WasmProvider` does not provide a fallback implementation of `getExportURL` at
this time, so if you don't provide your own, the export menu will remain
disabled in the toolbar.
