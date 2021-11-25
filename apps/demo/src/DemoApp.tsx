import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import H5GroveApp from './H5GroveApp';
import HsdsApp from './HsdsApp';
import MockApp from './MockApp';

function DemoApp() {
  return (
    <Router>
      <Switch>
        <Route path="/mock">
          <MockApp />
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
