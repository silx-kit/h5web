import type { ClassStyleAttrs } from '../models';
import styles from './ScalarVis.module.css';

interface Props extends ClassStyleAttrs {
  value: string;
}

function ScalarVis(props: Props) {
  const { value, className = '', style } = props;

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      <pre className={styles.scalar}>{value}</pre>
    </div>
  );
}

export default ScalarVis;
