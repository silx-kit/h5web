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

- [Vite](https://codesandbox.io/s/h5webapp-vite-5c204)
- [Create React App v4](https://codesandbox.io/s/h5webapp-cra-v4-0y1lj)
- [Create React App v5](https://codesandbox.io/s/h5webapp-cra-v5-bzmbh1)

## API reference

### `App`

Renders the HDF5 viewer.

For `App` to work, it must be wrapped in a data provider:

```tsx
<MockProvider>
  <App />
</MockProvider>
```

#### `explorerOpen?: boolean` (optional)

Whether the viewer should start with the explorer panel open. Defaults to
`true`. Pass `false` to hide the explorer on initial render, thus giving more
space to the visualization. This may be useful when H5Web is embeded inside
another app.

```tsx
<App explorerOpen={false} />
```

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

### `H5GroveProvider`

Data provider for [H5Grove](https://github.com/silx-kit/h5grove).

```tsx
<H5GroveProvider
  url="https://h5grove.server.url"
  filepath="some-file.h5"
  axiosParams={{ file: 'some-file.h5' }}
>
  <App />
</H5GroveProvider>
```

#### `url: string` (required)

The base URL of the H5Grove server.

#### `filepath: string` (required)

The path and/or name of the file to display in the UI.

#### `axiosParams?: Record<string, string>` (optional)

By default, `H5GroveProvider` does not make any assumption as to which query
parameters to send to the server. If you use one of H5Grove's default API
implementations, then you'll need to use this prop to pass the `file` query
parameter as shown above.

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

### `MockProvider`

Data provider for demonstration and testing purposes.

```tsx
<MockProvider>
  <App />
</MockProvider>
```

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
