import type { ReactElement } from 'react';
import styles from './ScalarVis.module.css';
import { assertNumOrStr } from '../../../guards';

interface Props {
  value: string | number;
}

function ScalarVis(props: Props): ReactElement {
  const { value } = props;
  assertNumOrStr(value);
  return <div className={styles.scalar}>{value.toString()}</div>;
}

export type { Props as ScalarVisProps };
export default ScalarVis;
