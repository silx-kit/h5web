import React, { useContext } from 'react';
import { FiAnchor } from 'react-icons/fi';
import { StickyContext } from './StickyContext';
import styles from './MatrixVis.module.css';

interface Props {
  style: React.CSSProperties;
}

function AnchorCell(props: Props): JSX.Element {
  const { style } = props;
  const { stickyIndices, toggleStickyIndices } = useContext(StickyContext);

  return (
    <div className={styles.indexCell} style={style}>
      <button
        name="Toggle sticky indices"
        className={styles.btn}
        type="button"
        data-bg={stickyIndices || undefined}
        onClick={toggleStickyIndices}
      >
        <FiAnchor />
      </button>
    </div>
  );
}

export default AnchorCell;
