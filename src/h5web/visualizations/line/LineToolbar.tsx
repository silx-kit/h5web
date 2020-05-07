import React from 'react';
import shallow from 'zustand/shallow';
import Toggler from '../shared/Toggler';
import { useLineConfig } from './config';

function LineToolbar(): JSX.Element {
  const [showGrid, toggleGrid] = useLineConfig(
    state => [state.showGrid, state.toggleGrid],
    shallow
  );

  return (
    <>
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
    </>
  );
}

export default LineToolbar;
