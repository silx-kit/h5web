import type { ClassStyleAttrs } from '../models';
import styles from './RawVis.module.css';
import { isImage } from './utils';

const LARGE_THRESHOLD = 1_000_000;

interface Props extends ClassStyleAttrs {
  value: unknown;
  title?: string;
}

function RawVis(props: Props) {
  const { value, title, className = '', style } = props;

  if (value instanceof Uint8Array && isImage(value)) {
    return (
      <div className={`${styles.root} ${className}`} style={style}>
        <img
          className={styles.img}
          src={URL.createObjectURL(new Blob([value]))}
          alt={title}
        />
      </div>
    );
  }

  const valueAsStr =
    value instanceof Uint8Array
      ? `Uint8Array [ ${value.toString()} ]`
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
