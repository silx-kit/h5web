import type { Primitive } from '../../../providers/models';
import type { PrintableType } from '../models';
import styles from './ScalarVis.module.css';

interface Props<T extends Primitive<PrintableType> = Primitive<PrintableType>> {
  value: T;
  formatter: (value: T) => string;
}

function ScalarVis<T extends Primitive<PrintableType>>(props: Props<T>) {
  const { value, formatter } = props;
  return <div className={styles.scalar}>{formatter(value)}</div>;
}

export type { Props as ScalarVisProps };
export default ScalarVis;
