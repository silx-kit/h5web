import React from 'react';
import shallow from 'zustand/shallow';
import Toggler from '../shared/Toggler';
import { useLineConfig } from './config';

function LineToolbar(): JSX.Element {
  const [showGrid, toggleGrid, hasYLogScale, toggleYLogScale] = useLineConfig(
    state => [
      state.showGrid,
      state.toggleGrid,
      state.hasYLogScale,
      state.toggleYLogScale,
    ],
    shallow
  );

  return (
    <>
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
      <Toggler
        label="Y SymLog scale"
        value={hasYLogScale}
        onChange={toggleYLogScale}
      />
    </>
  );
}

export default LineToolbar;
