import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import H5GroveApp from './H5GroveApp';
import HsdsApp from './HsdsApp';
import MockApp from './MockApp';

function DemoApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<H5GroveApp />} />
        <Route path="mock" element={<MockApp />} />
        <Route path="hsds" element={<HsdsApp />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default DemoApp;
