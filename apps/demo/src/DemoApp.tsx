import { lazy, Suspense } from 'react';
import { Redirect, Route, Switch } from 'wouter';

import H5GroveApp from './H5GroveApp';
import Home from './Home';
import HsdsApp from './HsdsApp';
import MockApp from './MockApp';

// Split H5Wasm demo into its own bundle, and load it only when the demo is first visited
const H5WasmApp = lazy(async () => import('./h5wasm/H5WasmApp'));

const query = new URLSearchParams(document.location.search);
// @ts-expect-error - Untyped global flag
globalThis.H5WEB_EXPERIMENTAL = query.has('experimental');

function DemoApp() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/h5grove" component={H5GroveApp} />
        <Route path="/mock" component={MockApp} />
        <Route path="/hsds" component={HsdsApp} />
        <Route path="/h5wasm" component={H5WasmApp} />
        <Route>
          <Redirect to="/" replace />
        </Route>
      </Switch>
    </Suspense>
  );
}

export default DemoApp;
