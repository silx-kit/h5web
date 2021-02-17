import type { ReactElement } from 'react';
import styles from './ScalarVis.module.css';

interface Props {
  value: string | number | boolean;
}

function ScalarVis(props: Props): ReactElement {
  const { value } = props;
  return <div className={styles.scalar}>{value.toString()}</div>;
}

export type { Props as ScalarVisProps };
export default ScalarVis;
