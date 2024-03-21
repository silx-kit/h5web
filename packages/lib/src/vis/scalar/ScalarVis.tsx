import type { Primitive, PrintableType } from '@h5web/shared/hdf5-models';

import type { ClassStyleAttrs } from '../models';
import styles from './ScalarVis.module.css';

interface Props extends ClassStyleAttrs {
  value: Primitive<PrintableType>;
  formatter: (value: Primitive<PrintableType>) => string;
}

function ScalarVis(props: Props) {
  const { value, formatter, className = '', style } = props;

  return (
    <div className={`${styles.root} ${className}`} style={style}>
      <pre className={styles.scalar}>{formatter(value)}</pre>
    </div>
  );
}

export default ScalarVis;
