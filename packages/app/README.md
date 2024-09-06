# H5Web App & Providers

[![Demos](https://img.shields.io/website?down_message=offline&label=demo&up_message=online&url=https%3A%2F%2Fh5web.panosc.eu%2F)](https://h5web.panosc.eu/)
[![Version](https://img.shields.io/npm/v/@h5web/app)](https://www.npmjs.com/package/@h5web/app)

[H5Web](https://github.com/silx-kit/h5web) is a collection of React components
to visualize and explore data. It consists of two main packages:

- [`@h5web/lib`](https://www.npmjs.com/package/@h5web/lib): visualization
  components built with
  [react-three-fiber](https://github.com/react-spring/react-three-fiber).
- **[`@h5web/app`](https://www.npmjs.com/package/@h5web/app): a stand-alone,
  web-based viewer to explore HDF5 files (this library)**.

`@h5web/app` exposes the HDF5 viewer component `App`, as well as the following
built-in data providers:

- `H5GroveProvider` for use with server implementations based on
  [H5Grove](https://github.com/silx-kit/h5grove), like
  [jupyterlab-h5web](https://github.com/silx-kit/jupyterlab-h5web);
- `HsdsProvider` for use with [HSDS](https://github.com/HDFGroup/hsds);
- `MockProvider` for testing purposes.

## Prerequisites

The `react` and `react-dom` dependencies must be installed in your project. Note
that as of version 10, `@h5web/app` requires **React 18**.

This package supports TypeScript out of the box without the need to install a
separate `@types/` package.

## Getting started 🚀

```bash
npm install @h5web/app
```

```tsx
import '@h5web/app/dist/styles.css';

import React from 'react';
import { App, MockProvider } from '@h5web/app';

function MyApp() {
  return (
    <div style={{ height: '100vh' }}>
      <MockProvider>
        <App />
      </MockProvider>
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

### Examples

The following code sandboxes demonstrate how to set up and use `@h5web/app` with
various front-end development stacks:

- [Vite](https://codesandbox.io/p/sandbox/h5webapp-vite-5c204?file=%2Fsrc%2FMyApp.tsx%3A12%2C1)
- [Create React App v4](https://codesandbox.io/p/sandbox/h5webapp-cra-v4-0y1lj?file=%2Fsrc%2FMyApp.tsx%3A1%2C1)
- [Create React App v5](https://codesandbox.io/p/sandbox/h5webapp-cra-v5-bzmbh1?file=%2Fsrc%2FMyApp.tsx)

### Browser support

H5Web works out of the box on **Firefox 78 ESR**. Support for Firefox 68 ESR is
possible by polyfilling the `ResizeObserver` API. Older versions of Firefox are
not supported.

## API reference

### `App`

Renders the HDF5 viewer.

For `App` to work, it must be wrapped in a data provider:

```tsx
<MockProvider>
  <App />
</MockProvider>
```

#### `sidebarOpen?: boolean` (optional)

Whether the viewer should start with the sidebar open. The sidebar contains the
explorer and search panels. Defaults to `true`. Pass `false` to hide the sidebar
on initial render, thus giving more space to the visualization. This is useful
when H5Web is embeded inside another app.

```tsx
<App sidebarOpen={false} />
```

> This replaces prop `explorerOpen`, which was deprecated in v7.1.0 and removed
> in v8.0.0.

#### `initialPath?: string` (optional)

The path to select within the file when the viewer is first rendered. Defaults
to `'/'`.

```tsx
<MockProvider>
  <App initialPath="/nD_datasets/threeD" />
</MockProvider>
```

#### `getFeedbackURL?: (context: FeedbackContext) => string` (optional)

If provided, a "Give feedback" button appears in the breadcrumbs bar, which
invokes the function when clicked. The function should return a valid URL, for
instance a `mailto:` URL with a pre-filled subject and body:
`mailto:some@email.com?subject=Feedback&body=<url-encoded-text>`. If the app is
publicly available, we recommend returning the URL of a secure online contact
form instead.

```tsx
<App getFeedbackURL={() => 'https://my-feedback-form.com'} />
```

```tsx
<App
  getFeedbackURL={(context) => {
    const {
      filePath, // path of current file
      entityPath, // path of currently selected entity
    } = context;

    return `mailto:some@email.com?subject=Feedback&body=${encodeURIComponent(...)}`;
  }}
/>
```

#### `disableDarkMode?: boolean` (optional)

By default, the viewer follows your browser's and/or operating system's dark
mode setting. This prop disables this beahviour by forcing the viewer into light
mode.

```tsx
<App disableDarkMode />
```

#### `propagateErrors?: boolean` (optional)

The viewer has a top-level `ErrorBoundary` that, by default, handles errors
thrown outside of the visualization area. These include errors thrown by the
data provider when fetching metadata for the explorer. If you prefer to
implement your own error boundary, you may choose to let errors through the
viewer's top-level boundary:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={MyErrorFallback}>
  <MockProvider>
    <App propagateErrors />
  </MockProvider>
</ErrorBoundary>;
```

### `H5GroveProvider`

Data provider for [H5Grove](https://github.com/silx-kit/h5grove).

```tsx
<H5GroveProvider
  url="https://h5grove.server.url"
  filepath="some-file.h5"
  axiosConfig={useMemo(() => ({ params: { file: 'some-file.h5' } }), [])}
>
  <App />
</H5GroveProvider>
```

#### `url: string` (required)

The base URL of the H5Grove server.

#### `filepath: string` (required)

The path and/or name of the file to display in the UI.

#### `axiosConfig?: AxiosRequestConfig` (optional)

By default, `H5GroveProvider` does not make any assumption as to how to
configure its internal [axios](https://axios-http.com/docs/req_config) client.
If you use one of H5Grove's default API implementations, then you'll need to use
this prop to pass the `file` query parameter as shown above.

If your API server requires authentication or is on a different domain, you'll
need to pass the necessary request headers and configuration as well.

> Remember to memoise or extract your `axiosConfig` object so the fetching cache
> does not get cleared if/when your app re-renders.

#### `getExportURL?: (...args) => URL | (() => Promise<URL | Blob>) | undefined` (optional)

The `DataProvider#getExportURL` method is used by the toolbars to generate URLs
and controls for exporting the current dataset/slice to various formats. This
prop allows providing your own implementation of this method.

`getExportURL` is called once for every export menu entry. It receives the
export `format`, as well as the current `dataset` metadata object, `selection`
string, and `value` array. The export entry behaviour then depends of the return
type:

- `URL`: the URL is set as the `href` of the export entry's download anchor.
- `() => Promise<URL | Blob>`: the function is called when the user clicks on
  the export entry. When the promise resolves, the returned `URL` or `Blob` is
  used to trigger a download.
- `undefined`: the export entry is not rendered.

Returning an async function enables advanced use cases like generating exports
client-side, or server-side but from an authenticated endpoint.

<details>
  <summary>Advanced examples</summary>

```tsx
// Client-side CSV export
getExportURL={(format, dataset, selection, value) => {
  if (format === 'csv') {
    // Async function that will be called when the user clicks on a `CSV` export menu entry
    return async () => {
      // Generate CSV string from `value` array
      let csv = '';
      value.forEach((val) => { ... })

      // Return CSV string as Blob so it can be downloaded
      return new Blob([csv]);
    };
  }
}}
```

```tsx
// Fetch export data from authenticated endpoint
getExportURL={(format, dataset, selection) => async () => {
  const query = new URLSearchParams({ format, path: dataset.path, selection });
  const response = await fetch(`${AUTH_EXPORT_ENDPOINT}?${query.toString()}`, {
    headers: { /* authentication header */ }
  })

  return response.blob();
}}
```

```tsx
// Fetch a one-time export link
getExportURL={(format, dataset, selection) => async () => {
  const query = new URLSearchParams({ format, path: dataset.path, selection });
  const response = await fetch(`${AUTH_TOKEN_ENDPOINT}?${query.toString()}`, {
    headers: { /* authentication header */ }
  })

  // Response body contains temporary, pre-authenticated export URL
  return new URL(await response.body());
}}
```

</details>

You may provide a partial implementation of `getExportURL` that handles only
specific export scenarios. In this case, or if you don't provide a function at
all, `H5GroveProvider` falls back to generating URLs based on the `/data`
endpoint and `format` query param.

#### `resetKeys?: unknown[]` (optional)

You can pass variables in `resetKeys` that, when changed, will reset the
provider's internal fetch cache. You may want to do this, for instance, when the
content of the current file changes and you want the viewer to refetch the
latest metadata and dataset values.

It is up to you to decide what sort of keys to use and when to update them. For
instance:

- Your server could send over a hash of the file via WebSocket.
- You could show a toast notification with a _Refresh_ button when the file
  changes and simply increment a number when the button is clicked (cf.
  contrived example below).

```tsx
function MyApp() {
  const [key, setKey] = useState(0);
  const incrementKey = useCallback(() => setKey((val) => val + 1), []);

  return (
    <>
      <button type="button" onClick={incrementKey}>
        Refresh
      </button>
      <H5GroveProvider resetKeys={[key]} /* ... */>
        <App />
      </H5GroveProvider>
    </>
  );
}
```

### `HsdsProvider`

Data provider for [HSDS](https://github.com/HDFGroup/hsds).

```tsx
<HsdsProvider
  url="https://hsds.server.url"
  username="foo"
  password="abc123"
  filepath="/home/reader/some-file.h5"
>
  <App />
</HsdsProvider>
```

#### `url: string` (required)

The base URL of the HSDS server.

#### `username: string; password: string` (required)

The credentials to use to authenticate to the HSDS server. Note that this
authentication mechanism is not secure; please do not use it to grant access to
private data.

#### `filepath: string` (required)

The path of the file to request.

#### `getExportURL?: (...args) => URL | (() => Promise<URL | Blob>) | undefined` (optional)

See
[`H5GroveProvider#getExportURL`](https://github.com/silx-kit/h5web/blob/main/packages/app/README.md#getexporturl-args--url----promiseurl--blob--undefined-optional).

`HsdsProvider` does not provide a fallback implementation of `getExportURL` at
this time, so if you don't provide your own, the export menu will remain
disabled in the toolbar.

#### `resetKeys?: unknown[]` (optional)

See
[`H5GroveProvider#resetKeys`](https://github.com/silx-kit/h5web/blob/main/packages/app/README.md#resetkeys-unknown-optional).

### `MockProvider`

Data provider for demonstration and testing purposes.

```tsx
<MockProvider>
  <App />
</MockProvider>
```

#### `getExportURL?: (...args) => URL | (() => Promise<URL | Blob>) | undefined` (optional)

See
[`H5GroveProvider#getExportURL`](https://github.com/silx-kit/h5web/blob/main/packages/app/README.md#getexporturl-args--url----promiseurl--blob--undefined-optional).

`MockProvider` provides a very basic fallback implementation of `getExportURL`
that can generate only client-side CSV exports of 1D datasets.

### Utilities

#### `getFeedbackMailto`

Generate a feedback `mailto:` URL using H5Web's built-in feedback email
template.

```tsx
(context: FeedbackContext, email: string, subject = 'Feedback') => string;
```

```tsx
import { getFeedbackMailto } from '@h5web/app';
...
<App getFeedbackURL={(context) => {
  return getFeedbackMailto(context, 'some@email.com');
}} />
```

#### `enableBigIntSerialization`

Invoke this function before rendering your application to allow the _Raw_
visualization and metadata inspector to serialize and display
[big integers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#bigint_type):

```jsx
enableBigIntSerialization();
createRoot(document.querySelector('#root')).render(<MyApp />);
```

This is recommended if you're working with a provider that supports 64-bit
integers — i.e. one that may provide dataset and attribute values that include
primitive `bigint` numbers.

The _Raw_ visualization and metadata inspector rely on `JSON.stringify()` to
render dataset and attribute values. By default, `JSON.stringify()` does not
know how to serialize `bigint` numbers and throws an error if it encounters one.
`enableBigIntSerialization()` teaches `JSON.stringify()` to convert big integers
to strings:

```js
> JSON.stringify(123n);
TypeError: Do not know how to serialize a BigInt

> enableBigIntSerialization();
> JSON.stringify(123n);
"123n"
```

> The `n` suffix (i.e. the same suffix used for `bigint` literals as
> demonstrated above) is added to help distinguish big integer strings from
> other strings.

### Context

The viewer component `App` communicates with its wrapping data provider through
a React context called `DataContext`. This context is available via a custom
hook called `useDataContext`. This means you can use the built-in data providers
in your own applications:

```tsx
<MockProvider>
  <MyApp />
</MockProvider>;

function MyApp() {
  const { filename } = useDataContext();
  return <p>{filename}</p>;
}
```

`useDataContext` returns the following object:

```tsx
interface DataContextValue {
  filepath: string;
  filename: string;

  entitiesStore: EntitiesStore;
  valuesStore: ValuesStore;
  attrValuesStore: AttrValuesStore;
}
```

The three stores are created with the
[react-suspense-fetch](https://github.com/dai-shi/react-suspense-fetch) library,
which relies on
[React Suspense](https://reactjs.org/docs/react-api.html#reactsuspense). A
component that uses one of these stores (e.g.
`entitiesStore.get('/path/to/entity')`) must have a `Suspense` ancestor to
manage the loading state.

```tsx
<MockProvider>
  <Suspense fallback={<span>Loading...</span>}>
    <MyApp />
  </Suspense>
</MockProvider>;

function MyApp() {
  const { entitiesStore } = useDataContext();
  const group = entitiesStore.get('/resilience/slow_metadata');
  return <pre>{JSON.stringify(group, null, 2)}</pre>;
}
```
