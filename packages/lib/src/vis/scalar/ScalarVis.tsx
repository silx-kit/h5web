import type { Primitive, PrintableType } from '@h5web/shared/models-hdf5';

import styles from './ScalarVis.module.css';

interface Props {
  value: Primitive<PrintableType>;
  formatter: (value: Primitive<PrintableType>) => string;
}

function ScalarVis(props: Props) {
  const { value, formatter } = props;

  return (
    <div className={styles.root}>
      <pre className={styles.scalar}>{formatter(value)}</pre>
    </div>
  );
}

export default ScalarVis;
