import { type ClassStyleAttrs } from '../models';
import styles from './ScalarVis.module.css';

const LARGE_THRESHOLD = 1_000_000;

interface Props extends ClassStyleAttrs {
  value: string;
}

function ScalarVis(props: Props) {
  const { value, className = '', style } = props;

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      {value.length < LARGE_THRESHOLD ? (
        <pre className={styles.scalar}>{value}</pre>
      ) : (
        <p className={styles.fallback}>Too big to display</p>
      )}
    </div>
  );
}

export default ScalarVis;
