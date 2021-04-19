import type { ReactElement } from 'react';
import Measure from 'react-measure';
import styles from './Toolbar.module.css';

interface Props {
  children: ReactElement;
  onMeasure: (width: number) => void;
}

function MeasuredControl(props: Props) {
  const { children: child, onMeasure } = props;

  return (
    <Measure
      onResize={({ entry }: { entry?: DOMRect }) => {
        if (entry) {
          onMeasure(entry.width);
        }
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className={styles.control}>
          {child}
        </div>
      )}
    </Measure>
  );
}

export default MeasuredControl;
