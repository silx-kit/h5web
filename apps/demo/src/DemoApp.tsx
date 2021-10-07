import { App, MockProvider } from '@h5web/app';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import H5GroveApp from './H5GroveApp';
import HsdsApp from './HsdsApp';
import JupyterApp from './JupyterApp';

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
