import { Redirect, Route, Switch } from 'wouter';

import H5GroveApp from './H5GroveApp';
import H5WasmApp from './h5wasm/H5WasmApp';
import Home from './Home';
import HsdsApp from './HsdsApp';
import MockApp from './MockApp';

const query = new URLSearchParams(document.location.search);
// @ts-expect-error
window.H5WEB_EXPERIMENTAL = query.has('experimental');

function DemoApp() {
  return (
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
  );
}

export default DemoApp;
