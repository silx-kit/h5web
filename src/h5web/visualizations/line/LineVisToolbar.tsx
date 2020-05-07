import React from 'react';
import shallow from 'zustand/shallow';
import Toggler from '../shared/Toggler';
import { useLineVisConfig } from './config';
import styles from './LineVisToolbar.module.css';

function LineVisToolbar(): JSX.Element {
  const [showGrid, toggleGrid] = useLineVisConfig(
    state => [state.showGrid, state.toggleGrid],
    shallow
  );

  return (
    <div className={styles.toolbar}>
      <Toggler label="Show grid" value={showGrid} onChange={toggleGrid} />
    </div>
  );
}

export default LineVisToolbar;
