import type { ReactElement } from 'react';
import Measure from 'react-measure';

import styles from './Toolbar.module.css';

interface Props {
  children: ReactElement;
  knownWidth: number | undefined;
  onMeasure: (width: number) => void;
}

function MeasuredControl(props: Props) {
  const { children: child, knownWidth, onMeasure } = props;

  return (
    <Measure
      onResize={({ entry }: { entry?: DOMRect }) => {
        if (entry && entry.width > (knownWidth || 0)) {
          onMeasure(entry.width);
        }
      }}
    >
      {({ measureRef }) => (
        <div
          className={styles.controlWrapper}
          data-measured={knownWidth !== undefined} // hide control until measured for the first time
        >
          <div ref={measureRef} className={styles.control}>
            {child}
          </div>
        </div>
      )}
    </Measure>
  );
}

export default MeasuredControl;
