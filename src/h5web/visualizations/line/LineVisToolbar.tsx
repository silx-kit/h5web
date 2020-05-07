import React from 'react';
import shallow from 'zustand/shallow';
import Toggler from '../shared/Toggler';
import { useLineVisConfig } from './config';

function LineVisToolbar(): JSX.Element {
  const [showGrid, toggleGrid] = useLineVisConfig(
    state => [state.showGrid, state.toggleGrid],
    shallow
  );

  return (
    <>
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
    </>
  );
}

export default LineVisToolbar;
