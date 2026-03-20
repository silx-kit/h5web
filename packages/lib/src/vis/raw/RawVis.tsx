import { type ClassStyleAttrs } from '../models';
import styles from './RawVis.module.css';

const LARGE_THRESHOLD = 1_000_000;

interface Props extends ClassStyleAttrs {
  value: string;
}

function RawVis(props: Props) {
  const { value, className = '', style } = props;

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      {value.length < LARGE_THRESHOLD ? (
        <pre className={styles.raw}>{value}</pre>
      ) : (
        <p className={styles.fallback}>Too big to display</p>
      )}
    </div>
  );
}

export default RawVis;
