import type { Primitive, PrintableType } from '@h5web/shared';

import styles from './ScalarVis.module.css';

interface Props {
  value: Primitive<PrintableType>;
  formatter: (value: Primitive<PrintableType>) => string;
}

function ScalarVis(props: Props) {
  const { value, formatter } = props;
  return <pre className={styles.scalar}>{formatter(value)}</pre>;
}

export default ScalarVis;
