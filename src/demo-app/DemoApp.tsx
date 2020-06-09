import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from '../h5web/App';
import SilxProvider from '../h5web/providers/silx/SilxProvider';
import MockProvider from '../h5web/providers/mock/MockProvider';
import HsdsProvider from '../h5web/providers/hsds/HsdsProvider';

const HSDS_URL = process.env.REACT_APP_HSDS_URL || '';
const HSDS_USERNAME = process.env.REACT_APP_HSDS_USERNAME || '';
const HSDS_PASSWORD = process.env.REACT_APP_HSDS_PASSWORD || '';
const HSDS_FILEPATH = process.env.REACT_APP_HSDS_FILEPATH || '';

function DemoApp(): JSX.Element {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <MockProvider domain="source.h5">
            <App />
          </MockProvider>
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
