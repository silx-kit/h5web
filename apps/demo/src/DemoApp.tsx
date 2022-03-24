import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import H5GroveApp from './H5GroveApp';
import H5WasmApp from './H5WasmApp';
import HsdsApp from './HsdsApp';
import MockApp from './MockApp';

function DemoApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<H5GroveApp />} />
        <Route path="mock" element={<MockApp />} />
        <Route path="hsds" element={<HsdsApp />} />
        <Route path="h5wasm" element={<H5WasmApp />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default DemoApp;
