import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from '../h5web/App';
import H5GroveApp from './H5GroveApp';
import HsdsApp from './HsdsApp';
import JupyterApp from './JupyterApp';

// Split mock data generation code out of main bundle
const MockProvider = lazy(
  () =>
    import(
      /* webpackChunkName: "mock" */ '../h5web/providers/mock/MockProvider'
    )
);

function DemoApp() {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <Suspense fallback={null}>
            <MockProvider>
              <App />
            </MockProvider>
          </Suspense>
        </Route>
        <Route path="/hsds">
          <HsdsApp />
        </Route>
        <Route path="/h5grove">
          <H5GroveApp />
        </Route>
        <Route exact path="/">
          <JupyterApp />
        </Route>
      </Switch>
    </Router>
  );
}

export default DemoApp;
