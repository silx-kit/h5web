import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from '../h5web/App';
import SilxProvider from '../h5web/providers/silx/SilxProvider';
import MockProvider from '../h5web/providers/mock/MockProvider';
import HsdsProvider from '../h5web/providers/hsds/HsdsProvider';

function DemoApp(): JSX.Element {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <MockProvider domain="Mocked bsa_002_000-integrate-sub">
            <App />
          </MockProvider>
        </Route>
        <Route path="/hsds">
          <HsdsProvider
            username="test_user1"
            password="test"
            filepath="test/tall.h5"
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
