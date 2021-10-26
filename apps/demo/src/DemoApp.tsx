import { App, MockProvider } from '@h5web/app';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import H5GroveApp from './H5GroveApp';
import HsdsApp from './HsdsApp';

function DemoApp() {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <MockProvider>
            <App />
          </MockProvider>
        </Route>
        <Route path="/hsds">
          <HsdsApp />
        </Route>
        <Route path="/">
          <H5GroveApp />
        </Route>
      </Switch>
    </Router>
  );
}

export default DemoApp;
