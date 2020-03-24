import React, { useContext } from 'react';
import { range } from 'lodash-es';
import { StickyContext } from './StickyContext';
import styles from './MatrixVis.module.css';
import AnchorCell from './AnchorCell';
import { CellSize } from './utils';

interface Props {
  anchorCell?: boolean;
  cellCount: number;
  cellSize: CellSize;
  className: string;
}

function IndexTrack(props: Props): JSX.Element {
  const { anchorCell, cellCount, cellSize, className } = props;
  const { stickyIndices } = useContext(StickyContext);

  return (
    <div className={className} data-sticky={stickyIndices || undefined}>
      {anchorCell && <AnchorCell key="anchor" style={{ ...cellSize }} />}
      {range(cellCount).map(index => {
        return (
          <div
            className={styles.indexCell}
            style={{ ...cellSize }}
            data-bg={index % 2 === 1 ? '' : undefined}
          >
            {index >= 0 && index}
          </div>
        );
      })}
    </div>
  );
}

export default IndexTrack;
