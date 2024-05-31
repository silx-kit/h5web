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

This package, `@h5web/h5wasm`, provides two additional data providers that can
**read HDF5 files straight in the browser** thanks to the
[h5wasm](https://github.com/usnistgov/h5wasm) library: `H5WasmProvider` and
`H5WasmLocalFileProvider`.

Check out
[this code sandbox](https://codesandbox.io/p/sandbox/h5web-h5wasm-77j67x?file=%2Fsrc%2FMyApp.tsx%3A1%2C1)
for a demonstration of how to set up `@h5web/h5wasm` and use
`H5WasmLocalFileProvider`.

## Prerequisites

The `react` dependency must be installed in your project. Note that as of
version 10, `@h5web/h5wasm` requires **React 18**.

This package supports TypeScript out of the box without the need to install a
separate `@types/` package.

## Getting started 🚀

```bash
npm install @h5web/app @h5web/h5wasm
```

```tsx
import '@h5web/app/dist/styles.css';

import { useState } from 'react';
import { App } from '@h5web/app';
import { H5WasmLocalFileProvider } from '@h5web/h5wasm';

function MyApp() {
  const [file, setFile] = useState<File>();

  if (!file) {
    return (
      <input
        aria-label="Pick HDF5 file"
        type="file"
        accept=".h5"
        onChange={(evt) => setFile(evt.target.files?.[0])}
      />
    );
  }

  return (
    <div style={{ height: '100vh' }}>
      <H5WasmLocalFileProvider file={file}>
        <App />
      </H5WasmLocalFileProvider>
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
- your application will run only in browsers that
  [support BigInt](https://caniuse.com/bigint).

### External links are not resolved

The provider doesn't know how to resolve links to groups and datasets contained
in other HDF5 files. Such links will appear as unresolved entities in the
viewer.

### File size is limited (`H5WasmProvider` only)

> This limitation doesn't apply to `H5WasmLocalFileProvider`.

Since `H5WasmProvider` requires the entire HDF5 file to be passed as a single
`ArrayBuffer`, there's a limit to how big a file you can load. This limit
depends on your browser, on your operating system, and on your machine's
resources.

## API reference

### `H5WasmLocalFileProvider`

- `file: File` (required) - local HDF5 `File` object

```tsx
<H5WasmLocalFileProvider file={file}>
  <App />
</H5WasmLocalFileProvider>
```

#### `file: File` (required)

Local HDF5 `File` object obtained from an HTML file input (i.e.
`<input type="file">`).

#### `getExportURL?: (...args) => URL | (() => Promise<URL | Blob>) | undefined` (optional)

See
[`H5GroveProvider#getExportURL`](https://github.com/silx-kit/h5web/blob/main/packages/app/README.md#getexporturl-args--url----promiseurl--blob--undefined-optional).

`H5WasmLocalFileProvider` does not provide a fallback implementation of
`getExportURL` at this time, so if you don't provide your own, the export menu
will remain disabled in the toolbar.

#### `getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>`

If provided, this aysnchronous function is invoked when loading a compressed
dataset. It receives the name of a compression plugin as parameter and should
return:

- the compression plugin's source file as `ArrayBuffer`,
- or `undefined` if the plugin is not available.

`@h5web/h5wasm` is capable of identifying and requesting the plugins supported
by the
[`h5wasm-plugins@0.0.1`](https://github.com/h5wasm/h5wasm-plugins/tree/v0.0.1)
package: `blosc`, `bz2`, `lz4`, `lzf`, `szf`, `zfp`, `zstd`.

A typical implementation of `getPlugin` in a bundled front-end application might
look like this:

```ts
import type { Plugin } from '@h5web/h5wasm';

/*
 * Import the plugins' source files as static assets (i.e. as URLs).
 * The exact syntax may vary depending on your bundler (Vite, webpack ...)
 * and may require extra configuration/typing.
 */
import blosc from 'h5wasm-plugins/plugins/libH5Zblosc.so';
import bz2 from 'h5wasm-plugins/plugins/libH5Zbz2.so';
// ...

const PLUGINS: Record<Plugin, string> = {
  [Plugin.Blosc]: blosc,
  [Plugin.BZIP2]: bz2,
  // ...
};

async function getPlugin(name: Plugin): Promise<ArrayBuffer | undefined> {
  if (!PLUGINS[name]) {
    return undefined;
  }

  const response = await fetch(PLUGINS[name]);
  return response.arrayBuffer();
}
```

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
[`H5WasmLocalFileProvider#getExportURL`](#getexporturl-args--url----promiseurl--blob--undefined-optional)

#### `getPlugin?: (name: Plugin) => Promise<ArrayBuffer | undefined>`

See
[`H5WasmLocalFileProvider#getPlugin`](#getplugin-name-plugin--promisearraybuffer--undefined)
