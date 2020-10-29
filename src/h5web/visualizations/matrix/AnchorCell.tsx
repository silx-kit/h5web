import React, { ReactElement, useContext } from 'react';
import { FiAnchor } from 'react-icons/fi';
import styles from './MatrixVis.module.css';
import { GridSettingsContext } from './GridSettingsContext';

interface Props {
  onToggle: () => void;
  sticky: boolean;
}

function AnchorCell(props: Props): ReactElement {
  const { onToggle, sticky } = props;
  const { cellSize } = useContext(GridSettingsContext);

  return (
    <div className={styles.anchorCell} style={cellSize}>
      <button
        className={styles.anchorBtn}
        type="button"
        aria-label="Toggle sticky indices"
        aria-pressed={sticky}
        onClick={onToggle}
      >
        <FiAnchor />
      </button>
    </div>
  );
}

export default AnchorCell;
