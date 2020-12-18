import React, { lazy, ReactElement, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from '../h5web/App';
import SilxProvider from '../h5web/providers/silx/SilxProvider';
import HsdsApp from './HsdsApp';
import JupyterApp from './JupyterApp';

// Split mock data generation code out of main bundle
const MockProvider = lazy(
  () =>
    import(
      /* webpackChunkName: "mock" */ '../h5web/providers/mock/MockProvider'
    )
);

function DemoApp(): ReactElement {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <Suspense fallback={<></>}>
            <MockProvider>
              <App />
            </MockProvider>
          </Suspense>
        </Route>
        <Route path="/hsds">
          <HsdsApp />
        </Route>
        <Route path="/jupyter">
          <JupyterApp />
        </Route>
        <Route exact path="/">
          <SilxProvider domain="bsa_002_000-integrate-sub">
            <App />
          </SilxProvider>
        </Route>
      </Switch>
    </Router>
  );
}

export default DemoApp;
