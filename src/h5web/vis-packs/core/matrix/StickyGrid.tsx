import { ReactNode, Ref, useContext, useState } from 'react';
import IndexTrack from './IndexTrack';
import { GridSettingsContext } from './GridSettingsContext';
import AnchorCell from './AnchorCell';
import styles from './MatrixVis.module.css';

interface Props {
  children: ReactNode;
  style: React.CSSProperties;
}

function StickyGrid(props: Props, ref: Ref<HTMLDivElement>) {
  const { children, style } = props;
  const { rowCount, columnCount } = useContext(GridSettingsContext);

  const [sticky, setSticky] = useState(true);

  return (
    <div
      className={styles.stickyGrid}
      ref={ref}
      style={style}
      role="table"
      data-sticky={sticky || undefined}
    >
      <IndexTrack className={styles.indexRow} cellCount={columnCount - 1}>
        <AnchorCell sticky={sticky} onToggle={() => setSticky(!sticky)} />
      </IndexTrack>
      <div className={styles.innerContainer}>
        <IndexTrack className={styles.indexColumn} cellCount={rowCount - 1} />
        {children}
      </div>
    </div>
  );
}

export default StickyGrid;
