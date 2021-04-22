import type { Primitive } from '../../../providers/models';
import { formatComplexValue } from '../../../utils';
import type { PrintableType } from '../models';
import styles from './ScalarVis.module.css';

interface Props {
  value: Primitive<PrintableType>;
}

function ScalarVis(props: Props) {
  const { value } = props;

  return (
    <div className={styles.scalar}>
      {Array.isArray(value) ? formatComplexValue(value) : value.toString()}
    </div>
  );
}

export type { Props as ScalarVisProps };
export default ScalarVis;
