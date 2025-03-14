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
  <App initialPath="/arrays/threeD" />
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

Some visualizations allow exporting the current dataset/slice to various
formats. For instance, the _Line_ visualization allows exporting to CSV and NPY;
the _Heatmap_ visualization to NPY and TIFF, etc.

For each format, the viewer invokes the provider's `getExportURL` method. If
this method returns a `URL` or an async function, then the export menu in the
toolbar shows an entry for the corresponding export format.

In the case of JSON and CSV, the viewer itself takes care of the export by
providing its own "exporter" function to the `getExportURL` method. When this
happens, the `getExportURL` method just returns a function that calls the
exporter.

In the case of NPY and TIFF, `H5GroveApi#getExportURL` returns a `URL` so the
export can be generated server-side by `h5grove`.

The optional `getExportURL` prop is called internally by the `getExportURL`
method and allows taking over the export process. It enables advanced use cases
like generating exports from an authenticated endpoint.

<details>
  <summary>Advanced examples</summary>

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

```tsx
// Tweak a built-in export payload in some way (round or format numbers, truncate lines, etc.)
getExportURL={(format, dataset, selection, builtInExporter) => async () => {
  if (!builtInExporter || format !== 'csv') {
    return undefined;
  }

  const csvPayload = builtInExporter();
  return csvPayload.split('\n').slice(0, 100).join('\n'); // truncate to first 100 lines
}}
```

</details>

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

`HsdsProvider` doesn't support the NPY and TIFF export formats out of the box.

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

`MockProvider` doesn't support the NPY and TIFF export formats out of the box.

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

This is recommended if you work with a provider that supports 64-bit integers —
i.e. one that may provide dataset and attribute values that include primitive
`bigint` numbers — currently only [`MockProvider`](#mockprovider).

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

> If you're application already implements `bigint` serialization, you don't
> need to call `enableBigIntSerialization()`. Doing so would override the
> existing implementation, which might have unintended effects.

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

For convenience, the following hooks are available to access data through the
data context: `useEntity`, `useDatasetValue`, `useDatasetsValues`,
`usePrefetchValues`.

We also provide a large number of type guards and assertion functions to narrow
down the kind/shape/type of HDF5 entities returned by `useEntity`, as well as a
memoised hook called `useNdArray` to create ndarrays that can be passed to the
visualization components (available in `@h5web/lib`).

```tsx
function MyApp() {
  const entity = useEntity('/arrays/twoD'); // ProvidedEntity
  assertDataset(entity); // Dataset
  assertArrayShape(entity); // Dataset<ArrayShape>
  assertFloatType(entity); // Dataset<ArrayShape, FloatType>

  const value = useDatasetValue(entity); // number[] | TypedArray
  const dataArray = useNdArray(value, entity.shape);
  const domain = useDomain(dataArray);

  return (
    <HeatmapVis
      style={{ width: '100vw', height: '100vh' }}
      dataArray={dataArray}
      domain={domain}
    />
  );
}
```

When accessing the values of multiple datasets with multiple consecutive calls
to `useDatasetValue` (and/or `useDatasetsValues`), invoke `usePrefetchValues`
first to ensure that the values are requested in parallel rather than
sequentially:

```tsx
const axesDatasets = [abscissasDataset, ordinatesDataset];
usePrefetchValues([valuesDataset, ...axesDatasets]);

const values = useDatasetValue(valuesDataset);
const [abscissas, ordinates] = useDatasetsValues(axesDatasets);
```

All three hooks accept a `selection` parameter to request specific slices from
n-dimensional datasets:

```tsx
const selection = '0,:,:';
usePrefetchValues([valuesDataset], selection); // prefetch the first 2D slice
usePrefetchValues([abscissasDataset, ordinatesDataset]); // pretech in full (i.e. no selection)

const values = useDatasetValue(valuesDataset, selection);
const abscissas = useDatasetValue(abscissasDataset);
const ordinates = useDatasetValue(ordinatesDataset);
```
