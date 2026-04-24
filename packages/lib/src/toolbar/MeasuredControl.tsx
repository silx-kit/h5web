import { useMeasure, useSyncedRef } from '@react-hookz/web';
import { type ReactElement, useLayoutEffect } from 'react';

import styles from './MeasuredControl.module.css';

interface Props {
  children: ReactElement;
  knownWidth: number | undefined;
  onMeasure: (width: number) => void;
}

function MeasuredControl(props: Props) {
  const { children: child, knownWidth, onMeasure } = props;

  const [size, ref] = useMeasure<HTMLDivElement>();

  const knownWidthRef = useSyncedRef(knownWidth);
  const onMeasureRef = useSyncedRef(onMeasure);

  useLayoutEffect(() => {
    if (size && size.width > (knownWidthRef.current || 0)) {
      onMeasureRef.current(size.width);
    }
  }, [size, knownWidthRef, onMeasureRef]);

  return (
    <div
      className={styles.controlWrapper}
      data-measured={knownWidth !== undefined} // hide control until measured for the first time
    >
      <div ref={ref} className={styles.control}>
        {child}
      </div>
    </div>
  );
}

export default MeasuredControl;
