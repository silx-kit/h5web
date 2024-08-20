import { isTypedArray } from '@h5web/shared/guards';

import type { ClassStyleAttrs } from '../models';
import styles from './RawVis.module.css';

const LARGE_THRESHOLD = 1_000_000;

interface Props extends ClassStyleAttrs {
  value: unknown;
}

function RawVis(props: Props) {
  const { value, className = '', style } = props;

  const valueAsStr = isTypedArray(value)
    ? `${value.constructor.name} [ ${value.toString()} ]`
    : JSON.stringify(value, null, 2);

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      {valueAsStr.length < LARGE_THRESHOLD ? (
        <pre className={styles.raw}>{valueAsStr}</pre>
      ) : (
        <p className={styles.fallback}>Too big to display</p>
      )}
    </div>
  );
}

export default RawVis;
