import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from '../h5web/App';
import SilxProvider from '../h5web/providers/silx/SilxProvider';
import HsdsProvider from '../h5web/providers/hsds/HsdsProvider';

// Split mock data generation code out of main bundle
const MockProvider = lazy(() => import('../h5web/providers/mock/MockProvider'));

const HSDS_URL = process.env.REACT_APP_HSDS_URL || '';
const HSDS_USERNAME = process.env.REACT_APP_HSDS_USERNAME || '';
const HSDS_PASSWORD = process.env.REACT_APP_HSDS_PASSWORD || '';
const HSDS_FILEPATH = process.env.REACT_APP_HSDS_FILEPATH || '';

function DemoApp(): JSX.Element {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <Suspense fallback={<></>}>
            <MockProvider domain="source.h5">
              <App />
            </MockProvider>
          </Suspense>
        </Route>
        <Route path="/hsds">
          <HsdsProvider
            url={HSDS_URL}
            username={HSDS_USERNAME}
            password={HSDS_PASSWORD}
            filepath={HSDS_FILEPATH}
          >
            <App />
          </HsdsProvider>
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
